const { getSystemDB } = require('../config/db');

const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    alertRule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AlertRule',
      required: false, // Optional because the rule might be deleted after triggering
    },
    ruleSnapshot: {
      type: Object,
      required: false, // Stores the rule data for history and templating
    },
    message: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'high', 'critical'],
      default: 'low',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    escalationLevel: {
      type: Number,
      default: 0, // 0 = User, 1 = Admin, 2 = ERP Manager
    },
    escalatedAt: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

// Use the systemDB connection (erp-system database)
module.exports = getSystemDB().model('NotificationLog', notificationLogSchema);
