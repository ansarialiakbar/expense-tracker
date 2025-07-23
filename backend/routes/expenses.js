const express = require('express');
const multer = require('multer');
const fs = require('fs');
const Expense = require('../models/Expense');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const createObjectCsvWriter = require('csv-writer').createObjectCsvWriter;
const router = express.Router();

//  Ensure uploads folder exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

//  Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

//  Create expense
router.post('/', auth(['employee', 'admin']), upload.single('receipt'), async (req, res) => {
  try {
    console.log('REQ.BODY:', req.body);
    console.log('REQ.FILE:', req.file);

    const { amount, category, date, notes } = req.body;

    const expense = new Expense({
      userId: req.user.id,
      amount: parseFloat(amount),
      category,
      date,
      notes,
      receipt: req.file ? req.file.path : null,
    });

    await expense.save();

    await new AuditLog({
      action: 'expense_created',
      userId: req.user.id,
      details: `Expense of ${amount} in ${category} created`,
    }).save();

    res.status(201).json(expense);
  } catch (err) {
    console.error("Error saving expense:", err);
    res.status(500).json({ message: err.message });
  }
});

//  Get expenses
router.get('/', auth(['employee', 'admin']), async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const expenses = await Expense.find(filter).populate('userId', 'email');
    res.json(expenses);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//  Update status
router.put('/:id', auth(['admin']), async (req, res) => {
  const { status } = req.body;
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, { status }, { new: true });
    await new AuditLog({
      action: 'expense_updated',
      userId: req.user.id,
      details: `Expense ${req.params.id} status changed to ${status}`,
    }).save();
    res.json(expense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Export CSV
router.get('/export', auth(['admin']), async (req, res) => {
  try {
    const expenses = await Expense.find().populate('userId', 'email');
    const csvWriter = createObjectCsvWriter({
      path: 'expenses.csv',
      header: [
        { id: 'userId', title: 'User Email' },
        { id: 'amount', title: 'Amount' },
        { id: 'category', title: 'Category' },
        { id: 'date', title: 'Date' },
        { id: 'status', title: 'Status' },
      ],
    });
    const records = expenses.map(exp => ({
      userId: exp.userId.email,
      amount: exp.amount,
      category: exp.category,
      date: exp.date,
      status: exp.status,
    }));
    await csvWriter.writeRecords(records);
    res.download('expenses.csv');
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
