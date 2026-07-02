import { PrismaClient } from "@prisma/client";

// ek hi PrismaClient instance banao poore project ke liye
// agar har file mein alag instance banate toh database connections bahut zyada ho jaate
// development mein query aur error logs on hain - production mein sirf errors
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
});

// yeh prisma object baaki saari services mein import hota hai jaise:
// auth.service.js, order.service.js, admin.service.js etc.
// sab wahan se is ek instance ko use karte hain
