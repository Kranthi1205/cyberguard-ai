# 🛡️ CyberGuard AI
### Agentic AI for Autonomous Cyber Threat Detection & Response

> A full-stack MERN application featuring AI-powered threat detection, SIEM log analysis, automated incident response, and an intelligent threat intelligence chatbot.

---

## 📋 Features

- **🔐 Authentication** — Email/password + Google OAuth2
- **⬡ AI Threat Analysis** — Per-threat Groq AI analysis with actionable insights
- **⚡ Automated Response** — One-click autonomous incident response execution
- **◈ SIEM Log Analysis** — AI-powered log parsing and MITRE ATT&CK mapping
- **◎ Threat Intelligence Chat** — Real-time AI chatbot powered by LLaMA 3.3
- **📊 SOC Dashboard** — Live charts: severity, category, activity timeline
- **📱 Mobile Responsive** — Works on all screen sizes
- **🎯 Mock + Real Data** — Ships with mock data, supports real SIEM integration

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm run install-all
```

### 2. Configure environment variables

**Backend** — Copy `.env.example` to `.env` in root:
```bash
cp .env.example .env
```

Fill in:
```env
MONGODB_URI=mongodb+srv://...        # MongoDB Atlas URI
JWT_SECRET=your_random_secret_here
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_secret
GROQ_API_KEY=gsk_...
CLIENT_URL=http://localhost:3000
```

**Frontend** — Copy `.env.example` to `.env` in `client/`:
```bash
cp client/.env.example client/.env
```

Fill in:
```env
REACT_APP_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

### 3. Run development server
```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/health

---

## 🔑 Credential Setup Guide

### MongoDB Atlas
1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Click **Connect** → **Drivers**
4. Copy the connection string
5. Replace `<username>`, `<password>` with your DB user credentials

### Google OAuth2
1. Go to https://console.cloud.google.com
2. Create a project → **APIs & Services** → **Credentials**
3. Click **Create Credentials** → **OAuth 2.0 Client IDs**
4. Application type: **Web application**
5. Add Authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://your-vercel-app.vercel.app` (production)
6. Add Authorized redirect URIs (same as above)
7. Copy **Client ID** and **Client Secret**

### Groq API
1. Go to https://console.groq.com
2. Sign up / log in
3. Go to **API Keys** → **Create API Key**
4. Copy the key (starts with `gsk_`)

---

## 🌐 Deployment

### Backend → Render
1. Push code to GitHub
2. Go to https://render.com → **New Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: (leave blank)
5. Add all environment variables from `.env`
6. Change `NODE_ENV=production`
7. Change `CLIENT_URL=https://your-vercel-url.vercel.app`

### Frontend → Vercel
1. Go to https://vercel.com → **New Project**
2. Import your GitHub repo
3. Settings:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Add environment variable:
   - `REACT_APP_GOOGLE_CLIENT_ID` = your Google Client ID
5. After deploy, update your Google Cloud Console with the Vercel URL

### Update API URL for Production
In `client/src/services/api.js`, the `baseURL` is `/api` which works via the proxy in dev.

For production, update to your Render backend URL:
```js
baseURL: process.env.REACT_APP_API_URL || '/api',
```

And add to Vercel env vars:
```
REACT_APP_API_URL=https://your-render-app.onrender.com/api
```

---

## 📁 Project Structure

```
cyberguard/
├── server/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Login, register, Google auth
│   │   ├── threatController.js# CRUD + AI analysis + auto-response
│   │   ├── aiController.js    # Groq chat + log analysis + threat intel
│   │   └── siemController.js  # SIEM log ingestion and retrieval
│   ├── middleware/
│   │   └── auth.js            # JWT protect middleware
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Threat.js          # Threat schema
│   │   └── SiemLog.js         # SIEM log schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── threats.js
│   │   ├── ai.js
│   │   └── siem.js
│   └── index.js               # Express server entry
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── context/
│       │   └── AuthContext.js # Global auth state
│       ├── services/
│       │   └── api.js         # Axios instance
│       ├── components/
│       │   └── layout/
│       │       └── Layout.js  # Sidebar + topbar
│       ├── pages/
│       │   ├── LoginPage.js   # Login + Google auth
│       │   ├── DashboardPage.js
│       │   ├── ThreatsPage.js
│       │   ├── ThreatDetailPage.js
│       │   ├── SiemPage.js
│       │   └── AiChatPage.js
│       ├── App.js
│       ├── index.js
│       └── index.css          # Global styles + CSS vars
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🔌 Real SIEM Data Integration

To ingest real logs into CyberGuard, POST to:
```
POST /api/siem/ingest
Authorization: Bearer <token>
Content-Type: application/json

{
  "source": "Palo Alto Firewall",
  "eventType": "THREAT",
  "severity": "high",
  "message": "Threat detected: CVE-2024-XXXX exploit attempt",
  "rawData": { ...your raw log object... }
}
```

You can pipe Splunk, Elastic SIEM, or any log shipper to this endpoint.

---

## 🤖 AI Models Used

- **LLaMA 3.3 70B Versatile** (via Groq) — Threat analysis, chat, log analysis
- Groq provides extremely fast inference (ideal for real-time SOC operations)

---

## 📜 License

MIT License — Built for academic/research purposes.
