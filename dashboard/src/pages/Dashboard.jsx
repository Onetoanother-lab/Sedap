import { useEffect, useState } from "react";
import Monthly from "../components/Monthly";
import Branch from "../components/Branch";
import StatCard from "../components/StatCard";

const API = import.meta.env.VITE_API_URL || "https://sedap-nnap.onrender.com/api";

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, canceled: 0, delivered: 0, income: 0 });

  useEffect(() => {
    fetch(`${API}/orderlist`)
      .then((res) => res.json())
      .then((orders) => {
        if (!Array.isArray(orders)) return;
        const total     = orders.length;
        const canceled  = orders.filter(o => o.status === "canceled").length;
        const delivered = orders.filter(o => o.status === "delivered").length;
        const income    = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        setStats({ total, canceled, delivered, income });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="pt-4">


      {/* Header */}
      <h1 className="text-2xl text-primary font-bold">Dashboard</h1>
      <p className="text-md font-semibold text-primary mb-10">
        Your order history will appear here.
      </p>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard title="Total Orders"   value={stats.total}     percent={0} />
        <StatCard title="Total Canceled"  value={stats.canceled}  percent={0} />
        <StatCard title="Total Delivered" value={stats.delivered} percent={0} />
        <StatCard title="Income Profit"   value={stats.income}    percent={0} />
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
