import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CircleAlert, Mail, Pencil, Ellipsis, Phone,
  Briefcase,
} from "lucide-react";
import { RiMastercardFill } from "react-icons/ri";

/* ─────────────────────────────────────────
   FIXED: Use DaisyUI CSS-variable tokens so colors
   update correctly when the theme changes.
───────────────────────────────────────── */
const BAR_COLORS = [
  "oklch(var(--in))",   // info    — blue
  "oklch(var(--su))",   // success — green
  "oklch(var(--wa))",   // warning — yellow
  "oklch(var(--er))",   // error   — red
];

const CHART_DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const API = import.meta.env.VITE_API_URL || "https://sedap-nnap.onrender.com/api";

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */
function CustomerDetailTable({ items }) {
  const [active, setActive] = useState("Monthly");
  return (
    <div>
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="font-bold text-base-content text-base">Most Ordered Food</h3>
          <p className="text-base-content/60 text-xs mt-0.5">Top items ordered by this customer</p>
        </div>
        <div className="flex gap-1 bg-base-200 rounded-full p-1">
          {["Monthly", "Weekly", "Daily"].map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                active === t ? "bg-base-100 text-base-content shadow-sm" : "text-base-content/60 hover:text-base-content"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 space-y-0 divide-y divide-gray-50">
        {items.length === 0 ? (
          <p className="text-base-content/40 text-sm text-center py-6">No orders found for this customer.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-3">
              <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-base-content text-sm font-semibold truncate">{item.name}</p>
                <p className="text-success text-[10px] font-bold tracking-wide mt-0.5">{item.category}</p>
                <p className="text-base-content/60 text-[10px] mt-1">{item.qty}x ordered</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-base-content font-bold text-sm">{item.price.toLocaleString()} UZS</span>
                <button className="text-base-content/60 hover:text-base-content">
                  <Ellipsis className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CustomerDetailChart({ chartData, legendData }) {
  const [active, setActive] = useState("Monthly");
  const maxH = 150;
  const totalOrdered = legendData.reduce((sum, l) => sum + l.value, 0);
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="font-bold text-base-content text-base">Most Liked Food</h3>
          <p className="text-base-content/60 text-xs mt-0.5">Order frequency by day of week</p>
        </div>
        <div className="flex gap-1 bg-base-200 rounded-full p-1">
          {["Monthly", "Weekly", "Daily"].map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                active === t ? "bg-base-100 text-base-content shadow-sm" : "text-base-content/60 hover:text-base-content"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end mb-2">
        <div className="bg-base-100 shadow-md rounded-xl px-3 py-1.5 text-right border border-base-200">
          <p className="text-base-content font-bold text-sm">{totalOrdered} Items Ordered</p>
          <p className="text-base-content/60 text-[10px]">{today}</p>
        </div>
      </div>

      <div className="flex items-end gap-1 px-2" style={{ height: `${maxH + 4}px` }}>
        {chartData.map((group, gi) => (
          <div key={gi} className="flex-1 flex items-end justify-center gap-0.5">
            {group.map((h, bi) => (
              <div
                key={bi}
                className="w-2.5 rounded-t-sm transition-all"
                /* FIXED: CSS variable tokens — theme-aware */
                style={{ height: `${Math.min(h, maxH)}px`, backgroundColor: BAR_COLORS[bi] }}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex mt-2 px-2">
        {CHART_DAYS.map((d) => (
          <div key={d} className="flex-1 text-center text-[9px] text-base-content/60 font-medium">{d}</div>
        ))}
      </div>

      <div className="border-t border-base-200 my-4" />

      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        {legendData.map(({ color, label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* FIXED: background set via inline style so it uses the CSS var */}
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-base-content/60 text-xs">{label}</span>
            </div>
            <span className="text-base-content font-bold text-sm">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
const CustomerDetail = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading]     = useState(true);
  const [customer, setCustomer]   = useState(null);
  const [topItems, setTopItems]   = useState([]);
  const [chartData, setChartData] = useState(Array(7).fill([0, 0, 0, 0]));
  const [legendData, setLegendData] = useState([]);
  const [editOpen, setEditOpen]   = useState(false);
  const [editForm, setEditForm]   = useState({});
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) { setLoading(false); return; }
    fetch(`${API}/customers/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCustomer(data);
        return fetch(`${API}/orderlist`)
          .then((res) => res.json())
          .then((orders) => {
            const customerOrders = orders.filter((o) => o.customerName === data.name);
            const itemMap = {};
            for (const order of customerOrders) {
              if (!Array.isArray(order.items)) continue;
              for (const item of order.items) {
                const key = item.id || item._id;
                if (!key) continue;
                if (!itemMap[key]) itemMap[key] = { ...item, qty: 0 };
                itemMap[key].qty += item.qty || 1;
              }
            }
            const sorted = Object.values(itemMap).sort((a, b) => b.qty - a.qty);
            const top5   = sorted.slice(0, 5);
            setTopItems(top5);

            const top4    = top5.slice(0, 4);
            const top4Ids = top4.map((it) => String(it.id || it._id));
            const newChartData = Array.from({ length: 7 }, () => [0, 0, 0, 0]);
            for (const order of customerOrders) {
              if (!order.createdAt || !Array.isArray(order.items)) continue;
              const day = new Date(order.createdAt).getDay();
              for (const item of order.items) {
                const key = String(item.id || item._id);
                const idx = top4Ids.indexOf(key);
                if (idx !== -1) newChartData[day][idx] += item.qty || 1;
              }
            }
            setChartData(newChartData);

            const total = top5.reduce((sum, it) => sum + it.qty, 0);
            setLegendData(
              top4.map((it, i) => {
                const pct  = total > 0 ? Math.round((it.qty / total) * 100) : 0;
                const name = (it.name || "Item").slice(0, 12);
                return { color: BAR_COLORS[i], label: `${name} (${pct}%)`, value: it.qty };
              })
            );
          });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [searchParams]);

  const openEdit = () => {
    setEditForm({
      name:     customer?.name     || "",
      email:    customer?.email    || "",
      phone:    customer?.phone    || "",
      company:  customer?.company  || "",
      jobTitle: customer?.jobTitle || "",
      location: customer?.location || "",
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!customer?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed to update customer");
      setCustomer(await res.json());
      setEditOpen(false);
    } catch {
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="">
      {loading && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span className="loading loading-spinner text-success w-12"></span>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0" style={{ opacity: loading ? 0 : 1, transition: "opacity 0.4s ease" }}>
        <main className="flex-1 p-8 overflow-auto">

          <div className="mb-6">
            <h1 className="text-base-content font-bold text-2xl">Customer Detail</h1>
            <p className="text-base-content/60 text-sm mt-0.5">Here your Customer Detail Profile</p>
          </div>

          {/* Top Row */}
          <div className="flex gap-5 items-stretch">

            {/* Profile Card */}
            <div className="flex-1 bg-base-100 rounded-2xl shadow-sm px-8 py-7 flex gap-6 items-center min-w-0">
              <div className="flex-shrink-0 w-28 h-36 rounded-2xl overflow-hidden bg-base-200">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(customer?.name || "Customer")}&size=200&background=e5e7eb&color=6b7280&bold=true`}
                  alt={customer?.name || "Customer"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base-content text-2xl font-bold leading-tight">{customer?.name || "—"}</h2>
                    <p className="text-success font-semibold text-sm mt-1">Customer</p>
                    <p className="text-base-content/60 text-xs mt-2 leading-relaxed">{customer?.location || "—"}</p>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button className="w-9 h-9 flex items-center justify-center rounded-full bg-success/10 hover:bg-green-100 transition-colors">
                      <CircleAlert className="w-4 h-4 text-success" />
                    </button>
                    <button onClick={openEdit} className="w-9 h-9 flex items-center justify-center rounded-full bg-base-200 hover:bg-base-300 transition-colors">
                      <Pencil className="w-4 h-4 text-base-content/60" />
                    </button>
                  </div>
                </div>
                <div className="border-t border-base-200 my-5" />
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-info/10">
                      <Mail className="w-3.5 h-3.5 text-info" />
                    </div>
                    <span className="text-base-content/60 text-xs font-medium">{customer?.email || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-success/10">
                      <Phone className="w-3.5 h-3.5 text-success" />
                    </div>
                    <span className="text-base-content/60 text-xs font-medium">{customer?.phone || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-error/10">
                      <Briefcase className="w-3.5 h-3.5 text-error" />
                    </div>
                    <span className="text-base-content/60 text-xs font-medium">
                      {customer?.company || "—"}{customer?.jobTitle ? ` · ${customer.jobTitle}` : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Balance Card */}
            <div className="w-72 flex-shrink-0 rounded-2xl overflow-hidden shadow-md flex flex-col">
              <div className="flex-1 px-6 pt-5 pb-5" style={{ background: "linear-gradient(160deg, oklch(var(--su)) 0%, oklch(var(--su) / 0.8) 100%)" }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/70 text-[10px] font-semibold tracking-widest uppercase">Your Balance</p>
                  <button className="text-white/60 hover:text-white"><Ellipsis className="w-5 h-5" /></button>
                </div>
                <h1 className="text-white text-4xl font-extrabold tracking-tight mt-1 mb-5">
                  $ {customer?.totalSpent != null ? customer.totalSpent.toLocaleString() : "—"}
                </h1>
                <div className="flex items-center justify-between">
                  <p className="text-white/80 font-mono text-xs tracking-widest">•••• •••• •••• ••••</p>
                  <p className="text-white/80 font-semibold text-xs">02/21</p>
                </div>
              </div>
              <div className="px-6 py-4 flex items-center justify-between" style={{ background: "oklch(var(--su) / 0.7)" }}>
                <div>
                  <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-0.5">Name</p>
                  <p className="text-white font-bold text-sm">{customer?.name || "—"}</p>
                </div>
                <RiMastercardFill className="w-10 h-10 text-white opacity-90" />
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex gap-5 mt-5">
            <div className="flex-1 bg-base-100 rounded-2xl shadow-sm p-6 min-w-0">
              <CustomerDetailTable items={topItems} />
            </div>
            <div className="flex-1 bg-base-100 rounded-2xl shadow-sm p-6 min-w-0">
              <CustomerDetailChart chartData={chartData} legendData={legendData} />
            </div>
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="font-bold text-lg mb-4">Edit Customer</h2>
            {[
              { key: "name",     label: "Name" },
              { key: "email",    label: "Email" },
              { key: "phone",    label: "Phone" },
              { key: "company",  label: "Company" },
              { key: "jobTitle", label: "Job Title" },
              { key: "location", label: "Location" },
            ].map(({ key, label }) => (
              <input
                key={key}
                placeholder={label}
                value={editForm[key] || ""}
                onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                className="input input-bordered w-full mb-3"
              />
            ))}
            <div className="flex justify-end gap-3 mt-2">
              <button onClick={() => setEditOpen(false)} className="btn btn-ghost">Cancel</button>
              <button onClick={saveEdit} disabled={saving} className="btn btn-primary">
                {saving ? <span className="loading loading-spinner loading-sm" /> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetail;