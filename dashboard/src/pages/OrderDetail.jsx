import React, { useEffect, useState } from "react";
import { LuTruck } from "react-icons/lu";
import { FiPhone } from "react-icons/fi";
import { TbTruckDelivery } from "react-icons/tb";
import api from "../api/axios";

const OrderDetail = () => {
    const [order, setOrder]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState(null);

    useEffect(() => {
        api.get('/orderlist')
            .then(({ data }) => setOrder(data[0] || null))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg text-success" />
        </div>
    );

    if (error) return (
        <div className="alert alert-error">{error}</div>
    );

    if (!order) return (
        <div className="alert alert-warning">No orders found in database yet.</div>
    );

    const safeOrder = {
        id: order.id,
        status: "On Delivery",
        customer: {
            name: order.customerName,
            avatar: "https://img.daisyui.com/images/profile/demo/yellingcat@192.webp",
        },
        address: order.address,
        items: order.items || [],
        delivery: { name: "Courier", phone: "+998 90 000 00 00", time: "12:52" },
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-base-content tracking-tight">Order ID #{safeOrder.id}</h2>
                    <p className="text-sm text-success font-medium mt-0.5">Orders / Order Details</p>
                </div>
                <div className="flex gap-3 items-center">
                    <button className="btn btn-outline btn-error btn-sm rounded-lg px-5 font-semibold">Cancel Order</button>
                    <button className="btn btn-success btn-sm rounded-lg px-5 gap-2 font-semibold text-white shadow">
                        <LuTruck className="text-base" />{safeOrder.status}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-5">
                {/* Left */}
                <div className="col-span-12 lg:col-span-3 flex flex-col">
                    <div className="bg-base-100 rounded-t-2xl shadow-sm py-10 px-4 flex flex-col items-center text-center">
                        <div className="avatar mb-3">
                            <div className="w-[72px] h-[72px] rounded-full overflow-hidden ring-[3px] ring-success ring-offset-2 ring-offset-base-100">
                                <img src={safeOrder.customer.avatar} alt="avatar" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <h3 className="font-bold text-[15px] text-base-content leading-tight">{safeOrder.customer.name}</h3>
                        <span className="mt-2 inline-flex items-center text-[11px] font-semibold text-success border border-success/60 rounded-full px-3 py-[2px] bg-success/5">
                            Customer
                        </span>
                    </div>

                    <div className="rounded-2xl shadow-sm px-5 py-4 relative bottom-3" style={{ background: "#2d3748" }}>
                        <h4 className="font-bold text-white text-sm mb-2">Note Order</h4>
                        <p className="text-[12px] text-white/60 leading-[1.6]">Delivery address and order note</p>
                        <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2.5">
                            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center flex-shrink-0">
                                <TbTruckDelivery className="text-base" style={{ color: "#2d3748" }} />
                            </div>
                            <p className="text-[11px] font-semibold text-white leading-snug">{safeOrder.address}</p>
                        </div>
                    </div>

                    {/* History */}
                    <div className="bg-base-100 rounded-2xl shadow-sm px-5 pt-5 pb-4 flex-1 mt-4">
                        <h4 className="font-bold text-base-content text-sm mb-5">History</h4>
                        <div className="relative">
                            <div className="absolute left-[5px] top-2 bottom-2 w-[2px] bg-base-200 rounded-full" />
                            <div className="absolute left-[5px] top-[28px] bottom-0 w-[2px] bg-error/70 rounded-full" />
                            {[
                                { label: "Order Delivered", active: false },
                                { label: "On Delivery",     active: true,  date: "Sat, 23 Jul 2020, 01:24 PM" },
                                { label: "Payment Success", active: true,  date: "Fri, 22 Jul 2020, 10:44 AM" },
                                { label: "Order Created",   active: true,  date: new Date(order.createdAt).toLocaleString() },
                            ].map((step, i) => (
                                <div key={i} className="relative flex items-start gap-3 mb-5 last:mb-0">
                                    <span className={`relative z-10 mt-[3px] w-3 h-3 rounded-full border-2 border-base-100 flex-shrink-0 shadow-sm ${step.active ? "bg-error" : "bg-base-300"}`} />
                                    <div>
                                        <p className={`text-[12px] leading-tight ${step.active ? "font-bold text-base-content" : "text-base-content/40 font-medium"}`}>{step.label}</p>
                                        {step.date && <p className="text-[11px] text-base-content/40 mt-0.5">{step.date}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right */}
                <div className="col-span-12 lg:col-span-9 space-y-5">
                    {/* Items table */}
                    <div className="bg-base-100 rounded-2xl shadow-sm overflow-hidden">
                        <div className="grid grid-cols-12 bg-success text-white px-6 py-4 font-semibold text-sm">
                            <span className="col-span-5">Items</span>
                            <span className="col-span-2 text-center">Qty</span>
                            <span className="col-span-2 text-center">Price</span>
                            <span className="col-span-3 text-center">Total Price</span>
                        </div>
                        {safeOrder.items.length === 0 ? (
                            <div className="p-8 text-center text-base-content/50">No items in this order</div>
                        ) : (
                            safeOrder.items.map((item, i) => (
                                <div key={i} className="grid grid-cols-12 items-center px-6 py-4 border-b border-base-200 last:border-0 hover:bg-base-50 transition-colors">
                                    <div className="col-span-5 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-base-200 flex-shrink-0">
                                            <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                        </div>
                                        <p className="font-semibold text-sm text-base-content">{item.name}</p>
                                    </div>
                                    <span className="col-span-2 text-center text-sm font-medium">{item.qty}x</span>
                                    <span className="col-span-2 text-center text-sm">{Number(item.price).toLocaleString()} UZS</span>
                                    <span className="col-span-3 text-center text-sm font-bold">
                                        {(item.qty * item.price).toLocaleString()} UZS
                                    </span>
                                </div>
                            ))
                        )}
                        {/* Totals */}
                        <div className="px-6 py-4 bg-base-200 text-sm space-y-1">
                            <div className="flex justify-between"><span>Sub Total</span><span>{order.subTotal?.toLocaleString()} UZS</span></div>
                            <div className="flex justify-between text-error"><span>Discount</span><span>-{order.discount?.toLocaleString()} UZS</span></div>
                            <div className="flex justify-between"><span>Tax</span><span>{order.tax?.toLocaleString()} UZS</span></div>
                            <div className="flex justify-between"><span>Tips</span><span>{order.tips?.toLocaleString()} UZS</span></div>
                            <div className="flex justify-between font-bold text-base pt-2 border-t border-base-300">
                                <span>Total</span><span className="text-success">{order.total?.toLocaleString()} UZS</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-base-100 rounded-2xl shadow-sm p-5">
                        <p className="text-xs font-semibold text-base-content/50 uppercase tracking-widest mb-4">Delivery by</p>
                        <div className="flex items-center justify-between gap-4 flex-wrap">
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
                            <div className="flex items-center gap-3 flex-wrap">
                                <button className="flex items-center gap-2 border border-base-300 rounded-xl px-4 py-2.5 text-sm font-medium text-base-content hover:bg-base-200 transition-colors">
                                    <div className="w-7 h-7 rounded-full bg-info/10 flex items-center justify-center">
                                        <FiPhone className="text-info text-sm" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] text-base-content/40 leading-none mb-0.5">Telephone</p>
                                        <p className="text-xs font-semibold">{safeOrder.delivery.phone}</p>
                                    </div>
                                </button>
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
