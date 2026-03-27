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

const Monthly = () => {
  const data = {
    labels: ["2025-Dekabr", "2026-Fevral"],
    datasets: [
      {
        label: "Orders",
        data: [5, 4],
        backgroundColor: ["#ff6384", "#36a2eb"],
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="bg-base-100 rounded-xl p-6 shadow">
      <h2 className="font-semibold mb-4">Monthly Orders</h2>
      <Bar data={data} />
    </div>
  );
};

export default Monthly;
