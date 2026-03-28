import express from "express";
import { v4 as uuidv4 } from "uuid";

export default function transactionRoutes(Transaction) {
    const router = express.Router();

    // GET all transactions — newest first
    router.get("/transactions", async (req, res) => {
        try {
            const transactions = await Transaction.find().sort({ createdAt: -1 });
            return res.status(200).json(transactions);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });

    // GET single transaction
    router.get("/transactions/:id", async (req, res) => {
        try {
            const tx = await Transaction.findOne({ id: req.params.id });
            if (!tx) return res.status(404).json({ error: "Transaction not found" });
            return res.status(200).json(tx);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });

    // POST create transaction
    router.post("/transactions", async (req, res) => {
        try {
            const { name, amount } = req.body;
            if (!name || amount === undefined) {
                return res.status(400).json({ error: "Missing required fields: name, amount" });
            }
            const doc = new Transaction({ id: uuidv4(), ...req.body });
            await doc.save();
            return res.status(201).json(doc);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });

    // PATCH update transaction
    router.patch("/transactions/:id", async (req, res) => {
        try {
            const updated = await Transaction.findOneAndUpdate(
                { id: req.params.id },
                req.body,
                { new: true }
            );
            if (!updated) return res.status(404).json({ error: "Transaction not found" });
            return res.status(200).json(updated);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });

    // DELETE transaction
    router.delete("/transactions/:id", async (req, res) => {
        try {
            const deleted = await Transaction.findOneAndDelete({ id: req.params.id });
            if (!deleted) return res.status(404).json({ error: "Transaction not found" });
            return res.status(200).json({ message: "Deleted successfully" });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    });

    return router;
}
