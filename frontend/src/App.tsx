import { useState, useEffect, useRef } from 'react';
import './App.css';

interface Role {
  id: string;
  role: string;
  name: string;
  personality: string;
}

interface Model {
  id: string;
  name: string;
}

interface Agent {
  id: string;
  name: string;
  role: string;
  personality: string;
  modelId: string;
  isModerator: boolean;
}

interface Message {
  id: string;
  senderName: string;
  role: string;
  content: string;
  isModerator: boolean;
}

const API_BASE = ""; // Relative path for Vercel deployment

function App() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [moderatorRole, setModeratorRole] = useState<Role | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);
  const [maxTurns, setMaxTurns] = useState(5);
  const [status, setStatus] = useState<'setting' | 'running' | 'completed'>('setting');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial data fetch
    setIsLoading(true);
    setError(null);
    
    const fetchInitialData = async () => {
      try {
        const [rolesRes, modelsRes] = await Promise.all([
          fetch(`${API_BASE}/api/roles`),
          fetch(`${API_BASE}/api/models`)
        ]);

        if (!rolesRes.ok || !modelsRes.ok) throw new Error("API request failed");

        const rolesData = await rolesRes.json();
        const modelsData = await modelsRes.json();

        if (rolesData.roles) {
          setRoles(rolesData.roles);
          setModeratorRole(rolesData.moderator);
        }
        if (modelsData.models) {
          setModels(modelsData.models);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("データの読み込みに失敗しました。OpenRouterのAPIキーが正しく設定されているか、サーバーの状態を確認してください。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addAgent = () => {
    if (selectedAgents.length >= 5 || roles.length === 0 || models.length === 0) return;
    const firstRole = roles[0];
    const firstModel = models[0];
    const newAgent: Agent = {
      id: Math.random().toString(36).substr(2, 9),
      name: firstRole.name,
      role: firstRole.role,
      personality: firstRole.personality,
      modelId: firstModel.id,
      isModerator: false
    };
    setSelectedAgents([...selectedAgents, newAgent]);
  };

  const updateAgent = (index: number, field: keyof Agent, value: string) => {
    const newAgents = [...selectedAgents];
    if (field === 'role') {
      const roleObj = roles.find(r => r.role === value);
      if (roleObj) {
        newAgents[index].role = roleObj.role;
        newAgents[index].name = roleObj.name;
        newAgents[index].personality = roleObj.personality;
      }
    } else {
      (newAgents[index] as any)[field] = value;
    }
    setSelectedAgents(newAgents);
  };

  const removeAgent = (index: number) => {
    setSelectedAgents(selectedAgents.filter((_, i) => i !== index));
  };

  const randomizeAll = () => {
    if (roles.length === 0 || models.length === 0) return;
    const count = Math.floor(Math.random() * 3) + 3; // 3-5 agents
    const shuffledRoles = [...roles].sort(() => 0.5 - Math.random());
    const newAgents = shuffledRoles.slice(0, count).map(role => ({
      id: Math.random().toString(36).substr(2, 9),
      name: role.name,
      role: role.role,
      personality: role.personality,
      modelId: models[Math.floor(Math.random() * models.length)].id,
      isModerator: false
    }));
    setSelectedAgents(newAgents);
  };

  const startDebate = async () => {
    if (!topic || selectedAgents.length === 0 || !moderatorRole) return;
    setStatus('running');
    setMessages([]);

    const moderatorAgent: Agent = {
      ...moderatorRole,
      modelId: models[0]?.id || "",
      isModerator: true
    };

    let currentHistory: Message[] = [];

    // 1. Moderator Intro
    await processTurn(moderatorAgent, "それでは議論を開始しましょう。今日のトピックは「" + topic + "」です。まずは皆さんのご意見をお聞かせください。", currentHistory);

    // 2. Debate Turns
    for (let turn = 1; turn <= maxTurns; turn++) {
      for (const agent of selectedAgents) {
        const response = await fetchChat(agent, currentHistory, false);
        await simulateTyping(agent, response, currentHistory);
      }
      
      // Moderator intervenes halfway
      if (turn === Math.ceil(maxTurns / 2)) {
        const modResponse = await fetchChat(moderatorAgent, currentHistory, true);
        await simulateTyping(moderatorAgent, modResponse, currentHistory);
      }
    }

    // 3. Moderator Summary
    const summaryResponse = await fetchChat(moderatorAgent, currentHistory, false, true);
    await simulateTyping(moderatorAgent, summaryResponse, currentHistory);

    setStatus('completed');
  };

  const fetchChat = async (agent: Agent, history: Message[], isModeratorTurn: boolean, isSummaryTurn: boolean = false) => {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        agent,
        history: history.map(m => ({ senderName: m.senderName, role: m.role, content: m.content })),
        isModeratorTurn,
        isSummaryTurn
      })
    });
    const data = await res.json();
    return data.content;
  };

  const simulateTyping = async (agent: Agent, content: string, currentHistory: Message[]) => {
    setIsTyping(true);
    // Human-like delay: wait 1-2 seconds before starting to "type"
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderName: agent.name,
      role: agent.role,
      content: content,
      isModerator: agent.isModerator
    };
    
    setMessages(prev => [...prev, newMessage]);
    currentHistory.push(newMessage);
    setIsTyping(false);
  };

  const processTurn = async (agent: Agent, content: string, currentHistory: Message[]) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderName: agent.name,
      role: agent.role,
      content: content,
      isModerator: agent.isModerator
    };
    setMessages(prev => [...prev, newMessage]);
    currentHistory.push(newMessage);
  };

  const downloadMarkdown = () => {
    let md = `# 議論記録: ${topic}\n\n`;
    messages.forEach(m => {
      md += `### ${m.role} ${m.senderName}\n${m.content}\n\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debate-${new Date().getTime()}.md`;
    a.click();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI-Debate Studio</h1>
      </header>

      <main className="container">
        {isLoading ? (
          <div className="loading-screen">
            <p>議論の準備をしています...</p>
          </div>
        ) : error ? (
          <div className="error-screen">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn-secondary">再読み込み</button>
          </div>
        ) : status === 'setting' ? (
          <section className="setup-area">
            <div className="input-group">
              <label>議論のトピック</label>
              <input 
                type="text" 
                value={topic} 
                onChange={(e) => setTopic(e.target.value)} 
                placeholder="例: AIは人類を救うか？"
              />
            </div>

            <div className="input-group">
              <label>ターン数: {maxTurns}</label>
              <input 
                type="range" 
                min="1" max="10" 
                value={maxTurns} 
                onChange={(e) => setMaxTurns(parseInt(e.target.value))} 
              />
            </div>

            <div className="agents-setup">
              <div className="section-header">
                <h3>参加エージェント (最大5名)</h3>
                <button onClick={randomizeAll} className="btn-secondary">🎲 ランダム設定</button>
              </div>
              
              {selectedAgents.map((agent, index) => (
                <div key={agent.id} className="agent-config-card">
                  <select value={agent.role} onChange={(e) => updateAgent(index, 'role', e.target.value)}>
                    {roles.map(r => <option key={r.id} value={r.role}>{r.role} ({r.name})</option>)}
                  </select>
                  <select value={agent.modelId} onChange={(e) => updateAgent(index, 'modelId', e.target.value)}>
                    {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <button onClick={() => removeAgent(index)} className="btn-danger">削除</button>
                </div>
              ))}
              
              {selectedAgents.length < 5 && (
                <button onClick={addAgent} className="btn-add">+ エージェントを追加</button>
              )}
            </div>

            <button 
              onClick={startDebate} 
              className="btn-primary start-btn" 
              disabled={!topic || selectedAgents.length === 0}
            >
              議論を開始する
            </button>
          </section>
        ) : (
          <section className="debate-area">
            <div className="debate-header">
              <h2>Topic: {topic}</h2>
              {status === 'completed' && (
                <div className="action-buttons">
                  <button onClick={() => setStatus('setting')} className="btn-secondary">最初に戻る</button>
                  <button onClick={downloadMarkdown} className="btn-primary">Markdownを保存</button>
                </div>
              )}
            </div>
            
            <div className="chat-window" ref={scrollRef}>
              {messages.map(m => (
                <div key={m.id} className={`message-bubble ${m.isModerator ? 'moderator' : ''}`}>
                  <div className="message-info">
                    <span className="name">{m.senderName}</span>
                    <span className="role">{m.role}</span>
                  </div>
                  <div className="message-content">{m.content}</div>
                </div>
              ))}
              {isTyping && (
                <div className="typing-indicator">
                  AIが思考中... <span>.</span><span>.</span><span>.</span>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
