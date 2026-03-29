import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { ToastContainer, toast } from "react-toastify";

const API = import.meta.env.VITE_API_URL || "https://sedap-nnap.onrender.com/api";

const FoodsDetail = () => {
  const { id } = useParams();
  const [product, setProduct]     = useState(null);
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [apiError, setApiError]   = useState(null);   // FIXED: surfaces real errors
  const [filter, setFilter]       = useState("Monthly");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  const [formData, setFormData] = useState({
    name: "", description: "", price: "", discount: "", category: "", image: "",
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [productRes, ordersRes] = await Promise.all([
        fetch(`${API}/products/${id}`),
        fetch(`${API}/orderlist`),
      ]);

      if (!productRes.ok) throw new Error(`Product not found (${productRes.status})`);
      if (!ordersRes.ok)  throw new Error(`Could not load orders (${ordersRes.status})`);

      const productData = await productRes.json();
      const ordersData  = await ordersRes.json();

      setProduct(productData);

      // Build monthly revenue chart from real orders only
      const productOrders = ordersData.filter(
        (o) => (o.items || []).some((item) => item.id === productData.id)
      );

      const monthlyMap = {};
      productOrders.forEach((order) => {
        const date  = new Date(order.createdAt);
        const month = date.toLocaleString("en", { month: "short" });
        if (!monthlyMap[month]) monthlyMap[month] = { name: month, value: 0 };
        const rev = (order.items || [])
          .filter((item) => item.id === productData.id)
          .reduce((s, item) => s + (item.price * (item.qty || 1)), 0);
        monthlyMap[month].value += rev;
      });

      const allMonths  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const filledData = allMonths.map((m) => monthlyMap[m] || { name: m, value: 0 });
      setOrders(filledData);
    } catch (err) {
      // FIXED: show real error, no silent mock data
      setApiError(err.message || "Failed to load product data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenu = () => {
    setModalMode("add");
    setFormData({ name: "", description: "", price: "", discount: "", category: "", image: "" });
    setShowModal(true);
  };

  const handleEditMenu = () => {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      price:    parseFloat(formData.price)    || 0,
      discount: (parseFloat(formData.discount) || 0) / 100,
    };
    try {
      let response;
      if (modalMode === "add") {
        response = await fetch(`${API}/products`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(submitData),
        });
        if (response.ok) toast.success("Menu muvaffaqiyatli qo'shildi!");
      } else {
        response = await fetch(`${API}/products/${product.id}`, {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ ...product, ...submitData }),
        });
        if (response.ok) toast.success("Menu muvaffaqiyatli yangilandi!");
      }
      if (response?.ok) { setShowModal(false); fetchData(); }
    } catch (error) {
      toast.error("Amaliyot muvaffaqiyatsiz. Serverni tekshiring.");
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("uz-UZ", { style: "currency", currency: "UZS", minimumFractionDigits: 0 }).format(price);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-base-100 p-3 rounded-lg shadow-lg border border-base-300 min-w-[140px]">
          <p className="font-semibold text-success">{formatPrice(payload[0].value)}</p>
          <p className="text-sm text-base-content/60">{payload[0].payload.name}</p>
        </div>
      );
    }
    return null;
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="loading loading-spinner text-success w-12"></span>
      </div>
    );
  }

  // ── FIXED: Real error state instead of silent mock fallback ────────────────
  if (apiError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4">
        <div className="text-error text-5xl">⚠️</div>
        <h2 className="text-xl font-bold text-base-content">Failed to load product</h2>
        <p className="text-base-content/60 text-sm text-center max-w-sm">{apiError}</p>
        <button onClick={fetchData} className="btn btn-primary mt-2">Retry</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-base-content/60 text-lg">Mahsulot topilmadi</p>
      </div>
    );
  }

  const discountedPrice = product.price * (1 - product.discount);
  const totalRevenue    = orders.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <div className="min-h-screen bg-base-200 p-4 sm:p-6 text-base-content">
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-base-content">Taomlar</h1>
          <p className="text-base-content/60 mt-1">Menyular umumiy holati va daromad grafigi</p>
        </div>
        <button
          onClick={handleAddMenu}
          className="bg-primary hover:bg-primary-focus text-primary-content px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Yangi menu
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — product info */}
        <div className="bg-base-100 rounded-2xl p-5 sm:p-6 shadow-sm border border-base-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h2 className="text-xl font-semibold">Menu haqida</h2>
            <div className="text-sm">
              <span className="text-base-content/60">Kategoriya: </span>
              <span className="text-primary font-medium">{product.category}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 mb-8">
            <img
              src={product.image}
              alt={product.name}
              className="w-full sm:w-56 h-56 object-cover rounded-xl shadow-md"
              onError={(e) => (e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product?.name || "Food")}&size=300&background=e5e7eb&color=6b7280&bold=true`)}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-primary font-medium">Omborda mavjud</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">{product.name}</h3>
              <p className="text-base-content/70 mb-6 leading-relaxed">{product.description}</p>

              <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                <div>
                  <p className="text-sm text-base-content/60">Asl narx</p>
                  <p className="text-lg line-through text-base-content/40">{formatPrice(product.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-base-content/60">Chegirmali</p>
                  <p className="text-2xl font-bold text-primary">{formatPrice(discountedPrice)}</p>
                </div>
                <div>
                  <p className="text-sm text-base-content/60">Chegirma</p>
                  <p className="text-xl font-semibold text-warning">{Math.round(product.discount * 100)}%</p>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                <button onClick={handleAddMenu} className="bg-primary hover:bg-primary-focus text-primary-content px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Qo'shish
                </button>
                <button onClick={handleEditMenu} className="bg-base-200 hover:bg-base-300 px-5 py-2.5 rounded-lg font-medium transition-colors">
                  Tahrirlash
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-base-300 pt-6">
            <h4 className="font-semibold text-lg mb-3">Tarkibi</h4>
            <p className="text-base-content/70 mb-6">{product.ingredients || "—"}</p>
            <h4 className="font-semibold text-lg mb-3">Oziqlanish qiymati (taxminiy)</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Kaloriya", value: product.nutrition?.kcal    ? `${product.nutrition.kcal} kcal` : "—" },
                { label: "Oqsil",    value: product.nutrition?.protein ? `${product.nutrition.protein}g`  : "—" },
                { label: "Yog'",     value: product.nutrition?.fat     ? `${product.nutrition.fat}g`      : "—" },
                { label: "Uglevod",  value: product.nutrition?.carbs   ? `${product.nutrition.carbs}g`    : "—" },
              ].map((item) => (
                <div key={item.label} className="bg-base-200 p-3 rounded-lg text-center">
                  <p className="text-sm text-base-content/60">{item.label}</p>
                  <p className="font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — revenue chart (real data only) */}
        <div className="bg-base-100 rounded-2xl p-5 sm:p-6 shadow-sm border border-base-300">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Daromad grafigi</h2>
              <p className="text-sm text-base-content/60">Buyurtmalardan tushgan summa ({filter})</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary mt-2">
                {totalRevenue.toLocaleString()} so'm
              </p>
              {totalRevenue === 0 && (
                <p className="text-xs text-base-content/40 mt-1">No orders recorded for this product yet.</p>
              )}
            </div>
            <div className="flex gap-2 bg-base-200 p-1 rounded-lg">
              {["Monthly", "Weekly", "Daily"].map((range) => (
                <span
                  key={range}
                  onClick={() => setFilter(range)}
                  className={`px-3 py-1 rounded-full cursor-pointer ${
                    filter === range ? "bg-primary/20 text-primary font-medium" : "text-base-content/40 hover:bg-base-300"
                  }`}
                >
                  {range}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-6 mb-6 text-sm">
            <div>
              <p className="text-base-content/60">Jami savdo</p>
              <p className="font-bold text-primary">{totalRevenue.toLocaleString()} so'm</p>
            </div>
            <div>
              <p className="text-base-content/60">Kunlik o'rtacha</p>
              <p className="font-bold text-primary">
                {Math.round(totalRevenue / (filter === "Daily" ? 1 : filter === "Weekly" ? 7 : 30)).toLocaleString()} so'm
              </p>
            </div>
          </div>

          <div style={{ width: "100%", height: "480px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={orders} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid stroke="hsl(var(--bc) / 0.1)" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="hsl(var(--bc) / 0.5)" fontSize={12} />
                <YAxis stroke="hsl(var(--bc) / 0.5)" fontSize={12} tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Daromad (so'm)"
                  stroke="oklch(var(--su))"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-base-100/90 backdrop-blur-md rounded-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-base-300 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">{modalMode === "add" ? "Yangi menu qo'shish" : "Menu tahrirlash"}</h3>
              <button onClick={() => setShowModal(false)} className="text-3xl text-base-content/50 hover:text-base-content">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { label: "Nomi",          name: "name",     type: "text"   },
                { label: "Narxi (so'm)", name: "price",    type: "number" },
                { label: "Chegirma (%)", name: "discount", type: "number" },
                { label: "Kategoriya",   name: "category", type: "text"   },
                { label: "Rasm URL",     name: "image",    type: "text"   },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium mb-1">{field.label}</label>
                  <input type={field.type} name={field.name} value={formData[field.name]} onChange={handleInputChange}
                    className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1">Tavsif</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3}
                  className="textarea textarea-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Bekor qilish</button>
                <button type="submit" className="btn btn-primary">{modalMode === "add" ? "Qo'shish" : "Saqlash"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodsDetail;