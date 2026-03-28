import express from "express";
import bcrypt from "bcrypt";

// Strip password and normalise _id → id for every user object sent to the frontend
function safeUser(doc) {
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    delete obj.password;
    obj.id = (obj.id || obj._id)?.toString();
    return obj;
}

export default function userRoutes(User) {
    const router = express.Router();

    // GET /api/users?email=&uid=  — used by AuthContext OAuth lookup
    router.get("/users", async (req, res) => {
        try {
            const { email, uid } = req.query;
            const filter = {};
            if (email) filter.email = email;
            if (uid)   filter.uid   = uid;

            const users = await User.find(filter);
            return res.status(200).json(users.map(safeUser));
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

    // GET /api/users/:id  — accepts both MongoDB _id and our string id field
    router.get("/users/:id", async (req, res) => {
        try {
            const user = await User.findOne({
                $or: [{ id: req.params.id }, { _id: req.params.id }]
            }).catch(() => null);

            if (!user) return res.status(404).json({ message: "User not found" });
            return res.status(200).json(safeUser(user));
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

    // POST /api/users  — register (email+password) OR create OAuth user
    router.post("/users", async (req, res) => {
        try {
            const { name, email, password, avatar = null, uid = null } = req.body;
            if (!name?.trim()) {
                return res.status(400).json({ message: "Name is required" });
            }

            const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

            const user = new User({ name, email: email || null, password: hashedPassword, avatar, uid });
            await user.save();  // pre-save hook sets user.id = _id.toString()

            return res.status(201).json(safeUser(user));
        } catch (e) {
            if (e.code === 11000) {
                const field = e.keyPattern?.email ? "Email" : e.keyPattern?.uid ? "Account" : "User";
                return res.status(400).json({ message: `${field} already registered` });
            }
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

    // POST /api/users/login  — email + password sign-in
    // IMPORTANT: must be defined BEFORE /:id to avoid "login" being treated as an id
    router.post("/users/login", async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required" });
            }

            const user = await User.findOne({ email });
            if (!user || !user.password) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            return res.status(200).json(safeUser(user));
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

    // PATCH /api/users/:id  — update profile fields
    router.patch("/users/:id", async (req, res) => {
        try {
            const { name, email, avatar, uid } = req.body;
            const updateFields = {};
            if (name   !== undefined) updateFields.name   = name;
            if (email  !== undefined) updateFields.email  = email;
            if (avatar !== undefined) updateFields.avatar = avatar;
            if (uid    !== undefined) updateFields.uid    = uid;

            const updated = await User.findOneAndUpdate(
                { $or: [{ id: req.params.id }, { _id: req.params.id }] },
                { $set: updateFields },
                { new: true }
            ).catch(() => null);

            if (!updated) return res.status(404).json({ message: "User not found" });
            return res.status(200).json(safeUser(updated));
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

    return router;
}
