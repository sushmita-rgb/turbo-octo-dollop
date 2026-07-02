// backend/services/matching.service.js
//
// No ML — deterministic weighted scoring based on skills, roles,
// experience, preferences, location and availability.

import { EXPERIENCE_LEVELS } from "../constants/techStack.constants.js";

// Groups roles into broader categories so we can reward complementary
// (not identical) skillsets when matching two people, and reward filling
// a category gap when matching a person to a team.
const ROLE_CATEGORY = {
    "Frontend Developer": "frontend",
    "Backend Developer": "backend",
    "Full Stack Developer": "fullstack",
    "Mobile Developer (Flutter)": "mobile",
    "Mobile Developer (React Native)": "mobile",
    "iOS Developer": "mobile",
    "Android Developer": "mobile",
    "ML Engineer": "data_ai",
    "Data Scientist": "data_ai",
    "Data Engineer": "data_ai",
    "DevOps Engineer": "devops",
    "Cloud Engineer": "devops",
    "Blockchain Developer": "blockchain",
    "Game Developer": "gamedev",
    "UI/UX Designer": "design",
    "Product Designer": "design",
    "Product Manager": "product",
    "QA Engineer": "qa",
    "Security Engineer": "security",
    "AR/VR Developer": "gamedev",
    "Embedded Systems Engineer": "hardware",
    "Technical Writer": "product",
};

const roleCategory = (role) => ROLE_CATEGORY[role] || "other";

const round2 = (n) => Math.round(n * 100) / 100;

const expLevelIndex = (level) => {
    const idx = EXPERIENCE_LEVELS.indexOf(level);
    return idx === -1 ? 1 : idx; // default -> Intermediate
};

function jaccard(a = [], b = []) {
    const setA = new Set((a || []).map((x) => String(x).toLowerCase()));
    const setB = new Set((b || []).map((x) => String(x).toLowerCase()));
    if (setA.size === 0 && setB.size === 0) return 0;
    let intersection = 0;
    for (const item of setA) if (setB.has(item)) intersection++;
    const union = new Set([...setA, ...setB]).size;
    return union === 0 ? 0 : intersection / union;
}

function extractCountry(location = "") {
    const parts = (location || "").split(",");
    return parts.length > 1
        ? parts[parts.length - 1].trim().toLowerCase()
        : (location || "").trim().toLowerCase();
}

/**
 * Score how good a teammate match `candidate` is for `currentUser`.
 * Weights: techOverlap 40%, roleComplementarity 15%, preferenceOverlap 15%,
 * experienceProximity 10%, locationProximity 10%, availability 10%.
 */
function scoreUserForUser(currentUser, candidate) {
    const techOverlap = jaccard(currentUser.techStack, candidate.techStack);
    const prefOverlap = jaccard(currentUser.preferences, candidate.preferences);

    const sameCategory =
        roleCategory(currentUser.team_role) === roleCategory(candidate.team_role);
    const roleComplementarity = sameCategory ? 0.3 : 1; // reward different specialities

    const levelDiff = Math.abs(
        expLevelIndex(currentUser.experienceLevel) - expLevelIndex(candidate.experienceLevel)
    );
    const experienceProximity = Math.max(0, 1 - levelDiff / (EXPERIENCE_LEVELS.length - 1));

    const currentCountry = extractCountry(currentUser.location);
    const sameCountry = currentCountry !== "" && currentCountry === extractCountry(candidate.location);
    const locationProximity = sameCountry ? 1 : 0.3;

    const availabilityScore = candidate.availability === false ? 0 : 1;

    const score =
        techOverlap * 0.4 +
        roleComplementarity * 0.15 +
        prefOverlap * 0.15 +
        experienceProximity * 0.1 +
        locationProximity * 0.1 +
        availabilityScore * 0.1;

    return {
        score: Math.round(score * 100),
        breakdown: {
            techOverlap: round2(techOverlap),
            roleComplementarity: round2(roleComplementarity),
            preferenceOverlap: round2(prefOverlap),
            experienceProximity: round2(experienceProximity),
            locationProximity: round2(locationProximity),
            availabilityScore,
        },
    };
}

