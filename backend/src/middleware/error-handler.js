// yeh global error handler hai - app.js mein sabse last mein mount kiya gaya hai
// jab bhi koi route ya service error throw karta hai, woh yahan aa jaata hai

export function errorHandler(error, _request, response, _next) {
  const statusCode = error.statusCode || 500;

  // JWT wali errors - jsonwebtoken library khud yeh names deti hai
  const isJwtError = error.name === "JsonWebTokenError" || error.name === "TokenExpiredError";

  // Prisma ke database errors - P2002 matlab duplicate record, P2003 matlab foreign key issue
  const isUniqueConstraintError = error.code === "P2002";
  const isForeignKeyError = error.code === "P2003";
  const isKnownDatabaseError = isUniqueConstraintError || isForeignKeyError;

  // error type ke hisab se message decide karo
  // hme original Prisma error message expose nahi karna client ko - internal details hoti hain
  const message =
    isJwtError
      ? "Invalid or expired authentication token"
      : isUniqueConstraintError
        ? "A record with these details already exists"
        : isForeignKeyError
          ? "Related record does not exist"
          : statusCode === 500
        ? "Internal server error"
        : error.message;

  const finalStatusCode = isJwtError ? 401 : isKnownDatabaseError ? 400 : statusCode;

  // sirf 500 errors ko server logs mein print karo - debugging ke liye zaroori hai
  if (finalStatusCode === 500) {
    console.error(error);
  }

  // consistent JSON format - frontend expect karta hai success aur message fields
  response.status(finalStatusCode).json({
    success: false,
    message
  });
}
