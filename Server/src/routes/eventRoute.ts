import { Router } from "express";
import { addEvent, getEventById, getEvents } from "../controllers/eventController";
import { authenticateJWT } from "../controllers/authController";

const router = Router();
// router.use(authenticateJWT);
router.post("/", addEvent);
router.get("/event", getEventById);
router.get("/", getEvents);

export default router;
