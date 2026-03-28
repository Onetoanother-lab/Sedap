import { useMemo } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

// Group orderlist by address city/district (first word of address)
function groupByDistrict(orders) {
    const map = {};
    orders.forEach((o) => {
        if (!o.address) return;
        // Take the last comma-separated segment, or first word
        const parts   = o.address.split(",");
        const district = (parts[parts.length - 1] || parts[0]).trim().split(" ")[0];
        map[district]  = (map[district] || 0) + 1;
    });
    return map;
}

const COLORS = ["#ff7a90", "#9e9e9e", "#2ecc71", "#1e90ff", "#f39c12", "#9b59b6"];

const Branch = ({ orders = [] }) => {
    const grouped = useMemo(() => groupByDistrict(orders), [orders]);
    const labels  = Object.keys(grouped);
    const values  = Object.values(grouped);

    const data = {
        labels: labels.length ? labels : ["No data"],
        datasets: [{
            data: values.length ? values : [1],
            backgroundColor: COLORS.slice(0, Math.max(labels.length, 1)),
            borderWidth: 0,
        }],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "bottom" },
            tooltip: { enabled: labels.length > 0 },
        },
    };

    return (
        <div className="bg-base-100 rounded-xl p-6 shadow">
            <h2 className="font-semibold mb-4">Orders by Location</h2>
            <div className="w-64 h-64">
                <Pie data={data} options={options} />
            </div>
        </div>
    );
};

export default Branch;
