const express = require('express');
     const mongoose = require('mongoose');
     const cors = require('cors');
     const dotenv = require('dotenv');
     const authRoutes = require('./routes/auth');
     const expenseRoutes = require('./routes/expenses');
     const auditRoutes = require('./routes/audit');

     dotenv.config();
     const app = express();

     app.use(cors({
          origin: process.env.FRONTEND_URL,
          credentials: true // required if you're using cookies for auth
     }));
     app.use(express.json());
     app.get("/", (req, res) => {
        res.send(" Server is running...");
     });
     app.use('/uploads', express.static('uploads'));

     app.use('/api/auth', authRoutes);
     app.use('/api/expenses', expenseRoutes);
     app.use('/api/audit', auditRoutes);

     mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
       .then(() => console.log('MongoDB connected'))
       .catch(err => console.error(err));

     const PORT = process.env.PORT || 5000;
     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));