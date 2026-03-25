import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    id:       { type: String },
    name:     { type: String, required: true },
    email:    { type: String, default: null },
    password: { type: String, default: null },
    avatar:   { type: String, default: null },
    uid:      { type: String, default: "" },
}, { timestamps: true, id: false })  // ← add id: false

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ id: 1 },    { unique: true, sparse: true });

export default mongoose.model("User", userSchema);