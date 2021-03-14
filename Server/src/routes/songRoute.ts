import { Router } from "express";
import { getSongs } from "../controllers/songController";
import { authenticateJWT } from "../controllers/authController";

const router = Router();
router.use(authenticateJWT);
router.get("/", getSongs);

export default router;
