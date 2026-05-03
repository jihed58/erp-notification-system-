const express = require('express');
const router = express.Router();
const {
  getAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
} = require('../controllers/alertController');
const { protect } = require('../middlewares/authMiddleware');

// Toutes les routes alertes sont protégées par JWT
router.use(protect);

router.get('/', getAlerts);
router.post('/', createAlert);
router.put('/:id', updateAlert);
router.delete('/:id', deleteAlert);

module.exports = router;
