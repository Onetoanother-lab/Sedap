import express from "express";

export default function customerRoutes(Customer) {
    const router = express.Router();

    // GET all customers
    router.get("/customers", async (req, res) => {
        try {
            const customers = await Customer.find();
            return res.status(200).json(customers);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

    // GET single customer by id
    router.get("/customers/:id", async (req, res) => {
        try {
            const customer = await Customer.findOne({ id: req.params.id });
            if (!customer) return res.status(404).json({ message: "Customer not found" });
            return res.status(200).json(customer);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

    // PATCH update customer by id
    router.patch("/customers/:id", async (req, res) => {
        try {
            const updated = await Customer.findOneAndUpdate(
                { id: req.params.id },
                req.body,
                { new: true }
            );
            if (!updated) return res.status(404).json({ message: "Customer not found" });
            return res.status(200).json(updated);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

    return router;
}
