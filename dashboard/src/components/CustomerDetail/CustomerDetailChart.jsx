import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip
);

const CustomerDetailChart = () => {
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [420, 350, 280, 500, 230, 180, 763],
        backgroundColor: [
          "#5AC8FA",
          "#FF5B5B",
          "#34C759",
          "#FFC107",
          "#5AC8FA",
          "#FF5B5B",
          "#34C759",
        ],
        borderRadius: 20,
        barThickness: 18,
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#000",
        bodyColor: "#666",
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          title: () => "763 Likes",
          label: () => "Oct 24th, 2020",
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: { display: false },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md w-[45%] h-[60%]">
      <h2 className="text-lg font-semibold">Most Liked Food</h2>
      <p className="text-sm text-gray-400 mb-4">
        Lorem ipsum dolor sit amet, consectetur
      </p>

      <Bar data={data} options={options} />
    </div>
  );
};

export default CustomerDetailChart;
