import { Router } from "express";
import { addChat, getChatsByUser, updateChat, deleteChat, getChatsById } from "../controllers/chatController";
import { authenticateJWT } from "../controllers/authController";

const router = Router();
// router.use(authenticateJWT);
router.post("/", addChat);
router.get("/", getChatsByUser);
router.get("/single", getChatsById);
router.put("/", updateChat);
router.delete("/", deleteChat);

export default router;