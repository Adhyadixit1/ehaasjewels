import { useDailyStats } from '../../hooks/useDailyStats';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const TimeSpentChart = () => {
  const { data, isLoading, error } = useDailyStats(7);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading stats</div>;

  const chartData = {
    labels: data?.map(day => new Date(day.day).toLocaleDateString()) || [],
    datasets: [
      {
        label: 'Average Time Spent (minutes)',
        data: data?.map(day => Math.round((day.avg_time_spent_seconds || 0) / 60)) || [],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Daily Time Spent</h2>
      <div className="h-64">
        <Line 
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Minutes'
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
};
