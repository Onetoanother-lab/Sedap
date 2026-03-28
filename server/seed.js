import mongoose from "mongoose";
import dotenv from "dotenv";
import { readFileSync } from "fs";

// Models
import Product from "./models/Product.js";
import Customer from "./models/Customer.js";
import Order from "./models/Order.js";
import OrderList from "./models/OrderList.js";
import User from "./models/User.js";
import Review from "./models/Review.js";
import Transaction from "./models/Transaction.js";
import Event from "./models/Event.js";

dotenv.config();

// Load db.json
const db = JSON.parse(readFileSync("./db.json", "utf-8"));

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // ── Clear existing collections ──────────────────────────────────
        await Promise.all([
            Product.deleteMany({}),
            Customer.deleteMany({}),
            Order.deleteMany({}),
            OrderList.deleteMany({}),
            User.deleteMany({}),
            Review.deleteMany({}),
            Transaction.deleteMany({}),
            Event.deleteMany({}),
        ]);
        console.log("🧹 Cleared existing data");

        // ── Products ────────────────────────────────────────────────────
        if (db.products?.length) {
            await Product.insertMany(db.products);
            console.log(`📦 Inserted ${db.products.length} products`);
        }

        // ── Customers ───────────────────────────────────────────────────
        if (db.customers?.length) {
            await Customer.insertMany(db.customers);
            console.log(`👥 Inserted ${db.customers.length} customers`);
        }

        // ── Orders ──────────────────────────────────────────────────────
        if (db.orders?.length) {
            await Order.insertMany(db.orders);
            console.log(`🛒 Inserted ${db.orders.length} orders`);
        }

        // ── Order List ──────────────────────────────────────────────────
        if (db.orderlist?.length) {
            await OrderList.insertMany(db.orderlist);
            console.log(`📋 Inserted ${db.orderlist.length} order lists`);
        }

        // ── Users (passwords stored as-is from db.json — hash in prod!) ─
        if (db.users?.length) {
            await User.insertMany(db.users);
            console.log(`👤 Inserted ${db.users.length} users`);
        }

        // ── Reviews ─────────────────────────────────────────────────────
        if (db.reviews?.length) {
            await Review.insertMany(db.reviews);
            console.log(`⭐ Inserted ${db.reviews.length} reviews`);
        }

        // ── Transactions ─────────────────────────────────────────────────
        if (db.transactions?.length) {
            await Transaction.insertMany(db.transactions);
            console.log(`💳 Inserted ${db.transactions.length} transactions`);
        }

        // ── Events ───────────────────────────────────────────────────────
        if (db.events?.length) {
            await Event.insertMany(db.events);
            console.log(`📅 Inserted ${db.events.length} events`);
        }

        console.log("\n🎉 Seeding complete!");
    } catch (err) {
        console.error("❌ Seeding failed:", err);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
};

seed();
