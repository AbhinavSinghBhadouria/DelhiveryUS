// yeh services/notification.service.js hai
// har order status change pe hme customer ko email aur SMS dono bhejte hain
// order.service.js mein notifyCustomerStatusChange ko call karte hain status update ke baad

// prisma db/prisma.js se - notification record save karne ke liye
import { prisma } from "../db/prisma.js";
import { env } from "../config/env.js";

// sendEmail aur sendSms providers notification/providers.js folder mein hain
// woh actual sending karte hain ya mock log karte hain .env ke EMAIL_PROVIDER/SMS_PROVIDER pe depend karke
import { sendEmail, sendSms } from "./notification/providers.js";

// simple message template - customer ko order ID aur new status batata hai
function buildStatusMessage(order, status) {
  return `Your order ${order.id} status changed to ${status}.`;
}

// dispatchNotification - ek channel (EMAIL ya SMS) pe notification bhejo aur log karo
// agar sending fail bhi ho toh bhi database mein FAILED status ke saath save karo
async function dispatchNotification({ order, user, channel, subject, message }) {
  // email ke liye email use karo, SMS ke liye phone - fallback email pe
  const recipient = channel === "EMAIL" ? user.email : user.phone || user.email;
  let provider = "mock";
  let status = "SENT";

  try {
    if (channel === "EMAIL") {
      // notification/providers.js ka sendEmail - EMAIL_PROVIDER env variable pe depend hai
      const result = await sendEmail({ to: recipient, subject, message });
      provider = result.provider;
      status = result.status;
    } else {
      // notification/providers.js ka sendSms - SMS_PROVIDER env variable pe depend hai
      const result = await sendSms({ to: recipient, message });
      provider = result.provider;
      status = result.status;
    }
  } catch (error) {
    // notification fail ho gaya - log karo aur FAILED status ke saath save karo
    // order service ko fail mat karo kyunki notification secondary feature hai
    console.error(`Notification ${channel} failed:`, error.message);
    status = "FAILED";
    provider = channel === "EMAIL" ? env.emailProvider : env.smsProvider;
  }

  // notifications table mein log karo - chahe sent ho ya failed
  // admin baad mein dekh sakta hai database mein
  return prisma.notification.create({
    data: {
      orderId: order?.id,
      userId: user.id,
      channel,
      recipient,
      subject,
      message,
      provider,
      status
    }
  });
}

// notifyCustomerStatusChange - yeh main function hai jo order.service.js se call hota hai
// Promise.all se email aur SMS dono parallel bhejo - sequential nahi
export async function notifyCustomerStatusChange(order, customer, status) {
  const message = buildStatusMessage(order, status);
  const subject = `Order ${status}`;

  // dono parallel mein - ek ka wait doosre ke liye nahi
  await Promise.all([
    dispatchNotification({ order, user: customer, channel: "EMAIL", subject, message }),
    dispatchNotification({ order, user: customer, channel: "SMS", subject: null, message })
  ]);
}
