import React, { useEffect, useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "https://sedap-nnap.onrender.com/api";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Plain hex values — oklch(var(--*)) tokens cannot be resolved by SVG renderers
// or Canvas 2D (same fix already applied in Branch.jsx and Monthly.jsx).
const COLOR_SUCCESS = "#34d399"; // ≈ DaisyUI --su
const COLOR_PRIMARY = "#60a5fa"; // ≈ DaisyUI --p

// Shared Recharts style props — keeps all four charts consistent and avoids
// repeating the same dark-mode-safe values in every JSX block.
const GRID_PROPS = {
  strokeDasharray: "3 3",
  stroke: "#94a3b8",   // slate-400 — visible in both light and dark mode
  strokeOpacity: 0.3,
};

const AXIS_PROPS = {
  tick:   { fill: "#94a3b8", fontSize: 11 },
  axisLine:  { stroke: "#94a3b8", strokeOpacity: 0.3 },
  tickLine:  { stroke: "#94a3b8", strokeOpacity: 0.3 },
};

const Analitics = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders]     = useState([]);
  // FIX 7: replace full-screen fixed spinner with inline skeleton —
  // the fixed overlay blocked the entire app (sidebar, navbar, other routes)
  // while Analytics was loading.
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filter, setFilter]     = useState("Monthly");
  // FIX 4: persist likes and ratings in localStorage so they survive navigation.
  // Previously both were plain useState({}) and reset to zero on every unmount.
  const [likes, setLikes] = useState(() => {
    try { return JSON.parse(localStorage.getItem("analytics_likes") || "{}"); }
    catch { return {}; }
  });
  const [ratings, setRatings] = useState(() => {
    try { return JSON.parse(localStorage.getItem("analytics_ratings") || "{}"); }
    catch { return {}; }
  });

  const now = useMemo(() => new Date(), []);

  // ── Chart data — now produces both "orders" and "revenue" keys ──────────────
  // FIX 6: previously chartData only carried a single "value" key (order count)
  // which meant both the Chart Orders and Revenue charts rendered identical lines.
  // Now each data point carries "orders" (count) and "revenue" (sum of totals).
  const chartData = useMemo(() => {
    if (filter === "Weekly") {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return DAYS.map((d, i) => {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        const dayOrders = orders.filter(
          (o) => new Date(o.createdAt).toDateString() === day.toDateString()
        );
        return {
          name: d,
          orders: dayOrders.length,
          revenue: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        };
      });
    }
    if (filter === "Daily") {
      return Array.from({ length: 24 }, (_, h) => {
        const hourOrders = orders.filter((o) => {
          const d = new Date(o.createdAt);
          return d.toDateString() === now.toDateString() && d.getHours() === h;
        });
        return {
          name: `${h}:00`,
          orders: hourOrders.length,
          revenue: hourOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        };
      });
    }
    // Monthly
    return MONTHS.map((m, i) => {
      const monthOrders = orders.filter((o) => {
        const d = new Date(o.createdAt);
        return d.getMonth() === i && d.getFullYear() === now.getFullYear();
      });
      return {
        name: m,
        orders: monthOrders.length,
        revenue: monthOrders.reduce((sum, o) => sum + (o.total || 0), 0),
      };
    });
  }, [filter, orders, now]);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          fetch(`${API}/products`),
          fetch(`${API}/orderlist`),
        ]);
        if (!productsRes.ok || !ordersRes.ok) throw new Error("Server error");
        setProducts(await productsRes.json());
        setOrders(await ordersRes.json());
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // FIX 4 (cont.): write through to localStorage on every change
  useEffect(() => {
    localStorage.setItem("analytics_likes", JSON.stringify(likes));
  }, [likes]);

  useEffect(() => {
    localStorage.setItem("analytics_ratings", JSON.stringify(ratings));
  }, [ratings]);

  // FIX 7 (cont.): inline loader — sidebar and navbar remain usable
  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner text-success w-12"></span>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-error font-medium">{error}</p>
      </div>
    );

  // ── Current period orders ───────────────────────────────────────────────────
  const filteredOrders = orders.filter((o) => {
    const date = new Date(o.createdAt);
    if (filter === "Daily") return date.toDateString() === now.toDateString();
    if (filter === "Weekly") {
      const s = new Date(now); s.setDate(now.getDate() - now.getDay());
      const e = new Date(s);   e.setDate(s.getDate() + 6);
      return date >= s && date <= e;
    }
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  // ── Previous period orders ──────────────────────────────────────────────────
  const prevOrders = orders.filter((o) => {
    const date = new Date(o.createdAt);
    if (filter === "Daily") {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return date.toDateString() === yesterday.toDateString();
    }
    if (filter === "Weekly") {
      const s = new Date(now); s.setDate(now.getDate() - now.getDay() - 7);
      const e = new Date(s);   e.setDate(s.getDate() + 6);
      return date >= s && date <= e;
    }
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const prevYear  = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
  });

  const totalRevenue = filteredOrders.reduce((a, o) => a + (o.total || 0), 0);

  // FIX 1: compute the correct denominator for "avg sales per day".
  // The old code hard-coded 30 for all three filter modes:
  //   • Daily   → should be 1 (one day)
  //   • Weekly  → should be 7 (seven days)
  //   • Monthly → should be days elapsed so far this month (not always 30)
  const avgDivisor = (() => {
    if (filter === "Daily")  return 1;
    if (filter === "Weekly") return 7;
    return Math.max(now.getDate(), 1); // days elapsed this month, min 1
  })();

  // ── Aggregate item quantities per product ────────────────────────────────────
  const buildProductStats = (orderSet) => {
    const stats = {};
    orderSet.forEach((o) => {
      (o.items || []).forEach((item) => {
        const key = item.id || item._id;
        if (!key) return;
        stats[key] = (stats[key] || 0) + (item.qty || 1);
      });
    });
    return stats;
  };

  const currentStats = buildProductStats(filteredOrders);
  const prevStats    = buildProductStats(prevOrders);

  const mostSelling = Object.entries(currentStats)
    .map(([id, qty]) => {
      const p       = products.find((x) => String(x.id) === String(id));
      const prevQty = prevStats[id] || 0;
      return p ? { ...p, qty, trending: qty >= prevQty } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.qty - a.qty);

  return (
    <div className="space-y-6 text-base-content">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-base-content/50 mt-1">Your restaurant summary with graph view</p>
        </div>
        <div className="flex items-center gap-2 border rounded-xl px-4 py-2 bg-base-100 shadow cursor-pointer">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="text-sm text-base-content/60">{dateRangeLabel}</span>
        </div>
      </div>

      {/* CHART ORDERS + MOST SELLING */}
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
                    filter === opt ? "bg-primary/20 text-primary" : "text-base-content/40"
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
              <p className="text-success font-bold text-xl">{totalRevenue.toLocaleString()}</p>
            </div>
            <div>
              {/* FIX 1 applied here */}
              <p className="text-base-content/50 text-sm">Avg. Sales per day</p>
              <p className="text-success font-bold text-xl">
                {Math.round(totalRevenue / avgDivisor).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="name" {...AXIS_PROPS} />
                <YAxis {...AXIS_PROPS} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-background-primary, #fff)",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                {/* stroke is a plain hex — oklch(var(--su)) is not resolved by SVG */}
                <Line
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke={COLOR_SUCCESS}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: COLOR_SUCCESS, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
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
            <p className="text-base-content/40 text-sm text-center py-12">No orders found for this period</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {mostSelling.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div className="flex gap-3">
                    <img src={item.image} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-base-content/40">
                        Serves for {item.serves || 1} Person | {item.time || 24} mins
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold">{item.price?.toLocaleString()} UZS</span>
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
            {/* FIX 3: removed the "⌄" chevron — it implied a clickable period
                picker but was purely decorative. Plain text label is honest. */}
            <span className="text-sm text-base-content/50 capitalize">{filter}</span>
          </div>

          {mostSelling.length === 0 ? (
            <p className="text-base-content/40 text-sm text-center py-12">No orders found for this period</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {mostSelling.map((item, i) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <span className="text-base-content/40 font-semibold w-6">#{i + 1}</span>
                    <img src={item.image} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-base-content/40">{item.category || "FOOD"}</p>
                      <p className="text-xs text-base-content/30 mt-0.5">
                        {item.qty} sold
                        {prevStats[item.id] != null
                          ? ` (prev: ${prevStats[item.id]})`
                          : " (new)"}
                      </p>
                    </div>
                  </div>
                  {item.trending
                    ? <TrendingUp  className="text-success w-5 h-5 flex-shrink-0" />
                    : <TrendingDown className="text-error   w-5 h-5 flex-shrink-0" />
                  }
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
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="name" {...AXIS_PROPS} />
                {/* width=64 + tickFormatter prevent large UZS numbers overflowing */}
                <YAxis
                  {...AXIS_PROPS}
                  width={64}
                  tickFormatter={(v) =>
                    v >= 1_000_000
                      ? `${(v / 1_000_000).toFixed(1)}M`
                      : v >= 1_000
                      ? `${(v / 1_000).toFixed(0)}k`
                      : String(v)
                  }
                />
                <Tooltip
                  formatter={(v) => [`${v.toLocaleString()} UZS`, "Revenue"]}
                  contentStyle={{
                    background: "var(--color-background-primary, #fff)",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                {/* stroke is a plain hex — oklch(var(--p)) is not resolved by SVG */}
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue (UZS)"
                  stroke={COLOR_PRIMARY}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: COLOR_PRIMARY, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
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
          <p className="text-base-content/40 text-sm text-center py-8">No orders found for this period</p>
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

                    {/* FIX 5: star row always renders all 5 stars visually;
                        filled count matches the stored rating exactly.
                        The text label now only appears after rating is set,
                        so "Rate this" and "1 / 5" are never shown simultaneously. */}
                    <div className="flex items-center gap-1 text-sm">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span
                          key={s}
                          onClick={() => setRatings((p) => ({ ...p, [item.id]: s }))}
                          className={`cursor-pointer select-none ${s <= rate ? "text-warning" : "text-base-300"}`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-base-content/40 ml-2 text-xs">
                        {rate > 0 ? `${rate} / 5` : "Rate this"}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        setLikes((p) => ({ ...p, [item.id]: (p[item.id] || 0) + 1 }))
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

        {/* FIX 2: "View more" is now only rendered when hidden items exist,
            and clicking it actually expands/collapses them in-place.
            Previously the div always rendered and clicking did nothing. */}
        {mostSelling.length > 6 && (
          <ExpandableViewMore items={mostSelling.slice(6)} />
        )}
      </div>
    </div>
  );
};

// FIX 2 (extracted component): shows/hides the overflow items on demand
function ExpandableViewMore({ items }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl overflow-hidden border border-base-300 hover:shadow-lg transition">
              <img src={item.image} className="h-40 w-full object-cover" />
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-sm">{item.name}</h3>
                <p className="text-xs text-base-content/40 line-clamp-2">{item.description}</p>
                <span className="font-semibold text-sm">{item.price?.toLocaleString()} UZS</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <div
        className="text-right mt-4 text-primary text-sm cursor-pointer hover:underline"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Show less ▲" : `View ${items.length} more ▼`}
      </div>
    </>
  );
}

export default Analitics;