import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../services/api';
import ThreatMap from '../components/dashboard/ThreatMap';

const SEVERITY_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#10b981', info: '#6366f1' };

const areaData = [
  { time: '00:00', threats: 4 }, { time: '03:00', threats: 6 }, { time: '06:00', threats: 3 },
  { time: '09:00', threats: 11 }, { time: '12:00', threats: 8 }, { time: '15:00', threats: 14 },
  { time: '18:00', threats: 9 }, { time: '21:00', threats: 7 }, { time: '23:59', threats: 5 },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/threats/stats').then(({ data }) => {
      if (data.success) setStats(data.stats);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, gap: 16 }}>
      <div className="spinner" style={{ width: 24, height: 24 }}></div>
      <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Loading Intelligence...</span>
    </div>
  );

  const severityData = stats?.bySeverity?.map(s => ({ name: s._id, value: s.count, color: SEVERITY_COLORS[s._id] })) || [];
  const categoryData = stats?.byCategory?.map(c => ({ name: c._id.toUpperCase(), count: c.count })) || [];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Overview
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
          Real-time threat monitoring and incident response metrics.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
        {[
          { label: 'Total Threats', value: stats?.total || 0, color: 'accent', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
          { label: 'Active Incidents', value: stats?.active || 0, color: 'red', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
          { label: 'Critical Alerts', value: stats?.critical || 0, color: 'red', icon: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01' },
          { label: 'Resolved Threats', value: stats?.resolved || 0, color: 'green', icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className={`stat-card ${color}`}>
            <div className={`stat-value ${color}`}>{value}</div>
            <div className="stat-label">{label}</div>
            <svg className="stat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: `var(--${color})` }}>
              {icon.includes('M') ? <path d={icon}></path> : null}
            </svg>
          </div>
        ))}
      </div>

      {/* 3D Threat Map */}
      <div style={{ marginBottom: 32 }}>
        <ThreatMap threats={stats?.recent || []} />
      </div>

      {/* Charts row */}
      <div className="grid-2-col" style={{ marginBottom: 24 }}>
        {/* Area chart */}
        <div className="card">
          <div className="card-title">Threat Activity (24H)</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="threatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                itemStyle={{ color: 'var(--accent)' }}
              />
              <Area type="monotone" dataKey="threats" stroke="var(--accent)" fill="url(#threatGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card">
          <div className="card-title">Severity Distribution</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, height: 220 }}>
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie data={severityData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={4} stroke="none">
                  {severityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {severityData.map(s => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: s.color, flexShrink: 0 }}></div>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize', flex: 1 }}>{s.name}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category bar chart + recent threats */}
      <div className="grid-2-col">
        <div className="card">
          <div className="card-title">Threats by Category</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={100} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'var(--bg-secondary)' }} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }} />
              <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent active threats */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-title">Recent Active Threats</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {(stats?.recent || []).slice(0, 5).map(t => (
              <div key={t._id} onClick={() => navigate(`/threats/${t._id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 6, cursor: 'pointer', border: '1px solid var(--border)', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div className="pulse-dot red" style={{ width: 6, height: 6 }}></div>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                <span className={`badge badge-${t.severity}`}>{t.severity}</span>
              </div>
            ))}
            {(!stats?.recent || stats.recent.length === 0) && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 40, background: 'var(--bg-secondary)', borderRadius: 6, border: '1px dashed var(--border)' }}>
                No active threats found.
              </div>
            )}
          </div>
          <button className="btn btn-ghost" onClick={() => navigate('/threats')} style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
            View all alerts →
          </button>
        </div>
      </div>
    </div>
  );
}
