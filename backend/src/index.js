const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// Connect to BOTH databases first, then load routes & background services.
// Models call getSystemDB() / getErpDataDB() at require-time, so the
// connections MUST be established before any route file is imported.
// ─────────────────────────────────────────────────────────────────────────────
connectDB().then(() => {

  // Routes (imported after DB connections are live)
  const authRoutes         = require('./routes/authRoutes');
  const alertRoutes        = require('./routes/alertRoutes');
  const userRoutes         = require('./routes/userRoutes');
  const notificationRoutes = require('./routes/notificationRoutes');
  const hrRoutes           = require('./routes/hrRoutes');

  // Background services
  const { startEscalationEngine }       = require('./services/escalationService');
  const { startAlertEvaluationEngine }  = require('./services/alertEvaluationService');

  app.use('/api/auth',          authRoutes);
  app.use('/api/alerts',        alertRoutes);
  app.use('/api/users',         userRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/erp',           hrRoutes);

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  startEscalationEngine();
  startAlertEvaluationEngine();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));

}).catch(err => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});