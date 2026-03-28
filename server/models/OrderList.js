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

const courierSchema = new mongoose.Schema({
    name:   { type: String, default: "" },
    phone:  { type: String, default: "" },
    avatar: { type: String, default: "" },
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
    status:    { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
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
    status: {
        type: String,
        enum: ['new', 'on_delivery', 'delivered', 'canceled'],
        default: 'new'
    },
    branch: {
        type: String,
        default: ""
    },
    courier: {
        type: courierSchema,
        default: () => ({})
    },
    statusHistory: {
        type: [statusHistorySchema],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("OrderList", orderListSchema);
