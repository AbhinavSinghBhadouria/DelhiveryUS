import dotenv from "dotenv";

// .env file se saari values load karo - yeh project root ke .env file ko read karta hai
dotenv.config();

// env object mein saari environment variables ek jagah collect kar li hain
// taaki poore project mein process.env directly use na karna pade
export const env = {
  nodeEnv: process.env.NODE_ENV || "development",

  // PORT default 5000 hai agar .env mein set na kiya ho - hme 5001 use kiya locally
  port: Number(process.env.PORT || 5000),

  // DATABASE_URL postgres connection string hai - db/prisma.js mein use hoti hai
  databaseUrl: process.env.DATABASE_URL,

  // JWT_SECRET se token sign aur verify hote hain - utils/token.js mein use hota hai
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",

  // frontendUrl CORS ke liye chahiye - app.js mein cors() ko diya jata hai
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  // email aur SMS provider settings - notification/providers.js mein read hoti hain
  // EMAIL_PROVIDER = "nodemailer" | "resend" | "mock"
  // nodemailer ke liye SMTP credentials chahiye - Gmail ya koi bhi SMTP server
  emailProvider: process.env.EMAIL_PROVIDER || "mock",
  emailApiKey: process.env.EMAIL_API_KEY,
  emailFrom: process.env.EMAIL_FROM || "no-reply@example.com",
  emailFromName: process.env.EMAIL_FROM_NAME || "DelhiveryUS",

  // Nodemailer SMTP settings - EMAIL_PROVIDER=nodemailer hone par yeh use hote hain
  // Gmail ke liye: SMTP_HOST=smtp.gmail.com, SMTP_PORT=587
  // SMTP_USER = Gmail address, SMTP_PASS = Gmail App Password (16-digit)
  smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,

  smsProvider: process.env.SMS_PROVIDER || "mock",
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioFromNumber: process.env.TWILIO_FROM_NUMBER
};

// yeh function server.js mein call hota hai server start hone se pehle
// agar DATABASE_URL ya JWT_SECRET missing hain toh seedha crash karo
// better hai ki shuru mein hi fail ho, baad mein random errors se zyada bura hota hai
export function validateEnv() {
  const missing = [];

  if (!env.databaseUrl) missing.push("DATABASE_URL");
  if (!env.jwtSecret) missing.push("JWT_SECRET");

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
