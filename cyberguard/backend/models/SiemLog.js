const mongoose = require('mongoose');

const siemLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  source: { type: String },
  eventType: { type: String },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low', 'info'],
    default: 'info',
  },
  message: { type: String },
  rawData: { type: mongoose.Schema.Types.Mixed },
  parsed: { type: Boolean, default: false },
  threatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Threat' },
  isMock: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('SiemLog', siemLogSchema);
