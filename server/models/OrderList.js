import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    category: { type: String },
    image: { type: String, default: "" },
    qty: { type: Number, required: true, default: 1 }
}, { _id: false });

const orderListSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    customerName: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    items: {
        type: [orderItemSchema],
        default: []
    },
    subTotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    tips: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("OrderList", orderListSchema);