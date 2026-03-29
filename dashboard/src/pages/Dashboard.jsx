import { useEffect, useState } from "react";
import Monthly from "../components/Monthly";
import Branch from "../components/Branch";
import StatCard from "../components/StatCard";

const API = import.meta.env.VITE_API_URL || "https://sedap-nnap.onrender.com/api";

/**
 * Compare a metric this month vs last month.
 * Returns percent change rounded to 1 decimal, or 0 if no prior data.
 */
function calcPercent(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

const Dashboard = () => {
  const [stats, setStats] = useState({
    // FIX: values now reflect the *current month* so they match the trend %.
    // Previously, card values were all-time totals while the % compared
    // only the current month to the previous month — actively misleading.
    thisTotal: 0, thisCanceled: 0, thisDelivered: 0, thisIncome: 0,
    totalPct: 0, canceledPct: 0, deliveredPct: 0, incomePct: 0,
  });

  useEffect(() => {
    fetch(`${API}/orderlist`)
      .then((res) => res.json())
      .then((orders) => {
        if (!Array.isArray(orders)) return;

        const now       = new Date();
        const thisMonth = now.getMonth();
        const thisYear  = now.getFullYear();

        const lastMonthDate = new Date(thisYear, thisMonth - 1, 1);
        const lastMonth     = lastMonthDate.getMonth();
        const lastYear      = lastMonthDate.getFullYear();

        const inThis = (order) => {
          const d = new Date(order.createdAt);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        };
        const inLast = (order) => {
          const d = new Date(order.createdAt);
          return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
        };

        // ── This month ──
        const thisOrders    = orders.filter(inThis);
        const thisTotal     = thisOrders.length;
        const thisCanceled  = thisOrders.filter((o) => o.status === "canceled").length;
        const thisDelivered = thisOrders.filter((o) => o.status === "delivered").length;
        const thisIncome    = thisOrders.reduce((s, o) => s + (o.total || 0), 0);

        // ── Last month ──
        const lastOrders    = orders.filter(inLast);
        const lastTotal     = lastOrders.length;
        const lastCanceled  = lastOrders.filter((o) => o.status === "canceled").length;
        const lastDelivered = lastOrders.filter((o) => o.status === "delivered").length;
        const lastIncome    = lastOrders.reduce((s, o) => s + (o.total || 0), 0);

        setStats({
          thisTotal,
          thisCanceled,
          thisDelivered,
          thisIncome,
          totalPct:     calcPercent(thisTotal,     lastTotal),
          canceledPct:  calcPercent(thisCanceled,  lastCanceled),
          deliveredPct: calcPercent(thisDelivered, lastDelivered),
          incomePct:    calcPercent(thisIncome,     lastIncome),
        });
      })
      .catch(() => {});
  }, []);

  const monthLabel = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="pt-4">
      <h1 className="text-2xl text-primary font-bold">Dashboard</h1>
      {/* FIX: subtitle now states the scope so users know these are monthly figures */}
      <p className="text-md font-semibold text-primary mb-10">
        {monthLabel} — month-to-date summary
      </p>

      {/* Stat Cards
          FIX: values and trend % now refer to the same period (this month).
          FIX: unit prop is only passed to the income card — count cards get no unit. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard title="Orders This Month"    value={stats.thisTotal}     percent={stats.totalPct} />
        <StatCard title="Canceled This Month"  value={stats.thisCanceled}  percent={stats.canceledPct} />
        <StatCard title="Delivered This Month" value={stats.thisDelivered} percent={stats.deliveredPct} />
        <StatCard title="Income This Month"    value={stats.thisIncome}    percent={stats.incomePct} unit="UZS" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Monthly />
        </div>
        <Branch />
      </div>
    </div>
  );
};

export default Dashboard;