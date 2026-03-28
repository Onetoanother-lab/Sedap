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
  "#ff6384", "#36a2eb", "#ffce56", "#4bc0c0",
  "#9966ff", "#ff9f40", "#c9cbcf", "#2ecc71",
  "#e74c3c", "#3498db", "#f39c12", "#1abc9c",
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
