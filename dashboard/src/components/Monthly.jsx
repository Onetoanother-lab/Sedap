import { useMemo } from "react";
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const COLORS = [
    "#ff6384","#36a2eb","#4bc0c0","#ff9f40","#9966ff",
    "#c9cbcf","#2ecc71","#e74c3c","#3498db","#f39c12","#1abc9c","#e91e63",
];

// Group orders by month (field: order.date  e.g. "2025-12-01")
function groupByMonth(orders) {
    const map = {};
    orders.forEach((o) => {
        if (!o.date) return;
        const d     = new Date(o.date);
        const label = d.toLocaleString("en", { year: "numeric", month: "short" });
        map[label]  = (map[label] || 0) + 1;
    });
    return map;
}

const Monthly = ({ orders = [] }) => {
    const grouped = useMemo(() => groupByMonth(orders), [orders]);
    const labels  = Object.keys(grouped);
    const values  = Object.values(grouped);

    const data = {
        labels,
        datasets: [{
            label: "Orders",
            data: values,
            backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length]),
            borderRadius: 8,
        }],
    };

    const options = {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
    };

    return (
        <div className="bg-base-100 rounded-xl p-6 shadow">
            <h2 className="font-semibold mb-4">Monthly Orders</h2>
            {labels.length === 0 ? (
                <p className="text-base-content/50 text-sm">No orders yet</p>
            ) : (
                <Bar data={data} options={options} />
            )}
        </div>
    );
};

export default Monthly;
