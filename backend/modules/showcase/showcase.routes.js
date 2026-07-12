import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/multer.middleware.js";
import {
    publishProject,
    getProjects,
    getProjectById,
    toggleLikeProject,
    toggleSaveProject,
    addCommentToProject,
    incrementShare,
    getUserTeams
} from "./showcase.controller.js";

const router = Router();

// Apply verifyJWT middleware to all routes except list and details (for public viewing)
router.route("/").get(getProjects);
router.route("/:id").get(getProjectById);

router.route("/").post(
    verifyJWT,
    upload.array("screenshots", 5), // allow up to 5 screenshots
    publishProject
);

router.route("/my-teams").get(verifyJWT, getUserTeams);

router.route("/:id/like").post(verifyJWT, toggleLikeProject);
router.route("/:id/save").post(verifyJWT, toggleSaveProject);
router.route("/:id/comment").post(verifyJWT, addCommentToProject);
router.route("/:id/share").post(incrementShare); // public access allows incrementing share counts

export default router;
