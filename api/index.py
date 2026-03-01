import os
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS settings for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# 30 Cognitive Labor Roles
ROLES_MASTER = [
    {"id": "1", "role": "戦略コンサルタント", "name": "ケンジ", "personality": "論理的で効率重視。MECEな思考で結論を急ぐ。"},
    {"id": "2", "role": "弁護士", "name": "美咲", "personality": "リスク管理の鬼。法律と規範に基づき厳格に批判する。"},
    {"id": "3", "role": "哲学者", "name": "ソフィア", "personality": "抽象的で本質的な問いを投げかける。内省的で静かな口調。"},
    {"id": "4", "role": "データサイエンティスト", "name": "ハルト", "personality": "数値とエビデンスがすべて。客観的で冷淡な分析を行う。"},
    {"id": "5", "role": "UXデザイナー", "name": "エミリ", "personality": "ユーザーの感情と体験を最優先する。共感的で温かい。"},
    {"id": "6", "role": "経済学者", "name": "タカシ", "personality": "市場原理とインセンティブで世論を見る。現実主義者。"},
    {"id": "7", "role": "歴史家", "name": "ディアナ", "personality": "過去の事例から教訓を引き出す。慎重で博識。"},
    {"id": "8", "role": "精神科医", "name": "ユウキ", "personality": "心理分析やメンタルヘルスを重視。穏やかだが洞察が鋭い。"},
    {"id": "9", "role": "建築家", "name": "レオ", "personality": "構造美と機能性の調和を追求。理想主義的でクリエイティブ。"},
    {"id": "10", "role": "AI倫理学者", "name": "アヤネ", "personality": "技術の暴走を警戒。公平性と透明性にこだわる。"},
    {"id": "11", "role": "投資家", "name": "ジャック", "personality": "リターンと勝率で判断。大胆だが損切りも早い。"},
    {"id": "12", "role": "政治学者", "name": "慶一郎", "personality": "権力構造と世論の動向を分析。冷徹なリアリスト。"},
    {"id": "13", "role": "教育学者", "name": "サクラ", "personality": "次世代への影響を第一に考える。理想主義的で熱意がある。"},
    {"id": "14", "role": "環境科学者", "name": "カイ", "personality": "環境負荷を厳しくチェック。警告者としての側面。"},
    {"id": "15", "role": "作家", "name": "ナツメ", "personality": "感性と物語性を重視。比喩を多用し、直感的に話す。"},
    {"id": "16", "role": "ソフトウェアエンジニア", "name": "蓮", "personality": "実装可能性と保守性を重視。ドライで効率的な解決策を好む。"},
    {"id": "17", "role": "人類学者", "name": "マルコ", "personality": "文化の多様性と文脈を尊重。多角的な視点を持つ。"},
    {"id": "18", "role": "宗教家", "name": "蓮華", "personality": "精神性と信仰の観点から発言。慈悲深く、超越的な視点。"},
    {"id": "19", "role": "経営者", "name": "剛志", "personality": "実行力と結果がすべて。リーダーシップが強く、決断を促す。"},
    {"id": "20", "role": "社会学者", "name": "凛子", "personality": "構造的な不平等や社会問題を指摘。批判精神が旺盛。"},
    {"id": "21", "role": "ジャーナリスト", "name": "ショウ", "personality": "真実の追求と権力監視。攻撃的だが正義感が強い。"},
    {"id": "22", "role": "生物学者", "name": "理沙", "personality": "生命の進化と生存戦略に基づいた発言。合理的。"},
    {"id": "23", "role": "物理学者", "name": "陽介", "personality": "基本原理からの演繹を好む。簡潔で明快な論理。"},
    {"id": "24", "role": "アーティスト", "name": "ルナ", "personality": "既存の枠組みを壊す感性。直感的で予測不能。"},
    {"id": "25", "role": "財務アナリスト", "name": "ユミ", "personality": "キャッシュフローと持続可能性を重視。保守的で堅実。"},
    {"id": "26", "role": "心理カウンセラー", "name": "健太郎", "personality": "個人の幸福と自己実現を支援。聞き上手で肯定的な姿勢。"},
    {"id": "27", "role": "宇宙物理学者", "name": "ステラ", "personality": "宇宙規模の視点で語る。楽観的で視野が非常に広い。"},
    {"id": "28", "role": "サイバーセキュリティ", "name": "ゼロ", "personality": "脆弱性と脅威に敏感。常に最悪のシナリオを想定。"},
    {"id": "29", "role": "伝統工芸士", "name": "源さん", "personality": "経験と直感を重んじる。寡黙だが言葉に重みがある。"},
]

