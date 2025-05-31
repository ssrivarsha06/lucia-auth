// email.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function send2FACode(email, code) {
  await transporter.sendMail({
    from: '"Your App" <no-reply@yourapp.com>',
    to: email,
    subject: '🔐 Your 2FA Code',
    text: `Your verification code is: ${code}`,
    html: `<b>${code}</b> (expires in 5 minutes)`,
  });
  console.log(`📨 2FA code sent to ${email} (via Mailtrap)`);
}
