import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ThreatsPage from './pages/ThreatsPage';
import ThreatDetailPage from './pages/ThreatDetailPage';
import SiemPage from './pages/SiemPage';
import AiChatPage from './pages/AiChatPage';
import Layout from './components/layout/Layout';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:16 }}>
      <div style={{ fontFamily:'var(--font-display)', color:'var(--accent)', fontSize:14, letterSpacing:4 }}>CYBERGUARD AI</div>
      <div className="spinner" style={{ width:32, height:32 }}></div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
    <Route path="/threats" element={<ProtectedRoute><Layout><ThreatsPage /></Layout></ProtectedRoute>} />
    <Route path="/threats/:id" element={<ProtectedRoute><Layout><ThreatDetailPage /></Layout></ProtectedRoute>} />
    <Route path="/siem" element={<ProtectedRoute><Layout><SiemPage /></Layout></ProtectedRoute>} />
    <Route path="/ai-chat" element={<ProtectedRoute><Layout><AiChatPage /></Layout></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
