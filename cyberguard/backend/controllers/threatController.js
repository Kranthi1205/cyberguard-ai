const Groq = require('groq-sdk');
const Threat = require('../models/Threat');
const SiemLog = require('../models/SiemLog');

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) return null;
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

// Mock threat data for development
const generateMockThreats = () => {
  const threats = [
    {
      title: 'SQL Injection Attempt Detected',
      description: 'Automated SQL injection pattern detected from external IP targeting login endpoint.',
      severity: 'critical',
      category: 'intrusion',
      status: 'active',
      sourceIP: '185.220.101.45',
      destinationIP: '10.0.0.5',
      sourcePort: 54321,
      destinationPort: 443,
      protocol: 'HTTPS',
      country: 'Russia',
      detectedBy: 'ai_agent',
      isMock: true,
    },
    {
      title: 'Ransomware Signature Identified',
      description: 'File encryption behavior matching LockBit 3.0 ransomware signature detected on endpoint.',
      severity: 'critical',
      category: 'ransomware',
      status: 'investigating',
      sourceIP: '192.168.1.102',
      destinationIP: '10.0.0.1',
      protocol: 'SMB',
      country: 'Internal',
      detectedBy: 'ai_agent',
      isMock: true,
    },
    {
      title: 'DDoS Attack - Volumetric Flood',
      description: 'High-volume UDP flood attack targeting web server. Traffic exceeds 50Gbps threshold.',
      severity: 'high',
      category: 'ddos',
      status: 'active',
      sourceIP: '203.0.113.0/24',
      destinationIP: '10.0.0.10',
      destinationPort: 80,
      protocol: 'UDP',
      country: 'China',
      detectedBy: 'siem',
      isMock: true,
    },
    {
      title: 'Spear Phishing Email Campaign',
      description: 'Targeted phishing campaign mimicking internal HR emails detected. 15 users at risk.',
      severity: 'high',
      category: 'phishing',
      status: 'investigating',
      sourceIP: '91.195.240.120',
      protocol: 'SMTP',
      country: 'Ukraine',
      detectedBy: 'ai_agent',
      isMock: true,
    },
    {
      title: 'Brute Force Login Attempt',
      description: '1,200+ failed login attempts on SSH service from single IP in last 10 minutes.',
      severity: 'medium',
      category: 'intrusion',
      status: 'resolved',
      sourceIP: '198.51.100.23',
      destinationIP: '10.0.0.3',
      destinationPort: 22,
      protocol: 'SSH',
      country: 'Netherlands',
      detectedBy: 'rule_engine',
      isMock: true,
    },
    {
      title: 'APT Lateral Movement Detected',
      description: 'Advanced persistent threat actor performing lateral movement across internal network.',
      severity: 'critical',
      category: 'apt',
      status: 'active',
      sourceIP: '192.168.1.50',
      destinationIP: '192.168.1.100',
      protocol: 'RDP',
      country: 'Internal',
      detectedBy: 'ai_agent',
      isMock: true,
    },
    {
      title: 'Malware C2 Communication',
      description: 'Endpoint communicating with known malware command-and-control server.',
      severity: 'high',
      category: 'malware',
      status: 'investigating',
      sourceIP: '192.168.1.77',
      destinationIP: '45.33.32.156',
      destinationPort: 4444,
      protocol: 'TCP',
      country: 'USA',
      detectedBy: 'ai_agent',
      isMock: true,
    },
    {
      title: 'Insider Threat - Data Exfiltration',
      description: 'Unusual large file transfer to external cloud storage by privileged user after hours.',
      severity: 'high',
      category: 'insider',
      status: 'investigating',
      sourceIP: '192.168.1.25',
      destinationIP: '13.107.42.14',
      protocol: 'HTTPS',
      country: 'Internal',
      detectedBy: 'ai_agent',
      isMock: true,
    },
  ];
  return threats;
};

