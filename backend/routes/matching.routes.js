import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getMatchedUsers,
    getMatchedTeams,
    getMatchedCandidatesForTeam,
} from "../controllers/matching.controller.js";

const router = Router();

router.route("/users").get(verifyJWT, getMatchedUsers);
router.route("/teams").get(verifyJWT, getMatchedTeams);
router.route("/teams/:teamId/candidates").get(verifyJWT, getMatchedCandidatesForTeam);

export default router;