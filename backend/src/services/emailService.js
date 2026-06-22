const nodemailer = require('nodemailer');

// Lazy-initialize transporter to ensure .env is loaded first
let transporter = null;

function getTransporter() {
  if (!transporter) {
    console.log(`[EmailService] Connecting to SMTP: host=${process.env.SMTP_HOST}, port=${process.env.SMTP_PORT}, user=${process.env.SMTP_USER}`);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Send an email notification to a user when their alert is triggered.
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.userName - Recipient's name
 * @param {Object} params.ruleSnapshot - The snapshot of the alert rule
 * @param {string} params.message - The notification message
 * @param {string} params.severity - Alert severity level
 */
const sendAlertEmail = async ({ to, userName, ruleSnapshot, message, severity }) => {
  // Skip if SMTP is not configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('[EmailService] SMTP not configured, skipping email notification.');
    return;
  }

  const severityColors = {
    low: '#4caf50',
    high: '#ff9800',
    critical: '#f44336',
  };

  const severityLabels = {
    low: 'Basse',
    high: 'Haute',
    critical: 'Critique',
  };

  const color = severityColors[severity] || '#1976d2';
  const label = severityLabels[severity] || severity;

  const conditionsHtml = (ruleSnapshot.conditions || [])
    .map(c => `<li><strong>${c.field}</strong> ${c.operator} <code>${c.value}</code></li>`)
    .join('');

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <!-- Header -->
      <div style="background: ${color}; padding: 20px 24px; color: white;">
        <h1 style="margin: 0; font-size: 20px;">🔔 Alerte Déclenchée</h1>
        <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Système de Notification ERP</p>
      </div>

      <!-- Body -->
      <div style="padding: 24px;">
        <p style="margin: 0 0 16px; font-size: 16px;">Bonjour <strong>${userName}</strong>,</p>
        <p style="margin: 0 0 20px; font-size: 15px; color: #333;">${message}</p>

        <!-- Alert Details Card -->
        <div style="background: #f9f9f9; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px; font-size: 16px; color: #333;">Détails de l'alerte</h3>
          <table style="width: 100%; font-size: 14px; color: #555;">
            <tr>
              <td style="padding: 4px 0; font-weight: bold; width: 120px;">Nom :</td>
              <td style="padding: 4px 0;">${ruleSnapshot.name || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold;">Module :</td>
              <td style="padding: 4px 0;">${ruleSnapshot.module || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold;">Cible :</td>
              <td style="padding: 4px 0;">${ruleSnapshot.targetType || ''} ${ruleSnapshot.targetValue ? '= ' + ruleSnapshot.targetValue : ''}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: bold;">Sévérité :</td>
              <td style="padding: 4px 0;">
                <span style="background: ${color}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${label}</span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Conditions -->
        ${conditionsHtml ? `
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 8px; font-size: 16px; color: #333;">Conditions remplies</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #555;">
            ${conditionsHtml}
          </ul>
        </div>
        ` : ''}

        <!-- CTA -->
        <div style="text-align: center; margin: 24px 0 8px;">
          <p style="font-size: 14px; color: #777;">Connectez-vous à votre tableau de bord pour consulter et gérer cette notification.</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #f5f5f5; padding: 16px 24px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0;">
        Cet email a été envoyé automatiquement par le système de notification ERP.<br/>
        Veuillez ne pas répondre à cet email.
      </div>
    </div>
  `;

  try {
    const info = await getTransporter().sendMail({
      from: `"ERP Notifications" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: `🔔 Alerte "${ruleSnapshot.name || 'Inconnue'}" déclenchée — Sévérité: ${label}`,
      html: htmlContent,
    });
    console.log(`[EmailService] Email sent to ${to} — MessageId: ${info.messageId}`);
  } catch (err) {
    console.error(`[EmailService] Failed to send email to ${to}:`, err.message);
  }
};

module.exports = { sendAlertEmail };
