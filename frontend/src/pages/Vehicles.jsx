import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import BackToDashboard from "../components/BackToDashboard";

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [formData, setFormData] = useState({
    vehicle: "",
    registration: "",
    owner: "",
    lastService: "",
    status: "Active"
  });

  const fetchVehicles = () => {
    apiFetch("/api/vehicles")
      .then((response) => response.json())
      .then((data) => {
        setVehicles(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching vehicles:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingVehicle
      ? `/api/vehicles/${editingVehicle._id}`
      : "/api/vehicles";

    const method = editingVehicle ? "PUT" : "POST";

    try {
      const response = await apiFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error("Operation failed");
      }

      setShowForm(false);
      setEditingVehicle(null);

      setFormData({
        vehicle: "",
        registration: "",
        owner: "",
        lastService: "",
        status: "Active"
      });

      fetchVehicles();
    } catch (error) {
      console.error("Error saving vehicle:", error);
      alert("Failed to save vehicle");
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);

    setFormData({
      vehicle: vehicle.vehicle,
      registration: vehicle.registration,
      owner: vehicle.owner,
      lastService: vehicle.lastService,
      status: vehicle.status
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this vehicle?"
    );

    if (!confirmDelete) return;

    try {
      const response = await apiFetch(
        `/api/vehicles/${id}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      fetchVehicles();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      alert("Failed to delete vehicle");
    }
  };

  return (
    <div className="page-content">

      <BackToDashboard />

      <div className="page-header">
        <div>
          <h1>Vehicles</h1>
          <p>Manage customer vehicles and service history</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setEditingVehicle(null);

            setFormData({
              vehicle: "",
              registration: "",
              owner: "",
              lastService: "",
              status: "Active"
            });

            setShowForm(true);
          }}
        >
          + Add Vehicle
        </button>
      </div>

      {showForm && (
        <div className="content-card customer-form-card">

          <h2>
            {editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
          </h2>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="vehicle"
              placeholder="Vehicle Name"
              value={formData.vehicle}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="registration"
              placeholder="Registration Number"
              value={formData.registration}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="owner"
              placeholder="Owner Name"
              value={formData.owner}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="lastService"
              placeholder="Last Service"
              value={formData.lastService}
              onChange={handleChange}
              required
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div>
              <button type="submit" className="primary-button">
                {editingVehicle ? "Update Vehicle" : "Save Vehicle"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingVehicle(null);
                }}
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}

      <div className="content-card">

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search vehicles..."
          />
        </div>

        {loading ? (
          <p>Loading vehicles...</p>
        ) : (
          <div className="customer-table">

            <div className="customer-row table-heading">
              <span>Vehicle</span>
              <span>Registration No.</span>
              <span>Owner</span>
              <span>Last Service</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {vehicles.map((vehicle) => (
              <div
                className="customer-row"
                key={vehicle._id}
              >
                <span>{vehicle.vehicle}</span>
                <span>{vehicle.registration}</span>
                <span>{vehicle.owner}</span>
                <span>{vehicle.lastService}</span>

                <span className="status active-status">
                  {vehicle.status}
                </span>

                <span>
                  <button onClick={() => handleEdit(vehicle)}>
                    Edit
                  </button>

                  <button onClick={() => handleDelete(vehicle._id)}>
                    Delete
                  </button>
                </span>
              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default Vehicles;