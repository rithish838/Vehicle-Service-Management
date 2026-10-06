const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema({
    invoiceId: {
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

    vehicle: {
        type: String,
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Billing", billingSchema, "Billing");