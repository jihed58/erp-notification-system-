const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getTargets } = require('../controllers/hrController');

// GET /api/erp/targets?module=rh&targetType=employe
router.get('/targets', protect, getTargets);

module.exports = router;
