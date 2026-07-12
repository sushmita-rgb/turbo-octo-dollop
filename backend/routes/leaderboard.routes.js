import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getLeaderboard } from "../controllers/leaderboard.controller.js";

const router = Router();

router.route("/").get(verifyJWT, getLeaderboard);

export default router;
