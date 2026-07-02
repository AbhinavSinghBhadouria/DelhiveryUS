// yeh middleware/auth.middleware.js hai - do kaam karta hai:
// 1. requireAuth - check karta hai ki valid JWT token aaya ya nahi
// 2. requireRoles - check karta hai ki logged in user ka role sahi hai ya nahi

// prisma db/prisma.js se - user database se fetch karne ke liye
import { prisma } from "../db/prisma.js";

// AppError utils/app-error.js mein define hai - statusCode ke saath error throw karne ke liye
import { AppError } from "../utils/app-error.js";

// asyncHandler utils/async-handler.js mein hai - async functions ko try/catch se wrap karta hai
import { asyncHandler } from "../utils/async-handler.js";

// verifyAuthToken utils/token.js mein hai - JWT verify karta hai
import { verifyAuthToken } from "../utils/token.js";

// requireAuth - yeh har protected route pe lagta hai
// kaam karta hai: Authorization header se token nikalo, verify karo, user fetch karo
export const requireAuth = asyncHandler(async (request, _response, next) => {
  const authHeader = request.headers.authorization;

  // agar header hi nahi aaya ya Bearer se start nahi kiya toh 401
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Authentication token is required", 401);
  }

  // "Bearer eyJ..." se sirf token part nikalo
  const token = authHeader.replace("Bearer ", "").trim();

  // utils/token.js ka verifyAuthToken call karo - JWT decode hota hai
  const payload = verifyAuthToken(token);

  // payload.sub mein user id hai - db se actual user fetch karo
  // prisma db/prisma.js wala use hota hai
  const user = await prisma.user.findUnique({
    where: { id: payload.sub }
  });

  // agar user delete ho gaya ho database se toh bhi 401 do
  if (!user) {
    throw new AppError("Authenticated user no longer exists", 401);
  }

  // user ko request object pe daldo - baaki routes ko req.user se milega
  request.user = user;
  return next();
});

// requireRoles - yeh requireAuth ke baad use hota hai
// spread operator se multiple roles accept karta hai jaise requireRoles("ADMIN", "AGENT")
export function requireRoles(...allowedRoles) {
  return (request, _response, next) => {
    // agar requireAuth nahi laga pehle toh user nahi hoga
    if (!request.user) {
      return next(new AppError("Authentication is required", 401));
    }

    // request.user.role check karo allowed list mein hai ya nahi
    if (!allowedRoles.includes(request.user.role)) {
      return next(new AppError("You do not have permission to access this resource", 403));
    }

    return next();
  };
}
