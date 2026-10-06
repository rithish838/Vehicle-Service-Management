
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Customer = require("./models/Customer");
const Vehicle = require("./models/Vehicle");
const Service = require("./models/Service");
const Mechanic = require("./models/Mechanic");
const SparePart = require("./models/SparePart");
const Billing = require("./models/Billing");
const User = require("./models/User");
const authRoutes = require("./routes/auth");
const customerPortalRoutes = require("./routes/customerPortal");
const { authenticate, requireRole } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/vehicle_service_management";

// MongoDB connection
mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Vehicle Service Management Backend is running!"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/customer-portal", authenticate, requireRole("customer"), customerPortalRoutes);
app.use("/api", authenticate, requireRole("admin"));

function linkCustomerReference(field) {
    return async (req, res, next) => {
        delete req.body.customerId;
        if (!Object.prototype.hasOwnProperty.call(req.body, field)) {
            return next();
        }

        const name = String(req.body[field] || "").trim();
        if (!name) {
            req.body.customerId = null;
            return next();
        }

        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        try {
            const customers = await Customer.find({
                name: new RegExp(`^${escapedName}$`, "i")
            }).select("_id").limit(2);

            if (customers.length > 1) {
                return res.status(409).json({
                    message: "Customer name is not unique; record cannot be linked safely"
                });
            }

            req.body.customerId = customers[0]?._id || null;
            next();
        } catch (error) {
            next(error);
        }
    };
}

// ===============================
// CUSTOMERS API - MongoDB
// ===============================

app.get("/api/customers", async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (error) {
        console.error("Error fetching customers:", error);

        res.status(500).json({
            message: "Failed to fetch customers"
        });
    }
});

// CREATE customer
app.post("/api/customers", async (req, res) => {
    try {
        const customerData = { ...req.body };
        delete customerData.userId;
        const customer = new Customer(customerData);
        const savedCustomer = await customer.save();

        res.status(201).json(savedCustomer);
    } catch (error) {
        console.error("Error creating customer:", error);

        res.status(500).json({
            message: "Failed to create customer"
        });
    }
});


