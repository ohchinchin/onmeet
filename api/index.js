const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const ROLES_MASTER = [
    {"id": "1", "role": "謌ｦ逡･繧ｳ繝ｳ繧ｵ繝ｫ繧ｿ繝ｳ繝・, "name": "繧ｱ繝ｳ繧ｸ", "personality": "隲也炊逧・〒蜉ｹ邇・㍾隕悶・ECE縺ｪ諤晁・〒邨占ｫ悶ｒ諤･縺舌・},
    {"id": "2", "role": "蠑∬ｭｷ螢ｫ", "name": "鄒主調", "personality": "繝ｪ繧ｹ繧ｯ邂｡逅・・鬯ｼ縲よｳ募ｾ九→隕冗ｯ・↓蝓ｺ縺･縺榊宍譬ｼ縺ｫ謇ｹ蛻､縺吶ｋ縲・},
    {"id": "3", "role": "蜩ｲ蟄ｦ閠・, "name": "繧ｽ繝輔ぅ繧｢", "personality": "謚ｽ雎｡逧・〒譛ｬ雉ｪ逧・↑蝠上＞繧呈兜縺偵°縺代ｋ縲ょ・逵∫噪縺ｧ髱吶°縺ｪ蜿｣隱ｿ縲・},
    {"id": "4", "role": "繝・・繧ｿ繧ｵ繧､繧ｨ繝ｳ繝・ぅ繧ｹ繝・, "name": "繝上Ν繝・, "personality": "謨ｰ蛟､縺ｨ繧ｨ繝薙ョ繝ｳ繧ｹ縺後☆縺ｹ縺ｦ縲ょｮ｢隕ｳ逧・〒蜀ｷ豺｡縺ｪ蛻・梵繧定｡後≧縲・},
    {"id": "5", "role": "UX繝・じ繧､繝翫・", "name": "繧ｨ繝溘Μ", "personality": "繝ｦ繝ｼ繧ｶ繝ｼ縺ｮ諢滓ュ縺ｨ菴馴ｨ薙ｒ譛蜆ｪ蜈医☆繧九ょ・諢溽噪縺ｧ貂ｩ縺九＞縲・},
    {"id": "6", "role": "邨梧ｸ亥ｭｦ閠・, "name": "繧ｿ繧ｫ繧ｷ", "personality": "蟶ょｴ蜴溽炊縺ｨ繧､繝ｳ繧ｻ繝ｳ繝・ぅ繝悶〒荳冶ｫ悶ｒ隕九ｋ縲ら樟螳滉ｸｻ鄒ｩ閠・・},
    {"id": "7", "role": "豁ｴ蜿ｲ螳ｶ", "name": "繝・ぅ繧｢繝・, "personality": "驕主悉縺ｮ莠倶ｾ九°繧画蕗險薙ｒ蠑輔″蜃ｺ縺吶よ・驥阪〒蜊夊ｭ倥・},
    {"id": "8", "role": "邊ｾ逾樒ｧ大現", "name": "繝ｦ繧ｦ繧ｭ", "personality": "蠢・炊蛻・梵繧・Γ繝ｳ繧ｿ繝ｫ繝倥Ν繧ｹ繧帝㍾隕悶らｩ上ｄ縺九□縺梧ｴ槫ｯ溘′驪ｭ縺・・},
    {"id": "9", "role": "蟒ｺ遽牙ｮｶ", "name": "繝ｬ繧ｪ", "personality": "讒矩鄒弱→讖溯・諤ｧ縺ｮ隱ｿ蜥後ｒ霑ｽ豎ゅら炊諠ｳ荳ｻ鄒ｩ逧・〒繧ｯ繝ｪ繧ｨ繧､繝・ぅ繝悶・},
    {"id": "10", "role": "AI蛟ｫ逅・ｭｦ閠・, "name": "繧｢繝､繝・, "personality": "謚陦薙・證ｴ襍ｰ繧定ｭｦ謌偵ょ・蟷ｳ諤ｧ縺ｨ騾乗・諤ｧ縺ｫ縺薙□繧上ｋ縲・},
    {"id": "11", "role": "謚戊ｳ・ｮｶ", "name": "繧ｸ繝｣繝・け", "personality": "繝ｪ繧ｿ繝ｼ繝ｳ縺ｨ蜍晉紫縺ｧ蛻､譁ｭ縲ょ､ｧ閭・□縺梧錐蛻・ｊ繧よ掠縺・・},
    {"id": "12", "role": "謾ｿ豐ｻ蟄ｦ閠・, "name": "諷ｶ荳驛・, "personality": "讓ｩ蜉帶ｧ矩縺ｨ荳冶ｫ悶・蜍募髄繧貞・譫舌ょ・蠕ｹ縺ｪ繝ｪ繧｢繝ｪ繧ｹ繝医・},
    {"id": "13", "role": "謨呵ご蟄ｦ閠・, "name": "繧ｵ繧ｯ繝ｩ", "personality": "谺｡荳紋ｻ｣縺ｸ縺ｮ蠖ｱ髻ｿ繧堤ｬｬ荳縺ｫ閠・∴繧九ら炊諠ｳ荳ｻ鄒ｩ遲峨∫・諢上′縺ゅｋ縲・},
    {"id": "14", "role": "迺ｰ蠅・ｧ大ｭｦ閠・, "name": "繧ｫ繧､", "personality": "迺ｰ蠅・ｲ闕ｷ繧貞宍縺励￥繝√ぉ繝・け縲りｭｦ蜻願・→縺励※縺ｮ蛛ｴ髱｢縲・},
    {"id": "15", "role": "菴懷ｮｶ", "name": "繝翫ヤ繝｡", "personality": "諢滓ｧ縺ｨ迚ｩ隱樊ｧ繧帝㍾隕悶よｯ泌湊繧貞､夂畑縺励∫峩諢溽噪縺ｫ隧ｱ縺吶・},
    {"id": "16", "role": "繧ｽ繝輔ヨ繧ｦ繧ｧ繧｢繧ｨ繝ｳ繧ｸ繝九い", "name": "闢ｮ", "personality": "螳溯｣・庄閭ｽ諤ｧ縺ｨ菫晏ｮ域ｧ繧帝㍾隕悶ゅラ繝ｩ繧､縺ｧ蜉ｹ邇・噪縺ｪ隗｣豎ｺ遲悶ｒ螂ｽ繧縲・},
    {"id": "17", "role": "莠ｺ鬘槫ｭｦ閠・, "name": "繝槭Ν繧ｳ", "personality": "譁・喧縺ｮ螟壽ｧ俶ｧ縺ｨ譁・ц繧貞ｰ企㍾縲ょ､夊ｧ堤噪縺ｪ隕也せ繧呈戟縺､縲・},
    {"id": "18", "role": "螳玲蕗螳ｶ", "name": "闢ｮ闖ｯ", "personality": "邊ｾ逾樊ｧ縺ｨ菫｡莉ｰ縺ｮ隕ｳ轤ｹ縺九ｉ逋ｺ險縲よ・謔ｲ豺ｱ縺上∬ｶ・ｶ顔噪縺ｪ隕也せ縲・},
    {"id": "19", "role": "邨悟霧閠・, "name": "蜑帛ｿ・, "personality": "螳溯｡悟鴨縺ｨ邨先棡縺後☆縺ｹ縺ｦ縲ゅΜ繝ｼ繝繝ｼ繧ｷ繝・・縺悟ｼｷ縺上∵ｱｺ譁ｭ繧剃ｿ・☆縲・},
    {"id": "20", "role": "遉ｾ莨壼ｭｦ閠・, "name": "蜃帛ｭ・, "personality": "讒矩逧・↑荳榊ｹｳ遲峨ｄ遉ｾ莨壼撫鬘後ｒ謖・遭縲よ音蛻､邊ｾ逾槭′譌ｺ逶帙・},
    {"id": "21", "role": "繧ｸ繝｣繝ｼ繝翫Μ繧ｹ繝・, "name": "繧ｷ繝ｧ繧ｦ", "personality": "逵溷ｮ溘・霑ｽ豎ゅ→讓ｩ蜉帷屮隕悶よ判謦・噪縺縺梧ｭ｣鄒ｩ諢溘′蠑ｷ縺・・},
    {"id": "22", "role": "逕溽黄蟄ｦ閠・, "name": "逅・ｲ・, "personality": "逕溷多縺ｮ騾ｲ蛹悶→逕溷ｭ俶姶逡･縺ｫ蝓ｺ縺･縺・◆逋ｺ險縲ょ粋逅・噪縲・},
    {"id": "23", "role": "迚ｩ逅・ｭｦ閠・, "name": "髯ｽ莉・, "personality": "蝓ｺ譛ｬ蜴溽炊縺九ｉ縺ｮ貍皮ｹｹ繧貞･ｽ繧縲らｰ｡貎斐〒譏主ｿｫ縺ｪ隲也炊縲・},
    {"id": "24", "role": "繧｢繝ｼ繝・ぅ繧ｹ繝・, "name": "繝ｫ繝・, "personality": "譌｢蟄倥・譫邨・∩繧貞｣翫☆諢滓ｧ縲ら峩諢溽噪縺ｧ莠域ｸｬ荳崎・縲・},
    {"id": "25", "role": "雋｡蜍吶い繝翫Μ繧ｹ繝・, "name": "繝ｦ繝・, "personality": "繧ｭ繝｣繝・す繝･繝輔Ο繝ｼ縺ｨ謖∫ｶ壼庄閭ｽ諤ｧ繧帝㍾隕悶ゆｿ晏ｮ育噪縺ｧ蝣・ｮ溘・},
    {"id": "26", "role": "蠢・炊繧ｫ繧ｦ繝ｳ繧ｻ繝ｩ繝ｼ", "name": "蛛･螟ｪ驛・, "personality": "蛟倶ｺｺ縺ｮ蟷ｸ遖上→閾ｪ蟾ｱ螳溽樟繧呈髪謠ｴ縲り◇縺堺ｸ頑焔縺ｧ閧ｯ螳夂噪縺ｪ蟋ｿ蜍｢縲・},
    {"id": "27", "role": "螳・ｮ咏黄逅・ｭｦ閠・, "name": "繧ｹ繝・Λ", "personality": "螳・ｮ呵ｦ乗ｨ｡縺ｮ隕也せ縺ｧ隱槭ｋ縲よ･ｽ隕ｳ逧・〒隕夜㍽縺碁撼蟶ｸ縺ｫ蠎・＞縲・},
    {"id": "28", "role": "繧ｵ繧､繝舌・繧ｻ繧ｭ繝･繝ｪ繝・ぅ", "name": "繧ｼ繝ｭ", "personality": "閼・ｼｱ諤ｧ縺ｨ閼・ｨ√↓謨乗─縲ょｸｸ縺ｫ譛謔ｪ縺ｮ繧ｷ繝翫Μ繧ｪ繧呈Φ螳壹・},
    {"id": "29", "role": "莨晉ｵｱ蟾･闃ｸ螢ｫ", "name": "貅舌＆繧・, "personality": "邨碁ｨ薙→逶ｴ諢溘ｒ驥阪ｓ縺倥ｋ縲ょｯ｡鮟吶□縺瑚ｨ闡峨↓驥阪∩縺後≠繧九・},
];

const DEFAULT_FREE_MODELS = [
    { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash Exp (Free)" },
    { id: "meta-llama/llama-3-8b-instruct:free", name: "Llama 3 8B Instruct (Free)" },
    { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B Instruct (Free)" },
    { id: "microsoft/phi-3-medium-128k-instruct:free", name: "Phi-3 Medium (Free)" }
];

const MODERATOR_ROLE = {"id": "30", "role": "蜿ｸ莨夊・, "name": "繝ｬ繧､繧ｳ", "personality": "荳ｭ遶狗噪縲りｭｰ隲悶ｒ謨ｴ逅・＠縲∬ｫ也せ縺ｸ縺ｮ髮・ｸｭ繧剃ｿ・＠縲∵怙邨ら噪縺ｫ邱乗峡繧定｡後≧縲・};

app.get('/api/roles', (req, res) => {
    res.json({ roles: ROLES_MASTER, moderator: MODERATOR_ROLE });
});

app.get('/api/models', async (req, res) => {
    try {
        const response = await axios.get("https://openrouter.ai/api/v1/models", { timeout: 5000 });
        const allModels = response.data.data || [];
        const freeModels = allModels
            .filter(m => m.pricing && m.pricing.prompt === "0" && m.pricing.completion === "0")
            .map(m => ({ id: m.id, name: m.name }));
        
        if (freeModels.length > 0) {
            res.json({ models: freeModels });
        } else {
            res.json({ models: DEFAULT_FREE_MODELS });
        }
    } catch (error) {
        console.error("OpenRouter Models Fetch Error:", error.message);
        res.json({ models: DEFAULT_FREE_MODELS }); // Fallback
    }
});

app.post('/api/chat', async (req, res) => {
    const { topic, agent, history, isModeratorTurn, isSummaryTurn } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) return res.status(500).json({ error: "API key not set" });

    let systemPrompt = "";
    if (agent.isModerator) {
        systemPrompt = isSummaryTurn 
            ? `縺ゅ↑縺溘・蜿ｸ莨夊・・${agent.name}縺ｧ縺吶りｭｰ隲悶・隕∫ｴ・→譛邨ら噪縺ｪ邱乗峡繧定｡後▲縺ｦ縺上□縺輔＞縲Ａ
            : `縺ゅ↑縺溘・蜿ｸ莨夊・・${agent.name}縺ｧ縺吶りｭｰ隲悶′逶帙ｊ荳翫′繧九ｈ縺・↓繝ｪ繝ｼ繝峨＠縺ｦ縺上□縺輔＞縲Ａ;
    } else {
        systemPrompt = `縺ゅ↑縺溘・${agent.name}・・{agent.role}・峨〒縺吶よｧ譬ｼ: ${agent.personality}縲り・蛻・・蟆る摩逧・↑遶句ｴ縺九ｉ諢剰ｦ九ｒ霑ｰ縺ｹ縺ｦ縺上□縺輔＞縲Ａ;
    }

    const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `繝医ヴ繝・け: ${topic}` },
        ...history.map(m => ({ role: "user", content: `[${m.role} ${m.senderName}]: ${m.content}` }))
    ];

    try {
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: agent.modelId,
            messages: messages
        }, {
            headers: { Authorization: `Bearer ${apiKey}` },
            timeout: 30000
        });
        res.json({ content: response.data.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
