const mongoose = require("mongoose");

const mechanicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    specialization: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    activeJobs: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Mechanic", mechanicSchema, "Mechanics");