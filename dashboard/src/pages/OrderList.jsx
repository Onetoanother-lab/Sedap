import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  MoreHorizontal,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function OrderList() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "https://jsonplaceholder.typicode.com/users"
        );
        const users = await response.json();

        const transformedOrders = users.map((user, index) => {
          const date = new Date();
          date.setDate(date.getDate() - index);

          const statuses = ["New Order", "On Delivery", "Delivered"];
          const randomStatus =
            statuses[Math.floor(Math.random() * statuses.length)];

          return {
            id: `#${5859 + index}`,
            date: date.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            customer: user.name,
            location: `${user.address.street}, ${user.address.city}`,
            amount: `${(Math.random() * 500 + 100).toFixed(2)} UZS`,
            status: randomStatus,
          };
        });

        setOrders(transformedOrders);
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
      case "New Order":
        return "bg-warning/20 text-warning";
      case "On Delivery":
        return "bg-info/20 text-info";
      case "Delivered":
        return "bg-success/20 text-success";
      default:
        return "bg-base-200 text-base-content";
    }
  };

  const handleAcceptOrder = (id) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "On Delivery" } : o
      )
    );
    setSelectedOrder(null);
  };

  const handleRejectOrder = (id) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setSelectedOrder(null);
  };

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
              Live data ({orders.length})
            </p>
          </div>

          <div className="flex gap-4">
            <button className="btn btn-outline btn-sm">
              All Status <ChevronDown size={16} />
            </button>
            <button className="btn btn-outline btn-sm">
              Today <ChevronDown size={16} />
            </button>
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

          {orders.map((order, i) => (
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
                    {order.status}
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
