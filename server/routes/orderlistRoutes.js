import express from "express";
import { v4 as uuidv4 } from "uuid";

export default function orderListRoutes(OrderList) {
    const router = express.Router();

    // GET all orders
    router.get("/orderlist", async (req, res) => {
        try {
            const orders = await OrderList.find().sort({ createdAt: -1 });
            return res.status(200).json(orders);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

    // GET single order by id
    router.get("/orderlist/:id", async (req, res) => {
        try {
            const order = await OrderList.findOne({ id: req.params.id });
            if (!order) return res.status(404).json({ message: "Order not found" });
            return res.status(200).json(order);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

    // POST create new order
    router.post("/orderlist", async (req, res) => {
        try {
            const order = new OrderList({
                id: uuidv4().slice(0, 4), // short 4-char id to match existing data
                ...req.body,
            });
            await order.save();
            return res.status(201).json(order);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

    // DELETE order by id
    router.delete("/orderlist/:id", async (req, res) => {
        try {
            const deleted = await OrderList.findOneAndDelete({ id: req.params.id });
            if (!deleted) return res.status(404).json({ message: "Order not found" });
            return res.status(200).json({ message: "Deleted successfully" });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

    return router;
}
