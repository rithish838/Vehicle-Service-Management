const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    serviceId: {
        type: String,
        required: true
    },

    vehicle: {
        type: String,
        required: true
    },

    customer: {
        type: String,
        required: true
    },

    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        default: null
    },

    serviceType: {
        type: String,
        required: true
    },

    mechanic: {
        type: String,
        required: true
    },

    status: {
        type: String,
        required: true
    },

    requestSource: {
        type: String,
        enum: ["admin", "customer"],
        default: "admin"
    },

    preferredDate: {
        type: String,
        default: ""
    },

    notes: {
        type: String,
        maxlength: 1000,
        default: ""
    },

    confirmationEmailStatus: {
        type: String,
        enum: ["not_requested", "pending", "sent", "not_configured", "failed"],
        default: "not_requested"
    },

    confirmationEmailSentAt: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model("Service", serviceSchema, "Services");