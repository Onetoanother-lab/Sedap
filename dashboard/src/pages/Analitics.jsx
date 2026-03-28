import React, { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "https://sedap-nnap.onrender.com/api";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const Analitics = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filter, setFilter]     = useState("Monthly");
  const [likes, setLikes]       = useState({});
  const [ratings, setRatings]   = useState({});

  // ── Must be BEFORE early returns — Rules of Hooks ──────────────────
  const now = useMemo(() => new Date(), []);

  // ANL-02 + ANL-03: real revenue data, responds to filter & orders
  const chartData = useMemo(() => {
    if (filter === "Weekly") {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return DAYS.map((d, i) => {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        return {
          name: d,
          value: orders
            .filter((o) => new Date(o.createdAt).toDateString() === day.toDateString())
            .reduce((sum, o) => sum + (o.total || 0), 0),
        };
      });
    }
    if (filter === "Daily") {
      return Array.from({ length: 24 }, (_, h) => ({
        name: `${h}:00`,
        value: orders
          .filter((o) => {
            const d = new Date(o.createdAt);
            return d.toDateString() === now.toDateString() && d.getHours() === h;
          })
          .reduce((sum, o) => sum + (o.total || 0), 0),
      }));
    }
    // Monthly — current year
    return MONTHS.map((m, i) => ({
      name: m,
      value: orders
        .filter((o) => {
          const d = new Date(o.createdAt);
          return d.getMonth() === i && d.getFullYear() === now.getFullYear();
        })
        .reduce((sum, o) => sum + (o.total || 0), 0),
    }));
  }, [filter, orders, now]);

  // ANL-04: dynamic date range label
  const dateRangeLabel = useMemo(() => {
    if (filter === "Daily") {
      return `Today, ${now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`;
    }
    if (filter === "Weekly") {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const fmt = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      return `${fmt(weekStart)} – ${fmt(weekEnd)}, ${now.getFullYear()}`;
    }
    return `Jan – Dec ${now.getFullYear()}`;
  }, [filter, now]);
  // ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsRes = await fetch(`${API}/products`);
        const ordersRes   = await fetch(`${API}/orderlist`);
        if (!productsRes.ok || !ordersRes.ok) throw new Error("Server error");
        setProducts(await productsRes.json());
        setOrders(await ordersRes.json());
        setError(null);
      } catch (error) {
        setError(error.message || "Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
        <span className="loading loading-spinner text-success w-12"></span>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-error font-medium">{error}</p>
      </div>
    );

  const filteredOrders = orders.filter((o) => {
    const date = new Date(o.createdAt);
    if (filter === "Daily") return date.toDateString() === now.toDateString();
    if (filter === "Weekly") {
      const s = new Date(now);
      s.setDate(now.getDate() - now.getDay());
      const e = new Date(s);
      e.setDate(s.getDate() + 6);
      return date >= s && date <= e;
    }
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const totalRevenue = filteredOrders.reduce((a, o) => a + (o.total || 0), 0);

  const productStats = {};
  filteredOrders.forEach((o) => {
    (o.items || []).forEach((item) => {
      productStats[item.id] = (productStats[item.id] || 0) + (item.qty || 1);
    });
  });

  const mostSelling = Object.entries(productStats)
    .map(([id, qty]) => {
      const p = products.find((x) => String(x.id) === String(id));
      return p ? { ...p, qty } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.qty - a.qty);

  return (
    <div className="space-y-6 text-base-content">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-base-content/50 mt-1">
            Your restaurant summary with graph view
          </p>
        </div>
        <div className="flex items-center gap-2 border rounded-xl px-4 py-2 bg-base-100 shadow cursor-pointer">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="text-sm text-base-content/60">{dateRangeLabel}</span>
        </div>
      </div>

      {/* CHART + MOST SELLING */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-base-100 rounded-2xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Chart Orders</h2>
            <div className="flex gap-2 text-sm">
              {["Monthly", "Weekly", "Daily"].map((opt) => (
                <span
                  key={opt}
                  onClick={() => setFilter(opt)}
                  className={`px-3 py-1 rounded-full cursor-pointer ${
                    filter === opt
                      ? "bg-primary/20 text-primary"
                      : "text-base-content/40"
                  }`}
                >
                  {opt}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-6 mb-4">
            <div>
              <p className="text-base-content/50 text-sm">Total Sales</p>
              <p className="text-success font-bold text-xl">
                {totalRevenue.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-base-content/50 text-sm">Avg. Sales per day</p>
              <p className="text-success font-bold text-xl">
                {Math.round(
                  totalRevenue /
                    (filter === "Daily" ? 1 : filter === "Weekly" ? 7 : 30)
                ).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="oklch(var(--su))"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-base-100 rounded-2xl shadow p-6">
          <div className="flex justify-between mb-4">
            <h2 className="font-semibold text-lg">Most Selling Items</h2>
          </div>

          {mostSelling.length === 0 ? (
            <p className="text-base-content/40 text-sm text-center py-12">
              No orders found for this period
            </p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {mostSelling.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div className="flex gap-3">
                    <img
                      src={item.image}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-base-content/40">
                        Serves for {item.serves || 1} Person | {item.time || 24} mins
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold">
                    {item.price?.toLocaleString()} UZS
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TRENDING + REVENUE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-base-100 rounded-2xl shadow p-6">
          <div className="flex justify-between mb-4">
            <h2 className="font-semibold text-lg">Trending Items</h2>
            <span className="text-sm text-primary cursor-pointer">
              Weekly ⌄
            </span>
          </div>

          {mostSelling.length === 0 ? (
            <p className="text-base-content/40 text-sm text-center py-12">
              No orders found for this period
            </p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {mostSelling.map((item, i) => (
                <div key={item.id} className="flex justify-between">
                  <div className="flex gap-4">
                    <span className="text-base-content/40 font-semibold">
                      #{i + 1}
                    </span>
                    <img
                      src={item.image}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-base-content/40">
                        {item.category || "FOOD"}
                      </p>
                    </div>
                  </div>
                  {i % 2 === 0 ? (
                    <TrendingUp className="text-success w-5 h-5" />
                  ) : (
                    <TrendingDown className="text-error w-5 h-5" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-base-100 rounded-2xl shadow p-6">
          <h2 className="font-semibold text-lg mb-4">Revenue</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="oklch(var(--p))"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* MOST FAVOURITE */}
      <div className="bg-base-100 rounded-2xl shadow p-6 mt-6">
        <h2 className="text-xl font-semibold mb-6">Most Favourite Items</h2>

        {mostSelling.length === 0 ? (
          <p className="text-base-content/40 text-sm text-center py-8">
            No orders found for this period
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mostSelling.slice(0, 6).map((item) => {
              const like = likes[item.id] ?? 0;
              const rate = ratings[item.id] ?? 0;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl overflow-hidden border border-base-300 hover:shadow-lg transition"
                >
                  <img
                    src={item.image}
                    className="h-40 w-full object-cover"
                  />
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    <p className="text-xs text-base-content/40 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-1 text-sm">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span
                          key={s}
                          onClick={() =>
                            setRatings((p) => ({ ...p, [item.id]: s }))
                          }
                          className={`cursor-pointer ${
                            s <= rate ? "text-warning" : "text-base-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-base-content/40 ml-2">
                        {rate ? `${rate} / 5` : "Rate this"}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setLikes((p) => ({
                          ...p,
                          [item.id]: (p[item.id] || 0) + 1,
                        }))
                      }
                      className="mt-3 flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm"
                    >
                      💙 {like} Like it
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-right mt-4 text-primary text-sm cursor-pointer">
          View more ⌄
        </div>
      </div>
    </div>
  );
};

export default Analitics;
