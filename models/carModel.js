const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
    carName: {
    type: String,
    required: true,
  },
  images:{
    type: Array
    },
  price: {
    type: Number,
    required: true,
    min: 0, 
  },
  available: {
    type: Number,
    required: true,
    min: 0, // Ensure that available quantity is at least 0
  },
  status: {
    type: String,
    enum: ["available", "unavailable"],
    default: "available",
  },
}, {
  timestamps: true,
});

const carModel = mongoose.model("Car", carSchema);

module.exports = carModel;
