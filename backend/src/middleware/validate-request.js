// yeh middleware Zod schema se request data validate karta hai
// routes mein hme ise use karte hain validateRequest(schema) ke form mein
// schema validators/ folder ke kisi bhi file se aata hai

export function validateRequest(schema) {
  return (request, response, next) => {
    // body, params, aur query teeno ko ek saath validate karo
    // agar GET request hai toh body nahi hoga - isliye ?? {} lagaya hai
    const result = schema.safeParse({
      body: request.body ?? {},
      params: request.params ?? {},
      query: request.query ?? {}
    });

    // validation fail hua toh 400 wapas karo
    // Zod ka issues array hota hai - hme usme se sab errors extract karke ek string banate hain
    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");

      return response.status(400).json({
        success: false,
        message
      });
    }

    // validated data request.validated pe daldo - controllers wahan se uthate hain
    // directly req.body use nahi karte taaki unvalidated data na aaye
    request.validated = result.data;
    return next();
  };
}
