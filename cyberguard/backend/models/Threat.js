const mongoose = require('mongoose');

const threatSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    default: 'medium',
  },
  category: {
    type: String,
    enum: ['malware', 'intrusion', 'ddos', 'phishing', 'ransomware', 'insider', 'apt', 'other'],
    default: 'other',
  },
  status: {
    type: String,
    enum: ['active', 'investigating', 'resolved', 'false_positive'],
    default: 'active',
  },
  sourceIP: { type: String },
  destinationIP: { type: String },
  sourcePort: { type: Number },
  destinationPort: { type: Number },
  protocol: { type: String },
  country: { type: String },
  aiAnalysis: { type: String },
  aiResponseSuggestion: { type: String },
  automatedResponseApplied: { type: Boolean, default: false },
  automatedResponseAction: { type: String },
  rawLog: { type: String },
  detectedBy: {
    type: String,
    enum: ['ai_agent', 'rule_engine', 'manual', 'siem'],
    default: 'ai_agent',
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  isMock: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Threat', threatSchema);
