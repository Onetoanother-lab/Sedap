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
    // sparse unique: field must be ABSENT (not null) for the index to skip it.
    // MongoDB sparse indexes still index null values — only missing fields are skipped.
    email: {
        type: String,
    },
    // null for OAuth-only accounts; bcrypt hash for email+password accounts
    password: {
        type: String,
    },
    avatar: {
        type: String,
    },
    // Firebase UID — absent for plain email/password accounts (NOT null, to avoid sparse index conflict)
    uid: {
        type: String,
    },
}, { timestamps: true, id: false });

// Sparse unique indexes — only enforce uniqueness on non-null values
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ id: 1 },    { unique: true, sparse: true });
userSchema.index({ uid: 1 },   { unique: true, sparse: true });

// Auto-assign id = _id.toString() so the frontend always receives a stable string id
userSchema.pre("save", function (next) {
    if (!this.id) {
        this.id = this._id.toString();
    }
    next();
});

export default mongoose.model("User", userSchema);
