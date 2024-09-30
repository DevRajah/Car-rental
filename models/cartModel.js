const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to User model if the user is logged in
    required: false, // Optional for guests
  },
  guestCartId: {
    type: String, // A unique session ID for guest users
    required: false, // Optional for registered users
  },
  cars: [
    {
      carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car", // Reference to the Car model
        required: true,
      },
      carName: {
        type: String,
        required: true,
      },
      carImage: [
        {
          public_id: { type: String, required: true },
          url: { type: String, required: true },
        }
      ],
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      sub_total: {
        type: Number,
        required: true,
      },
    },
  ],
  total: {
    type: Number,
    required: true,
    default: 0, 
  },
}, {
  timestamps: true,
});

const cartModel = mongoose.model("Cart", cartSchema);

module.exports = cartModel;
