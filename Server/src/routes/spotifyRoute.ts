import { Router } from "express";
import { authorizeSpotify,searchSong ,getTopTracks,getTopArtists} from "../controllers/spotifyController";

const router = Router();
router.post("/auth", authorizeSpotify);
router.post("/search", authorizeSpotify);
router.post("/search/song", searchSong);
router.post("/toptracks", getTopTracks);
router.post("/topartists", getTopArtists);



export default router;
