const cartModel = require("../models/cartModel");
const carModel = require("../models/carModel");
const userModel = require("../models/userModel");
const orderModel = require("../models/orderModel");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
require("dotenv").config();

//Function to add to cart
const addToCart = async (req, res) => {
    try {
      const { userId, carId } = req.params;
  
      // Find the user by ID (for registered users)
      let user = null;
      if (userId) {
        user = await userModel.findById(userId);
        if (!user) {
          return res.status(400).json({ message: "User does not exist." });
        }
      }
  
      // Find the car by ID
      const car = await carModel.findById(carId);
      if (!car) {
        return res.status(400).json({ message: "Car not found." });
      }
  
      // Check if the car is available
      if (!car.available) {
        return res.status(400).json({ message: "This car is not available." });
      }
  
      // For guest users, find or create a cart using a session-based guestCartId
      let cart;
      if (userId) {
        cart = await cartModel.findOne({ userId: userId });
        if (!cart) {
          cart = new cartModel({ userId: user._id, cars: [], total: 0 });
        }
      } else {
        const guestCartId = req.session.guestCartId;
        cart = await cartModel.findOne({ guestCartId });
        if (!cart) {
          cart = new cartModel({ guestCartId, cars: [], total: 0 });
        }
      }
  
      // Check if the car is already in the cart
      const existingCar = cart.cars.find((item) => item.carId.equals(carId));
  
      if (existingCar) {
        return res.status(400).json({ message: "This car is already in the cart." });
      } else {
        // Add the car to the cart
        const newItem = {
          carId,
          price: car.price, // Use the fixed price
          carName: car.name,
          carImage: car.image,
          sub_total: car.price,
        };
  
        cart.cars.push(newItem);
      }
  
      // Recalculate the total price of the cart
      cart.total = cart.cars.reduce((acc, item) => acc + item.sub_total, 0);
  
      // Save the updated cart to the database
      await cart.save();
  
      res.status(200).json({ message: "Car added to cart successfully.", data: cart });
    } catch (err) {
      res.status(500).json({ message: `Error adding to cart: ${err.message}` });
    }
  };
  
//Function to update cart quantity
const updateCart= async (req, res) => {
    try {
      const { carId } = req.params;
      const { quantityChange } = req.body; 
  
      // Find the car by ID
      const car = await cartModel.findById(carId);
      if (!car) {
        return res.status(404).json({ message: "Car not found." });
      }
  
      // Ensure quantityChange is provided
      if (!quantityChange) {
        return res.status(400).json({ message: "Quantity change value is required." });
      }
  
      // Update the available quantity
      const newQuantity = car.available + quantityChange;
  
      // Ensure the quantity doesn't fall below zero
      if (newQuantity < 0) {
        return res.status(400).json({ message: "Insufficient quantity available." });
      }
  
      car.available = newQuantity;
  
      // Save the updated car to the database
      await car.save();
  
      res.status(200).json({
        message: "Car quantity updated successfully.",
        data: car,
      });
    } catch (err) {
      res.status(500).json({ message: `Error updating car quantity: ${err.message}` });
    }
  };
  

//Function to remove specific product from cart
const removeFromCart = async (req, res) => {
    try {
      const { userId, carId } = req.params;
  
      let cart = userId 
        ? await cartModel.findOne({ userId: userId })
        : await cartModel.findOne({ guestCartId: req.session.guestCartId });
  
      if (!cart) {
        return res.status(400).json({ message: "Cart not found." });
      }
  
      // Remove the car from the cart
      cart.cars = cart.cars.filter((item) => !item.carId.equals(carId));
  
      // Recalculate the total price of the cart
      cart.total = cart.cars.reduce((acc, item) => acc + item.sub_total, 0);
  
      await cart.save();
  
      res.status(200).json({ message: "Car removed from cart successfully.", data: cart });
    } catch (err) {
      res.status(500).json({ message: `Error removing car from cart: ${err.message}` });
    }
  };
  

//Function to view cart contents
const viewCart = async (req, res) => {
    try {
      const { userId } = req.params;
  
      let cart = userId 
        ? await cartModel.findOne({ userId: userId })
        : await cartModel.findOne({ guestCartId: req.session.guestCartId });
  
      if (!cart) {
        return res.status(200).json({ message: "Cart is empty.", data: [] });
      }
  
      res.status(200).json({ message: "Cart retrieved successfully.", data: cart });
    } catch (err) {
      res.status(500).json({ message: `Error retrieving cart: ${err.message}` });
    }
  };
  

