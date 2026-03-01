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
      } catch (err) {
        console.error("Fetch error:", err);
        setError("郢昴・繝ｻ郢ｧ・ｿ邵ｺ・ｮ髫ｱ・ｭ邵ｺ・ｿ髴趣ｽｼ邵ｺ・ｿ邵ｺ・ｫ陞滂ｽｱ隰ｨ蜉ｱ・邵ｺ・ｾ邵ｺ蜉ｱ笳・ｸｲ・壬enRouter邵ｺ・ｮAPI郢ｧ・ｭ郢晢ｽｼ邵ｺ譴ｧ・ｭ・｣邵ｺ蜉ｱ・･髫ｪ・ｭ陞ｳ螢ｹ・・ｹｧ蠕娯ｻ邵ｺ繝ｻ・狗ｸｺ荵敖竏壹＠郢晢ｽｼ郢晁・繝ｻ邵ｺ・ｮ霑･・ｶ隲ｷ荵晢ｽ帝￡・ｺ髫ｱ髦ｪ・邵ｺ・ｦ邵ｺ荳岩味邵ｺ霈費ｼ樒ｸｲ繝ｻ);
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
    await processTurn(moderatorAgent, "邵ｺ譏ｴ・檎ｸｺ・ｧ邵ｺ・ｯ髫ｴ・ｰ髫ｲ謔ｶ・帝ｫ｢蜿･・ｧ荵晢ｼ邵ｺ・ｾ邵ｺ蜉ｱ・・ｸｺ繝ｻﾂ繧・ｽｻ鬆大ｾ狗ｸｺ・ｮ郢晏現繝ｴ郢昴・縺醍ｸｺ・ｯ邵ｲ繝ｻ + topic + "邵ｲ髦ｪ縲堤ｸｺ蜷ｶﾂ繧・穐邵ｺ螢ｹ繝ｻ騾ｧ繝ｻ・・ｹｧ阮吶・邵ｺ逍ｲﾑ埼囎荵晢ｽ堤ｸｺ鬘倪裸邵ｺ荵昶雷邵ｺ荳岩味邵ｺ霈費ｼ樒ｸｲ繝ｻ, currentHistory);

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
    let md = `# 髫ｴ・ｰ髫ｲ蜀ｶ・ｨ蛟ｬ鮖ｸ: ${topic}\n\n`;
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
        <h1>AI-Debate Studio <span style={{fontSize: '14px', opacity: 0.5}}>v1.0.4</span></h1>
      </header>

      <main className="container">
        {isLoading ? (
          <div className="loading-screen">
            <p>髫ｴ・ｰ髫ｲ謔ｶ繝ｻ雋・摩・咏ｹｧ蛛ｵ・邵ｺ・ｦ邵ｺ繝ｻ竏ｪ邵ｺ繝ｻ..</p>
            <div className="debug-info">API邵ｺ・ｸ邵ｺ・ｮ隰暦ｽ･驍ｯ螢ｹ・帝￡・ｺ髫ｱ蝣ｺ・ｸ・ｭ...</div>
          </div>
        ) : error ? (
          <div className="error-screen">
            <h3>隰暦ｽ･驍ｯ螢ｹ縺顔ｹ晢ｽｩ郢晢ｽｼ</h3>
            <p style={{color: '#ff6b6b'}}>{error}</p>
            <div style={{fontSize: '12px', marginTop: '10px', opacity: 0.7}}>
              郢晏・ﾎｦ郢昴・ Vercel邵ｺ・ｮ霑ｺ・ｰ陟・・・､逕ｻ辟夂ｸｺ・ｫ OPENROUTER_API_KEY 邵ｺ譴ｧ・ｭ・｣邵ｺ蜉ｱ・･髫ｪ・ｭ陞ｳ螢ｹ・・ｹｧ蠕娯ｻ邵ｺ繝ｻ・狗ｸｺ迢暦ｽ｢・ｺ髫ｱ髦ｪ・邵ｺ・ｦ邵ｺ荳岩味邵ｺ霈費ｼ樒ｸｲ繝ｻ            </div>
            <button onClick={() => window.location.reload()} className="btn-secondary" style={{marginTop: '20px'}}>陷蟠趣ｽｪ・ｭ邵ｺ・ｿ髴趣ｽｼ邵ｺ・ｿ</button>
          </div>
        ) : status === 'setting' ? (
          <section className="setup-area">
            <div className="input-group">
              <label>髫ｴ・ｰ髫ｲ謔ｶ繝ｻ郢晏現繝ｴ郢昴・縺・/label>
              <input 
                type="text" 
                value={topic} 
                onChange={(e) => setTopic(e.target.value)} 
                placeholder="關薙・ AI邵ｺ・ｯ闔・ｺ鬯俶ｧｭ・定ｬｨ莉｣竕ｧ邵ｺ蜈ｷ・ｼ繝ｻ
              />
            </div>

            <div className="input-group">
              <label>郢ｧ・ｿ郢晢ｽｼ郢晢ｽｳ隰ｨ・ｰ: {maxTurns}</label>
              <input 
                type="range" 
                min="1" max="10" 
                value={maxTurns} 
                onChange={(e) => setMaxTurns(parseInt(e.target.value))} 
              />
            </div>

            <div className="agents-setup">
              <div className="section-header">
                <h3>陷ｿ繧・・郢ｧ・ｨ郢晢ｽｼ郢ｧ・ｸ郢ｧ・ｧ郢晢ｽｳ郢昴・(隴崢陞滂ｽｧ5陷ｷ繝ｻ</h3>
                <button onClick={randomizeAll} className="btn-secondary">﨟櫁ｻｸ 郢晢ｽｩ郢晢ｽｳ郢敖郢晢｣ｰ髫ｪ・ｭ陞ｳ繝ｻ/button>
              </div>
              
              {selectedAgents.map((agent, index) => (
                <div key={agent.id} className="agent-config-card">
                  <select value={agent.role} onChange={(e) => updateAgent(index, 'role', e.target.value)}>
                    {roles.map(r => <option key={r.id} value={r.role}>{r.role} ({r.name})</option>)}
                  </select>
                  <select value={agent.modelId} onChange={(e) => updateAgent(index, 'modelId', e.target.value)}>
                    {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                  <button onClick={() => removeAgent(index)} className="btn-danger">陷台ｼ∝求</button>
                </div>
              ))}
              
              {selectedAgents.length < 5 && (
                <button onClick={addAgent} className="btn-add">+ 郢ｧ・ｨ郢晢ｽｼ郢ｧ・ｸ郢ｧ・ｧ郢晢ｽｳ郢晏現・帝恆・ｽ陷会｣ｰ</button>
              )}
            </div>

            <button 
              onClick={startDebate} 
              className="btn-primary start-btn" 
              disabled={!topic || selectedAgents.length === 0}
            >
              髫ｴ・ｰ髫ｲ謔ｶ・帝ｫ｢蜿･・ｧ荵昶・郢ｧ繝ｻ            </button>
          </section>
        ) : (
          <section className="debate-area">
            <div className="debate-header">
              <h2>Topic: {topic}</h2>
              {status === 'completed' && (
                <div className="action-buttons">
                  <button onClick={() => setStatus('setting')} className="btn-secondary">隴崢陋ｻ譏ｴ竊楢ｬ鯉ｽｻ郢ｧ繝ｻ/button>
                  <button onClick={downloadMarkdown} className="btn-primary">Markdown郢ｧ蜑・ｽｿ譎擾ｽｭ繝ｻ/button>
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
                  AI邵ｺ譴ｧﾂ譎・繝ｻ・ｸ・ｭ... <span>.</span><span>.</span><span>.</span>
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
