import React, { useEffect, useState } from "react";
import { Eye, Pencil, Trash2, Plus, Search } from "lucide-react";

const API = "https://sedap-nnap.onrender.com/api/products";

const Foods = () => {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

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
    } catch (e) {
      setFoods([]);
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
    <div className="bg-gray-100 min-h-screen p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-gray-700">
            Manage products
          </h1>
        </div>

        <div className="flex gap-3">
          <div className="relative text-base-100">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4  text-gray-700" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product..."
              className="pl-9 pr-4 py-2 border rounded-lg"
            />
          </div>

          <button
            onClick={openAdd}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> New
          </button>
        </div>
      </div>

      {/* ================= CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12 gap-y-28 mt-24">
        {filteredFoods.map((food) => (
          <div
            key={food.id}
            className="relative bg-white rounded-2xl shadow-md px-6 pb-6 pt-20 flex flex-col items-center text-center hover:shadow-lg transition"
          >
            {/* IMAGE */}
            <div className="absolute -top-12">
              <img
                src={food.image || "https://via.placeholder.com/150"}
                alt={food.title}
                className="w-28 h-28 rounded-full object-cover shadow-md bg-white"
              />
            </div>

            {/* TITLE */}
            <h3 className="font-semibold text-gray-800 leading-tight">
              {food.name}
            </h3>

            {/* CATEGORY */}
            <p className="text-sm text-emerald-500 mb-1">{food.category}</p>

            {/* PRICE */}
            <p className="text-emerald-600 font-bold mb-6">${food.price}</p>

            {/* ACTIONS */}
            <div className="flex gap-4 mt-auto">
              <button className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                <Eye size={18} />
              </button>

              <button
                onClick={() => openEdit(food)}
                className="bg-orange-100 text-orange-500 p-2 rounded-lg"
              >
                <Pencil size={18} />
              </button>

              <button
                onClick={() => deleteFood(food.id)}
                className="bg-red-100 text-red-500 p-2 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL ================= */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96 text-base-100">
            <h2 className="font-semibold mb-4">
              {editing ? "Edit Product" : "Add Product"}
            </h2>

            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border p-2 rounded mb-3"
            />

            <input
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border p-2 rounded mb-3"
            />

            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border p-2 rounded mb-3"
            />

            <input
              placeholder="Image URL"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full border p-2 rounded mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModal(false)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveFood}
                className="bg-emerald-500 text-white px-4 py-2 rounded"
              >
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
