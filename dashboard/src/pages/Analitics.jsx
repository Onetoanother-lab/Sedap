import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import api from "../api/axios";

const Analitics = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders]     = useState([]);
    const [loading, setLoading]   = useState(true);
    const [filter, setFilter]     = useState("Monthly");
    const [likes, setLikes]       = useState({});
    const [ratings, setRatings]   = useState({});

    useEffect(() => {
        Promise.all([api.get('/products'), api.get('/orders')])
            .then(([p, o]) => {
                setProducts(p.data);
                setOrders(o.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
            <span className="loading loading-spinner text-success w-12" />
        </div>
    );

    const now = new Date();
    const filteredOrders = orders.filter((o) => {
        const date = new Date(o.date);
        if (filter === "Daily") return date.toDateString() === now.toDateString();
        if (filter === "Weekly") {
            const s = new Date(now); s.setDate(now.getDate() - now.getDay());
            const e = new Date(s);   e.setDate(s.getDate() + 6);
            return date >= s && date <= e;
        }
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    const totalRevenue = filteredOrders.reduce((a, o) => a + (o.total || 0), 0);

    const productStats = {};
    filteredOrders.forEach((o) => {
        productStats[o.productId] = (productStats[o.productId] || 0) + (o.quantity || 1);
    });

    const mostSelling = Object.entries(productStats)
        .map(([id, qty]) => {
            const p = products.find((x) => String(x.id) === String(id));
            return p ? { ...p, qty } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.qty - a.qty);

    // Build real monthly chart from all orders
    const monthMap = {};
    orders.forEach((o) => {
        if (!o.date) return;
        const d     = new Date(o.date);
        const label = d.toLocaleString("en", { month: "short" });
        monthMap[label] = (monthMap[label] || 0) + (o.total || 0);
    });
    const months   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const chartData = months.map((m) => ({ name: m, value: monthMap[m] || 0 }));

    return (
        <div className="space-y-6 text-base-content">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Analytics</h1>
                    <p className="text-base-content/50 mt-1">Your restaurant summary</p>
                </div>
                <div className="flex items-center gap-2 border rounded-xl px-4 py-2 bg-base-100 shadow cursor-pointer">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="text-sm text-base-content/60">{now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart */}
                <div className="bg-base-100 rounded-2xl shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-semibold text-lg">Revenue Chart</h2>
                        <div className="flex gap-2 text-sm">
                            {["Monthly", "Weekly", "Daily"].map((opt) => (
                                <span key={opt} onClick={() => setFilter(opt)}
                                    className={`px-3 py-1 rounded-full cursor-pointer ${filter === opt ? "bg-primary/20 text-primary" : "text-base-content/40"}`}>
                                    {opt}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-6 mb-4">
                        <div>
                            <p className="text-base-content/50 text-sm">Total Sales</p>
                            <p className="text-success font-bold text-xl">{totalRevenue.toLocaleString()} UZS</p>
                        </div>
                        <div>
                            <p className="text-base-content/50 text-sm">Avg / day</p>
                            <p className="text-success font-bold text-xl">
                                {Math.round(totalRevenue / (filter === "Daily" ? 1 : filter === "Weekly" ? 7 : 30)).toLocaleString()} UZS
                            </p>
                        </div>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(v) => `${v.toLocaleString()} UZS`} />
                                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Most Selling */}
                <div className="bg-base-100 rounded-2xl shadow p-6">
                    <h2 className="font-semibold text-lg mb-4">Most Selling Items</h2>
                    {mostSelling.length === 0 ? (
                        <p className="text-base-content/50 text-sm">No sales data for this period</p>
                    ) : (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {mostSelling.map((item) => (
                                <div key={item.id} className="flex justify-between">
                                    <div className="flex gap-3">
                                        <img src={item.image} className="w-12 h-12 rounded-xl object-cover" />
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-xs text-base-content/40">{item.qty} orders</p>
                                        </div>
                                    </div>
                                    <span className="font-semibold">{item.price?.toLocaleString()} UZS</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Trending + Revenue */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-base-100 rounded-2xl shadow p-6">
                    <h2 className="font-semibold text-lg mb-4">Trending Items</h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {mostSelling.map((item, i) => (
                            <div key={item.id} className="flex justify-between">
                                <div className="flex gap-4">
                                    <span className="text-base-content/40 font-semibold">#{i + 1}</span>
                                    <img src={item.image} className="w-12 h-12 rounded-xl object-cover" />
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-xs text-base-content/40">{item.category}</p>
                                    </div>
                                </div>
                                {i % 2 === 0 ? <TrendingUp className="text-success w-5 h-5" /> : <TrendingDown className="text-error w-5 h-5" />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-base-100 rounded-2xl shadow p-6">
                    <h2 className="font-semibold text-lg mb-4">Annual Revenue</h2>
                    <div className="h-64">
                        <ResponsiveContainer>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(v) => `${v.toLocaleString()} UZS`} />
                                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Most Favourite */}
            <div className="bg-base-100 rounded-2xl shadow p-6">
                <h2 className="text-xl font-semibold mb-6">Most Favourite Items</h2>
                {mostSelling.length === 0 ? (
                    <p className="text-base-content/50">No data yet — place some orders first.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mostSelling.slice(0, 6).map((item) => {
                            const like = likes[item.id] ?? 0;
                            const rate = ratings[item.id] ?? 0;
                            return (
                                <div key={item.id} className="rounded-2xl overflow-hidden border border-base-300 hover:shadow-lg transition">
                                    <img src={item.image} className="h-40 w-full object-cover" />
                                    <div className="p-4 space-y-2">
                                        <h3 className="font-semibold text-sm">{item.name}</h3>
                                        <p className="text-xs text-base-content/40 line-clamp-2">{item.description}</p>
                                        <div className="flex items-center gap-1 text-sm">
                                            {[1,2,3,4,5].map((s) => (
                                                <span key={s} onClick={() => setRatings(p => ({ ...p, [item.id]: s }))}
                                                    className={`cursor-pointer ${s <= rate ? "text-warning" : "text-base-300"}`}>★</span>
                                            ))}
                                        </div>
                                        <button onClick={() => setLikes(p => ({ ...p, [item.id]: (p[item.id] || 0) + 1 }))}
                                            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm">
                                            💙 {like} Like it
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analitics;
