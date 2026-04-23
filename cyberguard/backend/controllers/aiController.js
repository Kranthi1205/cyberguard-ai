const Groq = require('groq-sdk');

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) return null;
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const SYSTEM_PROMPT = `You are CyberGuard AI, an expert autonomous cybersecurity analyst and threat intelligence assistant. You help security operations center (SOC) analysts with:

1. Threat Detection & Analysis - Analyzing security events, logs, and indicators of compromise
2. Incident Response - Providing step-by-step response playbooks for cyber threats
3. SIEM Log Analysis - Interpreting security information and event management data
4. Threat Intelligence - Explaining TTPs (Tactics, Techniques, Procedures) from MITRE ATT&CK
5. Vulnerability Assessment - Identifying and prioritizing security vulnerabilities
6. Security Best Practices - Advising on security hardening and defense strategies

You are concise, technical, and actionable. Always prioritize containment and evidence preservation in incident response. When analyzing threats, reference relevant CVEs, MITRE techniques, or industry frameworks when applicable.`;

// @route POST /api/ai/chat
exports.chat = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages))
      return res.status(400).json({ success: false, message: 'Messages array required' });

    const groq = getGroqClient();
    if (!groq) {
      return res.json({
        success: true,
        message: 'CyberGuard AI [MOCK MODE]: Groq API key not configured. In production, I would analyze your security query using advanced AI models. Please add your GROQ_API_KEY to enable full AI capabilities.',
      });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-10), // last 10 messages for context
      ],
      max_tokens: 800,
      temperature: 0.3,
    });

    const reply = completion.choices[0]?.message?.content || 'Unable to generate response.';
    res.json({ success: true, message: reply });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/ai/analyze-log
exports.analyzeLog = async (req, res) => {
  try {
    const { logData } = req.body;
    if (!logData)
      return res.status(400).json({ success: false, message: 'Log data required' });

    const groq = getGroqClient();
    if (!groq) {
      return res.json({
        success: true,
        analysis: {
          summary: '[MOCK] Log analysis: Suspicious activity detected in provided log data.',
          severity: 'medium',
          indicators: ['Unusual port activity', 'High frequency requests', 'Known bad IP range'],
          recommendations: ['Block source IP', 'Review firewall rules', 'Enable enhanced logging'],
          mitreTechniques: ['T1190 - Exploit Public-Facing Application', 'T1046 - Network Service Scanning'],
        },
      });
    }

    const prompt = `Analyze this SIEM log data and provide a structured security analysis:

LOG DATA:
${logData}

Respond in JSON format with these exact fields:
{
  "summary": "Brief threat summary",
  "severity": "critical|high|medium|low|info",
  "indicators": ["list of IoCs found"],
  "recommendations": ["list of immediate actions"],
  "mitreTechniques": ["relevant MITRE ATT&CK techniques"]
}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a SIEM log analyzer. Always respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 600,
    });

    let analysis;
    try {
      const raw = completion.choices[0]?.message?.content || '{}';
      const clean = raw.replace(/```json|```/g, '').trim();
      analysis = JSON.parse(clean);
    } catch {
      analysis = { summary: completion.choices[0]?.message?.content, severity: 'unknown' };
    }

    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/ai/threat-intel/:query
exports.threatIntel = async (req, res) => {
  try {
    const { query } = req.params;
    const groq = getGroqClient();

    if (!groq) {
      return res.json({
        success: true,
        intel: `[MOCK] Threat Intelligence for "${query}": This is a known threat actor/technique. Configure your Groq API key for real AI-powered threat intelligence.`,
      });
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Provide threat intelligence about: ${query}. Include known TTPs, affected systems, detection methods, and mitigation strategies. Be concise (under 400 words).` },
      ],
      max_tokens: 600,
    });

    res.json({ success: true, intel: completion.choices[0]?.message?.content });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