// UPDATE customer
app.put("/api/customers/:id", async (req, res) => {
    try {
        const customerData = { ...req.body };
        delete customerData.userId;
        const existingCustomer = await Customer.findById(req.params.id);
        if (!existingCustomer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        if (existingCustomer.userId && customerData.email) {
            const accountEmail = customerData.email.trim().toLowerCase();
            const emailInUse = await User.exists({
                email: accountEmail,
                _id: { $ne: existingCustomer.userId }
            });
            if (emailInUse) {
                return res.status(409).json({ message: "That email already belongs to another account" });
            }
        }

        const updatedCustomer = await Customer.findByIdAndUpdate(
            req.params.id,
            customerData,
            { new: true, runValidators: true }
        );

        if (!updatedCustomer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        if (updatedCustomer.userId && customerData.email) {
            await User.updateOne(
                { _id: updatedCustomer.userId },
                { $set: { email: customerData.email.trim().toLowerCase() }, $inc: { tokenVersion: 1 } }
            );
        }

        res.json(updatedCustomer);
    } catch (error) {
        console.error("Error updating customer:", error);

        res.status(500).json({
            message: "Failed to update customer"
        });
    }
});


// DELETE customer
app.delete("/api/customers/:id", async (req, res) => {
    try {
        const deletedCustomer = await Customer.findByIdAndDelete(
            req.params.id
        );

        if (!deletedCustomer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        await User.deleteOne({ customerId: deletedCustomer._id });

        res.json({
            message: "Customer deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting customer:", error);

        res.status(500).json({
            message: "Failed to delete customer"
        });
    }
});

// ===============================
// VEHICLES API - MongoDB
// ===============================

app.get("/api/vehicles", async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        res.json(vehicles);
    } catch (error) {
        console.error("Error fetching vehicles:", error);

        res.status(500).json({
            message: "Failed to fetch vehicles"
        });
    }
});

// CREATE vehicle
app.post("/api/vehicles", linkCustomerReference("owner"), async (req, res) => {
    try {
        const vehicle = new Vehicle(req.body);
        const savedVehicle = await vehicle.save();

        res.status(201).json(savedVehicle);
    } catch (error) {
        console.error("Error creating vehicle:", error);

        res.status(500).json({
            message: "Failed to create vehicle"
        });
    }
});


// UPDATE vehicle
app.put("/api/vehicles/:id", linkCustomerReference("owner"), async (req, res) => {
    try {
        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedVehicle) {
            return res.status(404).json({
                message: "Vehicle not found"
            });
        }

        res.json(updatedVehicle);
    } catch (error) {
        console.error("Error updating vehicle:", error);

        res.status(500).json({
            message: "Failed to update vehicle"
        });
    }
});


// DELETE vehicle
app.delete("/api/vehicles/:id", async (req, res) => {
    try {
        const deletedVehicle = await Vehicle.findByIdAndDelete(
            req.params.id
        );

        if (!deletedVehicle) {
            return res.status(404).json({
                message: "Vehicle not found"
            });
        }

        res.json({
            message: "Vehicle deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting vehicle:", error);

        res.status(500).json({
            message: "Failed to delete vehicle"
        });
    }
});

// ===============================
// SERVICES API
// ===============================

app.get("/api/services", async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (error) {
        console.error("Error fetching services:", error);

        res.status(500).json({
            message: "Failed to fetch services"
        });
    }
});

// CREATE service
app.post("/api/services", linkCustomerReference("customer"), async (req, res) => {
    try {
        const service = new Service(req.body);
        const savedService = await service.save();

        res.status(201).json(savedService);
    } catch (error) {
        console.error("Error creating service:", error);

        res.status(500).json({
            message: "Failed to create service"
        });
    }
});


// UPDATE service
app.put("/api/services/:id", linkCustomerReference("customer"), async (req, res) => {
    try {
        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedService) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.json(updatedService);
    } catch (error) {
        console.error("Error updating service:", error);

        res.status(500).json({
            message: "Failed to update service"
        });
    }
});


// DELETE service
app.delete("/api/services/:id", async (req, res) => {
    try {
        const deletedService = await Service.findByIdAndDelete(
            req.params.id
        );

        if (!deletedService) {
            return res.status(404).json({
                message: "Service not found"
            });
        }

        res.json({
            message: "Service deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting service:", error);

        res.status(500).json({
            message: "Failed to delete service"
        });
    }
});

// ===============================
// MECHANICS API
// ===============================

app.get("/api/mechanics", async (req, res) => {
    try {
        const mechanics = await Mechanic.find();
        res.json(mechanics);
    } catch (error) {
        console.error("Error fetching mechanics:", error);

        res.status(500).json({
            message: "Failed to fetch mechanics"
        });
    }
});

// CREATE mechanic
app.post("/api/mechanics", async (req, res) => {
    try {
        const mechanic = new Mechanic(req.body);
        const savedMechanic = await mechanic.save();

        res.status(201).json(savedMechanic);
    } catch (error) {
        console.error("Error creating mechanic:", error);

        res.status(500).json({
            message: "Failed to create mechanic"
        });
    }
});


// UPDATE mechanic
app.put("/api/mechanics/:id", async (req, res) => {
    try {
        const updatedMechanic = await Mechanic.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedMechanic) {
            return res.status(404).json({
                message: "Mechanic not found"
            });
        }

        res.json(updatedMechanic);
    } catch (error) {
        console.error("Error updating mechanic:", error);

        res.status(500).json({
            message: "Failed to update mechanic"
        });
    }
});


