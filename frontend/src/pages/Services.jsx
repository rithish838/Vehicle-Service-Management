import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import BackToDashboard from "../components/BackToDashboard";

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [formData, setFormData] = useState({
    serviceId: "",
    vehicle: "",
    customer: "",
    serviceType: "",
    mechanic: "",
    status: "Pending"
  });

  const fetchServices = () => {
    apiFetch("/api/services")
      .then((response) => response.json())
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching services:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingService
      ? `/api/services/${editingService._id}`
      : "/api/services";

    const method = editingService ? "PUT" : "POST";

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
      setEditingService(null);

      setFormData({
        serviceId: "",
        vehicle: "",
        customer: "",
        serviceType: "",
        mechanic: "",
        status: "Pending"
      });

      fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Failed to save service");
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);

    setFormData({
      serviceId: service.serviceId,
      vehicle: service.vehicle,
      customer: service.customer,
      serviceType: service.serviceType,
      mechanic: service.mechanic,
      status: service.status
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmDelete) return;

    try {
      const response = await apiFetch(
        `/api/services/${id}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to delete service");
    }
  };

  return (
    <div className="page-content">

      <BackToDashboard />

      <div className="page-header">
        <div>
          <h1>Services</h1>
          <p>Manage vehicle service requests</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setEditingService(null);

            setFormData({
              serviceId: "",
              vehicle: "",
              customer: "",
              serviceType: "",
              mechanic: "",
              status: "Pending"
            });

            setShowForm(true);
          }}
        >
          + Add Service
        </button>
      </div>

      {showForm && (
        <div className="content-card customer-form-card">

          <h2>
            {editingService ? "Edit Service" : "Add Service"}
          </h2>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="serviceId"
              placeholder="Service ID"
              value={formData.serviceId}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="vehicle"
              placeholder="Vehicle"
              value={formData.vehicle}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="customer"
              placeholder="Customer"
              value={formData.customer}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="serviceType"
              placeholder="Service Type"
              value={formData.serviceType}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="mechanic"
              placeholder="Mechanic"
              value={formData.mechanic}
              onChange={handleChange}
              required
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <div>
              <button type="submit" className="primary-button">
                {editingService ? "Update Service" : "Save Service"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingService(null);
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
            placeholder="Search services..."
          />
        </div>

        {loading ? (
          <p>Loading services...</p>
        ) : (
          <div className="customer-table">

            <div className="customer-row table-heading">
              <span>Service ID</span>
              <span>Vehicle</span>
              <span>Service Type</span>
              <span>Mechanic</span>
              <span>Status</span>
              <span>Customer request</span>
              <span>Actions</span>
            </div>

            {services.map((service) => (
              <div
                className="customer-row"
                key={service._id}
              >
                <span>{service.serviceId}</span>
                <span>{service.vehicle}</span>
                <span>{service.serviceType}</span>
                <span>{service.mechanic}</span>

                <span
                  className={`status ${
                    service.status === "Completed"
                      ? "completed"
                      : service.status === "In Progress"
                      ? "progress"
                      : "pending"
                  }`}
                >
                  {service.status}
                </span>

                <span className="service-request-cell">
                  {service.requestSource === "customer" ? (
                    <>
                      <strong>Customer booking</strong>
                      <small>{service.preferredDate ? `Preferred: ${service.preferredDate}` : "No preferred date"}</small>
                      {service.notes && <small>Notes: {service.notes}</small>}
                    </>
                  ) : "Admin entry"}
                </span>

                <span>
                  <button onClick={() => handleEdit(service)}>
                    Edit
                  </button>

                  <button onClick={() => handleDelete(service._id)}>
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

export default Services;