import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const API = import.meta.env.VITE_API_URL || "https://sedap-nnap.onrender.com/api";

const COLORS = [
  "oklch(var(--er))",  "oklch(var(--in))",  "oklch(var(--wa))",  "oklch(var(--su))",
  "oklch(var(--p))",   "oklch(var(--a))",   "oklch(var(--b3))",  "oklch(var(--s))",
  "oklch(var(--er) / 0.7)", "oklch(var(--in) / 0.7)", "oklch(var(--wa) / 0.7)", "oklch(var(--su) / 0.7)",
];

const Monthly = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    fetch(`${API}/orderlist`)
      .then((res) => res.json())
      .then((orders) => {
        if (!Array.isArray(orders) || orders.length === 0) return;

        const counts = {};
        orders.forEach((order) => {
          const date = new Date(order.createdAt);
          if (isNaN(date)) return;
          const label = `${date.getFullYear()}-${date.toLocaleString("default", { month: "long" })}`;
          counts[label] = (counts[label] || 0) + 1;
        });

        const labels = Object.keys(counts).sort();
        const data = labels.map((l) => counts[l]);

        setChartData({
          labels,
          datasets: [
            {
              label: "Orders",
              data,
              backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length]),
              borderRadius: 8,
            },
          ],
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-base-100 rounded-xl p-6 shadow">
      <h2 className="font-semibold mb-4">Monthly Orders</h2>
      <Bar data={chartData} />
    </div>
  );
};

export default Monthly;
