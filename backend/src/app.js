// yeh main express app file hai - sab routes aur middleware yahan register hote hain
import cors from "cors";
import express from "express";
import morgan from "morgan";

// env config/env.js se aa raha hai - saari environment variables wahan manage hoti hain
import { env } from "./config/env.js";

// errorHandler middleware/error-handler.js se import kiya - yeh global error handler hai
import { errorHandler } from "./middleware/error-handler.js";

// yeh saare route files hain - har ek apne folder mein hai routes/ ke andar
import adminRoutes from "./routes/admin.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import authRoutes from "./routes/auth.routes.js";
import healthRoutes from "./routes/health.routes.js";
import orderRoutes from "./routes/order.routes.js";
import roleCheckRoutes from "./routes/role-check.routes.js";

export const app = express();

// CORS hme lagana pada kyunki frontend alag port pe run karta hai (5173/5174)
// Vite kabhi kabhi 5173 busy hone pe 5174 use kar leta hai, isliye dono allow karte hain
const allowedOrigins = [
  env.frontendUrl,
  "http://localhost:5173",
  "http://localhost:5174",
];
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

// JSON body parser - bina iske req.body empty aata tha
app.use(express.json());

// morgan dev mode mein request logs print karta hai terminal mein - debugging ke liye helpful
app.use(morgan("dev"));

// ab saare routes mount karo unke respective path pe
// /api/health - simple health check route, routes/health.routes.js mein defined hai
app.use("/api/health", healthRoutes);

// /api/auth - login, register, me - routes/auth.routes.js se
app.use("/api/auth", authRoutes);

// /api/role-check - sirf testing ke liye rakha hai role access verify karne ke liye
app.use("/api/role-check", roleCheckRoutes);

// /api/admin - admin wali saari cheezein - zones, rate cards, orders, agents
app.use("/api/admin", adminRoutes);

// /api/agent - agent ki profile, assigned orders, status update
app.use("/api/agent", agentRoutes);

// /api/orders - customer ke orders - quote, create, track, reschedule
app.use("/api/orders", orderRoutes);

// errorHandler sabse aakhir mein lagao - yeh middleware/error-handler.js mein hai
// kaam karta hai: koi bhi unhandled error ko pakadta hai aur consistent JSON response deta hai
app.use(errorHandler);
