import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    joinDate: {
        type: Date,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    lastOrder: {
        type: Date,
        default: null
    },
    email: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: ""
    },
    company: {
        type: String,
        default: ""
    },
    jobTitle: {
        type: String,
        default: ""
    },
    avatar: {
        type: String,
        default: ""
    }
}, { timestamps: true });

export default mongoose.model("Customer", customerSchema);