//Function clear all contents in a cart
const deleteCart = async (req, res) => {
  try {
    const { userId } = req.params;
    let cart = await cartModel.findOneAndDelete({ userId: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json({ message: "Cart deleted successfully." });
  } catch (err) {
    // Handle any errors that occur during the process
    res
      .status(500)
      .json({ message: `Error removing from cart: ${err.message}` });
  }
};

//Function to checkout a cart
const checkout = async (req, res) => {
    try {
      const { userId, guestCartId } = req.body;
  
      // Retrieve the user's or guest's cart
      let cart;
      if (userId) {
        cart = await cartModel.findOne({ userId });
      } else if (guestCartId) {
        cart = await cartModel.findOne({ guestCartId });
      }
  
      // If cart doesn't exist, return an error
      if (!cart || cart.cars.length === 0) {
        return res.status(400).json({ message: "Cart is empty or not found." });
      }
  
      // Validate the availability of each car in the cart
      let totalCost = 0;
      for (let cartItem of cart.cars) {
        const car = await carModel.findById(cartItem.carId);
  
        // Check if car exists
        if (!car) {
          return res.status(400).json({ message: `Car ${cartItem.carName} not found.` });
        }
  
        // Check if the car is still available
        if (car.available <= 0) {
          return res.status(400).json({ message: `Car ${car.name} is out of stock.` });
        }
  
        // Ensure enough quantity is available
        if (car.available < 1) {
          return res
            .status(400)
            .json({ message: `Insufficient quantity for ${car.name}.` });
        }
  
        // Deduct from available cars
        car.available -= 1;
        await car.save();
  
        // Add to total cost
        totalCost += cartItem.sub_total;
      }
  
      // Create a new order for the user or guest
      const order = new orderModel({
        userId: userId ? userId : null, // Save user ID if available
        guestCartId: guestCartId ? guestCartId : null, // Save guestCartId if available
        cars: cart.cars, // All the cars in the cart
        totalCost,
        status: "Pending", // Initial status of the order
      });
  
      // Save the order
      await order.save();
  
      // Clear the user's or guest's cart after successful checkout
      cart.cars = [];
      cart.total = 0;
      await cart.save();
  
      res.status(200).json({
        message: "Checkout successful.",
        orderDetails: order,
      });
    } catch (err) {
      res.status(500).json({ message: `Checkout failed: ${err.message}` });
    }
  };
  


// Function to get one order
const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if the orderId is a valid ObjectId
    // if (!mongoose.Types.ObjectId.isValid(orderId)) {
    //   return res.status(400).json({ error: "Invalid Order ID" });
    // }

    const order = await orderModel
      .findOne({ orderId })
      .populate("products")
      .populate("userId");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const address = await formModel.findOne({ userId: order.userId });

    if (!address) {
      return res.status(404).json({ error: "Address not found" });
    }

    res.status(200).json({
      order,
      address,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error: " + error.message });
  }
};

// Function to get all orders
const getAllOrders = async (req, res) => {
  try {
    // Find all orders, populate user and product details if needed
    const orders = await orderModel
      .find()
      .populate("userId")
      .populate("products");

    // Send the list of orders as a response
    res.status(200).json({
      message: "Orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error: " + error.message,
    });
  }
};

//function for users to get ordered products
const getOrderProducts = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Find the order by ID and populate the product details
    const order = await orderModel
      .findOne({ orderId })
      .populate("products.productId");

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Return the products in the order
    return res.status(200).json({
      message: "Products retrieved successfully.",
      products: order.products,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Error fetching products: ${err.message}` });
  }
};

//function to return product
const returnProduct = async (req, res) => {
  try {
    const {
      orderId,
      productId,
      size,
      quantity,
      reasonForReturn,
      productCondition,
      additionalComments,
    } = req.body;

    // Find the order by ID and populate the product details
    const order = await orderModel
      .findOne({ orderId })
      .populate("products.productId");

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Find the product in the order
    const productInOrder = order.products.find((item) => {
      const isSameProduct = item.productId._id.equals(productId);
      const isSameSize = size ? item.size === size : item.size === "N/A";
      return isSameProduct && isSameSize;
    });

    if (!productInOrder) {
      return res
        .status(404)
        .json({ message: "Product not found in this order." });
    }

    // Calculate the total quantity already returned for this product and Check if the quantity is valid across all returns
    // 
    const totalReturnedQuantity = order.returns
      .filter(
        (r) => r.productId.equals(productId) && (size ? r.size === size : true)
      )
      .reduce((total, r) => total + r.quantity, 0);

    const remainingQuantity = productInOrder.quantity - totalReturnedQuantity;

    if (quantity > remainingQuantity) {
      const errorMessage =
        remainingQuantity === 0
          ? `You have no more products to be returned for ${productInOrder.productId.itemName}(s) .`
          : `You can only return ${remainingQuantity} more ${productInOrder.productId.itemName}(s).`;
      return res.status(400).json({ message: errorMessage });
    }

    // Validate the return window (e.g., 30 days from order date)
    const returnWindow = 30 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const orderDate = new Date(order.orderDate);
    const isWithinReturnWindow = now - orderDate <= returnWindow;

    if (!isWithinReturnWindow) {
      return res.status(400).json({ message: "Return period has expired." });
    }

    // Record the return in the order with status "Pending"
    order.returns.push({
      productId: productInOrder.productId._id,
      size: productInOrder.size || "N/A",
      quantity,
      reasonForReturn,
      productCondition,
      additionalComments,
      status: "Pending",
    });

    // Save the updated order
    await order.save();

    return res.status(200).json({
      message: "Return request submitted successfully and is pending approval.",
      returns: order.returns,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: `Error processing return: ${err.message}` });
  }
};

//function to handle return processing
const processReturnRequest = async (req, res) => {
  try {
    const { orderId, returnId } = req.params;
    const { status } = req.body;

    // Validate the status
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    // Find the order by ID
    const order = await orderModel.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Find the return request by ID
    const returnRequest = order.returns.id(returnId);

    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found." });
    }

    // Update the return request status
    returnRequest.status = status;

    // If the return request is approved, update the stock
    if (status === "Approved") {
      const product = await productModel.findById(returnRequest.productId);

      if (product) {
        if (returnRequest.size) {
          const sizeDetails = product.sizes.find(
            (s) => s.size === returnRequest.size
          );
          if (sizeDetails) {
            sizeDetails.stock =
              Number(sizeDetails.stock) + Number(returnRequest.quantity);
          }
        } else {
          product.stock =
            Number(product.stock) + Number(returnRequest.quantity);
        }

        await product.save();
      }
    }

    await order.save();

    return res.status(200).json({
      message: `Return request has been ${status.toLowerCase()}.`,
      returnRequest,
    });
  } catch (err) {
    return res.status(500).json({
      message: `Error processing return request: ${err.message}`,
    });
  }
};

//function to track order
const trackOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Find the order by tracking ID
    const order = await orderModel.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Assuming you have a field `status` in your order model that tracks the current status
    const statusUpdates = order.statusUpdates || []; //an array of status changes
    const currentStatus = order.status;

    return res.status(200).json({
      message: "Order retrieved successfully.",
      order: {
        products: order.products,
        total: order.total,
        status: currentStatus,
        statusUpdates: statusUpdates,
        movementLogs: order.movementLogs,
        orderDate: order.orderDate,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: `Error tracking order: ${err.message}`,
    });
  }
};

//function to update order movement
const updateOrderMovement = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { location, details, status } = req.body;

    // Find the order by tracking ID
    const order = await orderModel.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Update movement logs
    if (location) {
      order.movementLogs.push({
        location,
        details,
        timestamp: new Date(),
      });
    }

    // Optionally update the status if provided
    if (status && status !== order.status) {
      order.status = status;
      order.statusUpdates.push({
        status,
        timestamp: new Date(),
      });
    }

    // Save the updated order
    await order.save();

    return res.status(200).json({
      message: "Order movement updated successfully.",
      order,
    });
  } catch (err) {
    return res.status(500).json({
      message: `Error updating order movement: ${err.message}`,
    });
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  viewCart,
  deleteCart,
  updateCart,
  checkout,
  getOrderDetails,
  getAllOrders,
  getOrderProducts,
  returnProduct,
  processReturnRequest,
  trackOrder,
  updateOrderMovement,
};
