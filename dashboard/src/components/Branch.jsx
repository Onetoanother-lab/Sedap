import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const API = import.meta.env.VITE_API_URL || "https://sedap-nnap.onrender.com/api";

const BRANCH_COLORS = [
  "oklch(var(--er))",
  "oklch(var(--b3))",
  "oklch(var(--su))",
  "oklch(var(--in))",
  "oklch(var(--wa))",
  "oklch(var(--p))",
];

const Branch = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    fetch(`${API}/orderlist`)
      .then((res) => res.json())
      .then((orders) => {
        if (!Array.isArray(orders) || orders.length === 0) return;

        const counts = {};
        orders.forEach((o) => {
          const b = o.branch || "Unknown";
          counts[b] = (counts[b] || 0) + 1;
        });

        const labels = Object.keys(counts);
        const data   = labels.map((l) => counts[l]);

        setChartData({
          labels,
          datasets: [
            {
              data,
              backgroundColor: labels.map((_, i) => BRANCH_COLORS[i % BRANCH_COLORS.length]),
              borderWidth: 0,
            },
          ],
        });
      })
      .catch(() => {});
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "bottom" },
      tooltip: { enabled: true },
    },
  };

  return (
    <div className="bg-base-100 rounded-xl p-6 shadow">
      <h2 className="font-semibold mb-4">Orders by Branch</h2>
      <div className="w-64 h-64">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default Branch;
