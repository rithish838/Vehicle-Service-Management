
const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
    vehicle: {
        type: String,
        required: true
    },

    registration: {
        type: String,
        required: true
    },

    owner: {
        type: String,
        required: true
    },

    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        default: null
    },

    lastService: {
        type: String,
        required: true
    },

    status: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