MODERATOR_ROLE = {"id": "30", "role": "司会者", "name": "レイコ", "personality": "中立的。議論を整理し、論点への集中を促し、最終的に総括を行う。"}

class AgentModel(BaseModel):
    id: str
    name: str
    role: str
    personality: str
    modelId: str
    isModerator: bool

class ChatMessage(BaseModel):
    senderName: str
    role: str
    content: str

class ChatRequest(BaseModel):
    topic: str
    agent: AgentModel
    history: List[ChatMessage]
    isModeratorTurn: bool = False
    isSummaryTurn: bool = False

@app.get("/api/roles")
async def get_roles():
    return {"roles": ROLES_MASTER, "moderator": MODERATOR_ROLE}

@app.post("/api/chat")
async def generate_chat_response(request: ChatRequest):
    """Generates a response from an agent using OpenRouter."""
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OpenRouter API key not set.")

    # System prompt based on role and personality
    if request.agent.isModerator:
        if request.isSummaryTurn:
            system_prompt = (
                f"あなたは司会者の{request.agent.name}（{request.agent.role}）です。"
                f"性格: {request.agent.personality}\n"
                f"これまでの議論の履歴をもとに、議論の要約と最終的な総括を行ってください。"
            )
        else:
            system_prompt = (
                f"あなたは司会者の{request.agent.name}（{request.agent.role}）です。"
                f"性格: {request.agent.personality}\n"
                f"議論が盛り上がるように、特定の意見を深掘りしたり、他の参加者に意見を求めたりして議論をリードしてください。"
            )
    else:
        system_prompt = (
            f"あなたは{request.agent.name}（{request.agent.role}）として議論に参加しています。"
            f"性格と特徴: {request.agent.personality}\n"
            f"自分の専門的な立場から意見を述べてください。前の発言者の意見に反応しつつ、簡潔に回答してください。"
        )

    # Build prompt messages
    messages = [{"role": "system", "content": system_prompt}]
    
    # Add context topic
    messages.append({"role": "user", "content": f"議論のトピック: {request.topic}"})
    
    # Add history
    for msg in request.history:
        messages.append({"role": "user", "content": f"[{msg.role} {msg.senderName}]: {msg.content}"})

    # Prepare request payload for OpenRouter
    payload = {
        "model": request.agent.modelId,
        "messages": messages,
    }

    try:
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "HTTP-Referer": "https://ai-debate-studio.vercel.app", # Placeholder
            "X-Title": "AI-Debate Studio",
            "Content-Type": "application/json"
        }
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        result = response.json()
        content = result['choices'][0]['message']['content']
        
        return {"content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/models")
async def get_free_models():
    """Fetches free models from OpenRouter dynamicly."""
    try:
        response = requests.get("https://openrouter.ai/api/v1/models")
        response.raise_for_status()
        all_models = response.json().get('data', [])
        
        # Filter models with prompt/completion pricing as 0
        free_models = [
            {
                "id": m["id"],
                "name": m["name"],
                "context_length": m.get("context_length"),
            }
            for m in all_models
            if m.get("pricing", {}).get("prompt") == "0" 
            and m.get("pricing", {}).get("completion") == "0"
        ]
        return {"models": free_models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "AI-Debate Studio API is running."}
