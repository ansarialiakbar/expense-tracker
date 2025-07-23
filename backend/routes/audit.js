const express = require('express');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth(['admin']), async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('userId', 'email').sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;