const NotificationLog = require('../models/NotificationLog');
const AlertRule = require('../models/AlertRule');
const User = require('../models/User');
const { sendAlertEmail } = require('../services/emailService');

// GET /api/notifications — Get notifications/history for logged in user
const getHistory = async (req, res) => {
  try {
    const { id, role, department } = req.user;
    const isArchived = req.query.archived === 'true'; // Default is false if not provided
    
    // Base query: notifications belonging to the logged-in user with correct archive status
    let query = { user: id, isArchived };

    // If Admin, also get notifications for users in their department that escalated to level 1 or 2
    if (role === 'admin') {
      const deptUsers = await User.find({ department }).select('_id');
      const deptUserIds = deptUsers.map(u => u._id);

      query = {
        $and: [
          { isArchived },
          {
            $or: [
              { user: id },
              { user: { $in: deptUserIds }, escalationLevel: { $gte: 1 } }
            ]
          }
        ]
      };
    }

    // If ERP Manager, also get ALL notifications that escalated to level 2
    if (role === 'erp_manager') {
      query = {
        $and: [
          { isArchived },
          {
            $or: [
              { user: id },
              { escalationLevel: 2 }
            ]
          }
        ]
      };
    }

    const logs = await NotificationLog.find(query)
      .populate('user', 'name department')
      .populate('alertRule', 'name module targetType targetValue severity') // May be null if deleted
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/notifications/:id/read — Mark as read
const markAsRead = async (req, res) => {
  try {
    const log = await NotificationLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Notification not found' });
    
    if (log.user.toString() !== req.user.id && req.user.role !== 'erp_manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    log.isRead = true;
    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/notifications/:id/archive — Archive a read notification
const archiveNotification = async (req, res) => {
  try {
    const log = await NotificationLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Notification not found' });
    
    if (log.user.toString() !== req.user.id && req.user.role !== 'erp_manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!log.isRead) {
      return res.status(400).json({ message: 'Cannot archive an unread notification' });
    }

    log.isArchived = true;
    await log.save();
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/notifications/simulate — Helper to trigger a fake alert for UI testing
const simulateAlert = async (req, res) => {
  try {
    const { alertRuleId } = req.body;
    
    const rule = await AlertRule.findById(alertRuleId);
    if (!rule) {
      return res.status(404).json({ message: 'Alert rule not found' });
    }

    if (rule.user.toString() !== req.user.id && req.user.role !== 'erp_manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Capture the snapshot of the rule to allow templating after deletion
    const ruleSnapshot = {
      name: rule.name,
      module: rule.module,
      targetType: rule.targetType,
      targetValue: rule.targetValue,
      targetLabel: rule.targetLabel,
      conditions: rule.conditions,
      logicOperator: rule.logicOperator,
      severity: rule.severity
    };

    const log = await NotificationLog.create({
      user: rule.user,
      alertRule: rule._id,
      ruleSnapshot,
      message: `Alerte déclenchée: Les conditions pour "${rule.name}" ont été remplies.`,
      severity: rule.severity,
      escalationLevel: 0,
      escalatedAt: new Date(),
      isRead: false,
      isArchived: false
    });

    // Send email notification to the user
    const targetUser = await User.findById(rule.user);
    if (targetUser && targetUser.email) {
      sendAlertEmail({
        to: targetUser.email,
        userName: targetUser.name,
        ruleSnapshot,
        message: log.message,
        severity: rule.severity,
      });
    }

    // Delete the rule from the database as requested
    await AlertRule.findByIdAndDelete(alertRuleId);

    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getHistory,
  markAsRead,
  archiveNotification,
  simulateAlert
};
