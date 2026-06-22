const AlertRule = require('../models/AlertRule');
const User = require('../models/User');

/**
 * GET /api/alerts — List alerts based on role:
 * - erp_manager: ALL alerts across all departments
 * - admin: alerts from users in their department + their own
 * - user: only their own alerts
 */
const getAlerts = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'erp_manager') {
      // ERP Manager sees everything
      filter = {};
    } else if (req.user.role === 'admin') {
      // Admin sees alerts from their department users + their own
      const departmentUsers = await User.find({
        department: req.user.department,
        status: 'active',
      }).select('_id');
      const userIds = departmentUsers.map((u) => u._id);

      // Include the admin's own alerts too
      if (!userIds.some((id) => id.toString() === req.user.id)) {
        userIds.push(req.user.id);
      }
      filter = { user: { $in: userIds } };
    } else {
      // Regular user sees only their own alerts
      filter = { user: req.user.id };
    }

    const alerts = await AlertRule.find(filter)
      .populate('user', 'name email department')
      .sort({ createdAt: -1 });

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/alerts — Créer une nouvelle alerte
const createAlert = async (req, res) => {
  try {
    const { name, module, targetType, targetValue, targetLabel, conditions, logicOperator, isActive, severity } = req.body;

    // Validation des champs requis
    if (!name || !module || !targetType || !targetValue) {
      return res
        .status(400)
        .json({ message: 'Name, module, targetType, and targetValue are required' });
    }

    if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
      return res
        .status(400)
        .json({ message: 'At least one condition is required' });
    }

    // Vérifier que chaque condition a les 3 champs
    for (const cond of conditions) {
      if (!cond.field || !cond.operator || cond.value === undefined || cond.value === '') {
        return res
          .status(400)
          .json({ message: 'Each condition must have field, operator, and value' });
      }
    }

    const alert = await AlertRule.create({
      user: req.user.id,
      name,
      module,
      targetType,
      targetValue,
      targetLabel: targetLabel || '',
      conditions,
      logicOperator: logicOperator || 'AND',
      isActive: isActive !== undefined ? isActive : true,
      severity: severity || 'low',
    });

    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
  Modifier une alerte existante
 */
const updateAlert = async (req, res) => {
  try {
    const alert = await AlertRule.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    // Authorization check based on role
    if (req.user.role === 'user' && alert.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this alert' });
    }

    if (req.user.role === 'admin') {
      // Admin can update alerts from users in their department
      const alertOwner = await User.findById(alert.user);
      if (
        alertOwner &&
        alertOwner.department !== req.user.department &&
        alert.user.toString() !== req.user.id
      ) {
        return res.status(403).json({ message: 'Not authorized to update alerts outside your department' });
      }
    }
    // erp_manager can update any alert — no check needed

    const { name, module, targetType, targetValue, conditions, logicOperator, isActive, severity } = req.body;

    // Mettre à jour uniquement les champs fournis
    if (name !== undefined) alert.name = name;
    if (module !== undefined) alert.module = module;
    if (targetType !== undefined) alert.targetType = targetType;
    if (targetValue !== undefined) alert.targetValue = targetValue;
    if (conditions !== undefined) alert.conditions = conditions;
    if (logicOperator !== undefined) alert.logicOperator = logicOperator;
    if (isActive !== undefined) alert.isActive = isActive;
    if (severity !== undefined) alert.severity = severity;

    const updatedAlert = await alert.save();
    res.json(updatedAlert);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
  Supprimer une alerte
 */
const deleteAlert = async (req, res) => {
  try {
    const alert = await AlertRule.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    // Authorization check based on role
    if (req.user.role === 'user' && alert.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this alert' });
    }

    if (req.user.role === 'admin') {
      const alertOwner = await User.findById(alert.user);
      if (
        alertOwner &&
        alertOwner.department !== req.user.department &&
        alert.user.toString() !== req.user.id
      ) {
        return res.status(403).json({ message: 'Not authorized to delete alerts outside your department' });
      }
    }
    // erp_manager can delete any alert — no check needed

    await AlertRule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Alert deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAlerts, createAlert, updateAlert, deleteAlert };
