import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import BackToDashboard from "../components/BackToDashboard";

function SpareParts() {
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingPart, setEditingPart] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    partNumber: "",
    category: "",
    stock: 0,
    status: "In Stock"
  });

  const fetchSpareParts = () => {
    apiFetch("/api/spare-parts")
      .then((response) => response.json())
      .then((data) => {
        console.log("Spare Parts Data:", data);
        setSpareParts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching spare parts:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSpareParts();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editingPart
      ? `/api/spare-parts/${editingPart._id}`
      : "/api/spare-parts";

    const method = editingPart ? "PUT" : "POST";

    try {
      const response = await apiFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          stock: Number(formData.stock)
        })
      });

      if (!response.ok) {
        throw new Error("Operation failed");
      }

      setShowForm(false);
      setEditingPart(null);

      setFormData({
        name: "",
        partNumber: "",
        category: "",
        stock: 0,
        status: "In Stock"
      });

      fetchSpareParts();
    } catch (error) {
      console.error("Error saving spare part:", error);
      alert("Failed to save spare part");
    }
  };

  const handleEdit = (part) => {
    setEditingPart(part);

    setFormData({
      name: part.name,
      partNumber: part.partNumber,
      category: part.category,
      stock: part.stock,
      status: part.status
    });

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this spare part?"
    );

    if (!confirmDelete) return;

    try {
      const response = await apiFetch(
        `/api/spare-parts/${id}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      fetchSpareParts();
    } catch (error) {
      console.error("Error deleting spare part:", error);
      alert("Failed to delete spare part");
    }
  };

  return (
    <div className="page-content">

      <BackToDashboard />

      <div className="page-header">
        <div>
          <h1>Spare Parts</h1>
          <p>Manage spare parts inventory</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setEditingPart(null);

            setFormData({
              name: "",
              partNumber: "",
              category: "",
              stock: 0,
              status: "In Stock"
            });

            setShowForm(true);
          }}
        >
          + Add Spare Part
        </button>
      </div>

      {showForm && (
        <div className="content-card customer-form-card">

          <h2>
            {editingPart ? "Edit Spare Part" : "Add Spare Part"}
          </h2>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="name"
              placeholder="Part Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="partNumber"
              placeholder="Part Number"
              value={formData.partNumber}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="stock"
              placeholder="Stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              required
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>

            <div>
              <button type="submit" className="primary-button">
                {editingPart ? "Update Spare Part" : "Save Spare Part"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPart(null);
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
          <p>Loading spare parts...</p>
        ) : (
          <div className="customer-table">

            <div className="customer-row table-heading">
              <span>Part Name</span>
              <span>Part Number</span>
              <span>Category</span>
              <span>Stock</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {spareParts.map((part) => (
              <div
                className="customer-row"
                key={part._id}
              >
                <span>{part.name}</span>
                <span>{part.partNumber}</span>
                <span>{part.category}</span>
                <span>{part.stock}</span>

                <span
                  className={`status ${
                    part.status === "In Stock"
                      ? "active-status"
                      : part.status === "Low Stock"
                      ? "pending"
                      : "progress"
                  }`}
                >
                  {part.status}
                </span>

                <span>
                  <button onClick={() => handleEdit(part)}>
                    Edit
                  </button>

                  <button onClick={() => handleDelete(part._id)}>
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

export default SpareParts;