import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import BackToDashboard from "../components/BackToDashboard";

function Mechanics() {
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingMechanic, setEditingMechanic] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    phone: "",
    activeJobs: 0,
    status: "Available"
  });

  const fetchMechanics = () => {
    apiFetch("/api/mechanics")
      .then((response) => response.json())
      .then((data) => {
        setMechanics(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching mechanics:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMechanics();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingMechanic
      ? `/api/mechanics/${editingMechanic._id}`
      : "/api/mechanics";

    const method = editingMechanic ? "PUT" : "POST";

    try {
      const response = await apiFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          activeJobs: Number(formData.activeJobs)
        })
      });

      if (!response.ok) {
        throw new Error("Operation failed");
      }

      setShowForm(false);
      setEditingMechanic(null);

      setFormData({
        name: "",
        specialization: "",
        phone: "",
        activeJobs: 0,
        status: "Available"
      });

      fetchMechanics();
    } catch (error) {
      console.error("Error saving mechanic:", error);
      alert("Failed to save mechanic");
    }
  };

  const handleEdit = (mechanic) => {
    setEditingMechanic(mechanic);

    setFormData({
      name: mechanic.name,
      specialization: mechanic.specialization,
      phone: mechanic.phone,
      activeJobs: mechanic.activeJobs,
      status: mechanic.status
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this mechanic?"
    );

    if (!confirmDelete) return;

    try {
      const response = await apiFetch(
        `/api/mechanics/${id}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      fetchMechanics();
    } catch (error) {
      console.error("Error deleting mechanic:", error);
      alert("Failed to delete mechanic");
    }
  };

  return (
    <div className="page-content">

      <BackToDashboard />

      <div className="page-header">
        <div>
          <h1>Mechanics</h1>
          <p>Manage mechanics and their service assignments</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setEditingMechanic(null);

            setFormData({
              name: "",
              specialization: "",
              phone: "",
              activeJobs: 0,
              status: "Available"
            });

            setShowForm(true);
          }}
        >
          + Add Mechanic
        </button>
      </div>

      {showForm && (
        <div className="content-card customer-form-card">

          <h2>
            {editingMechanic ? "Edit Mechanic" : "Add Mechanic"}
          </h2>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="name"
              placeholder="Mechanic Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="specialization"
              placeholder="Specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="activeJobs"
              placeholder="Active Jobs"
              value={formData.activeJobs}
              onChange={handleChange}
              min="0"
              required
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div>
              <button type="submit" className="primary-button">
                {editingMechanic ? "Update Mechanic" : "Save Mechanic"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingMechanic(null);
                }}
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}

      <div className="content-card">

        {loading ? (
          <p>Loading mechanics...</p>
        ) : (
          <div className="customer-table">

            <div className="customer-row table-heading">
              <span>Mechanic</span>
              <span>Specialization</span>
              <span>Phone</span>
              <span>Active Jobs</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {mechanics.map((mechanic) => (
              <div
                className="customer-row"
                key={mechanic._id}
              >
                <span>{mechanic.name}</span>
                <span>{mechanic.specialization}</span>
                <span>{mechanic.phone}</span>
                <span>{mechanic.activeJobs}</span>

                <span
                  className={`status ${
                    mechanic.status === "Available"
                      ? "active-status"
                      : "progress"
                  }`}
                >
                  {mechanic.status}
                </span>

                <span>
                  <button onClick={() => handleEdit(mechanic)}>
                    Edit
                  </button>

                  <button onClick={() => handleDelete(mechanic._id)}>
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

export default Mechanics;