import express from "express";
import { v4 as uuidv4 } from "uuid";

export default function eventRoutes(Event) {
    const router = express.Router();

    // GET all events — optional ?year=&month= filter
    router.get("/events", async (req, res) => {
        try {
            const { year, month } = req.query;
            let filter = {};
            if (year && month) {
                const start = new Date(Number(year), Number(month) - 1, 1);
                const end   = new Date(Number(year), Number(month), 1);
                filter.date = { $gte: start, $lt: end };
            }
            const events = await Event.find(filter).sort({ date: 1 });
            return res.status(200).json(events);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });

    // GET single event
    router.get("/events/:id", async (req, res) => {
        try {
            const event = await Event.findOne({ id: req.params.id });
            if (!event) return res.status(404).json({ error: "Event not found" });
            return res.status(200).json(event);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });

    // POST create event
    router.post("/events", async (req, res) => {
        try {
            const { title, date } = req.body;
            if (!title || !date) {
                return res.status(400).json({ error: "Missing required fields: title, date" });
            }
            const doc = new Event({ id: uuidv4(), ...req.body });
            await doc.save();
            return res.status(201).json(doc);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });

    // PUT update event
    router.put("/events/:id", async (req, res) => {
        try {
            const updated = await Event.findOneAndUpdate(
                { id: req.params.id },
                req.body,
                { new: true }
            );
            if (!updated) return res.status(404).json({ error: "Event not found" });
            return res.status(200).json(updated);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });

    // DELETE event
    router.delete("/events/:id", async (req, res) => {
        try {
            const deleted = await Event.findOneAndDelete({ id: req.params.id });
            if (!deleted) return res.status(404).json({ error: "Event not found" });
            return res.status(200).json({ message: "Deleted successfully" });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });

    return router;
}
