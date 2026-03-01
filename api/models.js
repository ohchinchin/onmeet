const axios = require('axios');

const DEFAULT_FREE_MODELS = [
  { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash Exp (Free)" },
  { id: "meta-llama/llama-3-8b-instruct:free", name: "Llama 3 8B Instruct (Free)" },
  { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B Instruct (Free)" }
];

module.exports = async (req, res) => {
  try {
    const response = await axios.get("https://openrouter.ai/api/v1/models", { timeout: 8000 });
    const freeModels = (response.data.data || [])
      .filter(m => m.pricing && m.pricing.prompt === "0" && m.pricing.completion === "0")
      .map(m => ({ id: m.id, name: m.name }));
    
    res.status(200).json({ models: freeModels.length > 0 ? freeModels : DEFAULT_FREE_MODELS });
  } catch (error) {
    res.status(200).json({ models: DEFAULT_FREE_MODELS });
  }
};
