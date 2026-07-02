import jwt from "jsonwebtoken";

// env config/env.js se - JWT_SECRET aur JWT_EXPIRES_IN wahan defined hain
import { env } from "../config/env.js";

// signAuthToken - yeh function auth.service.js mein use hota hai
// jab bhi user register ya login karta hai toh naya token sign karke dete hain
// token ke andar user.id (sub field) aur role daldo - baad mein verify karte waqt kaam aata hai
export function signAuthToken(user) {
  return jwt.sign(
    {
      sub: user.id,   // sub = subject - standard JWT claim - user id yahan store hota hai
      role: user.role
    },
    env.jwtSecret,        // secret config/env.js se aata hai
    {
      expiresIn: env.jwtExpiresIn   // default 7d - .env mein change kar sakte ho
    }
  );
}

// verifyAuthToken - yeh middleware/auth.middleware.js mein use hota hai
// har request pe Authorization header se token nikala jata hai aur yahan verify hota hai
// agar token expired ya invalid hai toh jwt khud error throw karta hai
export function verifyAuthToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
