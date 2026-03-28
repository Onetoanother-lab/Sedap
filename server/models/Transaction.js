import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: ""
    },
    avatar: {
        type: String,
        default: ""
    },
    amount: {
        type: Number,
        required: true
    },
    card: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["Pending", "Completed", "Canceled"],
        default: "Pending"
    },
    paymentId: {
        type: String,
        default: ""
    },
    invoiceDate: {
        type: Date,
        default: null
    },
    dueDate: {
        type: Date,
        default: null
    },
    datePaid: {
        type: Date,
        default: null
    },
    note: {
        type: String,
        default: ""
    }
}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);
