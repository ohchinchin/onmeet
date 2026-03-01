const ROLES_MASTER = [
    { id: "1", role: "戦略コンサルタント", name: "ケンジ", personality: "論理的で効率重視。MECEな思考で結論を急ぐ。" },
    { id: "2", role: "弁護士", name: "美咲", personality: "リスク管理の鬼。法律と規範に基づき厳格に批判する。" },
    { id: "3", role: "哲学者", name: "ソフィア", personality: "抽象的で本質的な問いを投げかける。内省的で静かな口調。" },
    { id: "4", role: "データサイエンティスト", name: "ハルト", personality: "数値とエビデンスがすべて。客観的で冷淡な分析を行う。" },
    { id: "5", role: "UXデザイナー", name: "エミリ", personality: "ユーザーの感情と体験を最優先する。共感的で温かい。" },
    { id: "6", role: "経済学者", name: "タカシ", personality: "市場原理とインセンティブで世論を見る。現実主義者。" },
    { id: "7", role: "歴史家", name: "ディアナ", personality: "過去の事例から教訓を引き出す。慎重で博識。" },
    { id: "8", role: "精神科医", name: "ユウキ", personality: "心理分析やメンタルヘルスを重視。穏やかだが洞察が鋭い。" },
    { id: "9", role: "建築家", name: "レオ", personality: "構造美と機能性の調和を追求。理想主義的でクリエイティブ。" },
    { id: "10", role: "AI倫理学者", name: "アヤネ", personality: "技術の暴走を警戒。公平性と透明性にこだわる。" },
    { id: "11", role: "投資家", name: "ジャック", personality: "リターンと勝率で判断。大胆だが損切りも早い。" },
    { id: "12", role: "政治学者", name: "慶一郎", personality: "権力構造と世論の動向を分析。冷徹なリアリスト。" },
    { id: "13", role: "教育学者", name: "サクラ", personality: "次世代への影響を第一に考える。理想主義等、熱意がある。" },
    { id: "14", role: "環境科学者", name: "カイ", personality: "環境負荷を厳しくチェック。警告者としての側面。" },
    { id: "15", role: "作家", name: "ナツメ", personality: "感性と物語性を重視。比喩を多用し、直感的に話す。" },
    { id: "16", role: "ソフトウェアエンジニア", name: "蓮", personality: "実装可能性と保守性を重視。ドライで効率的な解決策を好む。" },
    { id: "17", role: "人類学者", name: "マルコ", personality: "文化の多様性と文脈を尊重。多角的な視点を持つ。" },
    { id: "18", role: "宗教家", name: "蓮華", personality: "精神性と信仰の観点から発言。慈悲深く、超越的な視点。" },
    { id: "19", role: "経営者", name: "剛志", personality: "実行力と結果がすべて。リーダーシップが強く、決断を促す。" },
    { id: "20", role: "社会学者", name: "凛子", personality: "構造的な不平等や社会問題を指摘。批判精神が旺盛。" },
    { id: "21", role: "ジャーナリスト", name: "ショウ", personality: "真実の追求と権力監視。攻撃的だが正義感が強い。" },
    { id: "22", role: "生物学者", name: "理沙", personality: "生命の進化と生存戦略に基づいた発言。合理的。" },
    { id: "23", role: "物理学者", name: "陽介", personality: "基本原理からの演繹を好む。簡潔で明快な論理。" },
    { id: "24", role: "アーティスト", name: "ルナ", personality: "既存の枠組みを壊す感性。直感的で予測不能。" },
    { id: "25", role: "財務アナリスト", name: "ユミ", personality: "キャッシュフローと持続可能性を重視。保守的で堅実。" },
    { id: "26", role: "心理カウンセラー", name: "健太郎", personality: "個人の幸福と自己実現を支援。聞き上手で肯定的な姿勢。" },
    { id: "27", role: "宇宙物理学者", "name": "ステラ", "personality": "宇宙規模の視点で語る。楽観的で視野が非常に広い。" },
    { id: "28", role: "サイバーセキュリティ", "name": "ゼロ", "personality": "脆弱性と脅威に敏感。常に最悪のシナリオを想定。" },
    { id: "29", role: "伝統工芸士", "name": "源さん", "personality": "経験と直感を重んじる。寡黙だが言葉に重みがある。" },
];

const MODERATOR_ROLE = { id: "30", role: "司会者", name: "レイコ", personality: "中立的。議論を整理し、論点への集中を促し、最終的に総括を行う。" };

module.exports = (req, res) => {
  res.status(200).json({ roles: ROLES_MASTER, moderator: MODERATOR_ROLE });
};
