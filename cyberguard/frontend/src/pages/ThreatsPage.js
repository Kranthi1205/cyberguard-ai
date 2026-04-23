import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SEVERITIES = ['', 'critical', 'high', 'medium', 'low', 'info'];
const STATUSES = ['', 'active', 'investigating', 'resolved', 'false_positive'];

export default function ThreatsPage() {
  const navigate = useNavigate();
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ severity: '', status: '', page: 1 });
  const [pagination, setPagination] = useState({});

  const fetchThreats = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.severity) params.set('severity', filters.severity);
      if (filters.status) params.set('status', filters.status);
      params.set('page', filters.page);
      params.set('limit', 15);
      const { data } = await api.get(`/threats?${params}`);
      if (data.success) { setThreats(data.threats); setPagination(data.pagination); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchThreats(); }, [fetchThreats]);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: 2 }}>THREAT DETECTION</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)', marginTop: 4 }}>Autonomous threat monitoring feed</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select className="input" style={{ width: 'auto', fontSize: 13 }} value={filters.severity} onChange={e => setFilter('severity', e.target.value)}>
            <option value="">All Severities</option>
            {SEVERITIES.filter(Boolean).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </select>
          <select className="input" style={{ width: 'auto', fontSize: 13 }} value={filters.status} onChange={e => setFilter('status', e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={fetchThreats}>↺ Refresh</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div className="spinner" style={{ width: 28, height: 28, margin: '0 auto 12px' }}></div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: 2 }}>SCANNING THREAT FEED...</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>STATUS</th>
                  <th>THREAT</th>
                  <th>SEVERITY</th>
                  <th>CATEGORY</th>
                  <th>SOURCE IP</th>
                  <th>DETECTED BY</th>
                  <th>TIME</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {threats.map(t => (
                  <tr key={t._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/threats/${t._id}`)}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div className={`pulse-dot ${t.status === 'active' ? 'red' : t.status === 'resolved' ? 'green' : 'yellow'}`}></div></div></td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{t.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</div>
                    </td>
                    <td><span className={`badge badge-${t.severity}`}>{t.severity}</span></td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>{t.category}</span></td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)' }}>{t.sourceIP || '—'}</span></td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{t.detectedBy}</span></td>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{new Date(t.createdAt).toLocaleString()}</span></td>
                    <td><button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); navigate(`/threats/${t._id}`); }}>View →</button></td>
                  </tr>
                ))}
                {threats.length === 0 && (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>NO THREATS FOUND</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
              Showing {threats.length} of {pagination.total} threats
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Prev</button>
              <span style={{ padding: '6px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>{filters.page}/{pagination.pages}</span>
              <button className="btn btn-ghost btn-sm" disabled={filters.page >= pagination.pages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
