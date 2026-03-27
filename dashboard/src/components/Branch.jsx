import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const Branch = () => {
  const data = {
    labels: ["Yunusobod", "Tinchlik", "Chilonzor", "Sergeli"],
    datasets: [
      {
        data: [500, 100, 300, 200],
        backgroundColor: ["#ff7a90", "#9e9e9e", "#2ecc71", "#1e90ff"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <div className="bg-base-100 rounded-xl p-6 shadow">
      <h2 className="font-semibold mb-4">Orders by Branch</h2>

      <div className="w-64 h-64">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default Branch;
