import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    joinDate: {
        type: String,
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
        type: String,
        default: "$0"
    },
    lastOrder: {
        type: String,
        default: "$0"
    }
}, { timestamps: true });

export default mongoose.model("Customer", customerSchema);