// DELETE mechanic
app.delete("/api/mechanics/:id", async (req, res) => {
    try {
        const deletedMechanic = await Mechanic.findByIdAndDelete(
            req.params.id
        );

        if (!deletedMechanic) {
            return res.status(404).json({
                message: "Mechanic not found"
            });
        }

        res.json({
            message: "Mechanic deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting mechanic:", error);

        res.status(500).json({
            message: "Failed to delete mechanic"
        });
    }
});

// ===============================
// SPARE PARTS API
// ===============================

app.get("/api/spare-parts", async (req, res) => {
    try {
        const spareParts = await SparePart.find();
        res.json(spareParts);
    } catch (error) {
        console.error("Error fetching spare parts:", error);

        res.status(500).json({
            message: "Failed to fetch spare parts"
        });
    }
});

// CREATE spare part
app.post("/api/spare-parts", async (req, res) => {
    try {
        const sparePart = new SparePart(req.body);
        const savedSparePart = await sparePart.save();

        res.status(201).json(savedSparePart);
    } catch (error) {
        console.error("Error creating spare part:", error);

        res.status(500).json({
            message: "Failed to create spare part"
        });
    }
});


// UPDATE spare part
app.put("/api/spare-parts/:id", async (req, res) => {
    try {
        const updatedSparePart = await SparePart.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedSparePart) {
            return res.status(404).json({
                message: "Spare part not found"
            });
        }

        res.json(updatedSparePart);
    } catch (error) {
        console.error("Error updating spare part:", error);

        res.status(500).json({
            message: "Failed to update spare part"
        });
    }
});


// DELETE spare part
app.delete("/api/spare-parts/:id", async (req, res) => {
    try {
        const deletedSparePart = await SparePart.findByIdAndDelete(
            req.params.id
        );

        if (!deletedSparePart) {
            return res.status(404).json({
                message: "Spare part not found"
            });
        }

        res.json({
            message: "Spare part deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting spare part:", error);

        res.status(500).json({
            message: "Failed to delete spare part"
        });
    }
});
// ===============================
// BILLING API
// ===============================

app.get("/api/billing", async (req, res) => {
    try {
        const billing = await Billing.find();
        res.json(billing);
    } catch (error) {
        console.error("Error fetching billing:", error);

        res.status(500).json({
            message: "Failed to fetch billing"
        });
    }
});

// CREATE billing
app.post("/api/billing", linkCustomerReference("customer"), async (req, res) => {
    try {
        const bill = new Billing(req.body);
        const savedBill = await bill.save();

        res.status(201).json(savedBill);
    } catch (error) {
        console.error("Error creating billing:", error);

        res.status(500).json({
            message: "Failed to create billing"
        });
    }
});


// UPDATE billing
app.put("/api/billing/:id", linkCustomerReference("customer"), async (req, res) => {
    try {
        const updatedBill = await Billing.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedBill) {
            return res.status(404).json({
                message: "Billing record not found"
            });
        }

        res.json(updatedBill);
    } catch (error) {
        console.error("Error updating billing:", error);

        res.status(500).json({
            message: "Failed to update billing"
        });
    }
});


// DELETE billing
app.delete("/api/billing/:id", async (req, res) => {
    try {
        const deletedBill = await Billing.findByIdAndDelete(
            req.params.id
        );

        if (!deletedBill) {
            return res.status(404).json({
                message: "Billing record not found"
            });
        }

        res.json({
            message: "Billing record deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting billing:", error);

        res.status(500).json({
            message: "Failed to delete billing"
        });
    }
});

// ===============================
// REPORTS API
// ===============================

app.get("/api/reports", (req, res) => {
    res.json({
        totalServices: 72,
        totalRevenue: 184500,
        vehiclesServiced: 58,
        activeMechanics: 12,

        monthlyServices: [
            { month: "January", count: 42 },
            { month: "February", count: 48 },
            { month: "March", count: 55 },
            { month: "April", count: 51 },
            { month: "May", count: 63 },
            { month: "June", count: 72 }
        ],

        serviceStatus: [
            { status: "Completed", count: 48 },
            { status: "In Progress", count: 14 },
            { status: "Pending", count: 10 }
        ]
    });
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
