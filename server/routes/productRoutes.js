import express from "express";

export default function productRoutes(Product) {
    const router = express.Router();

    // GET all products
    router.get("/products", async (req, res) => {
        try {
            const products = await Product.find();
            return res.status(200).json(products);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

    // GET single product by id
    router.get("/products/:id", async (req, res) => {
        try {
            const product = await Product.findOne({ id: req.params.id });
            if (!product) return res.status(404).json({ message: "Product not found" });
            return res.status(200).json(product);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

    // POST create product
    router.post("/products", async (req, res) => {
        try {
            const { id, name, description, price, category } = req.body;
            if (!id || !name || !description || price === undefined || !category) {
                return res.status(400).json({ message: "Missing required fields: id, name, description, price, category" });
            }
            const product = new Product(req.body);
            await product.save();
            return res.status(201).json(product);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

    // PUT update product by id
    router.put("/products/:id", async (req, res) => {
        try {
            const updated = await Product.findOneAndUpdate(
                { id: req.params.id },
                req.body,
                { new: true }
            );
            if (!updated) return res.status(404).json({ message: "Product not found" });
            return res.status(200).json(updated);
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

    // DELETE product by id
    router.delete("/products/:id", async (req, res) => {
        try {
            const deleted = await Product.findOneAndDelete({ id: req.params.id });
            if (!deleted) return res.status(404).json({ message: "Product not found" });
            return res.status(200).json({ message: "Deleted successfully" });
        } catch (e) {
            console.error(e);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    });

    return router;
}
