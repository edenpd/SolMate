import { Router } from "express";
import { addEvent, getEventById } from "../controllers/eventController";
import { authenticateJWT } from "../controllers/authController";

const router = Router();
router.use(authenticateJWT);
router.post("/", addEvent);
router.get("/", getEventById);

export default router;
