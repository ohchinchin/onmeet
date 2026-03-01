import axios from 'axios';

export default async function handler(req, res) {
  const { topic, agent, history, isSummaryTurn } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "API key not set" });

  const systemPrompt = agent.isModerator
    ? (isSummaryTurn ? あなたは司会者です。総括を行ってください。 : あなたは司会者です。議論をリードしてください。)
    : あなたは\(\)です。\。専門的視点から発言してください。;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: Topic: \ },
    ...history.map(m => ({ role: "user", content: [\ \]: \ }))
  ];

  try {
    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: agent.modelId,
      messages: messages
    }, {
      headers: { Authorization: Bearer \ }
    });
    res.status(200).json({ content: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}