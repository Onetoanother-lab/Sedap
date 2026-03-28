import React, { useEffect, useState } from "react";
import { Eye, Pencil, Trash2, Plus, Search } from "lucide-react";
import api from "../api/axios";

const Foods = () => {
    const [foods, setFoods]     = useState([]);
    const [search, setSearch]   = useState("");
    const [modal, setModal]     = useState(false);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState({ name: "", description: "", category: "", price: "", discount: "", image: "" });

    const getFoods = async () => {
        try {
            const { data } = await api.get('/products');
            setFoods(Array.isArray(data) ? data : []);
        } catch { setFoods([]); }
        finally { setLoading(false); }
    };

    useEffect(() => { getFoods(); }, []);

    const deleteFood = async (id) => {
        if (!confirm("Delete this product?")) return;
        await api.delete(`/products/${id}`);
        getFoods();
    };

    const openAdd = () => {
        setEditing(null);
        setForm({ name: "", description: "", category: "", price: "", discount: "", image: "" });
        setModal(true);
    };

    const openEdit = (food) => {
        setEditing(food);
        setForm({
            name:        food.name        || "",
            description: food.description || "",
            category:    food.category    || "",
            price:       food.price       || "",
            discount:    food.discount    || "",
            image:       food.image       || "",
        });
        setModal(true);
    };

    const saveFood = async () => {
        if (!form.name || !form.category || !form.price) return;
        const payload = { ...form, price: Number(form.price), discount: Number(form.discount) || 0 };

        if (editing) {
            await api.put(`/products/${editing.id}`, { id: editing.id, ...payload });
        } else {
            await api.post('/products', payload);
        }
        setModal(false);
        getFoods();
    };

    const filtered = foods.filter((f) =>
        `${f.name ?? ""} ${f.category ?? ""}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6">
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <span className="loading loading-spinner text-success w-12" />
                </div>
            )}

            <div style={{ opacity: loading ? 0 : 1, transition: "opacity 0.4s ease" }}>
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-2xl font-semibold text-base-content">Manage Products</h1>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-base-content/60" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search product..." className="input input-bordered pl-9" />
                        </div>
                        <button onClick={openAdd} className="btn btn-success text-white gap-2">
                            <Plus size={18} /> New
                        </button>
                    </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 gap-y-28 mt-24">
                    {filtered.map((food) => (
                        <div key={food._id || food.id}
                            className="relative bg-base-100 rounded-2xl shadow px-6 pb-6 pt-20 flex flex-col items-center text-center hover:shadow-lg transition">
                            <div className="absolute -top-12">
                                <img src={food.image || "https://via.placeholder.com/150"} alt={food.name}
                                    className="w-28 h-28 rounded-full object-cover shadow bg-base-100" />
                            </div>
                            <h3 className="font-semibold text-base-content">{food.name}</h3>
                            <p className="text-sm text-success mb-1">{food.category}</p>
                            <p className="text-success font-bold mb-1">{Number(food.price).toLocaleString()} som</p>
                            {food.discount > 0 && (
                                <span className="badge badge-error text-white text-xs mb-4">
                                    -{(food.discount * 100).toFixed(0)}% off
                                </span>
                            )}
                            <div className="flex gap-4 mt-auto">
                                <button className="btn btn-ghost btn-sm text-primary"><Eye size={18} /></button>
                                <button onClick={() => openEdit(food)} className="btn btn-ghost btn-sm text-warning">
                                    <Pencil size={18} />
                                </button>
                                <button onClick={() => deleteFood(food.id)} className="btn btn-ghost btn-sm text-error">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && !loading && (
                    <div className="text-center text-base-content/50 mt-20">No products found</div>
                )}
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-base-100 p-6 rounded-xl w-96 space-y-3">
                        <h2 className="font-semibold text-lg">{editing ? "Edit Product" : "Add Product"}</h2>
                        {[
                            { key: "name",        placeholder: "Name" },
                            { key: "description", placeholder: "Description" },
                            { key: "category",    placeholder: "Category" },
                            { key: "image",       placeholder: "Image URL" },
                        ].map(({ key, placeholder }) => (
                            <input key={key} placeholder={placeholder} value={form[key]}
                                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                className="input input-bordered w-full" />
                        ))}
                        <div className="flex gap-3">
                            <input type="number" placeholder="Price" value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                className="input input-bordered w-full" />
                            <input type="number" placeholder="Discount (0-1)" value={form.discount}
                                onChange={(e) => setForm({ ...form, discount: e.target.value })}
                                className="input input-bordered w-full" />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setModal(false)} className="btn btn-ghost">Cancel</button>
                            <button onClick={saveFood} className="btn btn-success text-white">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Foods;
