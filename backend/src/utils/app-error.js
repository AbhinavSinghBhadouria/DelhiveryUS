// yeh utils/app-error.js hai
// Express mein by default Error ka statusCode nahi hota
// hme apna custom class banana pada jisme statusCode bhi store ho sake
// taaki errorHandler middleware ko pata chale ki 400 bhejo ya 404 ya kuch aur

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    // parent Error class ko message do
    super(message);
    // apna statusCode set karo - middleware/error-handler.js yahi padhta hai
    this.statusCode = statusCode;
  }
}
