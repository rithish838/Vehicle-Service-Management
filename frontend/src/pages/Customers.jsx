import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import BackToDashboard from "../components/BackToDashboard";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [accountCustomer, setAccountCustomer] = useState(null);
  const [accountPassword, setAccountPassword] = useState("");
  const [accountError, setAccountError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    vehicles: 0,
    status: "Active"
  });

  const fetchCustomers = () => {
    apiFetch("/api/customers")
      .then((response) => response.json())
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching customers:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingCustomer
      ? `/api/customers/${editingCustomer._id}`
      : "/api/customers";

    const method = editingCustomer ? "PUT" : "POST";

    try {
      const response = await apiFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          vehicles: Number(formData.vehicles)
        })
      });

      if (!response.ok) {
        throw new Error("Operation failed");
      }

      setShowForm(false);
      setEditingCustomer(null);

      setFormData({
        name: "",
        phone: "",
        email: "",
        vehicles: 0,
        status: "Active"
      });

      fetchCustomers();
    } catch (error) {
      console.error("Error saving customer:", error);
      alert("Failed to save customer");
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);

    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      vehicles: customer.vehicles,
      status: customer.status
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmDelete) return;

    try {
      const response = await apiFetch(
        `/api/customers/${id}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      fetchCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Failed to delete customer");
    }
  };

  const handlePortalAccountSubmit = async (event) => {
    event.preventDefault();
    setAccountError("");

    try {
      const response = await apiFetch(
        `/api/auth/customers/${accountCustomer._id}/account`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: accountPassword })
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to set up portal access");

      setAccountCustomer(null);
      setAccountPassword("");
      fetchCustomers();
    } catch (error) {
      setAccountError(error.message);
    }
  };

  return (
    <div className="page-content">

      <BackToDashboard />

      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>Manage all registered customers</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setEditingCustomer(null);
            setFormData({
              name: "",
              phone: "",
              email: "",
              vehicles: 0,
              status: "Active"
            });
            setShowForm(true);
          }}
        >
          + Add Customer
        </button>
      </div>

      {showForm && (
        <div className="content-card customer-form-card">

          <h2>
            {editingCustomer ? "Edit Customer" : "Add Customer"}
          </h2>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="name"
              placeholder="Customer Name"
              value={formData.name}
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
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="vehicles"
              placeholder="Number of Vehicles"
              value={formData.vehicles}
              onChange={handleChange}
              min="0"
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
                {editingCustomer ? "Update Customer" : "Save Customer"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingCustomer(null);
                }}
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}

      {accountCustomer && (
        <section className="content-card customer-form-card customer-account-form">
          <h2>{accountCustomer.userId ? "Reset portal password" : "Create customer portal login"}</h2>
          <p className="account-customer-email">{accountCustomer.name} · {accountCustomer.email}</p>
          <form onSubmit={handlePortalAccountSubmit}>
            <label htmlFor="portal-password">Temporary password</label>
            <input
              id="portal-password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={72}
              value={accountPassword}
              onChange={(event) => setAccountPassword(event.target.value)}
              placeholder="At least 12 characters"
              required
            />
            {accountError && <p className="login-error" role="alert">{accountError}</p>}
            <div>
              <button type="submit" className="primary-button">Save portal access</button>
              <button type="button" onClick={() => setAccountCustomer(null)}>Cancel</button>
            </div>
          </form>
        </section>
      )}

      <div className="content-card">

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search customers..."
          />
        </div>

        {loading ? (
          <p>Loading customers...</p>
        ) : (
          <div className="customer-table">

            <div className="customer-row table-heading">
              <span>Customer</span>
              <span>Phone</span>
              <span>Email</span>
              <span>Vehicles</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {customers.map((customer) => (
              <div
                className="customer-row"
                key={customer._id}
              >
                <span>{customer.name}</span>
                <span>{customer.phone}</span>
                <span>{customer.email}</span>
                <span>{customer.vehicles}</span>

                <span className="status active-status">
                  {customer.status}
                </span>

                <span>
                  <button onClick={() => {
                    setAccountCustomer(customer);
                    setAccountPassword("");
                    setAccountError("");
                  }}>
                    {customer.userId ? "Reset portal password" : "Create portal login"}
                  </button>

                  <button onClick={() => handleEdit(customer)}>
                    Edit
                  </button>

                  <button onClick={() => handleDelete(customer._id)}>
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

export default Customers;