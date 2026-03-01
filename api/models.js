const axios = require('axios');

const DEFAULT_FREE_MODELS = [
  { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash Exp (Free)" },
  { id: "meta-llama/llama-3-8b-instruct:free", name: "Llama 3 8B Instruct (Free)" },
  { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B Instruct (Free)" },
  { id: "microsoft/phi-3-mini-128k-instruct:free", name: "Phi-3 Mini Instruct (Free)" }
];

module.exports = async (req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  // OPTIONSリクエストへの対応
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // APIキーがない場合は即座にデフォルトを返す
    if (!apiKey) {
      console.warn("OPENROUTER_API_KEY is not set. Returning default models.");
      return res.status(200).json({ models: DEFAULT_FREE_MODELS });
    }

    const response = await axios.get("https://openrouter.ai/api/v1/models", { 
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://onmeet.vercel.app/",
        "X-Title": "AI-Debate Studio"
      },
      timeout: 5000 
    });

    if (response.data && Array.isArray(response.data.data)) {
      // 無料モデルを抽出
      const freeModels = response.data.data
        .filter(m => {
          // 料金設定が0のものを抽出
          const isFree = m.pricing && (m.pricing.prompt === "0" || m.pricing.prompt === 0) && (m.pricing.completion === "0" || m.pricing.completion === 0);
          // またはIDに :free が含まれるもの
          const hasFreeTag = m.id && m.id.endsWith(":free");
          return isFree || hasFreeTag;
        })
        .map(m => ({ id: m.id, name: m.name }));
      
      if (freeModels.length > 0) {
        return res.status(200).json({ models: freeModels });
      }
    }
    
    // 適切なデータが取れなかった場合はデフォルトを返す
    res.status(200).json({ models: DEFAULT_FREE_MODELS });

  } catch (error) {
    console.error("Models API Error:", error.response ? error.response.status : error.message);
    // エラー時も正常系としてデフォルトリストを返し、アプリを止めない
    res.status(200).json({ models: DEFAULT_FREE_MODELS });
  }
};
