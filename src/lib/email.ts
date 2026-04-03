import nodemailer from "nodemailer";

// Create transporter (Gmail SMTP connection)
export function getTransporter() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASS?.trim();

  if (!user || !pass) {
    console.warn("Gmail credentials missing. Email will not be sent.");
    return null;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user,
      pass: pass,
    },
  });

  return transporter;
}

// Send Welcome Email
export async function sendWelcomeEmail(
  clientEmail: string,
  clientName: string
) {
  const transporter = getTransporter();
  if (!transporter) return;

  try {
    const mailOptions = {
      from: `"Max Fitness Studio" <${process.env.GMAIL_USER}>`,
      to: clientEmail,
      subject: "Welcome to Max Fitness Studio! 🏋️‍♂️",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626; margin: 0;">MAX FITNESS</h1>
            <p style="color: #666; font-size: 14px;">Studio Management & Client Portal</p>
          </div>

          <h2 style="color: #111;">Welcome to the Family, ${clientName}! 🎉</h2>

          <p style="color: #333; line-height: 1.6;">
            We are thrilled to have you join <b>Max Fitness Studio</b>.
            Your journey towards a healthier, stronger version of yourself starts today!
          </p>

          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #111; font-size: 16px;">What's Next?</h3>
            <ul style="color: #444; padding-left: 20px;">
              <li>Visit the studio to get your physical ID card.</li>
              <li>Meet our expert trainers to discuss your fitness goals.</li>
              <li>Access your personalized dashboard to track your progress.</li>
            </ul>
          </div>

          <p style="color: #333; line-height: 1.6;">
            If you have any questions, feel free to reply to this email or visit us at the studio.
          </p>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 12px;">
            <p>© 2026 Max Fitness Studio. All rights reserved.</p>
            <p>Stay Strong. Stay Fit.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent via Gmail:", info.messageId);
  } catch (error: any) {
    console.error("❌ Gmail sending failed:");
    if (error.code === 'EAUTH') {
      console.error("Authentication Error: Please check your GMAIL_USER and GMAIL_APP_PASS. Ensure you are using a 16-character App Password, not your regular Gmail password.");
    } else if (error.code === 'ESOCKET') {
      console.error("Connection Error: Could not connect to Gmail SMTP server.");
    } else {
      console.error(error.message || error);
    }
  }
}
