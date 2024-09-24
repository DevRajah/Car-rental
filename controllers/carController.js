const carModel = require("../models/carModel");
const userModel = require("../models/userModel");
const cloudinary = require("../middlewares/cloudinary");

const fs = require("fs");
const path = require("path");

const createCar = async (req, res) => {
  try {
    const { carName, price, available } = req.body;

    // Check if files are uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "No files were uploaded",
      });
    }

    const filePaths = req.files.map((file) => path.resolve(file.path));

    // Check if all files exist
    const allFilesExist = filePaths.every((filePath) =>
      fs.existsSync(filePath)
    );

    if (!allFilesExist) {
      return res.status(400).json({
        message: "One or more uploaded images not found",
      });
    }

    // Upload the images to Cloudinary and collect the results
    const cloudinaryUploads = await Promise.all(
      filePaths.map((filePath) =>
        cloudinary.uploader.upload(filePath, {
          folder: "Product-Images",
        })
      )
    );

    const newCar = new carModel({
      carName,
      images: cloudinaryUploads.map((upload) => ({
        public_id: upload.public_id,
        url: upload.secure_url,
      })),
      price,
      available: available || true, // Default to available
    });

    await newCar.save();
    res
      .status(201)
      .json({ message: "Car created successfully.", data: newCar });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error: " + error.message,
    });
  } finally {
    // Cleanup the uploaded files
    req.files.forEach((file) => {
      const filePath = path.resolve(file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  }
};

const updateCar = async (req, res) => {
  try {
    const { carId } = req.params;
    const { carName, price, available } = req.body;
    // Check if files are uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "No files were uploaded",
      });
    }

    const filePaths = req.files.map((file) => path.resolve(file.path));

    // Check if all files exist
    const allFilesExist = filePaths.every((filePath) =>
      fs.existsSync(filePath)
    );

    if (!allFilesExist) {
      return res.status(400).json({
        message: "One or more uploaded files not found",
      });
    }

    // Upload the images to Cloudinary and collect the results
    const cloudinaryUploads = await Promise.all(
      filePaths.map((filePath) =>
        cloudinary.uploader.upload(filePath, {
          folder: "Car-Images",
        })
      )
    );

    // Find and update the category
    const updatedCar = await carModel.findByIdAndUpdate(
      id,
      {
        carName,
        price,
        available,
        images: cloudinaryUploads.map((upload) => ({
          public_id: upload.public_id,
          url: upload.secure_url,
        })),
      },
      { new: true }
    );

    if (!updatedCar) {
      return res.status(404).json({
        error: "Category not found",
      });
    }

    //   const car = await carModel.findById(carId);
    //   if (!car) {
    //     return res.status(404).json({ message: "Car not found." });
    //   }

    //   if (name) car.name = name;
    //   if (image) car.image = image;
    //   if (price) car.price = price;
    //   if (typeof available !== "undefined") car.available = available;

    //   await car.save();
    res
      .status(200)
      .json({ message: "Car updated successfully.", data: updatedCar });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error: " + error.message,
    });
  } finally {
    // Cleanup the uploaded files
    req.files.forEach((file) => {
      const filePath = path.resolve(file.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  }
};

const deleteCar = async (req, res) => {
  try {
    const { carId } = req.params;

    // Find and delete the car by ID
    const car = await carModel.findByIdAndDelete(carId);

    if (!car) {
      return res.status(404).json({ message: "Car not found." });
    }

    res.status(200).json({
      message: "Car deleted successfully.",
    });
  } catch (err) {
    res.status(500).json({ message: `Error deleting car: ${err.message}` });
  }
};

const getAllCars = async (req, res) => {
  try {
    const cars = await carModel.find();

    res.status(200).json({
      message: "Cars retrieved successfully.",
      data: cars,
    });
  } catch (err) {
    res.status(500).json({ message: `Error retrieving cars: ${err.message}` });
  }
};

const getCarById = async (req, res) => {
  try {
    const { carId } = req.params;

    const car = await carModel.findById(carId);
    if (!car) {
      return res.status(404).json({ message: "Car not found." });
    }

    res.status(200).json({
      message: "Car retrieved successfully.",
      data: car,
    });
  } catch (err) {
    res.status(500).json({ message: `Error retrieving car: ${err.message}` });
  }
};

module.exports = {
  createCar,
  updateCar,
  deleteCar,
  getAllCars,
  getCarById,
};
