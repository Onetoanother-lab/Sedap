import { useEffect, useState } from "react";
import Monthly from "../components/Monthly";
import Branch from "../components/Branch";
import StatCard from "../components/StatCard";
import api from "../api/axios";

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalCancelled: 0,
        totalDelivered: 0,
        incomeProfit: 0,
    });
    const [loading, setLoading] = useState(true);
    const [orderData, setOrderData] = useState([]); // for charts

    useEffect(() => {
        Promise.all([
            api.get('/orderlist'),
            api.get('/orders'),
        ])
            .then(([orderListRes, ordersRes]) => {
                const orderList = orderListRes.data;
                const orders    = ordersRes.data;

                const totalOrders   = orderList.length;
                const incomeProfit  = orderList.reduce((sum, o) => sum + (o.total || 0), 0);

                setStats({
                    totalOrders,
                    totalCancelled: 0,   // no status field yet — extend later
                    totalDelivered: 0,
                    incomeProfit,
                });

                setOrderData(orders);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="pt-4">
            <h1 className="text-2xl text-primary font-bold">Dashboard</h1>
            <p className="text-md font-semibold text-primary mb-10">
                Your restaurant overview
            </p>

            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <span className="loading loading-spinner text-success w-10" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        <StatCard title="Total Orders"    value={stats.totalOrders}    percent={4} />
                        <StatCard title="Total Cancelled" value={stats.totalCancelled} percent={-2} />
                        <StatCard title="Total Delivered" value={stats.totalDelivered} percent={0} />
                        <StatCard title="Income Profit"   value={stats.incomeProfit}   percent={8} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <Monthly orders={orderData} />
                        </div>
                        <Branch orders={orderData} />
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
