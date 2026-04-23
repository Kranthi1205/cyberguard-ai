const SiemLog = require('../models/SiemLog');

const mockLogs = [
  { source: 'Firewall', eventType: 'BLOCK', severity: 'high', message: 'Inbound connection blocked from 185.220.101.45:54321 to 10.0.0.5:443', rawData: { action: 'DENY', bytes: 1024 }, isMock: true },
  { source: 'IDS/IPS', eventType: 'ALERT', severity: 'critical', message: 'SQL injection pattern detected: OR 1=1-- in request body', rawData: { rule: 'SID:2100498', priority: 1 }, isMock: true },
  { source: 'Endpoint', eventType: 'PROCESS', severity: 'medium', message: 'Suspicious process spawned: cmd.exe /c powershell -enc ...', rawData: { pid: 4892, user: 'SYSTEM' }, isMock: true },
  { source: 'Authentication', eventType: 'FAIL', severity: 'medium', message: 'Failed login attempt #1247 for user admin from 198.51.100.23', rawData: { attempts: 1247, lockout: false }, isMock: true },
  { source: 'DNS', eventType: 'QUERY', severity: 'high', message: 'DNS query to known C2 domain: update.malicious-domain.ru', rawData: { domain: 'update.malicious-domain.ru', type: 'A' }, isMock: true },
  { source: 'Email Gateway', eventType: 'PHISH', severity: 'high', message: 'Phishing email blocked: sender spoofing hr@company.com', rawData: { subject: 'Urgent: Update your credentials', recipients: 15 }, isMock: true },
  { source: 'SIEM', eventType: 'CORRELATION', severity: 'critical', message: 'Lateral movement detected: 5 systems accessed in 2 minutes', rawData: { systems: ['WS001', 'WS045', 'SRV02', 'DC01', 'NAS01'] }, isMock: true },
  { source: 'DLP', eventType: 'EXFIL', severity: 'high', message: 'Large data transfer detected: 2.4GB uploaded to external storage', rawData: { destination: 'dropbox.com', size: '2.4GB', user: 'john.doe' }, isMock: true },
  { source: 'Vulnerability Scanner', eventType: 'SCAN', severity: 'info', message: 'Scheduled vulnerability scan completed: 3 critical CVEs found', rawData: { critial: 3, high: 12, medium: 28 }, isMock: true },
  { source: 'WAF', eventType: 'BLOCK', severity: 'medium', message: 'XSS attempt blocked: script injection in form field', rawData: { rule: 'XSS-001', uri: '/api/comments' }, isMock: true },
];

// @route GET /api/siem/logs
exports.getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, severity, source } = req.query;
    const filter = {};
    if (severity) filter.severity = severity;
    if (source) filter.source = source;

    const count = await SiemLog.countDocuments();
    if (count === 0) await SiemLog.insertMany(mockLogs);

    const logs = await SiemLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SiemLog.countDocuments(filter);
    res.json({ success: true, logs, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/siem/ingest
exports.ingestLog = async (req, res) => {
  try {
    const { source, eventType, severity, message, rawData } = req.body;
    const log = await SiemLog.create({ source, eventType, severity, message, rawData, isMock: false });
    res.status(201).json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/siem/stats
exports.getLogStats = async (req, res) => {
  try {
    const count = await SiemLog.countDocuments();
    if (count === 0) await SiemLog.insertMany(mockLogs);

    const bySeverity = await SiemLog.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]);
    const bySource = await SiemLog.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]);

    res.json({ success: true, stats: { total: count, bySeverity, bySource } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
