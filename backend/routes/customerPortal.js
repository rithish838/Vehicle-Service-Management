const express = require("express");
const Customer = require("../models/Customer");
const Vehicle = require("../models/Vehicle");
const Service = require("../models/Service");
const Billing = require("../models/Billing");
const { sendBookingConfirmation } = require("../services/bookingEmail");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const customer = await Customer.findOne({
            _id: req.auth.customerId,
            userId: req.auth.sub
        }).select("name email phone vehicles status");

        if (!customer) {
            return res.status(404).json({ message: "Customer profile not found" });
        }

        const filter = { customerId: customer._id };
        const [vehicles, services, invoices] = await Promise.all([
            Vehicle.find(filter).select("vehicle registration lastService status"),
            Service.find(filter).select("serviceId vehicle serviceType mechanic status preferredDate notes requestSource"),
            Billing.find(filter).select("invoiceId vehicle amount status")
        ]);

        res.json({ customer, vehicles, services, invoices });
    } catch (error) {
        console.error("Customer portal request failed:", error);
        res.status(500).json({ message: "Unable to load customer portal" });
    }
});

router.post("/bookings", async (req, res) => {
    const serviceType = String(req.body.serviceType || "").trim();
    const preferredDate = String(req.body.preferredDate || "").trim();
    const notes = String(req.body.notes || "").trim();

    if (serviceType.length < 2 || serviceType.length > 120) {
        return res.status(400).json({ message: "Choose a valid service type" });
    }
    if (notes.length > 1000) {
        return res.status(400).json({ message: "Notes must be 1000 characters or fewer" });
    }
    if (preferredDate && !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)) {
        return res.status(400).json({ message: "Choose a valid preferred date" });
    }

    try {
        const customer = await Customer.findOne({
            _id: req.auth.customerId,
            userId: req.auth.sub
        });
        if (!customer) {
            return res.status(404).json({ message: "Customer profile not found" });
        }

        if (!req.body.vehicleId || !require("mongoose").isValidObjectId(req.body.vehicleId)) {
            return res.status(400).json({ message: "Choose one of your linked vehicles" });
        }

        const vehicle = await Vehicle.findOne({
            _id: req.body.vehicleId,
            customerId: customer._id
        });
        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found in your account" });
        }

        const request = new Service({
            serviceId: "PENDING",
            vehicle: vehicle.vehicle,
            customer: customer.name,
            customerId: customer._id,
            serviceType,
            mechanic: "To be assigned",
            status: "Pending",
            requestSource: "customer",
            preferredDate,
            notes
        });
        request.serviceId = `REQ-${request._id.toString().slice(-8).toUpperCase()}`;
        await request.save();

        let emailSent = false;
        let emailNotice = "Booking saved, but confirmation email is not configured.";
        try {
            const emailResult = await sendBookingConfirmation({ customer, vehicle, request });
            if (emailResult.sent) {
                request.confirmationEmailStatus = "sent";
                request.confirmationEmailSentAt = new Date();
                emailSent = true;
                emailNotice = `Confirmation email sent to ${customer.email}.`;
            } else {
                request.confirmationEmailStatus = "not_configured";
            }
            await request.save();
        } catch (emailError) {
            console.error(`Booking ${request.serviceId} was saved but email failed:`, emailError);
            request.confirmationEmailStatus = "failed";
            emailNotice = "Booking saved, but the confirmation email could not be sent.";
            await request.save().catch((saveError) => {
                console.error(`Unable to record email status for ${request.serviceId}:`, saveError);
            });
        }

        res.status(201).json({
            message: emailNotice,
            emailSent,
            request: {
                id: request._id,
                serviceId: request.serviceId,
                status: request.status
            }
        });
    } catch (error) {
        console.error("Service booking failed:", error);
        res.status(500).json({ message: "Unable to submit service request" });
    }
});

module.exports = router;
