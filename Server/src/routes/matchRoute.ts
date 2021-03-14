import { Router } from "express";
import { authenticateJWT } from "../controllers/authController";
import { addMatch, getMatchesById, updateMatch, calcMatchesForUser } from "../controllers/matchController";

const router = Router();
router.use(authenticateJWT);
router.post("/", addMatch);
router.post("/calc/", calcMatchesForUser);
router.get("/", getMatchesById);
router.put("/", updateMatch);

export default router;
