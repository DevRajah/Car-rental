const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Optional for guest orders
  },
  guestCartId: {
    type: String, // ID for guest orders
    required: false, // Optional for user orders
  },
  cars: [
    {
      carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car",
        required: true,
      },
      carName: {
        type: String,
        required: true,
      },
      carImage: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      sub_total: {
        type: Number,
        required: true,
      },
    },
  ],
  totalCost: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Processing", "Completed", "Cancelled"],
    default: "Pending",
  },
}, {
  timestamps: true,
});

const orderModel = mongoose.model("Order", orderSchema);

module.exports = orderModel;
