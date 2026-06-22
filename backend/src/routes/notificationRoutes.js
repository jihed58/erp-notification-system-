const express = require('express');
const router = express.Router();
const { getHistory, markAsRead, archiveNotification, simulateAlert } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', getHistory);
router.put('/:id/read', markAsRead);
router.put('/:id/archive', archiveNotification);
router.post('/simulate', simulateAlert);

module.exports = router;
