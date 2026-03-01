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

const API_BASE = ""; 

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
    setIsLoading(true);
    setError(null);
    
    const fetchInitialData = async () => {
      try {
        const [rolesRes, modelsRes] = await Promise.all([
          fetch(`/api/roles`),
          fetch(`/api/models`)
        ]);

        if (!rolesRes.ok) throw new Error(`Roles API Error (Status: ${rolesRes.status})`);
        if (!modelsRes.ok) throw new Error(`Models API Error (Status: ${modelsRes.status})`);

        const rolesData = await rolesRes.json();
        const modelsData = await modelsRes.json();

        if (rolesData.roles) {
          setRoles(rolesData.roles);
          setModeratorRole(rolesData.moderator);
        }
        if (modelsData.models) {
          setModels(modelsData.models);
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to load data.");
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
    const count = Math.floor(Math.random() * 3) + 2; 
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

  const fetchChat = async (agent: Agent, history: Message[], isModeratorTurn: boolean, isSummaryTurn: boolean = false) => {
    try {
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
      
      if (!res.ok) {
        throw new Error(data.error || `API Error: ${res.status}`);
      }
      
      return data.content || "応答がありませんでした。";
    } catch (e: any) {
      console.error("fetchChat Error:", e);
      return `[エラー] ${e.message}`;
    }
  };

  const startDebate = async () => {
    if (!topic || selectedAgents.length === 0 || !moderatorRole) return;
    setStatus('running');
    setMessages([]);

    const moderatorAgent: Agent = {
      ...moderatorRole,
      modelId: selectedAgents[0]?.modelId || models[0]?.id || "", 
      isModerator: true
    };

    let currentHistory: Message[] = [];
    
    // 開始の挨拶
    await processTurn(moderatorAgent, `議題「${topic}」について、これより議論を開始します。参加者の皆さんはそれぞれの専門的見地から発言をお願いします。`, currentHistory);

    try {
      for (let turn = 1; turn <= maxTurns; turn++) {
        for (const agent of selectedAgents) {
          const response = await fetchChat(agent, currentHistory, false);
          
          if (response.startsWith("[エラー]")) {
            await processTurn(moderatorAgent, `申し訳ありません、${agent.name}（${agent.role}）との通信中に問題が発生しました。議論を中断します。原因：${response.replace("[エラー] ", "")}`, currentHistory);
            setStatus('completed');
            return;
          }
          
          await simulateTyping(agent, response, currentHistory);
        }
        
        // 中盤で司会者が整理
        if (turn === Math.ceil(maxTurns / 2) && turn !== maxTurns) {
          const modResponse = await fetchChat(moderatorAgent, currentHistory, true);
          if (!modResponse.startsWith("[エラー]")) {
            await simulateTyping(moderatorAgent, modResponse, currentHistory);
          }
        }
      }

      // 最終総括
      const summaryResponse = await fetchChat(moderatorAgent, currentHistory, false, true);
      if (summaryResponse.startsWith("[エラー]")) {
        await processTurn(moderatorAgent, `議論は出尽くしたようです。本日の議論を終了します。`, currentHistory);
      } else {
        await simulateTyping(moderatorAgent, summaryResponse, currentHistory);
      }
    } catch (err: any) {
      console.error("Debate flow error:", err);
    } finally {
      setStatus('completed');
    }
  };

  const simulateTyping = async (agent: Agent, content: string, currentHistory: Message[]) => {
    setIsTyping(true);
    // 発言の長さに応じて少し待機時間を変える（より自然に）
    const delay = Math.min(Math.max(content.length * 10, 1000), 3000);
    await new Promise(resolve => setTimeout(resolve, delay));
    
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
    // 表示のタイミングを少し空ける
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const downloadMarkdown = () => {
    let md = `# Debate Record: ${topic}\n\n`;
    messages.forEach(m => {
      md += `### ${m.role} ${m.senderName}\n${m.content}\n\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debate.md`;
    a.click();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI-Debate Studio <span style={{fontSize: '14px', opacity: 0.5}}>v1.1.0</span></h1>
      </header>

      <main className="container">
        {isLoading ? (
          <div className="loading-screen">
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="error-screen">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn-secondary">Retry</button>
          </div>
        ) : status === 'setting' ? (
          <section className="setup-area">
            <div className="input-group">
              <label>Topic</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter debate topic..." />
            </div>

            <div className="input-group">
              <label>Turns: {maxTurns}</label>
              <input type="range" min="1" max="10" value={maxTurns} onChange={(e) => setMaxTurns(parseInt(e.target.value))} />
            </div>

            <div className="agents-setup">
              <div className="section-header">
                <h3>Agents (Max 5)</h3>
                <button onClick={randomizeAll} className="btn-secondary">﨟櫁ｻｸ Randomize</button>
              </div>
              
              {selectedAgents.map((agent, index) => (
                <div key={agent.id} className="agent-config-card">
                  <select value={agent.role} onChange={(e) => updateAgent(index, 'role', e.target.value)}>
                    {roles.map(r => <option key={r.id} value={r.role}>{r.role} ({r.name})</option>)}
                  </select>
                  <select value={agent.modelId} onChange={(e) => updateAgent(index, 'modelId', e.target.value)}>
                    {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <button onClick={() => removeAgent(index)} className="btn-danger">Remove</button>
                </div>
              ))}
              
              {selectedAgents.length < 5 && (
                <button onClick={addAgent} className="btn-add">+ Add Agent</button>
              )}
            </div>

            <button onClick={startDebate} className="btn-primary start-btn" disabled={!topic || selectedAgents.length === 0}>
              Start Debate
            </button>
          </section>
        ) : (
          <section className="debate-area">
            <div className="debate-header">
              <h2>Topic: {topic}</h2>
              {status === 'completed' && (
                <div className="action-buttons">
                  <button onClick={() => setStatus('setting')} className="btn-secondary">Reset</button>
                  <button onClick={downloadMarkdown} className="btn-primary">Download Markdown</button>
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
              {isTyping && <div className="typing-indicator">Thinking...</div>}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
