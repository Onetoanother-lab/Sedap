import React, { useEffect, useState } from "react";
import { LuTruck } from "react-icons/lu";
import { FiPhone } from "react-icons/fi";
import { TbTruckDelivery } from "react-icons/tb";

const OrderDetail = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch("https://sedap-nnap.onrender.com/api/orderlist");
        const data = await res.json();
        setOrder(data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 ">
        <span className="loading loading-spinner loading-lg text-success"></span>
      </div>
    );
  }

  if (!order) return <p>Order not found</p>;

  const safeOrder = {
    id: order.id,
    status: "On Delivery",
    customer: {
      name: order.customerName,
      avatar:
        "https://img.daisyui.com/images/profile/demo/yellingcat@192.webp",
    },
    address: order.address,
    items: order.items || [],
    delivery: {
      name: "Courier",
      phone: "+998 90 000 00 00",
      time: "12:52",
    },
  };

  return (
    <div className="  space-y-6">

      {/* Page Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-base-content tracking-tight">
            Order ID #{safeOrder.id}
          </h2>
          <p className="text-sm text-success font-medium mt-0.5">
            Orders / Order Details
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <button className="btn btn-outline btn-error btn-sm rounded-lg px-5 font-semibold">
            Cancel Order
          </button>
          <button className="btn btn-success btn-sm rounded-lg px-5 gap-2 font-semibold text-white shadow">
            <LuTruck className="text-base" />
            {safeOrder.status}
            <svg className="w-4 h-4 ml-1 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">

        {/* ── LEFT COLUMN ── */}
        <div className="col-span-1 lg:col-span-3 flex flex-col ">

          {/* Customer Card */}
          <div className="bg-base-100 rounded-t-2xl shadow-sm py-10 px-4 flex flex-col items-center text-center">
            <div className="avatar mb-3">
              <div className="w-[72px] h-[72px] rounded-full overflow-hidden ring-[3px] ring-success ring-offset-2 ring-offset-base-100">
                <img src={safeOrder.customer.avatar} alt="avatar" className="w-full h-full object-cover" />
              </div>
            </div>
            <h3 className="font-bold text-[15px] text-base-content leading-tight">{safeOrder.customer.name}</h3>
            <span className="mt-2 inline-flex items-center text-[11px] font-semibold text-success border border-success/60 rounded-full px-3 py-[2px] bg-success/5 tracking-wide">
              Customer
            </span>
          </div>

          {/* Note Order — dark slate card */}
          <div className="rounded-2xl shadow-sm px-5 py-4 relative bottom-3" style={{ background: "#2d3748" }}>
            <h4 className="font-bold text-white text-sm mb-2 tracking-tight">Note Order</h4>
            <p className="text-[12px] text-white/60 leading-[1.6]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>
            {/* Address pill inside note card, matching screenshot */}
            <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center flex-shrink-0">
                <TbTruckDelivery className="text-base" style={{ color: "#2d3748" }} />
              </div>
              <p className="text-[11px] font-semibold text-white leading-snug">
                {safeOrder.address || "6 The Avenue, London E250 4GN"}
              </p>
            </div>
          </div>

          {/* History / Timeline */}
          <div className="bg-base-100 rounded-2xl shadow-sm px-5 pt-5 pb-4 flex-1 mt-4">
            <h4 className="font-bold text-base-content text-sm mb-5 tracking-tight">History</h4>

            {/* Custom timeline */}
            <div className="relative">
              {/* Full connector line */}
              <div className="absolute left-[5px] top-2 bottom-2 w-[2px] bg-base-200 rounded-full" />
              {/* Active line from step 2 down */}
              <div className="absolute left-[5px] top-[28px] bottom-0 w-[2px] bg-error/70 rounded-full" />

              {/* Step 1 — Order Delivered (future / grey) */}
              <div className="relative flex items-start gap-3 mb-5">
                <span className="relative z-10 mt-[3px] w-3 h-3 rounded-full bg-base-300 border-2 border-base-100 flex-shrink-0" />
                <div>
                  <p className="text-[12px] text-base-content/40 font-medium">Order Delivered</p>
                </div>
              </div>

              {/* Step 2 — On Delivery (active) */}
              <div className="relative flex items-start gap-3 mb-5">
                <span className="relative z-10 mt-[3px] w-3 h-3 rounded-full bg-error border-2 border-base-100 flex-shrink-0 shadow-sm" />
                <div>
                  <p className="text-[12px] font-bold text-base-content leading-tight">On Delivery</p>
                  <p className="text-[11px] text-base-content/40 mt-0.5">Sat, 23 Jul 2020, 01:24 PM</p>
                </div>
              </div>

              {/* Step 3 — Payment Success (active) */}
              <div className="relative flex items-start gap-3 mb-5">
                <span className="relative z-10 mt-[3px] w-3 h-3 rounded-full bg-error border-2 border-base-100 flex-shrink-0 shadow-sm" />
                <div>
                  <p className="text-[12px] font-bold text-base-content leading-tight">Payment Success</p>
                  <p className="text-[11px] text-base-content/40 mt-0.5">Fri, 22 Jul 2020, 10:44 AM</p>
                </div>
              </div>

              {/* Step 4 — Order Created (active) */}
              <div className="relative flex items-start gap-3">
                <span className="relative z-10 mt-[3px] w-3 h-3 rounded-full bg-error border-2 border-base-100 flex-shrink-0 shadow-sm" />
                <div>
                  <p className="text-[12px] font-bold text-base-content leading-tight">Order Created</p>
                  <p className="text-[11px] text-base-content/40 mt-0.5">Thu, 21 Jul 2020, 11:48 AM</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="col-span-12 lg:col-span-9 space-y-5">

          {/* Order Items Table */}
          <div className="bg-base-100 rounded-2xl shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 bg-success text-white px-6 py-4 font-semibold text-sm">
              <span className="col-span-5">Items</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-center">Price</span>
              <span className="col-span-2 text-center">Total Price</span>
              <span className="col-span-1"></span>
            </div>

            {/* Table Rows */}
            {safeOrder.items.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-12 items-center px-6 py-4 border-b border-base-200 last:border-b-0 hover:bg-base-50 transition-colors"
              >
                {/* Item info */}
                <div className="col-span-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-base-200 flex-shrink-0">
                    <img
                      src={item.image}
                      className="w-full h-full object-cover"
                      alt={item.name}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-base-content/40 uppercase tracking-wide mb-0.5">Main Course</p>
                    <p className="font-semibold text-sm text-base-content leading-tight">{item.name}</p>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4].map(s => (
                        <svg key={s} className="w-3 h-3 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      ))}
                      <svg className="w-3 h-3 text-base-300 fill-base-300" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      <span className="text-[10px] text-base-content/40 ml-1">(40+ reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Qty */}
                <span className="col-span-2 text-center text-sm font-medium text-base-content">{item.qty}x</span>

                {/* Price */}
                <span className="col-span-2 text-center text-sm text-base-content">{item.price.toLocaleString()} сум</span>

                {/* Total */}
                <span className="col-span-2 text-center text-sm font-bold text-base-content">
                  {(item.qty * item.price).toLocaleString()} сум
                </span>

                {/* Remove btn */}
                <div className="col-span-1 flex justify-center">
                  <button className="w-6 h-6 rounded-full border-2 border-error flex items-center justify-center hover:bg-error/10 transition-colors">
                    <svg className="w-3 h-3 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Map Placeholder */}
          <div className="bg-base-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="relative w-full h-44 bg-base-200 overflow-hidden">

              {/* Grid — uses currentColor so it flips with theme */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="map-grid" width="36" height="36" patternUnits="userSpaceOnUse">
                    <path
                      d="M 36 0 L 0 0 0 36"
                      fill="none"
                      className="stroke-base-content"
                      strokeWidth="0.6"
                      strokeOpacity="0.15"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#map-grid)" />
              </svg>

              {/* Route line + markers */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 500 180"
                preserveAspectRatio="none"
              >
                <polyline
                  points="70,158 190,98 300,118 440,48"
                  fill="none"
                  className="stroke-error"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Start dot */}
                <circle cx="70" cy="158" r="7" className="fill-base-300 strocke-base-100" strokeWidth="2.5" />
                {/* Rider dot */}
                <circle cx="300" cy="118" r="7" className="fill-error strocke-base-100" strokeWidth="2.5" />
                <text x="300" y="123" textAnchor="middle" className=" text-[8px] fill-white"></text>
                {/* End dot */}
                <circle cx="440" cy="48" r="7" className="fill-error strocke-base-100" strokeWidth="2.5" />
              </svg>

              {/* ETA bubble */}
              <div className="absolute left-[44%] top-[44%] -translate-x-1/2 -translate-y-1/2 z-10 bg-base-100 border border-base-300 rounded-lg shadow px-3 py-1.5 text-center pointer-events-none">
                <p className="text-xs font-bold text-base-content">4-6 mins</p>
                <p className="text-[10px] text-base-content/50">Estimated time</p>
              </div>

              {/* Track Orders label */}
              <div className="absolute top-3 right-4 text-right">
                <p className="text-xs font-semibold text-base-content">Track Orders</p>
                <p className="text-[10px] text-base-content/40 mt-0.5">Lorem ipsum dolor sit</p>
              </div>

              {/* Expand icon */}
              <div className="absolute bottom-3 left-3 w-7 h-7 rounded-md bg-base-100 border border-base-300 flex items-center justify-center cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="stroke-base-content" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />
                </svg>
              </div>

            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-base-100 rounded-2xl shadow-sm p-5">
            <p className="text-xs font-semibold text-base-content/50 uppercase tracking-widest mb-4">Delivery by</p>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Courier info */}
              <div className="flex items-center gap-3">
                <div className="avatar">
                  <div className="w-10 h-10 rounded-full bg-base-200 overflow-hidden">
                    <img src="https://img.daisyui.com/images/profile/demo/2@94.webp" alt="courier" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-sm text-base-content">{safeOrder.delivery.name}</p>
                  <p className="text-xs text-base-content/40">ID · 40495</p>
                </div>
              </div>

              {/* Right side: phone + time */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Phone button */}
                <button className="flex items-center gap-2 border border-base-300 rounded-xl px-4 py-2.5 text-sm font-medium text-base-content hover:bg-base-200 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-info/10 flex items-center justify-center">
                    <FiPhone className="text-info text-sm" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-base-content/40 leading-none mb-0.5">Telephone</p>
                    <p className="text-xs font-semibold">{safeOrder.delivery.phone}</p>
                  </div>
                </button>

                {/* Delivery time */}
                <div className="flex items-center gap-2 border border-base-300 rounded-xl px-4 py-2.5">
                  <div className="w-7 h-7 rounded-full bg-success/10 flex items-center justify-center">
                    <LuTruck className="text-success text-sm" />
                  </div>
                  <div>
                    <p className="text-[10px] text-base-content/40 leading-none mb-0.5">Delivery Time</p>
                    <p className="text-xs font-bold text-base-content">{safeOrder.delivery.time}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetail;