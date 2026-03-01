const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { topic, agent, history, isSummaryTurn } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "API key not set in Vercel." });

  const systemPrompt = agent.isModerator
    ? (isSummaryTurn ? `あなたは司会者です。これまでの議論を要約し、総括を行ってください。` : `あなたは司会者です。議論が盛り上がるようにリードしてください。`)
    : `あなたは${agent.name}（${agent.role}）です。性格: ${agent.personality}。専門的視点から発言してください。`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: `Topic: ${topic}` },
    ...history.map(m => ({ role: "user", content: `[${m.role} ${m.senderName}]: ${m.content}` }))
  ];

  try {
    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: agent.modelId,
      messages: messages
    }, {
      headers: { 
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 30000
    });
    
    if (response.data && response.data.choices && response.data.choices[0]) {
      res.status(200).json({ content: response.data.choices[0].message.content });
    } else {
      res.status(500).json({ error: "Invalid response from OpenRouter" });
    }
  } catch (error) {
    console.error("Chat API Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
};
