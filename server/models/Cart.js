import mongoose from "mongoose";

// Each document = one item added to the cart (duplicates are allowed —
// the frontend groups them by product id for display)
const cartItemSchema = new mongoose.Schema({
    id: { type: String, required: true },          // product id
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    category: { type: String, default: "" },
    image: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Cart", cartItemSchema);
