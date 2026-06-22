const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const alertRoutes = require('./routes/alertRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const hrRoutes = require('./routes/hrRoutes'); // generic ERP targets route
const { startEscalationEngine } = require('./services/escalationService');
const { startAlertEvaluationEngine } = require('./services/alertEvaluationService');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/erp', hrRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Start background jobs
startEscalationEngine();
startAlertEvaluationEngine();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));