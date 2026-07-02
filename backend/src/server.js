// yeh entry point hai poore backend ka - isko hi node run karta hai jab server start hota hai
// pehle app.js se express app import karo, fir env.js se environment variables uthao
import { app } from "./app.js";
import { env, validateEnv } from "./config/env.js";

// validateEnv() call karo - yeh config/env.js folder mein hai
// kaam karta hai: check karta hai ki DATABASE_URL aur JWT_SECRET missing toh nahi hain
// agar missing hue toh seedha error throw karta hai, server start hi nahi hoga
validateEnv();

// ab server ko PORT pe sun'na shuru karo
// PORT env.js se aa raha hai - default 5000 hai agar .env mein set na ho
app.listen(env.port, () => {
  console.log(`API server running on port ${env.port}`);
});
