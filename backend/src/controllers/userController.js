const User = require('../models/User');
const AlertRule = require('../models/AlertRule');
const NotificationLog = require('../models/NotificationLog');

// GET /api/users — List all users (ERP Manager only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/users/pending — List pending accounts (ERP Manager only)
const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ status: 'pending' })
      .select('-passwordHash')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/users/:id/approve — Approve a pending user, assign role & department
const approveUser = async (req, res) => {
  try {
    const { role, department } = req.body;

    // Validate role
    const validRoles = ['erp_manager', 'admin', 'user'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      });
    }

    // Both admin and user roles require a department
    if ((role === 'admin' || role === 'user') && !department) {
      return res.status(400).json({
        message: 'Department is required for this role',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status === 'active') {
      return res.status(400).json({ message: 'User is already active' });
    }

    // Prevent approving yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot approve yourself' });
    }

    user.role = role;
    user.department = (role === 'admin' || role === 'user') ? department : null;
    user.status = 'active';

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.passwordHash;

    res.json({ message: 'User approved successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/users/:id/role — Change a user's role (ERP Manager only)
const updateUserRole = async (req, res) => {
  try {
    const { role, department } = req.body;

    const validRoles = ['erp_manager', 'admin', 'user'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      });
    }

    if ((role === 'admin' || role === 'user') && !department) {
      return res.status(400).json({
        message: 'Department is required for this role',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent modifying your own role
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot modify your own role' });
    }

    user.role = role;
    user.department = (role === 'admin' || role === 'user') ? department : null;
    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.passwordHash;

    res.json({ message: 'Role updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/users/:id/suspend — Suspend a user account (ERP Manager only)
const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent suspending yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot suspend yourself' });
    }

    user.status = 'suspended';
    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.passwordHash;

    res.json({ message: 'User suspended successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/users/:id/reactivate — Reactivate a suspended user (ERP Manager only)
const reactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status !== 'suspended') {
      return res.status(400).json({ message: 'User is not suspended' });
    }

    user.status = 'active';
    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.passwordHash;

    res.json({ message: 'User reactivated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/users/:id — Delete a user account (ERP Manager only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/users/department — List users in the logged-in admin's department
const getDepartmentUsers = async (req, res) => {
  try {
    const { department, role } = req.user;
    
    // Manager can optionally pass a department query param to view any department
    const targetDept = role === 'erp_manager' && req.query.department ? req.query.department : department;
    
    if (!targetDept) {
      return res.status(400).json({ message: 'No department associated with this account' });
    }

    const users = await User.find({ department: targetDept })
      .select('-passwordHash')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/users/:id/alerts — Get alert rules for a specific user
const getUserAlerts = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Admins can only view alerts of users in their department
    if (req.user.role === 'admin' && targetUser.department !== req.user.department) {
      return res.status(403).json({ message: 'Not authorized to view users outside your department' });
    }

    const alerts = await AlertRule.find({ user: targetUserId }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/users/:id/notifications — Get notifications history for a specific user
const getUserNotifications = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.user.role === 'admin' && targetUser.department !== req.user.department) {
      return res.status(403).json({ message: 'Not authorized to view users outside your department' });
    }

    // Fetch all notifications (both active and archived) for the global history view
    const notifications = await NotificationLog.find({ user: targetUserId })
      .populate('alertRule', 'name module targetType targetValue severity')
      .sort({ createdAt: -1 });
      
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/users/:id/reset-password — Reset a user's password manually (ERP Manager only)
const resetUserPassword = async (req, res) => {
  try {
    const { temporaryPassword } = req.body;
    
    if (!temporaryPassword || temporaryPassword.length < 4) {
      return res.status(400).json({ message: 'A temporary password of at least 4 characters is required' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(temporaryPassword, salt);
    
    // Auto-reactivate if suspended, and reset strikes
    if (user.status === 'suspended') {
      user.status = 'active';
    }
    user.failedLoginAttempts = 0;
    user.mustChangePassword = true;
    
    await user.save();

    res.json({ message: 'Password reset and account reactivated. User must change password on next login.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
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
};
