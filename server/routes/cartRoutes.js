import express from "express";

export default function cartRoutes(Cart) {
    const router = express.Router();

    // GET all cart items
    router.get("/invoice", async (req, res) => {
        try {
            const items = await Cart.find();
            // Expose Mongoose _id as "id" so the frontend can use item.id
            const mapped = items.map(item => ({
                id: item._id.toString(),
                productId: item.id,
                name: item.name,
                description: item.description,
                price: item.price,
                discount: item.discount,
                category: item.category,
                image: item.image,
            }));
            return res.status(200).json(mapped);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

    // POST add item to cart
    router.post("/invoice", async (req, res) => {
        try {
            const { name, price } = req.body;
            if (!name || price === undefined) {
                return res.status(400).json({ message: "Missing required fields: name, price" });
            }
            const item = new Cart(req.body);
            await item.save();
            return res.status(201).json({
                id: item._id.toString(),
                productId: item.id,
                name: item.name,
                description: item.description,
                price: item.price,
                discount: item.discount,
                category: item.category,
                image: item.image,
            });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

    // DELETE single cart item by MongoDB _id
    router.delete("/invoice/:id", async (req, res) => {
        try {
            const deleted = await Cart.findByIdAndDelete(req.params.id);
            if (!deleted) return res.status(404).json({ message: "Item not found" });
            return res.status(200).json({ message: "Deleted successfully" });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

    // DELETE all cart items at once (used after order submit)
    router.delete("/invoice", async (req, res) => {
        try {
            await Cart.deleteMany({});
            return res.status(200).json({ message: "Cart cleared" });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

    return router;
}
