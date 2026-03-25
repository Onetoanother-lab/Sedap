import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ""
    }
}, { timestamps: true });

export default mongoose.model("Product", productSchema);