import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    productName: {
        type: String,
        required: true
    },
    productCategory: {
        type: String,
        default: "MAIN COURSE"
    },
    productImage: {
        type: String,
        default: ""
    },
    review: {
        type: String,
        required: true
    },
    reviewer: {
        type: String,
        required: true
    },
    reviewerRole: {
        type: String,
        default: ""
    },
    reviewerAvatar: {
        type: String,
        default: ""
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    tags: {
        type: [String],
        default: []
    },
    isFeatured: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model("Review", reviewSchema);
