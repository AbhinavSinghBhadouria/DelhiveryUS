import { Router } from "express";

const router = Router();

router.get("/", (_request, response) => {
  response.json({
    success: true,
    message: "Last-Mile Delivery Tracker API is running"
  });
});

export default router;
