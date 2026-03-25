import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const Charts = () => {
  const data = {
    labels: ['2025-Декабрь', '2025-Февраль'],
    datasets: [
      {
        label: 'Количество заказов',
        data: [4, 4],
        backgroundColor: ['#FF6384', '#36A2EB'],
        borderRadius: 8,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <div style={{ width: '600px', height: '400px' }} >
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}

export default Charts
