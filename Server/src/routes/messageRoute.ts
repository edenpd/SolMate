import { Router } from "express";
import { addMsg, getMessagesById } from "../controllers/messageController";
import { authenticateJWT } from "../controllers/authController";

const router = Router();
router.use(authenticateJWT);
router.post("/", addMsg);
router.get("/", getMessagesById);

export default router;
