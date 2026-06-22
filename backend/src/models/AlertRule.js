const { getSystemDB } = require('../config/db');

const mongoose = require('mongoose');

const conditionSchema = new mongoose.Schema(
  {
    field: { type: String, required: true },
    operator: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const alertRuleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    module: { type: String, required: true },
    targetType: { type: String, required: true },
    targetValue: { type: String, required: true },
    targetLabel: { type: String, default: '' },
    conditions: {
      type: [conditionSchema],
      validate: [(val) => val.length > 0, 'At least one condition is required'],
    },
    logicOperator: {
      type: String,
      enum: ['AND', 'OR'],
      default: 'AND',
    },
    severity: {
      type: String,
      enum: ['low', 'high', 'critical'],
      default: 'low',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Use the systemDB connection (erp-system database)
module.exports = getSystemDB().model('AlertRule', alertRuleSchema);
