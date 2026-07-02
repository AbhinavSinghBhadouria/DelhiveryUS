// services/notification/providers.js - actual email aur SMS sending yahan hota hai
// notification.service.js yahan se sendEmail aur sendSms call karta hai
//
// EMAIL_PROVIDER ke teen options hain:
//   "nodemailer" → SMTP se real email bhejo (Gmail, Outlook, etc.)
//   "resend"     → Resend.com REST API se bhejo
//   "mock"       → koi real call nahi, bas console log karta hai (development ke liye)

import nodemailer from "nodemailer";
import { env } from "../../config/env.js";

let cachedTransporter = null;
let isEthereal = false;

// getTransporter - ek baar transporter banao aur reuse karo
// credentials na hone par development mein Ethereal test account create karega
async function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  if (env.smtpUser && env.smtpPass) {
    cachedTransporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000
    });
    isEthereal = false;
    return cachedTransporter;
  }

  // Fallback to Ethereal email for testing
  console.log("[Nodemailer] SMTP credentials missing. Generating Ethereal test account...");
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log("-----------------------------------------------------------------");
    console.log(`[Nodemailer] Generated Ethereal Test SMTP Credentials:`);
    console.log(`  User: ${testAccount.user}`);
    console.log(`  Pass: ${testAccount.pass}`);
    console.log("-----------------------------------------------------------------");
    cachedTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    isEthereal = true;
    return cachedTransporter;
  } catch (error) {
    console.error("[Nodemailer] Failed to create Ethereal test account:", error.message);
    throw error;
  }
}

export async function sendEmail({ to, subject, message }) {

  // --- Nodemailer via SMTP ---
  if (env.emailProvider === "nodemailer") {
    // transporter SMTP connection handle karta hai
    const transporter = await getTransporter();
    const sender = env.emailFrom || (isEthereal ? transporter.options.auth.user : env.smtpUser);

    // sendMail - actual email bhejo
    // text: plain text, html: rich content - hme dono dete hain
    const info = await transporter.sendMail({
      from: `"${env.emailFromName}" <${sender}>`,
      to,
      subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a1a2e; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: #fff; margin: 0;">DelhiveryUS</h2>
            <p style="color: #aaa; margin: 4px 0 0;">Last-Mile Delivery Tracker</p>
          </div>
          <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #eee;">
            <h3 style="color: #333;">${subject}</h3>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">${message}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">
              Yeh ek automated message hai. Isko reply mat karo.
            </p>
          </div>
        </div>
      `
    });

    console.log(`[Nodemailer] Email sent to ${to} — subject: "${subject}"`);
    if (isEthereal) {
      console.log(`[Nodemailer] View Ethereal message at: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return { provider: "nodemailer", status: "SENT" };
  }

  // --- Resend REST API ---
  if (env.emailProvider === "resend" && env.emailApiKey) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.emailApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: env.emailFrom,
        to: [to],
        subject,
        text: message
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Resend API failed: ${errorBody}`);
    }

    return { provider: "resend", status: "SENT" };
  }

  // --- Mock (default) - development mein sirf log karo ---
  console.log(`[Mock Email] To: ${to} | Subject: ${subject} | Message: ${message}`);
  return { provider: "mock", status: "SENT" };
}

export async function sendSms({ to, message }) {
  // Twilio REST API se SMS bhejo
  if (env.smsProvider === "twilio" && env.twilioAccountSid && env.twilioAuthToken && env.twilioFromNumber) {
    const credentials = Buffer.from(`${env.twilioAccountSid}:${env.twilioAuthToken}`).toString("base64");
    const body = new URLSearchParams({ To: to, From: env.twilioFromNumber, Body: message });

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${env.twilioAccountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Twilio API failed: ${errorBody}`);
    }

    return { provider: "twilio", status: "SENT" };
  }

  // mock SMS - development ke liye
  console.log(`[Mock SMS] To: ${to} | Message: ${message}`);
  return { provider: "mock", status: "SENT" };
}

// sendOtpEmail - registration ke time email verification ke liye OTP bhejta hai
// Nodemailer ya mock use karta hai EMAIL_PROVIDER ke hisab se
export async function sendOtpEmail({ to, otp, name }) {
  const subject = "Verify your DelhiveryUS account";
  const message = `Hi ${name},\n\nYour verification OTP is: ${otp}\n\nThis OTP is valid for 15 minutes. Do not share it with anyone.\n\n— DelhiveryUS Team`;

  if (env.emailProvider === "nodemailer") {
    const transporter = await getTransporter();
    const sender = env.emailFrom || (isEthereal ? transporter.options.auth.user : env.smtpUser);
    const info = await transporter.sendMail({
      from: `"${env.emailFromName}" <${sender}>`,
      to,
      subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a1a2e; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: #fff; margin: 0;">DelhiveryUS</h2>
            <p style="color: #aaa; margin: 4px 0 0;">Last-Mile Delivery Tracker</p>
          </div>
          <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #eee;">
            <h3 style="color: #333;">Verify Your Email Address</h3>
            <p style="color: #555; font-size: 15px;">Hi ${name},</p>
            <p style="color: #555; font-size: 15px;">Use the OTP below to verify your account. It expires in <strong>15 minutes</strong>.</p>
            <div style="text-align: center; margin: 32px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #1a1a2e; background: #e8f0fe; padding: 16px 24px; border-radius: 8px;">${otp}</span>
            </div>
            <p style="color: #999; font-size: 13px;">Do not share this OTP with anyone. If you did not register, ignore this email.</p>
          </div>
        </div>
      `
    });
    console.log(`[Nodemailer] OTP email sent to ${to}`);
    if (isEthereal) {
      console.log(`[Nodemailer] View Ethereal message at: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return { provider: "nodemailer", status: "SENT" };
  }

  // mock mode - development mein OTP console mein print karo taaki testing ho sake
  console.log(`[Mock OTP Email] To: ${to} | OTP: ${otp}`);
  return { provider: "mock", status: "SENT" };
}
