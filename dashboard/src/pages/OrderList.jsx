import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  MoreHorizontal,
  CheckCircle,
  XCircle,
} from "lucide-react";

const STATUS_OPTIONS = ["All Status", "new", "on_delivery", "delivered", "canceled"];
const DATE_OPTIONS   = ["All Time", "Today", "This Week", "This Month"];

const STATUS_LABELS = {
  new: "New Order",
  on_delivery: "On Delivery",
  delivered: "Delivered",
  canceled: "Canceled",
};

const API = import.meta.env.VITE_API_URL || "https://sedap-nnap.onrender.com/api";

export default function OrderList() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [statusOpen, setStatusOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API}/orderlist`);
        const data = await response.json();

        const transformed = (Array.isArray(data) ? data : []).map((order) => ({
          id: `#${order.id || order._id}`,
          date: order.createdAt
            ? new Date(order.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—",
          customer: order.customerName || "—",
          location: order.address || "—",
          amount: `${(order.total || 0).toLocaleString()} UZS`,
          status: order.status || "new",
          rawDate: order.createdAt || null,
        }));

        setOrders(transformed);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "new":        return "bg-warning/20 text-warning";
      case "on_delivery": return "bg-info/20 text-info";
      case "delivered":  return "bg-success/20 text-success";
      case "canceled":   return "bg-error/20 text-error";
      default:           return "bg-base-200 text-base-content";
    }
  };

  const handleAcceptOrder = async (id) => {
    const rawId = id.replace(/^#/, "");
    try {
      await fetch(`${API}/orderlist/${rawId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "on_delivery" }),
      });
      setOrders((prev) =>
        prev.map((o) => o.id === id ? { ...o, status: "on_delivery" } : o)
      );
    } catch {
      alert("Failed to update order status");
    }
    setSelectedOrder(null);
  };

  const handleRejectOrder = async (id) => {
    const rawId = id.replace(/^#/, "");
    try {
      await fetch(`${API}/orderlist/${rawId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "canceled" }),
      });
      setOrders((prev) =>
        prev.map((o) => o.id === id ? { ...o, status: "canceled" } : o)
      );
    } catch {
      alert("Failed to update order status");
    }
    setSelectedOrder(null);
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "All Status" && o.status !== statusFilter) return false;
    if (dateFilter !== "All Time") {
      const now = new Date();
      const orderDate = new Date(o.rawDate);
      if (dateFilter === "Today") {
        if (orderDate.toDateString() !== now.toDateString()) return false;
      } else if (dateFilter === "This Week") {
        const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
        if (orderDate < weekAgo) return false;
      } else if (dateFilter === "This Month") {
        if (orderDate.getMonth() !== now.getMonth() || orderDate.getFullYear() !== now.getFullYear()) return false;
      }
    }
    return true;
  });

  if (loading) {
    return (
     <div className="flex items-center justify-center h-[60vh]">
      <span className="loading loading-spinner text-success w-12"></span>
    </div>
    );
  }

  return (
      <div className="">
        <div className="flex justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-base-content">
              Your Orders
            </h1>
            <p className="text-sm text-base-content/60">
              Live data ({filteredOrders.length})
            </p>
          </div>

          <div className="flex gap-4">
            {/* Status filter */}
            <div className="relative">
              <button
                onClick={() => { setStatusOpen((v) => !v); setDateOpen(false); }}
                className="btn btn-outline btn-sm"
              >
                {statusFilter === "All Status" ? "All Status" : STATUS_LABELS[statusFilter] || statusFilter}
                <ChevronDown size={16} />
              </button>
              {statusOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-base-100 border border-base-300 rounded-lg shadow z-20">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setStatusFilter(s); setStatusOpen(false); }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-base-200 ${statusFilter === s ? "font-semibold text-primary" : ""}`}
                    >
                      {s === "All Status" ? "All Status" : STATUS_LABELS[s] || s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date filter */}
            <div className="relative">
              <button
                onClick={() => { setDateOpen((v) => !v); setStatusOpen(false); }}
                className="btn btn-outline btn-sm"
              >
                {dateFilter} <ChevronDown size={16} />
              </button>
              {dateOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-base-100 border border-base-300 rounded-lg shadow z-20">
                  {DATE_OPTIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => { setDateFilter(d); setDateOpen(false); }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-base-200 ${dateFilter === d ? "font-semibold text-primary" : ""}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden bg-base-100 shadow">
          <div className="bg-primary text-primary-content px-6 py-4">
            <div className="grid grid-cols-12 gap-4 text-sm font-semibold">
              <div className="col-span-1">Order ID</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Customer</div>
              <div className="col-span-3">Location</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2">Status</div>
            </div>
          </div>

          {filteredOrders.map((order, i) => (
            <div
              key={order.id}
              className={`px-6 py-5 ${
                i % 2 === 0 ? "bg-base-100" : "bg-base-200"
              }`}
            >
              <div className="grid grid-cols-12 gap-4 items-center text-sm">
                <div className="col-span-1 font-semibold">
                  {order.id}
                </div>
                <div className="col-span-2 text-base-content/70">
                  {order.date}
                </div>
                <div className="col-span-2 font-medium">
                  {order.customer}
                </div>
                <div className="col-span-3 text-base-content/70">
                  {order.location}
                </div>
                <div className="col-span-2 font-semibold">
                  {order.amount}
                </div>

                <div className="col-span-2 flex justify-between">
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {STATUS_LABELS[order.status] || order.status}
                  </span>

                  <div className="relative">
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() =>
                        setSelectedOrder(
                          selectedOrder === order.id
                            ? null
                            : order.id
                        )
                      }
                    >
                      <MoreHorizontal size={16} />
                    </button>

                    {selectedOrder === order.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-base-100 border border-base-300 rounded-lg shadow z-10">
                        <button
                          onClick={() =>
                            handleAcceptOrder(order.id)
                          }
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-base-200"
                        >
                          <CheckCircle
                            size={16}
                            className="text-success"
                          />
                          Accept Order
                        </button>

                        <button
                          onClick={() =>
                            handleRejectOrder(order.id)
                          }
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-base-200"
                        >
                          <XCircle
                            size={16}
                            className="text-error"
                          />
                          Reject Order
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
  );
}
