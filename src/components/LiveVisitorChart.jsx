
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import useLiveVisitorData from '../hooks/useLiveVisitorData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: false,
      text: 'Visitor Analytics',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      min: 0,
      max: 100,
      ticks: {
        stepSize: 10,
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      }
    },
    x: {
      grid: {
        display: false,
      }
    }
  },
  animation: {
    duration: 1000,
    easing: 'easeOutQuart',
  },
};

const LiveVisitorChart = () => {
  const { chartData, isConnected } = useLiveVisitorData();

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Real-time Visitor Analytics</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
          <span className="text-xs font-medium text-gray-600">{isConnected ? 'Live Updates' : 'Offline'}</span>
        </div>
      </div>
      
      <div className="flex-1 min-h-[300px]">
        {chartData.labels.length > 0 ? (
          <Bar options={options} data={chartData} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
            <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-blue-500 animate-spin"></div>
            <p className="text-sm">Waiting for live data...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveVisitorChart;
