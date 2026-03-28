import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { toast, ToastContainer } from "react-toastify";
import api from "../api/axios";

const FoodsDetail = () => {
    const [product, setProduct]   = useState(null);
    const [orders, setOrders]     = useState([]);
    const [loading, setLoading]   = useState(true);
    const [filter, setFilter]     = useState("Monthly");
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [formData, setFormData] = useState({
        name: "", description: "", price: "", discount: "", category: "", image: "",
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [prodRes, ordRes] = await Promise.all([
                api.get('/products'),
                api.get('/orders'),
            ]);
            const productList = prodRes.data;
            const orderList   = ordRes.data;

            // Show the first product's detail
            const p = productList[0];
            if (!p) { setLoading(false); return; }
            setProduct(p);

            // Build monthly revenue for this product
            const productOrders = orderList.filter(o => String(o.productId) === String(p.id));
            const monthlyMap = {};
            productOrders.forEach((order) => {
                const d     = new Date(order.date);
                const month = d.toLocaleString("en", { month: "short" });
                if (!monthlyMap[month]) monthlyMap[month] = { name: month, value: 0 };
                monthlyMap[month].value += Number(order.total) || 0;
            });
            const allMonths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            setOrders(allMonths.map(m => monthlyMap[m] || { name: m, value: 0 }));
        } catch (err) {
            toast.error("Could not reach the backend: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            price:    parseFloat(formData.price)    || 0,
            discount: (parseFloat(formData.discount) || 0) / 100,
        };
        try {
            if (modalMode === "add") {
                await api.post('/products', payload);
                toast.success("Product added!");
            } else {
                await api.put(`/products/${product.id}`, { id: product.id, ...payload });
                toast.success("Product updated!");
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            toast.error("Failed: " + err.message);
        }
    };

    const handleInput = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

    const openAdd = () => {
        setModalMode("add");
        setFormData({ name: "", description: "", price: "", discount: "", category: "", image: "" });
        setShowModal(true);
    };
    const openEdit = () => {
        if (!product) return;
        setModalMode("edit");
        setFormData({
            name:        product.name,
            description: product.description,
            price:       product.price.toString(),
            discount:    (product.discount * 100).toString(),
            category:    product.category,
            image:       product.image,
        });
        setShowModal(true);
    };

    const formatPrice = (p) => new Intl.NumberFormat("uz-UZ", { style: "currency", currency: "UZS", minimumFractionDigits: 0 }).format(p);
    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-base-100 p-3 rounded-lg shadow-lg border border-base-200">
                <p className="font-semibold text-success">{formatPrice(payload[0].value)}</p>
                <p className="text-sm text-base-content/50">{payload[0].payload.name}</p>
            </div>
        );
    };

    if (loading) return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <span className="loading loading-spinner text-success w-12" />
        </div>
    );

    if (!product) return (
        <div className="p-8 text-base-content/50">No products found in database.</div>
    );

    const discountedPrice = product.price * (1 - product.discount);
    const totalRevenue    = orders.reduce((s, o) => s + o.value, 0);

    return (
        <div className="min-h-screen bg-base-200 p-4 sm:p-6 text-base-content">
            <ToastContainer />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Foods Detail</h1>
                    <p className="text-base-content/60 mt-1">Product overview & revenue</p>
                </div>
                <button onClick={openAdd} className="btn btn-primary gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Menu
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product card */}
                <div className="bg-base-100 rounded-2xl p-5 sm:p-6 shadow-sm border border-base-300">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Product Info</h2>
                        <span className="text-primary font-medium text-sm">{product.category}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-6 mb-8">
                        <img src={product.image} alt={product.name}
                            className="w-full sm:w-48 h-48 object-cover rounded-xl shadow"
                            onError={(e) => (e.target.src = "https://via.placeholder.com/300")} />
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                            <p className="text-base-content/70 mb-4 leading-relaxed">{product.description}</p>
                            <div className="grid grid-cols-3 gap-4 text-center mb-6">
                                <div>
                                    <p className="text-xs text-base-content/60">Original</p>
                                    <p className="text-lg line-through text-base-content/40">{formatPrice(product.price)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-base-content/60">Discounted</p>
                                    <p className="text-2xl font-bold text-primary">{formatPrice(discountedPrice)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-base-content/60">Discount</p>
                                    <p className="text-xl font-semibold text-warning">{Math.round(product.discount * 100)}%</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={openAdd} className="btn btn-primary btn-sm gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add
                                </button>
                                <button onClick={openEdit} className="btn btn-ghost btn-sm">Edit</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Revenue chart */}
                <div className="bg-base-100 rounded-2xl p-5 sm:p-6 shadow-sm border border-base-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                        <div>
                            <h2 className="text-xl font-semibold mb-1">Revenue</h2>
                            <p className="text-2xl font-bold text-primary">{totalRevenue.toLocaleString()} UZS</p>
                        </div>
                        <div className="flex gap-2 bg-base-200 p-1 rounded-lg">
                            {["Monthly", "Weekly", "Daily"].map(r => (
                                <span key={r} onClick={() => setFilter(r)}
                                    className={`px-3 py-1 rounded-full cursor-pointer text-sm ${filter === r ? "bg-primary/20 text-primary font-medium" : "text-base-content/40"}`}>
                                    {r}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div style={{ height: "400px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={orders} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={50} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="top" height={36} />
                                <Line type="monotone" dataKey="value" name="Revenue (UZS)"
                                    stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-base-100 rounded-2xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">{modalMode === "add" ? "Add New Product" : "Edit Product"}</h3>
                            <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm btn-circle">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {[
                                { label: "Name",        name: "name",        type: "text" },
                                { label: "Price (UZS)", name: "price",       type: "number" },
                                { label: "Discount (%)",name: "discount",    type: "number" },
                                { label: "Category",    name: "category",    type: "text" },
                                { label: "Image URL",   name: "image",       type: "text" },
                            ].map(f => (
                                <div key={f.name}>
                                    <label className="block text-sm font-medium mb-1">{f.label}</label>
                                    <input type={f.type} name={f.name} value={formData[f.name]}
                                        onChange={handleInput} className="input input-bordered w-full" />
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInput}
                                    rows={3} className="textarea textarea-bordered w-full" />
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    {modalMode === "add" ? "Add" : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodsDetail;
