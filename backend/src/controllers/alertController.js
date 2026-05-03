const AlertRule = require('../models/AlertRule');

// GET /api/alerts — Liste toutes les alertes de l'utilisateur connecté
const getAlerts = async (req, res) => {
  try {
    const alerts = await AlertRule.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/alerts — Créer une nouvelle alerte
const createAlert = async (req, res) => {
  try {
    const { name, module, targetType, targetValue, conditions, logicOperator, isActive } = req.body;

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
      conditions,
      logicOperator: logicOperator || 'AND',
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/alerts/:id — Modifier une alerte existante
const updateAlert = async (req, res) => {
  try {
    const alert = await AlertRule.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    // Vérifier que l'alerte appartient à l'utilisateur connecté
    if (alert.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this alert' });
    }

    const { name, module, targetType, targetValue, conditions, logicOperator, isActive } = req.body;

    // Mettre à jour uniquement les champs fournis
    if (name !== undefined) alert.name = name;
    if (module !== undefined) alert.module = module;
    if (targetType !== undefined) alert.targetType = targetType;
    if (targetValue !== undefined) alert.targetValue = targetValue;
    if (conditions !== undefined) alert.conditions = conditions;
    if (logicOperator !== undefined) alert.logicOperator = logicOperator;
    if (isActive !== undefined) alert.isActive = isActive;

    const updatedAlert = await alert.save();
    res.json(updatedAlert);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/alerts/:id — Supprimer une alerte
const deleteAlert = async (req, res) => {
  try {
    const alert = await AlertRule.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    // Vérifier que l'alerte appartient à l'utilisateur connecté
    if (alert.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this alert' });
    }

    await AlertRule.findByIdAndDelete(req.params.id);
    res.json({ message: 'Alert deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAlerts, createAlert, updateAlert, deleteAlert };
