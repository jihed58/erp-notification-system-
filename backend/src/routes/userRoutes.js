const express = require('express');
const router = express.Router();
const {
  getUsers,
  getPendingUsers,
  approveUser,
  updateUserRole,
  suspendUser,
  reactivateUser,
  deleteUser,
  getDepartmentUsers,
  getUserAlerts,
  getUserNotifications,
  resetUserPassword,
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

// Department Admin routes
router.get('/department', authorize('erp_manager', 'admin'), getDepartmentUsers);
router.get('/:id/alerts', authorize('erp_manager', 'admin'), getUserAlerts);
router.get('/:id/notifications', authorize('erp_manager', 'admin'), getUserNotifications);

// ERP Manager only routes
router.get('/', authorize('erp_manager'), getUsers);
router.get('/pending', authorize('erp_manager'), getPendingUsers);
router.put('/:id/approve', authorize('erp_manager'), approveUser);
router.put('/:id/role', authorize('erp_manager'), updateUserRole);
router.put('/:id/suspend', authorize('erp_manager'), suspendUser);
router.put('/:id/reactivate', authorize('erp_manager'), reactivateUser);
router.put('/:id/reset-password', authorize('erp_manager'), resetUserPassword);
router.delete('/:id', authorize('erp_manager'), deleteUser);

module.exports = router;
