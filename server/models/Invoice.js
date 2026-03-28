import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    orderId: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    items: {
        type: Array,
        default: []
    },
    subTotal: {
        type: Number,
        default: 0
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
        default: 0
    }
}, { timestamps: true });

export default mongoose.model("Invoice", invoiceSchema);
