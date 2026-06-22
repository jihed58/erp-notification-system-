const NotificationLog = require('../models/NotificationLog');

const checkEscalations = async () => {
  try {
    const now = new Date();

    // High severity logic
    // Unread for 1 hour at level 0 -> escalate to Admin (level 1)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    await NotificationLog.updateMany(
      { severity: 'high', isRead: false, escalationLevel: 0, escalatedAt: { $lt: oneHourAgo } },
      { $set: { escalationLevel: 1, escalatedAt: now } }
    );

    // Unread for another 1 hour at level 1 -> escalate to ERP Manager (level 2)
    await NotificationLog.updateMany(
      { severity: 'high', isRead: false, escalationLevel: 1, escalatedAt: { $lt: oneHourAgo } },
      { $set: { escalationLevel: 2, escalatedAt: now } }
    );

    // Critical severity logic
    // Unread for 15 minutes at level 0 -> escalate to Admin (level 1)
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    await NotificationLog.updateMany(
      { severity: 'critical', isRead: false, escalationLevel: 0, escalatedAt: { $lt: fifteenMinutesAgo } },
      { $set: { escalationLevel: 1, escalatedAt: now } }
    );

    // Unread for another 5 minutes at level 1 -> escalate to ERP Manager (level 2)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    await NotificationLog.updateMany(
      { severity: 'critical', isRead: false, escalationLevel: 1, escalatedAt: { $lt: fiveMinutesAgo } },
      { $set: { escalationLevel: 2, escalatedAt: now } }
    );

  } catch (error) {
    console.error('Error during escalation check:', error);
  }
};

const startEscalationEngine = () => {
  // Run the check every 1 minute
  setInterval(checkEscalations, 60 * 1000);
  console.log('Escalation engine started.');
};

module.exports = { startEscalationEngine };
