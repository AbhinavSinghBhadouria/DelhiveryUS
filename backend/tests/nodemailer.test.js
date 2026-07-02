import test from "node:test";
import assert from "node:assert/strict";
import { sendEmail, sendOtpEmail } from "../src/services/notification/providers.js";
import { env } from "../src/config/env.js";

test("Nodemailer integration", async (t) => {
  // Save original config
  const originalProvider = env.emailProvider;
  const originalSmtpUser = env.smtpUser;
  const originalSmtpPass = env.smtpPass;

  // Set email provider to nodemailer and clear SMTP credentials to force Ethereal fallback
  env.emailProvider = "nodemailer";
  env.smtpUser = "";
  env.smtpPass = "";

  await t.test("should send OTP email using Ethereal fallback and cache the transporter", async () => {
    const result = await sendOtpEmail({
      to: "test@example.com",
      otp: "123456",
      name: "Test User"
    });

    assert.equal(result.provider, "nodemailer");
    assert.equal(result.status, "SENT");
  });

  await t.test("should reuse the cached transporter for sending subsequent emails", async () => {
    const result = await sendEmail({
      to: "test2@example.com",
      subject: "Order Updated",
      message: "Your order has been shipped."
    });

    assert.equal(result.provider, "nodemailer");
    assert.equal(result.status, "SENT");
  });

  // Restore original config
  env.emailProvider = originalProvider;
  env.smtpUser = originalSmtpUser;
  env.smtpPass = originalSmtpPass;
});
