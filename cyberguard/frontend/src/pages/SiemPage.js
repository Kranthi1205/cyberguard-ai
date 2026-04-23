import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const SEV_ORDER = ['critical', 'high', 'medium', 'low', 'info'];

export default function SiemPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [severity, setSeverity] = useState('');
  const [analyzeText, setAnalyzeText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = severity ? `?severity=${severity}` : '';
      const [logsRes, statsRes] = await Promise.all([
        api.get(`/siem/logs${params}`),
        api.get('/siem/stats'),
      ]);
      if (logsRes.data.success) setLogs(logsRes.data.logs);
      if (statsRes.data.success) setStats(statsRes.data.stats);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [severity]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleAnalyze = async () => {
    if (!analyzeText.trim()) return;
    setAnalyzing(true); setAnalysisResult(null);
    try {
      const { data } = await api.post('/ai/analyze-log', { logData: analyzeText });
      if (data.success) setAnalysisResult(data.analysis);
    } catch (e) { console.error(e); }
    finally { setAnalyzing(false); }
  };

  const severityColor = (s) => ({ critical: 'var(--red)', high: 'var(--orange)', medium: 'var(--yellow)', low: 'var(--green)', info: 'var(--accent)' })[s] || 'var(--text-muted)';

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>SIEM LOG ANALYSIS</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)', marginTop: 4 }}>Security Information and Event Management</p>
      </div>

      {/* Stats bar */}
      {stats && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {SEV_ORDER.map(s => {
            const found = stats.bySeverity?.find(x => x._id === s);
            return (
              <button key={s} onClick={() => setSeverity(severity === s ? '' : s)}
                style={{ padding: '8px 16px', background: severity === s ? `${severityColor(s)}20` : 'var(--bg-card)', border: `1px solid ${severity === s ? severityColor(s) : 'var(--border)'}`, borderRadius: 3, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, color: severityColor(s), letterSpacing: 1 }}>
                {s.toUpperCase()} ({found?.count || 0})
              </button>
            );
          })}
          <button onClick={() => setSeverity('')} className="btn btn-ghost btn-sm">Clear Filter</button>
        </div>
      )}

      {/* AI Log Analyzer */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-title">◎ AI LOG ANALYZER — Paste any log data for instant AI analysis</div>
        <textarea
          className="input"
          placeholder={`Paste SIEM log data here...\n\nExample:\n2024-01-15 14:32:11 FIREWALL DENY IN=eth0 SRC=185.220.101.45 DST=10.0.0.5 PROTO=TCP SPT=54321 DPT=443\n2024-01-15 14:32:12 IDS ALERT SQL_INJECTION SRC=185.220.101.45 URI=/api/login PAYLOAD="OR 1=1--"`}
          rows={5}
          value={analyzeText}
          onChange={e => setAnalyzeText(e.target.value)}
          style={{ marginBottom: 12, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 11 }}
        />
        <button className="btn btn-primary btn-sm" onClick={handleAnalyze} disabled={analyzing || !analyzeText.trim()}>
          {analyzing ? <><div className="spinner" style={{ width: 14, height: 14 }}></div> Analyzing with AI...</> : '⬡ Analyze with AI'}
        </button>

        {analysisResult && (
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 3, padding: 14 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 8 }}>SUMMARY</div>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>{analysisResult.summary}</p>
              <div style={{ marginTop: 10 }}>
                <span className={`badge badge-${analysisResult.severity || 'info'}`}>{analysisResult.severity || 'unknown'}</span>
              </div>
            </div>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 3, padding: 14 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 8 }}>RECOMMENDATIONS</div>
              {(analysisResult.recommendations || []).map((r, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--green)' }}>▸</span>{r}
                </div>
              ))}
              {(analysisResult.mitreTechniques || []).length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 6 }}>MITRE ATT&CK</div>
                  {analysisResult.mitreTechniques.map((m, i) => (
                    <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)', marginBottom: 3 }}>{m}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Logs table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: 2, color: 'var(--accent)' }}>LIVE EVENT LOG</span>
          <button className="btn btn-ghost btn-sm" onClick={fetchLogs}>↺ Refresh</button>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" style={{ width: 24, height: 24, margin: '0 auto' }}></div></div>
        ) : (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {logs.map(log => (
              <div key={log._id} style={{ display: 'flex', gap: 12, padding: '10px 20px', borderBottom: '1px solid rgba(26,58,92,0.4)', alignItems: 'flex-start', fontSize: 12 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', minWidth: 140, paddingTop: 1 }}>
                  {new Date(log.timestamp).toLocaleString()}
                </span>
                <span style={{ minWidth: 100, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)' }}>{log.source}</span>
                <span style={{ minWidth: 70, fontFamily: 'var(--font-mono)', fontSize: 10, color: severityColor(log.severity), fontWeight: 600 }}>{log.severity?.toUpperCase()}</span>
                <span style={{ flex: 1, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
