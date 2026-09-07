const nodemailer = require("nodemailer");

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

/**
 * Sends the password reset link by email. If no SMTP credentials are set in
 * .env (fine for local/zero-cost dev), the link is printed to the backend
 * console instead so the flow still works end-to-end without any paid service.
 */
async function sendPasswordResetEmail(toEmail, resetUrl) {
  const transporter = getTransporter();

  if (!transporter) {
    console.log("\n=== PASSWORD RESET LINK (SMTP not configured) ===");
    console.log(`To: ${toEmail}`);
    console.log(resetUrl);
    console.log("Link expires in 15 minutes.");
    console.log("==================================================\n");
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: "Reset your Brush Bloom admin password",
    text: `We received a request to reset your admin password. This link expires in 15 minutes:\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
  });
}

async function sendOrderConfirmedEmail(toEmail, order) {
  const transporter = getTransporter();
  const subject = `Your order ${order.orderCode} is confirmed — Brush Bloom Handmade`;
  const text = `Good news! Your order ${order.orderCode} has been confirmed.\n\nEstimated total: ₹${order.estimatedTotal}\n\nWe'll be in touch about delivery. Thank you for shopping with Brush Bloom Handmade.`;

  if (!transporter) {
    console.log("\n=== ORDER CONFIRMATION EMAIL (SMTP not configured) ===");
    console.log(`To: ${toEmail}`);
    console.log(text);
    console.log("========================================================\n");
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject,
    text,
  });
}

module.exports = { sendPasswordResetEmail, sendOrderConfirmedEmail };


