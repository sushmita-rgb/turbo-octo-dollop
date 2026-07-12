import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// @desc    Get leaderboard rankings
// @route   GET /api/v1/leaderboard
// @access  Protected
const getLeaderboard = asyncHandler(async (req, res) => {
    const {
        type = "global", // global, country, college, activity, wins
        page = 1,
        limit = 10,
        country,
        college,
        search
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    // Apply search filter if specified
    if (search) {
        filter.$or = [
            { username: { $regex: search, $options: "i" } },
            { fullName: { $regex: search, $options: "i" } }
        ];
    }

    let sortOption = { reputationScore: -1 };

    if (type === "country") {
        const targetCountry = country || req.user?.country || "India";
        filter.country = { $regex: `^${targetCountry}$`, $options: "i" };
        sortOption = { reputationScore: -1 };
    } else if (type === "college") {
        const targetCollege = college || req.user?.college;
        if (targetCollege) {
            filter.college = { $regex: targetCollege, $options: "i" };
        }
        sortOption = { reputationScore: -1 };
    } else if (type === "activity") {
        sortOption = { monthlyActivity: -1 };
    } else if (type === "wins") {
        sortOption = { hackathonWins: -1 };
    } else {
        // default global
        sortOption = { reputationScore: -1 };
    }

    // Fetch ranked users
    const users = await User.find(filter)
        .select("username fullName avatar country college reputationScore monthlyActivity hackathonWins team_role")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum);

    const totalUsers = await User.countDocuments(filter);

    // Compute caller's rank if authenticated
    let userRank = null;
    if (req.user) {
        const currentUser = await User.findById(req.user._id);
        if (currentUser) {
            let rankFilter = { ...filter };
            const currentScoreField = type === "activity" ? "monthlyActivity" : 
                                      type === "wins" ? "hackathonWins" : "reputationScore";
            
            const currentUserScore = currentUser[currentScoreField] || 0;
            
            // Count how many users have a score higher than current user
            rankFilter[currentScoreField] = { $gt: currentUserScore };
            
            const higherScoringCount = await User.countDocuments(rankFilter);
            userRank = higherScoringCount + 1;
        }
    }

    // Get list of all unique countries & colleges for frontend filters dropdown
    const countries = await User.distinct("country", { country: { $ne: null, $ne: "" } });
    const colleges = await User.distinct("college", { college: { $ne: null, $ne: "" } });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                users,
                userRank,
                countries,
                colleges,
                pagination: {
                    totalUsers,
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalUsers / limitNum),
                    limit: limitNum
                }
            },
            "Leaderboard rankings fetched successfully"
        )
    );
});

export { getLeaderboard };
