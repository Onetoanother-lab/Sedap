import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        default: ""
    },
    color: {
        type: String,
        enum: ["bg-error", "bg-success", "bg-primary", "bg-warning", "bg-info"],
        default: "bg-primary"
    }
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
