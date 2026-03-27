import React, { useEffect, useState } from "react";
import { Eye, Pencil, Trash2, Plus, Search } from "lucide-react";

const API = "https://sedap-nnap.onrender.com/api/products";

const Foods = () => {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    category: "",
    price: "",
    image: "",
  });

  /* ================= GET ================= */
  const getFoods = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setFoods(Array.isArray(data) ? data : []);
    } catch {
      setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFoods();
  }, []);

  /* ================= DELETE ================= */
  const deleteFood = async (id) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    getFoods();
  };

  /* ================= ADD ================= */
  const openAdd = () => {
    setEditing(null);
    setForm({ title: "", category: "", price: "", image: "" });
    setModal(true);
  };

  /* ================= EDIT ================= */
  const openEdit = (food) => {
    setEditing(food);
    setForm({
      title: food?.title || "",
      category: food?.category || "",
      price: food?.price || "",
      image: food?.image || "",
    });
    setModal(true);
  };

  /* ================= SAVE ================= */
  const saveFood = async () => {
    if (!form.title || !form.category || !form.price) return;

    if (editing) {
      await fetch(`${API}/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          ...form,
          price: Number(form.price),
        }),
      });
    } else {
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
        }),
      });
    }

    setModal(false);
    getFoods();
  };

  /* ================= SEARCH ================= */
  const filteredFoods = foods.filter((f) =>
    `${f?.title ?? ""} ${f?.category ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="p-6">

      {/* Spinner */}
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span className="loading loading-spinner text-success w-12"></span>
        </div>
      )}

      {/* Content */}
      <div style={{ opacity: loading ? 0 : 1, transition: "opacity 0.4s ease" }}>

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-semibold text-base-content">
            Manage products
          </h1>

          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-base-content/60" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product..."
                className="input input-bordered pl-9"
              />
            </div>

            <button onClick={openAdd} className="btn btn-primary flex gap-2">
              <Plus size={18} /> New
            </button>
          </div>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 gap-y-28 mt-24">
          {filteredFoods.map((food) => (
            <div
              key={food.id}
              className="relative bg-base-100 rounded-2xl shadow px-6 pb-6 pt-20 flex flex-col items-center text-center hover:shadow-lg transition"
            >
              {/* IMAGE */}
              <div className="absolute -top-12">
                <img
                  src={food.image || "https://via.placeholder.com/150"}
                  alt={food.title}
                  className="w-28 h-28 rounded-full object-cover shadow bg-base-100"
                />
              </div>

              <h3 className="font-semibold text-base-content">{food.name}</h3>
              <p className="text-sm text-primary mb-1">{food.category}</p>
              <p className="text-primary font-bold mb-6">{food.price} som</p>

              <div className="flex gap-4 mt-auto">
                <button className="btn btn-ghost btn-sm text-primary">
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => openEdit(food)}
                  className="btn btn-ghost btn-sm text-warning"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => deleteFood(food.id)}
                  className="btn btn-ghost btn-sm text-error"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-base-100 p-6 rounded-xl w-96">
            <h2 className="font-semibold mb-4">
              {editing ? "Edit Product" : "Add Product"}
            </h2>

            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input input-bordered w-full mb-3"
            />
            <input
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input input-bordered w-full mb-3"
            />
            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="input input-bordered w-full mb-3"
            />
            <input
              placeholder="Image URL"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="input input-bordered w-full mb-4"
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setModal(false)} className="btn btn-ghost">
                Cancel
              </button>
              <button onClick={saveFood} className="btn btn-primary">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Foods;