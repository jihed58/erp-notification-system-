const { getErpDataDB } = require('../config/db');
const ERP_TARGET_CONFIG = require('../config/erpTargetConfig');

/**
 * GET /api/erp/targets?module=rh&targetType=employe
 * Generic endpoint — reads the config and queries the right collection
 * from the ERP data database (erp-notif).
 * No new controller needed when adding a new module.
 */
const getTargets = async (req, res) => {
  const { module, targetType } = req.query;

  if (!module || !targetType) {
    return res.status(400).json({ message: 'module and targetType query params are required' });
  }

  const moduleConfig = ERP_TARGET_CONFIG[module];
  if (!moduleConfig) {
    return res.status(404).json({ message: `No target config found for module: ${module}` });
  }

  const targetConfig = moduleConfig[targetType];
  if (!targetConfig) {
    return res.status(404).json({ message: `No target config found for targetType: ${targetType} in module: ${module}` });
  }

  try {
    const { collection, valueField, labelFields, sortField, filter, limit } = targetConfig;

    // Build the projection: we need valueField + all labelFields
    const projection = { _id: 0 };
    projection[valueField] = 1;
    labelFields.forEach(f => { projection[f] = 1; });

    // ✅ Query the ERP data database (erp-notif), NOT the system database
    const db = getErpDataDB().db;
    const docs = await db.collection(collection)
      .find(filter || {})
      .project(projection)
      .sort({ [sortField]: 1 })
      .limit(limit || 500)
      .toArray();

    const formatted = docs
      .map(doc => ({
        value: String(doc[valueField]),
        label: labelFields.map(f => (doc[f] || '')).join(' ').trim(),
      }))
      .filter(opt => opt.label); // remove empty labels

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getTargets };
