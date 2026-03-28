import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // Exposed to the frontend — auto-set to _id.toString() on first save
    id: {
        type: String,
    },
    name: {
        type: String,
        required: true,
    },
    // sparse unique: null values are NOT treated as duplicates
    // (GitHub OAuth can return users without a public email)
    email: {
        type: String,
        default: null,
    },
    // null for OAuth-only accounts; bcrypt hash for email+password accounts
    password: {
        type: String,
        default: null,
    },
    avatar: {
        type: String,
        default: null,
    },
    // Firebase UID — empty string for plain email/password accounts
    uid: {
        type: String,
        default: "",
    },
}, { timestamps: true });

// Sparse unique indexes — only enforce uniqueness on non-null values
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ id: 1 },    { unique: true, sparse: true });

// Auto-assign id = _id.toString() so the frontend always receives a stable string id
userSchema.pre("save", function (next) {
    if (!this.id) {
        this.id = this._id.toString();
    }
    next();
});

export default mongoose.model("User", userSchema);
