import nodemailer from 'nodemailer';
import { BrevoClient } from '@getbrevo/brevo';

const BREVO_API_KEY = process.env.BREVO_API_KEY?.trim();
const BREVO_SMTP_LOGIN = process.env.BREVO_SMTP_LOGIN?.trim();
const BREVO_SMTP_KEY = process.env.BREVO_SMTP_KEY?.trim();
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL?.trim() || 'no-reply@maxfitness.com';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME?.trim() || 'Max Fitness Studio';

function createBrevoClient() {
  return BREVO_API_KEY ? new BrevoClient({ apiKey: BREVO_API_KEY }) : null;
}

function createBrevoSmtpTransporter() {
  if (!BREVO_SMTP_LOGIN || !BREVO_SMTP_KEY) return null;

  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: BREVO_SMTP_LOGIN,
      pass: BREVO_SMTP_KEY,
    },
  });
}

function createGmailTransporter() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASS?.trim();
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

async function sendWithSmtp(clientEmail: string, htmlContent: string, subject: string) {
  const transporter = createBrevoSmtpTransporter();
  if (!transporter) return false;

  await transporter.sendMail({
    from: `"${BREVO_SENDER_NAME}" <${BREVO_SENDER_EMAIL}>`,
    to: clientEmail,
    subject,
    html: htmlContent,
  });
  return true;
}

async function sendWithGmail(clientEmail: string, htmlContent: string, subject: string) {
  const transporter = createGmailTransporter();
  if (!transporter) return false;

  const fromEmail = process.env.GMAIL_USER || BREVO_SENDER_EMAIL;
  await transporter.sendMail({
    from: `"${BREVO_SENDER_NAME}" <${fromEmail}>`,
    to: clientEmail,
    subject,
    html: htmlContent,
  });
  return true;
}

function buildHtml(clientName: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #dc2626; margin: 0; font-size: 28px;">MAX FITNESS STUDIO</h1>
        <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">Studio Management & Client Portal</p>
      </div>
      <h2 style="color: #111827; font-size: 22px; margin-bottom: 16px;">Welcome to the family, ${clientName}! 🎉</h2>
      <p style="color: #374151; line-height: 1.75; margin-bottom: 20px;">We are thrilled to have you join <strong>Max Fitness Studio</strong>. Your fitness journey starts today, and we are here to support you every step of the way.</p>
      <div style="background: #f3f4f6; padding: 18px; border-radius: 14px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 12px; color: #111827; font-size: 16px;">What's next?</h3>
        <ul style="color: #4b5563; padding-left: 20px; margin: 0; line-height: 1.8;">
          <li>Visit the studio to collect your membership ID.</li>
          <li>Meet our expert trainers for a personalized plan.</li>
          <li>Use your dashboard to track progress and payments.</li>
        </ul>
      </div>
      <p style="color: #374151; line-height: 1.75; margin-bottom: 24px;">If you have any questions, feel free to reply to this email or contact us any time.</p>
      <div style="border-top: 1px solid #e5e7eb; padding-top: 18px; color: #9ca3af; font-size: 12px; text-align: center;">© 2026 Max Fitness Studio. All rights reserved.</div>
    </div>
  `;
}

export async function sendWelcomeEmail(clientEmail: string, clientName: string) {
  const subject = `Welcome to Max Fitness Studio, ${clientName}!`;
  const htmlContent = buildHtml(clientName);

  const brevoClient = createBrevoClient();
  if (brevoClient) {
    try {
      await brevoClient.transactionalEmails.sendTransacEmail({
        sender: {
          email: BREVO_SENDER_EMAIL,
          name: BREVO_SENDER_NAME,
        },
        to: [
          {
            email: clientEmail,
            name: clientName,
          },
        ],
        subject,
        htmlContent,
      });
      console.log('✅ Welcome email sent via Brevo API to', clientEmail);
      return;
    } catch (error: any) {
      console.error('❌ Brevo API sending failed:', error?.message || error);
    }
  }

  const smtpSent = await sendWithSmtp(clientEmail, htmlContent, subject);
  if (smtpSent) {
    console.log('✅ Welcome email sent via Brevo SMTP to', clientEmail);
    return;
  }

  const gmailSent = await sendWithGmail(clientEmail, htmlContent, subject);
  if (gmailSent) {
    console.log('✅ Welcome email sent via Gmail fallback to', clientEmail);
    return;
  }

  console.warn('No email provider configured. Email will not be sent.');
}
