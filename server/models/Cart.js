import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    id: { type: String, required: true },          
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    category: { type: String, default: "" },
    image: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Cart", cartItemSchema);