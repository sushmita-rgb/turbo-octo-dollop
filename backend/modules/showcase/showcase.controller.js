import { Showcase } from "./showcase.model.js";
import { Team } from "../team/team.model.js";
import { User } from "../auth/user.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { uploadOnCloudinary } from "../../utils/cloudinary.js";

const publishProject = asyncHandler(async (req, res) => {
    const {
        team: teamId,
        title,
        description,
        demoLink,
        githubLink,
        techStack,
        isSolo: isSoloInput
    } = req.body;

    const isSolo = isSoloInput === 'true' || isSoloInput === true;

    if (!isSolo && !teamId) {
        throw new ApiError(400, "Team is required for team projects");
    }
    if (!title || !description) {
        throw new ApiError(400, "Title and Description are required");
    }

    let teamMembers = [req.user?._id];
    let team = null;

    if (!isSolo) {
        // Find the team
        team = await Team.findById(teamId);
        if (!team) {
            throw new ApiError(404, "Team not found");
        }

        // Check if user is a member of the team
        const isMember = team.members.some(memberId => memberId.toString() === req.user?._id.toString());
        if (!isMember) {
            throw new ApiError(403, "You must be a member of the team to publish its project");
        }
        teamMembers = team.members;
    }

    // Parse tech stack
    const parsedTechStack = typeof techStack === "string"
        ? JSON.parse(techStack)
        : techStack || [];

    // Handle files if any (screenshots)
    const screenshotFiles = req.files || [];
    const screenshots = [];

    if (screenshotFiles && screenshotFiles.length > 0) {
        for (const file of screenshotFiles) {
            const uploadedFile = await uploadOnCloudinary(file.path);
            if (uploadedFile?.url) {
                screenshots.push(uploadedFile.url);
            }
        }
    }

    // Create Showcase project
    const showcase = await Showcase.create({
        team: isSolo ? null : teamId,
        isSolo,
        title: title.trim(),
        description: description.trim(),
        demoLink: demoLink || "",
        githubLink: githubLink || "",
        screenshots,
        techStack: parsedTechStack.map(tech => tech.toLowerCase().trim()),
        teamMembers,
        creator: req.user?._id
    });

    return res.status(201).json(
        new ApiResponse(201, showcase, "Project published successfully")
    );
});

const getProjects = asyncHandler(async (req, res) => {
    const { search, techStack, sortBy } = req.query;
    const filter = {};

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ];
    }

    if (techStack) {
        filter.techStack = techStack.toLowerCase().trim();
    }

    let sortOptions = { createdAt: -1 }; // default sorting

    if (sortBy === "likes") {
        // Mongoose doesn't support sorting directly by array size in find.sort() without aggregation,
        // but we can query then sort, or use aggregation if needed, or simply sort by date by default.
        // Let's do simple aggregation if they sort by likes/comments, or sort in memory/db.
        // For simplicity, we can sort by date or likes. Let's write a flexible query.
    }

    // Let's execute normal find
    let query = Showcase.find(filter)
        .populate("team", "name hackathonName teamAvatar")
        .populate("creator", "username avatar")
        .populate("teamMembers", "username avatar")
        .populate("comments.user", "username avatar");

    let showcases = await query;

    // Apply sorting
    if (sortBy === "likes") {
        showcases.sort((a, b) => b.likes.length - a.likes.length);
    } else if (sortBy === "comments") {
        showcases.sort((a, b) => b.comments.length - a.comments.length);
    } else {
        // default sorting (newest first)
        showcases.sort((a, b) => b.createdAt - a.createdAt);
    }

    return res.status(200).json(
        new ApiResponse(200, showcases, "Projects fetched successfully")
    );
});

const getProjectById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const showcase = await Showcase.findById(id)
        .populate("team", "name hackathonName teamAvatar bannerImage")
        .populate("creator", "username avatar fullName")
        .populate("teamMembers", "username avatar fullName techStack")
        .populate("comments.user", "username avatar");

    if (!showcase) {
        throw new ApiError(404, "Project showcase not found");
    }

    return res.status(200).json(
        new ApiResponse(200, showcase, "Project details fetched successfully")
    );
});

const toggleLikeProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?._id;

    const showcase = await Showcase.findById(id);
    if (!showcase) {
        throw new ApiError(404, "Project showcase not found");
    }

    const likeIndex = showcase.likes.findIndex(likeId => likeId.toString() === userId.toString());
    let liked = false;

    if (likeIndex > -1) {
        showcase.likes.splice(likeIndex, 1);
    } else {
        showcase.likes.push(userId);
        liked = true;
    }

    await showcase.save();

    return res.status(200).json(
        new ApiResponse(200, { liked, count: showcase.likes.length }, liked ? "Project liked" : "Project unliked")
    );
});

const toggleSaveProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?._id;

    const showcase = await Showcase.findById(id);
    if (!showcase) {
        throw new ApiError(404, "Project showcase not found");
    }

    const saveIndex = showcase.saves.findIndex(saveId => saveId.toString() === userId.toString());
    let saved = false;

    if (saveIndex > -1) {
        showcase.saves.splice(saveIndex, 1);
    } else {
        showcase.saves.push(userId);
        saved = true;
    }

    await showcase.save();

    return res.status(200).json(
        new ApiResponse(200, { saved }, saved ? "Project saved to bookmarks" : "Project removed from bookmarks")
    );
});

const addCommentToProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
        throw new ApiError(400, "Comment text is required");
    }

    const showcase = await Showcase.findById(id);
    if (!showcase) {
        throw new ApiError(404, "Project showcase not found");
    }

    showcase.comments.push({
        user: req.user?._id,
        text: text.trim()
    });

    await showcase.save();

    // Populate newly added comment user info
    const updatedShowcase = await Showcase.findById(id).populate("comments.user", "username avatar");

    return res.status(201).json(
        new ApiResponse(201, updatedShowcase.comments, "Comment added successfully")
    );
});

const incrementShare = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const showcase = await Showcase.findByIdAndUpdate(
        id,
        { $inc: { sharesCount: 1 } },
        { new: true }
    );

    if (!showcase) {
        throw new ApiError(404, "Project showcase not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { sharesCount: showcase.sharesCount }, "Share count updated")
    );
});

const getUserTeams = asyncHandler(async (req, res) => {
    const teams = await Team.find({ members: req.user?._id })
        .populate("members", "username avatar");

    return res.status(200).json(
        new ApiResponse(200, teams, "User teams fetched successfully")
    );
});

export {
    publishProject,
    getProjects,
    getProjectById,
    toggleLikeProject,
    toggleSaveProject,
    addCommentToProject,
    incrementShare,
    getUserTeams
};
