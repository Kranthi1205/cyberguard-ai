import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ThreatDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [threat, setThreat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [responding, setResponding] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [responseMsg, setResponseMsg] = useState('');

  useEffect(() => {
    api.get(`/threats/${id}`).then(({ data }) => {
      if (data.success) {
        setThreat(data.threat);
        if (data.threat.aiAnalysis) setAnalysis(data.threat.aiAnalysis);
        if (data.threat.automatedResponseAction) setResponseMsg(data.threat.automatedResponseAction);
      }
    }).catch(() => navigate('/threats')).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAnalyze = async () => {
    setAnalyzing(true); setAnalysis('');
    try {
      const { data } = await api.post(`/threats/${id}/analyze`);
      if (data.success) setAnalysis(data.analysis);
    } catch (e) { setAnalysis('Analysis failed. Please try again.'); }
    finally { setAnalyzing(false); }
  };

  const handleRespond = async () => {
    setResponding(true);
    try {
      const { data } = await api.post(`/threats/${id}/respond`);
      if (data.success) {
        setResponseMsg(data.action);
        setThreat(t => ({ ...t, automatedResponseApplied: true, status: 'investigating' }));
      }
    } catch (e) { setResponseMsg('Response failed.'); }
    finally { setResponding(false); }
  };

  const updateStatus = async (status) => {
    try {
      const { data } = await api.put(`/threats/${id}`, { status });
      if (data.success) setThreat(data.threat);
    } catch (e) { console.error(e); }
  };

  if (loading) return <div style={{ padding: 60, textAlign: 'center' }}><div className="spinner" style={{ width: 32, height: 32, margin: '0 auto' }}></div></div>;
  if (!threat) return null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/threats')}>← Back</button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: 1 }}>{threat.title}</h1>
          <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
            <span className={`badge badge-${threat.severity}`}>{threat.severity}</span>
            <span className={`badge badge-${threat.status}`}>{threat.status?.replace('_', ' ')}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{threat.category} • {threat.detectedBy}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Threat info */}
        <div className="card">
          <div className="card-title">THREAT DETAILS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['Description', threat.description || '—'],
              ['Source IP', threat.sourceIP || '—'],
              ['Destination IP', threat.destinationIP || '—'],
              ['Protocol', threat.protocol || '—'],
              ['Country', threat.country || '—'],
              ['Source Port', threat.sourcePort || '—'],
              ['Dest Port', threat.destinationPort || '—'],
              ['Detected', new Date(threat.createdAt).toLocaleString()],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', minWidth: 100, paddingTop: 2 }}>{k}</span>
                <span style={{ fontSize: 13, fontFamily: ['Source IP','Destination IP'].includes(k) ? 'var(--font-mono)' : undefined, color: ['Source IP','Destination IP'].includes(k) ? 'var(--accent)' : 'var(--text-primary)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Status */}
          <div className="card">
            <div className="card-title">UPDATE STATUS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {['active', 'investigating', 'resolved', 'false_positive'].map(s => (
                <button key={s} className={`btn btn-sm ${threat.status === s ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => updateStatus(s)} style={{ justifyContent: 'center' }}>
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* AI Analysis */}
          <div className="card">
            <div className="card-title">⬡ AI THREAT ANALYSIS</div>
            <button className="btn btn-primary btn-sm" onClick={handleAnalyze} disabled={analyzing} style={{ marginBottom: 12, justifyContent: 'center' }}>
              {analyzing ? <><div className="spinner" style={{ width: 14, height: 14 }}></div> Analyzing...</> : '◎ Run AI Analysis'}
            </button>
            {analysis && (
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: 3, padding: 14, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                {analysis}
              </div>
            )}
          </div>

          {/* Auto Response */}
          <div className="card">
            <div className="card-title">⚡ AUTOMATED RESPONSE</div>
            {threat.automatedResponseApplied ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div className="pulse-dot green"></div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--green)' }}>RESPONSE APPLIED</span>
              </div>
            ) : (
              <button className="btn btn-danger btn-sm" onClick={handleRespond} disabled={responding} style={{ marginBottom: 12, justifyContent: 'center' }}>
                {responding ? <><div className="spinner" style={{ width: 14, height: 14 }}></div> Executing...</> : '⚡ Execute Auto-Response'}
              </button>
            )}
            {responseMsg && (
              <div style={{ background: 'rgba(0,255,157,0.05)', border: '1px solid rgba(0,255,157,0.2)', borderRadius: 3, padding: 14, fontSize: 12, color: 'var(--green)', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
                {responseMsg}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Raw Log */}
      {threat.rawLog && (
        <div className="card">
          <div className="card-title">RAW LOG DATA</div>
          <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', overflowX: 'auto', lineHeight: 1.6 }}>{threat.rawLog}</pre>
        </div>
      )}
    </div>
  );
}
