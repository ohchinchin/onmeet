const axios = require('axios');

module.exports = async (req, res) => {
  // CORS 対策（Vercel内での呼び出しだが念のため）
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { topic, agent, history, isSummaryTurn } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error("Critical Error: OPENROUTER_API_KEY is not set.");
    return res.status(500).json({ error: "APIキーが設定されていません。Vercelの環境変数を確認してください。" });
  }

  // エージェント情報のバリデーション
  if (!agent || !agent.modelId) {
    return res.status(400).json({ error: "エージェント情報またはモデルIDが不足しています。" });
  }

  const systemPrompt = agent.isModerator
    ? (isSummaryTurn 
        ? "あなたは熟練の司会者です。これまでの議論の履歴（[Role Name]: Content）にある、実際の発言のみを公平かつ客観的に総括してください。履歴に存在しない意見を捏造したり、想像で補完したりすることは厳禁です。発言が少ない場合は、その事実を含めて総括してください。" 
        : "あなたは熟練の司会者です。議論を円滑に進め、各発言者の論点を整理してください。必ず履歴にある内容に基づき、次に誰がどのような視点で話すべきか促してください。")
    : `あなたは${agent.name}（${agent.role}）です。性格: ${agent.personality}。
専門的かつ独自の視点から、議題に対して具体的で建設的な発言を行ってください。
他の参加者の意見も踏まえつつ、自分の役割に徹して発言してください。`;

  // メッセージの構築
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `本日の議論の議題: ${topic}` }
  ];

  // 履歴の追加（エラーメッセージを除外）
  if (Array.isArray(history)) {
    history.forEach(m => {
      // "Error:" や "[エラー]" が含まれるメッセージは、AIに読ませない（履歴から除外）
      if (m.content && !m.content.includes("Error:") && !m.content.includes("[エラー]")) {
        messages.push({ 
          role: "user", 
          content: `[${m.role} ${m.senderName}]: ${m.content}` 
        });
      }
    });
  }

  try {
    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: agent.modelId,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    }, {
      headers: { 
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://onmeet.vercel.app/", // OpenRouter用
        "X-Title": "AI-Debate Studio"                 // OpenRouter用
      },
      timeout: 45000 // タイムアウトを少し伸ばす
    });
    
    if (response.data && response.data.choices && response.data.choices[0]) {
      const content = response.data.choices[0].message.content;
      res.status(200).json({ content });
    } else {
      console.error("Unexpected OpenRouter Response:", JSON.stringify(response.data));
      res.status(502).json({ error: "AIからの応答が空でした。再度お試しください。" });
    }
  } catch (error) {
    const statusCode = error.response ? error.response.status : 500;
    const errorData = error.response ? error.response.data : error.message;
    
    console.error(`OpenRouter API Error (${statusCode}):`, JSON.stringify(errorData));
    
    let userMessage = "AIとの通信中にエラーが発生しました。";
    if (statusCode === 401 || statusCode === 403) {
      userMessage = "API認証エラーです。キーの設定を確認してください。";
    } else if (statusCode === 429) {
      userMessage = "リクエスト制限に達しました。しばらく待ってからお試しください。";
    } else if (statusCode === 400) {
      userMessage = "リクエスト形式が不正です。設定を見直してください。";
    }

    res.status(statusCode).json({ 
      error: userMessage, 
      details: process.env.NODE_ENV === 'development' ? errorData : undefined 
    });
  }
};
