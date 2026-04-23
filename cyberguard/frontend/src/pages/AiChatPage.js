import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';

const SUGGESTIONS = [
  'Analyze a SQL injection attack pattern',
  'What is the MITRE ATT&CK technique for lateral movement?',
  'How do I respond to a ransomware incident?',
  'Explain APT threat actor behaviors',
  'What are the signs of a DDoS attack?',
  'How to detect insider threats in SIEM logs?',
];

export default function AiChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '⬡ CyberGuard AI online. I am your autonomous threat intelligence analyst. I can help you analyze threats, interpret SIEM logs, develop incident response playbooks, and provide threat intelligence. What security concern can I help you with today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [intelQuery, setIntelQuery] = useState('');
  const [intel, setIntel] = useState('');
  const [intelLoading, setIntelLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg = { role: 'user', content: msg };
    setMessages(m => [...m, userMsg]);
    setLoading(true);
    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const { data } = await api.post('/ai/chat', { messages: history });
      if (data.success) setMessages(m => [...m, { role: 'assistant', content: data.message }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: '⚠ Connection error. Please try again.' }]);
    } finally { setLoading(false); }
  };

  const fetchIntel = async () => {
    if (!intelQuery.trim()) return;
    setIntelLoading(true); setIntel('');
    try {
      const { data } = await api.get(`/ai/threat-intel/${encodeURIComponent(intelQuery)}`);
      if (data.success) setIntel(data.intel);
    } catch (e) { setIntel('Failed to fetch threat intelligence.'); }
    finally { setIntelLoading(false); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, height: 'calc(100vh - 112px)' }}>
      {/* Chat */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="pulse-dot green"></div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--accent)', letterSpacing: 2 }}>CYBERGUARD AI ANALYST</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: 2 }}>POWERED BY GROQ LLaMA 3.3</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex', gap: 12, marginBottom: 20,
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
              animation: 'fadeIn 0.3s ease',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                background: m.role === 'user' ? 'linear-gradient(135deg, #0060aa, #00a8cc)' : 'rgba(0,212,255,0.1)',
                border: m.role === 'assistant' ? '1px solid rgba(0,212,255,0.3)' : 'none',
                color: m.role === 'user' ? '#fff' : 'var(--accent)',
              }}>
                {m.role === 'user' ? '👤' : '⬡'}
              </div>
              <div style={{
                maxWidth: '80%', padding: '12px 16px', borderRadius: 4,
                background: m.role === 'user' ? 'linear-gradient(135deg, rgba(0,96,170,0.3), rgba(0,168,204,0.2))' : 'var(--bg-secondary)',
                border: `1px solid ${m.role === 'user' ? 'rgba(0,168,204,0.3)' : 'var(--border)'}`,
                fontSize: 13, lineHeight: 1.7, color: 'var(--text-primary)',
                fontFamily: m.role === 'assistant' ? 'var(--font-mono)' : 'var(--font-body)',
                whiteSpace: 'pre-wrap',
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>⬡</div>
              <div style={{ display: 'flex', gap: 4, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 4, border: '1px solid var(--border)' }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-dot 1s infinite', animationDelay: `${i*0.2}s` }}></div>)}
              </div>
            </div>
          )}
          <div ref={bottomRef}></div>
        </div>

        {/* Suggestions */}
        <div style={{ padding: '0 16px 8px', display: 'flex', gap: 6, overflowX: 'auto' }}>
          {SUGGESTIONS.slice(0, 3).map(s => (
            <button key={s} onClick={() => sendMessage(s)}
              style={{ padding: '5px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 20, fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          <input className="input" placeholder="Ask about threats, incidents, MITRE techniques..." value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
            {loading ? <div className="spinner" style={{ width: 16, height: 16 }}></div> : 'Send'}
          </button>
        </div>
      </div>

      {/* Right panel - Threat Intel Lookup */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="card">
          <div className="card-title">◈ THREAT INTELLIGENCE LOOKUP</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input className="input" placeholder="e.g. LockBit, APT29, CVE-2024-..." value={intelQuery}
              onChange={e => setIntelQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchIntel()} />
            <button className="btn btn-primary btn-sm" onClick={fetchIntel} disabled={intelLoading || !intelQuery.trim()} style={{ justifyContent: 'center' }}>
              {intelLoading ? <><div className="spinner" style={{ width: 14, height: 14 }}></div> Searching...</> : '◎ Search Intel'}
            </button>
          </div>
          {intel && (
            <div style={{ marginTop: 14, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 3, padding: 14, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto' }}>
              {intel}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">QUICK QUERIES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => sendMessage(s)}
                style={{ padding: '9px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 3, fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                ▸ {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
