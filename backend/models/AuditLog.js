const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  details: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);