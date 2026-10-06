import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import BackToDashboard from "../components/BackToDashboard";

function Reports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/reports")
      .then((response) => response.json())
      .then((data) => {
        setReports(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching reports:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page-content">
      <BackToDashboard />

      <div className="page-header">
        <div>
          <h1>Reports</h1>
          <p>View service and revenue reports</p>
        </div>
      </div>

      {loading ? (
        <p>Loading reports...</p>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Services</h3>
              <p>{reports.totalServices}</p>
            </div>

            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p>₹{reports.totalRevenue.toLocaleString("en-IN")}</p>
            </div>

            <div className="stat-card">
              <h3>Vehicles Serviced</h3>
              <p>{reports.vehiclesServiced}</p>
            </div>

            <div className="stat-card">
              <h3>Active Mechanics</h3>
              <p>{reports.activeMechanics}</p>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Monthly Services</h3>

              <div className="service-table">
                {reports.monthlyServices.map((item) => (
                  <div className="service-row" key={item.month}>
                    <span>{item.month}</span>
                    <span>{item.services}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-card">
              <h3>Service Status</h3>

              <div className="service-table">
                {reports.serviceStatus.map((item) => (
                  <div className="service-row" key={item.status}>
                    <span>{item.status}</span>
                    <span>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;