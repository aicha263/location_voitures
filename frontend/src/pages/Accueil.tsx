import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "./style.css";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Accueil() {
  const revenus = 12000;
  const depenses = 5000;
  const profit = revenus - depenses;

  const data = {
    labels: ["Jan", "Feb", "Mar"],
    datasets: [
      {
        label: "Profit (MRU)",
        data: [3000, 5000, 7000],
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.15)",
        fill: true,
        tension: 0.45,
        borderWidth: 3,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Évolution du profit",
      },
    },
  };

  return (
    <div>
      {/* TITLE */}
      <div className="dashboard-header mb-4">
        <h2 className="fw-bold">📊 Tableau de bord</h2>
        <p className="text-muted">
          Vue générale des performances financières
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="dashboard-card success">
            <div className="icon">💰</div>
            <div>
              <span>Revenus</span>
              <h4>{revenus} MRU</h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="dashboard-card danger">
            <div className="icon">💸</div>
            <div>
              <span>Dépenses</span>
              <h4>{depenses} MRU</h4>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="dashboard-card primary">
            <div className="icon">📈</div>
            <div>
              <span>Profit</span>
              <h4>{profit} MRU</h4>
            </div>
          </div>
        </div>
      </div>


      {/* CHART */}
      <div className="chart-card">
        <h5>📈 Évolution du profit</h5>
        <Line data={data} options={options} />
      </div>

    </div>
  );
}

export default Accueil;
