import express from "express";
import { v4 as uuidv4 } from "uuid";

export default function reviewRoutes(Review) {
    const router = express.Router();

    // GET all reviews — featured first, then by newest. Supports ?from=YYYY-MM-DD&to=YYYY-MM-DD
    router.get("/reviews", async (req, res) => {
        try {
            const filter = {};
            if (req.query.from || req.query.to) {
                filter.createdAt = {};
                if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
                if (req.query.to) {
                    const to = new Date(req.query.to);
                    to.setDate(to.getDate() + 1);
                    filter.createdAt.$lt = to;
                }
            }
            const reviews = await Review.find(filter).sort({ isFeatured: -1, createdAt: -1 });
            return res.status(200).json(reviews);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });

    // GET single review
    router.get("/reviews/:id", async (req, res) => {
        try {
            const review = await Review.findOne({ id: req.params.id });
            if (!review) return res.status(404).json({ error: "Review not found" });
            return res.status(200).json(review);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });

    // POST create review
    router.post("/reviews", async (req, res) => {
        try {
            const { productName, review, reviewer, rating } = req.body;
            if (!productName || !review || !reviewer || rating === undefined) {
                return res.status(400).json({ error: "Missing required fields: productName, review, reviewer, rating" });
            }
            const doc = new Review({ id: uuidv4(), ...req.body });
            await doc.save();
            return res.status(201).json(doc);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });

    // PATCH update review
    router.patch("/reviews/:id", async (req, res) => {
        try {
            const updated = await Review.findOneAndUpdate(
                { id: req.params.id },
                req.body,
                { new: true }
            );
            if (!updated) return res.status(404).json({ error: "Review not found" });
            return res.status(200).json(updated);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });

    // DELETE review
    router.delete("/reviews/:id", async (req, res) => {
        try {
            const deleted = await Review.findOneAndDelete({ id: req.params.id });
            if (!deleted) return res.status(404).json({ error: "Review not found" });
            return res.status(200).json({ message: "Deleted successfully" });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });

    return router;
}
