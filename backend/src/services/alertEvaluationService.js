const NotificationLog = require('../models/NotificationLog');
const AlertRule = require('../models/AlertRule');
const User = require('../models/User');
const { sendAlertEmail } = require('./emailService');
const { getErpDataDB } = require('../config/db');

/**
 * Evaluate a single condition against a data document.
 * Handles number, text, and date comparisons.
 */
function evaluateCondition(condition, data) {
  const { field, operator, value } = condition;
  let actual = data[field];

  // Handle Mongoose/MongoDB Decimal128
  if (actual && actual.$numberDecimal !== undefined) {
    actual = parseFloat(actual.$numberDecimal);
  } else if (actual && typeof actual === 'object') {
    if (actual instanceof Date) {
      actual = actual.toISOString();
    } else if (actual.toString) {
      const str = actual.toString();
      if (!isNaN(str)) actual = parseFloat(str);
    }
  }

  // If the field doesn't exist in the document, condition cannot be met
  if (actual === undefined || actual === null) return false;

  // Handle Date comparisons
  const isDateValue = isNaN(value) && !isNaN(Date.parse(value));
  const isDateActual = typeof actual === 'string' && isNaN(actual) && !isNaN(Date.parse(actual));

  if (isDateValue && isDateActual) {
    const actualTime = new Date(actual).getTime();
    const expectedTime = new Date(value).getTime();

    switch (operator) {
      case 'gt': return actualTime > expectedTime;
      case 'lt': return actualTime < expectedTime;
      case 'gte': return actualTime >= expectedTime;
      case 'lte': return actualTime <= expectedTime;
      case 'eq': return new Date(actual).toISOString().split('T')[0] === new Date(value).toISOString().split('T')[0];
      case 'neq': return new Date(actual).toISOString().split('T')[0] !== new Date(value).toISOString().split('T')[0];
      default: return false;
    }
  }

  const expectedNum = parseFloat(value);
  const actualNum = typeof actual === 'number' ? actual : parseFloat(actual);

  switch (operator) {
    case 'gt':
      return !isNaN(actualNum) && !isNaN(expectedNum) && actualNum > expectedNum;
    case 'lt':
      return !isNaN(actualNum) && !isNaN(expectedNum) && actualNum < expectedNum;
    case 'gte':
      return !isNaN(actualNum) && !isNaN(expectedNum) && actualNum >= expectedNum;
    case 'lte':
      return !isNaN(actualNum) && !isNaN(expectedNum) && actualNum <= expectedNum;
    case 'eq':
      if (!isNaN(actualNum) && !isNaN(expectedNum)) return actualNum === expectedNum;
      return String(actual).toLowerCase() === String(value).toLowerCase();
    case 'neq':
      if (!isNaN(actualNum) && !isNaN(expectedNum)) return actualNum !== expectedNum;
      return String(actual).toLowerCase() !== String(value).toLowerCase();
    case 'contains':
      return String(actual).toLowerCase().includes(String(value).toLowerCase());
    default:
      return false;
  }
}

/**
 * Map a module + targetType to the actual MongoDB collection and ID field
 * so we can query real ERP data.
 */
const MODULE_COLLECTION_MAP = {
  stock: {
    collection: 'article',
    idField: 'idArticle',
  },
  crm: {
    collection: 'client',
    idField: 'idClient',
  },
  facturation: {
    collection: 'facture',
    idField: 'idFacture',
  },
  gmao: {
    collection: 'parcmachine',
    idField: 'idMachine',
  },
  rh: {
    collection: 'employe',
    idField: 'idEmploye',
  },
  achats: {
    collection: 'fournisseur',
    idField: 'idFournisseur',
  },
};

/**
 * Trigger an alert: create notification log, send email, delete rule.
 */
async function triggerAlert(rule, matchedData) {
  const ruleSnapshot = {
    name: rule.name,
    module: rule.module,
    targetType: rule.targetType,
    targetValue: rule.targetValue,
    targetLabel: rule.targetLabel,
    conditions: rule.conditions,
    logicOperator: rule.logicOperator,
    severity: rule.severity,
  };

  const conditionsSummary = rule.conditions
    .map(c => `${c.field} ${c.operator} ${c.value}`)
    .join(rule.logicOperator === 'AND' ? ' ET ' : ' OU ');

  const log = await NotificationLog.create({
    user: rule.user,
    alertRule: rule._id,
    ruleSnapshot,
    message: `Alerte automatique: Les conditions pour "${rule.name}" ont été remplies (${conditionsSummary}).`,
    severity: rule.severity,
    escalationLevel: 0,
    escalatedAt: new Date(),
    isRead: false,
    isArchived: false,
  });

  // Send email notification
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

  // Delete the rule from the database
  await AlertRule.findByIdAndDelete(rule._id);

  console.log(`[AlertEngine] ✅ Alert "${rule.name}" triggered and removed.`);
}

/**
 * Main evaluation loop: checks all active rules against real ERP data.
 */
async function evaluateAlerts() {
  try {
    const rules = await AlertRule.find({ isActive: true });
    if (rules.length === 0) return;

    // ✅ Query ERP data database (erp-notif) for real data
    const db = getErpDataDB().db;

    for (const rule of rules) {
      try {
        const mapping = MODULE_COLLECTION_MAP[rule.module];
        if (!mapping) continue;

        const { collection: collName, idField } = mapping;
        const collection = db.collection(collName);

        // Build query to find the target document
        // targetValue can be a numeric ID or a text identifier
        let query = {};
        const numericTarget = parseInt(rule.targetValue);
        if (!isNaN(numericTarget)) {
          query[idField] = numericTarget;
        } else {
          // Try to match by label/name field
          query[idField] = rule.targetValue;
        }

        const doc = await collection.findOne(query);
        if (!doc) continue; // Target not found, skip

        // Evaluate conditions
        const results = rule.conditions.map(cond => evaluateCondition(cond, doc));

        let triggered = false;
        if (rule.logicOperator === 'OR') {
          triggered = results.some(r => r === true);
        } else {
          // AND (default)
          triggered = results.every(r => r === true);
        }

        if (triggered) {
          await triggerAlert(rule, doc);
        }
      } catch (ruleErr) {
        console.error(`[AlertEngine] Error evaluating rule "${rule.name}":`, ruleErr.message);
      }
    }
  } catch (err) {
    console.error('[AlertEngine] Error during evaluation cycle:', err.message);
  }
}

/**
 * Start the alert evaluation engine (runs every 2 minutes).
 */
const startAlertEvaluationEngine = () => {
  // Run once shortly after startup (10 seconds delay to let DB connect)
  setTimeout(evaluateAlerts, 10 * 1000);

  // Then run every 2 minutes
  setInterval(evaluateAlerts, 2 * 60 * 1000);
  console.log('Alert evaluation engine started (every 2 minutes).');
};

module.exports = { startAlertEvaluationEngine, evaluateAlerts };
