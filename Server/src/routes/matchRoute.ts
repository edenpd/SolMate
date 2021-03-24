import { Router } from "express";
import { authenticateJWT } from "../controllers/authController";
import {
  addMatch,
  getMatchesById,
  updateMatch,
  MatcheAlgorithm,
} from "../controllers/matchController";

const router = Router();
// router.use(authenticateJWT);
router.post("/", addMatch);
router.post("/calc/", MatcheAlgorithm);
router.get("/", getMatchesById);
router.put("/", updateMatch);

export default router;
