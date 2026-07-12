import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

const ShowcaseSchema = new mongoose.Schema({
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: false,
        index: true
    },
    isSolo: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    demoLink: {
        type: String,
        trim: true,
        default: ""
    },
    githubLink: {
        type: String,
        trim: true,
        default: ""
    },
    screenshots: [{
        type: String, // Cloudinary URLs
        default: []
    }],
    techStack: [{
        type: String,
        trim: true,
        lowercase: true,
        index: true
    }],
    teamMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    saves: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    comments: [commentSchema],
    sharesCount: {
        type: Number,
        default: 0
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    }
}, { timestamps: true });

const Showcase = mongoose.model("Showcase", ShowcaseSchema);
export { Showcase };
