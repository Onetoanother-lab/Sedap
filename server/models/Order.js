import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    productId: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);