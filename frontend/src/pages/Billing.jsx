import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import BackToDashboard from "../components/BackToDashboard";

function Billing() {
  const [billing, setBilling] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);

  const [formData, setFormData] = useState({
    invoiceId: "",
    customer: "",
    vehicle: "",
    amount: 0,
    status: "Pending"
  });

  const fetchBilling = () => {
    apiFetch("/api/billing")
      .then((response) => response.json())
      .then((data) => {
        setBilling(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching billing:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingBill
      ? `/api/billing/${editingBill._id}`
      : "/api/billing";

    const method = editingBill ? "PUT" : "POST";

    try {
      const response = await apiFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount)
        })
      });

      if (!response.ok) {
        throw new Error("Operation failed");
      }

      setShowForm(false);
      setEditingBill(null);

      setFormData({
        invoiceId: "",
        customer: "",
        vehicle: "",
        amount: 0,
        status: "Pending"
      });

      fetchBilling();
    } catch (error) {
      console.error("Error saving billing:", error);
      alert("Failed to save billing");
    }
  };

  const handleEdit = (bill) => {
    setEditingBill(bill);

    setFormData({
      invoiceId: bill.invoiceId,
      customer: bill.customer,
      vehicle: bill.vehicle,
      amount: bill.amount,
      status: bill.status
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this invoice?"
    );

    if (!confirmDelete) return;

    try {
      const response = await apiFetch(
        `/api/billing/${id}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      fetchBilling();
    } catch (error) {
      console.error("Error deleting billing:", error);
      alert("Failed to delete billing");
    }
  };

  return (
    <div className="page-content">

      <BackToDashboard />

      <div className="page-header">
        <div>
          <h1>Billing</h1>
          <p>Manage invoices and payments</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setEditingBill(null);

            setFormData({
              invoiceId: "",
              customer: "",
              vehicle: "",
              amount: 0,
              status: "Pending"
            });

            setShowForm(true);
          }}
        >
          + Create Invoice
        </button>
      </div>

      {showForm && (
        <div className="content-card customer-form-card">

          <h2>
            {editingBill ? "Edit Invoice" : "Create Invoice"}
          </h2>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="invoiceId"
              placeholder="Invoice ID"
              value={formData.invoiceId}
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
              name="vehicle"
              placeholder="Vehicle"
              value={formData.vehicle}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              required
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>

            <div>
              <button type="submit" className="primary-button">
                {editingBill ? "Update Invoice" : "Save Invoice"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingBill(null);
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
          <p>Loading billing...</p>
        ) : (
          <div className="customer-table">

            <div className="customer-row table-heading">
              <span>Invoice</span>
              <span>Customer</span>
              <span>Vehicle</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {billing.map((bill) => (
              <div
                className="customer-row"
                key={bill._id}
              >
                <span>{bill.invoiceId}</span>
                <span>{bill.customer}</span>
                <span>{bill.vehicle}</span>

                <span>
                  ₹{Number(bill.amount).toLocaleString("en-IN")}
                </span>

                <span
                  className={`status ${
                    bill.status === "Paid"
                      ? "active-status"
                      : "pending"
                  }`}
                >
                  {bill.status}
                </span>

                <span>
                  <button onClick={() => handleEdit(bill)}>
                    Edit
                  </button>

                  <button onClick={() => handleDelete(bill._id)}>
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

export default Billing;