/**
 * Score how good `candidate` is for `team`, given the team's current
 * `memberDocs` (should include the leader).
 * Weights: requiredSkillOverlap 35%, skillGapCoverage 25%, roleDiversity 15%,
 * preferenceAlignment 10%, locationProximity 5%, experienceScore 5%,
 * availability 5%.
 */
function scoreUserForTeam(candidate, team, memberDocs = []) {
    const requiredSkills = (team.requiredSkills || []).map((s) => s.toLowerCase());
    const candidateSkills = (candidate.techStack || []).map((s) => s.toLowerCase());

    const requiredSkillOverlap = jaccard(candidateSkills, requiredSkills);

    const coveredSkills = new Set();
    memberDocs.forEach((m) => (m.techStack || []).forEach((s) => coveredSkills.add(s.toLowerCase())));
    const uncoveredSkills = requiredSkills.filter((s) => !coveredSkills.has(s));
    const skillGapCoverage =
        uncoveredSkills.length === 0
            ? requiredSkillOverlap
            : uncoveredSkills.filter((s) => candidateSkills.includes(s)).length / uncoveredSkills.length;

    const memberCategories = new Set(memberDocs.map((m) => roleCategory(m.team_role)));
    const roleDiversity = memberCategories.has(roleCategory(candidate.team_role)) ? 0.3 : 1;

    const teamThemeText = `${team.hackathonName || ""} ${team.projectIdea || ""} ${team.description || ""}`.toLowerCase();
    const prefHits = (candidate.preferences || []).filter((p) => teamThemeText.includes(p.toLowerCase())).length;
    const preferenceAlignment = Math.min(1, prefHits / 2);

    const leaderDoc = memberDocs.find((m) => String(m._id) === String(team.leader)) || memberDocs[0];
    const teamCountry = leaderDoc ? extractCountry(leaderDoc.location) : "";
    const sameCountry = teamCountry !== "" && extractCountry(candidate.location) === teamCountry;
    const locationProximity = sameCountry ? 1 : 0.4;

    const experienceScore = expLevelIndex(candidate.experienceLevel) >= 1 ? 1 : 0.5;

    const availabilityScore = candidate.availability === false ? 0 : 1;

    const score =
        requiredSkillOverlap * 0.35 +
        skillGapCoverage * 0.25 +
        roleDiversity * 0.15 +
        preferenceAlignment * 0.1 +
        locationProximity * 0.05 +
        experienceScore * 0.05 +
        availabilityScore * 0.05;

    return {
        score: Math.round(score * 100),
        breakdown: {
            requiredSkillOverlap: round2(requiredSkillOverlap),
            skillGapCoverage: round2(skillGapCoverage),
            roleDiversity: round2(roleDiversity),
            preferenceAlignment: round2(preferenceAlignment),
            locationProximity: round2(locationProximity),
            experienceScore,
            availabilityScore,
        },
    };
}

function rankUsersForUser(currentUser, candidates) {
    return candidates
        .map((c) => ({ user: c, ...scoreUserForUser(currentUser, c) }))
        .sort((a, b) => b.score - a.score);
}

// teamsWithMembers: [{ team, memberDocs }]
function rankTeamsForUser(currentUser, teamsWithMembers) {
    return teamsWithMembers
        .map(({ team, memberDocs }) => ({
            team,
            ...scoreUserForTeam(currentUser, team, memberDocs),
        }))
        .sort((a, b) => b.score - a.score);
}

function rankUsersForTeam(team, memberDocs, candidates) {
    return candidates
        .map((c) => ({ user: c, ...scoreUserForTeam(c, team, memberDocs) }))
        .sort((a, b) => b.score - a.score);
}

export {
    rankUsersForUser,
    rankTeamsForUser,
    rankUsersForTeam,
    scoreUserForUser,
    scoreUserForTeam,
};