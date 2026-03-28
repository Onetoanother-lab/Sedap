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
            const { customerName, address, items, total } = req.body;
            if (!customerName || !address || !items?.length || total === undefined) {
                return res.status(400).json({ message: "Missing required fields: customerName, address, items, total" });
            }
            const order = new OrderList({
                id: uuidv4(),
                ...req.body,
            });
            await order.save();
            return res.status(201).json(order);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

    // PATCH update order status
    router.patch("/orderlist/:id/status", async (req, res) => {
        try {
            const { status } = req.body;
            if (!status) return res.status(400).json({ error: "Missing required field: status" });
            const order = await OrderList.findOne({ id: req.params.id });
            if (!order) return res.status(404).json({ error: "Order not found" });
            order.status = status;
            order.statusHistory.push({ status, changedAt: new Date() });
            await order.save();
            return res.status(200).json(order);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ error: "Internal Server Error" });
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