// @route GET /api/threats
exports.getThreats = async (req, res) => {
  try {
    const { status, severity, category, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (category) filter.category = category;

    // Seed mock data if empty
    const count = await Threat.countDocuments();
    if (count === 0) {
      await Threat.insertMany(generateMockThreats());
    }

    const threats = await Threat.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('assignedTo', 'name email');

    const total = await Threat.countDocuments(filter);

    res.json({
      success: true,
      threats,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/threats/stats
exports.getThreatStats = async (req, res) => {
  try {
    const count = await Threat.countDocuments();
    if (count === 0) await Threat.insertMany(generateMockThreats());

    const [bySeverity, byStatus, byCategory, recent] = await Promise.all([
      Threat.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
      Threat.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Threat.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Threat.find({ status: 'active' }).sort({ createdAt: -1 }).limit(5),
    ]);

    const total = await Threat.countDocuments();
    const active = await Threat.countDocuments({ status: 'active' });
    const critical = await Threat.countDocuments({ severity: 'critical' });
    const resolved = await Threat.countDocuments({ status: 'resolved' });

    res.json({ success: true, stats: { total, active, critical, resolved, bySeverity, byStatus, byCategory, recent } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/threats/:id
exports.getThreat = async (req, res) => {
  try {
    const threat = await Threat.findById(req.params.id).populate('assignedTo', 'name email');
    if (!threat) return res.status(404).json({ success: false, message: 'Threat not found' });
    res.json({ success: true, threat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/threats
exports.createThreat = async (req, res) => {
  try {
    const threat = await Threat.create({ ...req.body, detectedBy: req.body.detectedBy || 'manual' });
    res.status(201).json({ success: true, threat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/threats/:id
exports.updateThreat = async (req, res) => {
  try {
    const threat = await Threat.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!threat) return res.status(404).json({ success: false, message: 'Threat not found' });
    res.json({ success: true, threat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/threats/:id/analyze
exports.analyzeThreat = async (req, res) => {
  try {
    const threat = await Threat.findById(req.params.id);
    if (!threat) return res.status(404).json({ success: false, message: 'Threat not found' });

    const groq = getGroqClient();
    if (!groq) {
      return res.json({
        success: true,
        analysis: `[MOCK ANALYSIS] Threat: ${threat.title}\nSeverity: ${threat.severity.toUpperCase()}\nThis ${threat.category} attack from ${threat.sourceIP || 'unknown IP'} requires immediate attention. Recommend isolating affected systems and blocking source IP.`,
        suggestion: `1. Block source IP ${threat.sourceIP || 'unknown'} at firewall\n2. Isolate affected endpoints\n3. Collect forensic artifacts\n4. Notify SOC team`,
      });
    }

    const prompt = `You are an expert cybersecurity analyst AI. Analyze this security threat and provide a concise analysis and response plan:

Threat Title: ${threat.title}
Category: ${threat.category}
Severity: ${threat.severity}
Source IP: ${threat.sourceIP || 'Unknown'}
Destination IP: ${threat.destinationIP || 'Unknown'}
Protocol: ${threat.protocol || 'Unknown'}
Country of Origin: ${threat.country || 'Unknown'}
Description: ${threat.description || 'No description'}

Provide:
1. Threat Analysis (2-3 sentences)
2. Immediate Response Actions (bullet points)
3. Long-term Mitigation Strategy (2-3 points)

Be concise and actionable.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    });

    const analysis = completion.choices[0]?.message?.content || 'Analysis unavailable';

    await Threat.findByIdAndUpdate(req.params.id, { aiAnalysis: analysis });

    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/threats/:id/respond
exports.autoRespond = async (req, res) => {
  try {
    const threat = await Threat.findById(req.params.id);
    if (!threat) return res.status(404).json({ success: false, message: 'Threat not found' });

    const actions = {
      ddos: 'Rate limiting applied. Traffic scrubbing enabled. Upstream filtering activated.',
      malware: 'Endpoint quarantined. Process terminated. Hash blacklisted in threat intel.',
      intrusion: 'Source IP blocked at perimeter firewall. Session terminated. Alert escalated.',
      phishing: 'Email sender blacklisted. Affected mailboxes flagged. Users notified.',
      ransomware: 'Endpoint isolated. Network shares disconnected. Backup restoration initiated.',
      apt: 'Lateral movement paths blocked. Compromised credentials reset. Forensic capture started.',
      insider: 'User session terminated. Access revoked. HR and legal team notified.',
      other: 'Traffic blocked. Incident ticket created. SOC team alerted.',
    };

    const action = actions[threat.category] || actions.other;

    await Threat.findByIdAndUpdate(req.params.id, {
      automatedResponseApplied: true,
      automatedResponseAction: action,
      status: 'investigating',
    });

    res.json({ success: true, action, message: 'Automated response executed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
