# 🛡️ CyberGuard AI — Deep Dive into the Four Core Tools

This document is your **complete technical reference** for the four major tools (modules) that power CyberGuard AI. Each section explains **what** the tool does, **why** it exists, **how** it works internally, and the **exact code flow** from button click to database.

---

## Table of Contents

1. [🤖 Tool 1: AI Analyst (Agentic AI Chat)](#-tool-1-ai-analyst-agentic-ai-chat)
2. [☣️ Tool 2: Threat Detection & Management Engine](#️-tool-2-threat-detection--management-engine)
3. [📊 Tool 3: SIEM Log Monitoring System](#-tool-3-siem-log-monitoring-system)
4. [🔐 Tool 4: Authentication & Identity System](#-tool-4-authentication--identity-system)

---

---

## 🤖 Tool 1: AI Analyst (Agentic AI Chat)

### What It Does
The AI Analyst is an **autonomous cybersecurity chatbot** that acts as your personal Security Operations Center (SOC) analyst. You can ask it anything about threats, attack patterns, incident response, or SIEM log interpretation, and it responds with expert-level analysis in real time.

### Why It's "Agentic"
The word **"Agentic"** means the AI doesn't just answer questions — it has a **defined role and expertise**. Before any conversation, the system injects a hidden "System Prompt" that tells the AI:

> *"You are CyberGuard AI, an expert autonomous cybersecurity analyst and threat intelligence assistant."*

This prompt gives the AI six specialized capabilities:
1. Threat Detection & Analysis
2. Incident Response Playbooks
3. SIEM Log Interpretation
4. MITRE ATT&CK Threat Intelligence
5. Vulnerability Assessment
6. Security Best Practices

This means even if you ask a vague question like "help me", the AI will always respond *as a cybersecurity expert*, not a generic chatbot.

### How It Works (Step by Step)

```
┌──────────────────────────────────────────────────────────────────┐
│  USER types "How do I respond to a ransomware incident?"        │
└──────────────┬───────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│  FRONTEND (AiChatPage.js)                                       │
│  1. Adds user message to the chat history array                 │
│  2. Sends POST request to backend: /api/ai/chat                 │
│     Body: { messages: [last 10 messages] }                      │
└──────────────┬───────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│  BACKEND (aiController.js → chat function)                      │
│  1. Receives the messages array                                 │
│  2. Initializes Groq SDK client with GROQ_API_KEY               │
│  3. Prepends the SYSTEM_PROMPT (the "agent identity")           │
│  4. Sends to Groq API:                                          │
│     - Model: llama-3.3-70b-versatile                            │
│     - Temperature: 0.3 (low = precise, not creative)            │
│     - Max Tokens: 800                                           │
│  5. Receives the AI's response                                  │
│  6. Sends it back to frontend as JSON                           │
└──────────────┬───────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│  FRONTEND                                                       │
│  1. Adds the AI response to the chat array                      │
│  2. Scrolls to bottom so user sees the new message              │
│  3. Removes the "typing" animation                              │
└──────────────────────────────────────────────────────────────────┘
```

### Sub-Feature: Threat Intelligence Lookup

Besides the chat, there's a **sidebar panel** on the AI page where you can type any threat name (e.g., "LockBit", "APT29", "CVE-2024-1234") and get a focused intelligence report.

**How it works:**
- Frontend sends `GET /api/ai/threat-intel/LockBit` to the backend.
- Backend creates a special prompt: *"Provide threat intelligence about LockBit. Include known TTPs, affected systems, detection methods, and mitigation strategies."*
- Groq AI generates a focused, concise intel report (under 400 words).
- Result is displayed in the sidebar.

### Sub-Feature: SIEM Log Analysis

The AI can also **analyze raw log data** and return a structured JSON report:

```json
{
  "summary": "SQL injection attempt targeting login endpoint",
  "severity": "critical",
  "indicators": ["OR 1=1--", "Suspicious User-Agent"],
  "recommendations": ["Block source IP", "Patch input validation"],
  "mitreTechniques": ["T1190 - Exploit Public-Facing Application"]
}
```

### Key Files
| File | Purpose |
|------|---------|
| `frontend/src/pages/AiChatPage.js` | The chat UI, message rendering, and suggestion buttons |
| `backend/controllers/aiController.js` | All AI logic: chat, log analysis, threat intel |
| `backend/routes/ai.js` | URL routing for `/api/ai/*` endpoints |

---

---

## ☣️ Tool 2: Threat Detection & Management Engine

### What It Does
This is the **core of the entire platform**. It manages the lifecycle of every cyber threat — from the moment it's detected to when it's resolved. Think of it as a **ticket system for security incidents**, but with AI superpowers.

### Threat Lifecycle
Every threat in the system goes through this lifecycle:

```
┌─────────────┐    ┌────────────────┐    ┌───────────────┐    ┌─────────────────┐
│   ACTIVE     │───▶│ INVESTIGATING  │───▶│   RESOLVED    │    │ FALSE POSITIVE  │
│ (New threat) │    │ (Being analyzed│    │ (Threat gone) │    │ (Was not real)  │
└─────────────┘    │  by analyst)   │    └───────────────┘    └─────────────────┘
                   └────────────────┘
```

### Threat Data Model (What a Threat Looks Like)
Every threat stored in MongoDB has these fields:

| Field | Type | Example | Description |
|-------|------|---------|-------------|
| `title` | String | "SQL Injection Attempt" | Human-readable name |
| `description` | String | "Automated SQL injection pattern..." | What happened |
| `severity` | Enum | `critical`, `high`, `medium`, `low`, `info` | How dangerous it is |
| `category` | Enum | `malware`, `intrusion`, `ddos`, `phishing`, `ransomware`, `insider`, `apt` | Type of attack |
| `status` | Enum | `active`, `investigating`, `resolved`, `false_positive` | Current state |
| `sourceIP` | String | "185.220.101.45" | Where the attack came from |
| `destinationIP` | String | "10.0.0.5" | What was targeted |
| `protocol` | String | "HTTPS", "SSH", "RDP" | Network protocol used |
| `country` | String | "Russia", "Internal" | Origin country |
| `detectedBy` | Enum | `ai_agent`, `rule_engine`, `manual`, `siem` | Who/what found it |
| `aiAnalysis` | String | (AI-generated text) | The AI's analysis of the threat |
| `automatedResponseApplied` | Boolean | `true` / `false` | Was an auto-response triggered? |
| `automatedResponseAction` | String | "Source IP blocked..." | What the auto-response did |

### How the Dashboard Gets Its Data

When you open the Dashboard, this happens:

```
┌──────────────────────────────────────────────────────────────────┐
│  FRONTEND (DashboardPage.js)                                    │
│  1. Calls GET /api/threats/stats on page load                   │
└──────────────┬───────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│  BACKEND (threatController.js → getThreatStats)                 │
│  1. Checks if MongoDB is empty                                  │
│  2. If empty → Seeds 8 realistic mock threats automatically     │
│  3. Runs MongoDB aggregation queries in parallel:               │
│     - Group by severity → for Pie Chart                         │
│     - Group by status → for status badges                       │
│     - Group by category → for Bar Chart                         │
│     - Find recent active threats → for threat list              │
│  4. Counts total, active, critical, resolved threats            │
│  5. Returns all stats as a single JSON response                 │
└──────────────┬───────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│  FRONTEND                                                       │
│  1. Stat Cards show: Total, Active, Critical, Resolved          │
│  2. Area Chart shows: 24-hour threat activity trend             │
│  3. Pie Chart shows: Severity distribution (donut)              │
│  4. Bar Chart shows: Threats grouped by category                │
│  5. List shows: Recent active threats with click-to-detail      │
└──────────────────────────────────────────────────────────────────┘
```

### AI-Powered Threat Analysis

When you click "Analyze" on a specific threat:

1. Backend fetches the full threat from MongoDB.
2. It constructs a detailed prompt including the threat's title, category, severity, IPs, protocol, and country.
3. Sends it to Groq AI (`llama-3.3-70b-versatile`).
4. The AI returns a structured analysis with:
   - Threat summary
   - Immediate response actions
   - Long-term mitigation strategy
5. The analysis is **saved back to MongoDB** so it persists.

### Automated Response System

When you click "Auto-Respond", the system executes a **pre-defined playbook** based on the threat category:

| Category | Automated Response |
|----------|-------------------|
| `ddos` | Rate limiting applied. Traffic scrubbing enabled. Upstream filtering activated. |
| `malware` | Endpoint quarantined. Process terminated. Hash blacklisted. |
| `intrusion` | Source IP blocked at perimeter firewall. Session terminated. |
| `phishing` | Email sender blacklisted. Affected mailboxes flagged. Users notified. |
| `ransomware` | Endpoint isolated. Network shares disconnected. Backup restoration initiated. |
| `apt` | Lateral movement paths blocked. Compromised credentials reset. Forensic capture started. |
| `insider` | User session terminated. Access revoked. HR and legal team notified. |

### Key Files
| File | Purpose |
|------|---------|
| `frontend/src/pages/DashboardPage.js` | Stats, charts, and overview |
| `frontend/src/pages/ThreatDetailPage.js` | Single threat view with AI analysis |
| `backend/controllers/threatController.js` | All CRUD + AI analysis + auto-response |
| `backend/models/Threat.js` | MongoDB schema for threats |
| `backend/routes/threats.js` | URL routing for `/api/threats/*` |

---

---

## 📊 Tool 3: SIEM Log Monitoring System

### What It Does
**SIEM** stands for **Security Information and Event Management**. This tool collects, stores, and displays security event logs from across your entire infrastructure — firewalls, IDS/IPS systems, endpoints, email gateways, DNS servers, and more.

In a real enterprise, a SIEM system ingests *millions* of logs per day. CyberGuard AI simulates this with realistic mock data and provides the ability to ingest real logs via API.

### What Types of Logs Are Tracked

| Source | Event Type | Example Log Message |
|--------|-----------|-------------------|
| **Firewall** | BLOCK | Inbound connection blocked from 185.220.101.45 to 10.0.0.5:443 |
| **IDS/IPS** | ALERT | SQL injection pattern detected: `OR 1=1--` in request body |
| **Endpoint** | PROCESS | Suspicious process spawned: `cmd.exe /c powershell -enc ...` |
| **Authentication** | FAIL | Failed login attempt #1247 for user admin from 198.51.100.23 |
| **DNS** | QUERY | DNS query to known C2 domain: `update.malicious-domain.ru` |
| **Email Gateway** | PHISH | Phishing email blocked: sender spoofing hr@company.com |
| **SIEM Correlation** | CORRELATION | Lateral movement detected: 5 systems accessed in 2 minutes |
| **DLP** | EXFIL | Large data transfer detected: 2.4GB uploaded to Dropbox |
| **Vuln Scanner** | SCAN | Scheduled scan completed: 3 critical CVEs found |
| **WAF** | BLOCK | XSS attempt blocked: script injection in form field |

### How It Works

```
┌──────────────────────────────────────────────────────────────────┐
│  FRONTEND (SiemPage.js)                                         │
│  1. Calls GET /api/siem/logs on page load                       │
│  2. Supports filtering by severity and source                   │
│  3. Supports pagination (50 logs per page)                      │
└──────────────┬───────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│  BACKEND (siemController.js → getLogs)                          │
│  1. Checks if MongoDB has any logs                              │
│  2. If empty → Seeds 10 realistic mock SIEM logs                │
│  3. Applies optional filters (severity, source)                 │
│  4. Sorts by timestamp (newest first)                           │
│  5. Returns paginated results                                   │
└──────────────┬───────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│  FRONTEND                                                       │
│  Renders a table showing:                                       │
│  • Timestamp                                                    │
│  • Source (Firewall, IDS, Endpoint, etc.)                        │
│  • Event Type (BLOCK, ALERT, FAIL, etc.)                        │
│  • Severity Badge (critical/high/medium/low/info)               │
│  • Log Message                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Log Ingestion API

Real SIEM systems push logs into the platform. CyberGuard AI supports this via:

```
POST /api/siem/ingest
Content-Type: application/json

{
  "source": "Firewall",
  "eventType": "BLOCK",
  "severity": "high",
  "message": "Blocked connection from 10.20.30.40",
  "rawData": { "action": "DENY", "bytes": 2048 }
}
```

This means you could connect a real firewall, IDS, or any security tool to CyberGuard AI and it would ingest and display those logs in real time.

### SIEM Stats API

The `/api/siem/stats` endpoint returns aggregated statistics:
- Total log count
- Logs grouped by severity
- Logs grouped by source

### Key Files
| File | Purpose |
|------|---------|
| `frontend/src/pages/SiemPage.js` | Log table UI with filters |
| `backend/controllers/siemController.js` | Log CRUD, ingestion, and stats |
| `backend/models/SiemLog.js` | MongoDB schema for logs |
| `backend/routes/siem.js` | URL routing for `/api/siem/*` |

---

---

## 🔐 Tool 4: Authentication & Identity System

### What It Does
This tool handles **who can access the platform**. It supports two methods of authentication:
1. **Email/Password** — Traditional registration and login with encrypted passwords.
2. **Google OAuth** — One-click login using your Google account.

Both methods generate a **JWT (JSON Web Token)** that acts as your "security pass" for all subsequent API requests.

### How Email/Password Auth Works

#### Registration Flow
```
┌──────────────────────────────────────────────────────────────────┐
│  USER fills out: Name, Email, Password → clicks "Create Account"│
└──────────────┬───────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│  FRONTEND (LoginPage.js)                                        │
│  Sends POST /api/auth/register                                  │
│  Body: { name, email, password }                                │
└──────────────┬───────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│  BACKEND (authController.js → register)                         │
│  1. Validates all fields are present                            │
│  2. Checks if email already exists in MongoDB                   │
│  3. Creates new User document (password is auto-hashed          │
│     using bcrypt with 12 salt rounds via mongoose pre-save)     │
│  4. Generates JWT token (signed with JWT_SECRET, expires 7d)    │
│  5. Returns { token, user } to frontend                         │
└──────────────┬───────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│  FRONTEND (AuthContext.js)                                      │
│  1. Stores the JWT token in localStorage                        │
│  2. Stores the user object in React state                       │
│  3. Redirects to /dashboard                                     │
│  4. All future API calls include: Authorization: Bearer <token> │
└──────────────────────────────────────────────────────────────────┘
```

#### Login Flow
```
┌──────────────────────────────────────────────────────────────────┐
│  BACKEND (authController.js → login)                            │
│  1. Finds user by email (with password field selected)          │
│  2. Checks authProvider is "local" (not a Google-only account)  │
│  3. Compares password hash using bcrypt                         │
│  4. Updates lastLogin timestamp                                 │
│  5. Generates and returns JWT token                             │
└──────────────────────────────────────────────────────────────────┘
```

### How Google OAuth Works

This is the more complex but more interesting flow:

```
┌──────────────────────────────────────────────────────────────────┐
│  Step 1: Page Load                                              │
│  - Google Identity Services (GSI) library loads via <script>    │
│  - Frontend initializes Google with the CLIENT_ID               │
│  - Google renders the "Continue with Google" button              │
└──────────────┬───────────────────────────────────────────────────┘
               │ User clicks the button
               ▼
┌──────────────────────────────────────────────────────────────────┐
│  Step 2: Google Popup                                           │
│  - A popup window opens showing Google's login page             │
│  - User selects their Google account                            │
│  - Google creates a JWT "credential" token containing:          │
│    • sub (unique Google ID)                                     │
│    • name                                                       │
│    • email                                                      │
│    • picture (avatar URL)                                       │
│  - Google sends this credential to our callback function        │
└──────────────┬───────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│  Step 3: Frontend → Backend                                     │
│  - Frontend sends POST /api/auth/google                         │
│  - Body: { credential: "eyJhbGciOi..." }                       │
└──────────────┬───────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│  Step 4: Backend Verification                                   │
│  (authController.js → googleAuth)                               │
│  1. Creates a Google OAuth2Client instance                      │
│  2. Calls client.verifyIdToken() to:                            │
│     - Verify the token signature with Google's public keys      │
│     - Check the audience matches our CLIENT_ID                  │
│     - Extract the payload (name, email, picture, googleId)      │
│  3. Searches MongoDB for existing user by googleId OR email     │
│  4. If found → Updates avatar, lastLogin, marks as "google"     │
│  5. If not found → Creates brand new user with Google data      │
│  6. Generates our own JWT token                                 │
│  7. Returns { token, user } to frontend                         │
└──────────────┬───────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────┐
│  Step 5: Frontend stores token → Redirects to Dashboard         │
└──────────────────────────────────────────────────────────────────┘
```

### JWT Protection Middleware

Every protected API route (threats, AI, SIEM) passes through the `protect` middleware:

```
Request comes in with header: "Authorization: Bearer eyJhbGci..."
       │
       ▼
┌──────────────────────────────────────────────────────────────────┐
│  middleware/auth.js → protect()                                 │
│  1. Extracts the token from the Authorization header            │
│  2. Verifies the token using jwt.verify(token, JWT_SECRET)      │
│  3. If invalid/expired → returns 401 Unauthorized               │
│  4. If valid → decodes the user ID from the token               │
│  5. Fetches the full user from MongoDB                          │
│  6. Attaches user to req.user                                   │
│  7. Calls next() → request continues to the controller          │
└──────────────────────────────────────────────────────────────────┘
```

### Security Features
| Feature | Implementation |
|---------|---------------|
| Password Hashing | bcrypt with 12 salt rounds (one-way, can't be reversed) |
| Rate Limiting | 20 auth attempts per 15 minutes per IP address |
| JWT Expiration | Tokens expire after 7 days |
| Google Token Verification | Server-side verification against Google's public keys |
| CORS Protection | Only `https://cyberguard-ai-three.vercel.app` is allowed |

### Key Files
| File | Purpose |
|------|---------|
| `frontend/src/pages/LoginPage.js` | Login/Register form + Google button |
| `frontend/src/context/AuthContext.js` | Token storage, user state, logout |
| `backend/controllers/authController.js` | Register, Login, Google Auth, Get Me |
| `backend/middleware/auth.js` | JWT verification middleware |
| `backend/models/User.js` | MongoDB schema for users |
| `backend/routes/auth.js` | URL routing + rate limiting for `/api/auth/*` |

---

---

## 🔗 How All Four Tools Connect

```
                    ┌─────────────────────────────────┐
                    │      AUTHENTICATION (Tool 4)     │
                    │  Guards every request with JWT   │
                    └────────────┬────────────────────┘
                                 │ Protected Routes
               ┌─────────────────┼──────────────────┐
               ▼                 ▼                   ▼
   ┌───────────────────┐ ┌──────────────┐  ┌────────────────┐
   │ THREAT ENGINE (2)  │ │ AI ANALYST(1)│  │ SIEM LOGS (3)  │
   │ CRUD + Auto-Respond│ │ Chat + Intel │  │ Ingest + View  │
   └────────┬──────────┘ └──────┬───────┘  └────────────────┘
            │                   │
            │   ┌───────────────┘
            ▼   ▼
   ┌──────────────────┐
   │   GROQ AI (LLM)  │
   │  llama-3.3-70b   │
   │  Analyzes threats │
   │  Powers the chat  │
   └──────────────────┘
```

**The flow:**
1. **Tool 4 (Auth)** verifies your identity on every request.
2. **Tool 2 (Threats)** manages incident lifecycle and calls **Tool 1 (AI)** to analyze threats.
3. **Tool 3 (SIEM)** feeds raw log data that can also be analyzed by **Tool 1 (AI)**.
4. **Tool 1 (AI)** is the brain — it powers the chat, threat analysis, log analysis, and intel lookups.

---

## 🎓 Summary Table

| Tool | Frontend Page | Backend Controller | Database Model | External API |
|------|--------------|-------------------|----------------|-------------|
| 🤖 AI Analyst | `AiChatPage.js` | `aiController.js` | None (stateless) | Groq AI |
| ☣️ Threat Engine | `DashboardPage.js`, `ThreatDetailPage.js` | `threatController.js` | `Threat.js` | Groq AI |
| 📊 SIEM Logs | `SiemPage.js` | `siemController.js` | `SiemLog.js` | None |
| 🔐 Auth System | `LoginPage.js` | `authController.js` | `User.js` | Google OAuth |

---

**You now have a complete, deep understanding of every tool in CyberGuard AI. Go build something amazing!** 🚀
