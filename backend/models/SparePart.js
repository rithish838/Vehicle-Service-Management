const mongoose = require("mongoose");

const sparePartSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    partNumber: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    stock: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("SparePart", sparePartSchema, "SpareParts");