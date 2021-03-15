import { Router } from "express";
import { authorizeSpotify } from "../controllers/spotifyController";

const router = Router();
router.post("/auth", authorizeSpotify);

export default router;
