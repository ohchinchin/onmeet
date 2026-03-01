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
        ? "あなたは熟練の司会者です。これまでの議論の内容を公平かつ客観的に総括し、最終的な結論を導き出してください。" 
        : "あなたは熟練の司会者です。議論を円滑に進め、各発言者の論点を整理し、次の議論の方向性を示してください。")
    : `あなたは${agent.name}（${agent.role}）です。性格: ${agent.personality}。
専門的かつ独自の視点から、議題に対して具体的で建設的な発言を行ってください。
他の参加者の意見も踏まえつつ、自分の役割に徹して発言してください。`;

  // メッセージの構築
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `本日の議論の議題: ${topic}` }
  ];

  // 履歴の追加（直近の文脈を重視）
  if (Array.isArray(history)) {
    history.forEach(m => {
      // OpenRouter/OpenAI形式に合わせる。
      // 送信者が自分の場合は assistant, 他者は user とする疑似的な対話形式も検討できるが、
      // ここではグループチャット形式なので全て user (名前付き) で送る。
      messages.push({ 
        role: "user", 
        content: `[${m.role} ${m.senderName}]: ${m.content}` 
      });
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
