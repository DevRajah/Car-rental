const router = require("express").Router();

const {createCar,
    updateCar,
    deleteCar,
    getAllCars,
    getCarById } = require("../controllers/carController");
const { authenticate } = require("../middleWares/authentication");
const { upload } = require("../middlewares/multer");


//endpoint to create product category
router.post('/create-car', upload.array('images', 5), authenticate, createCar)

//endpoint to update product category
router.put('/update-car/:id', upload.array('images', 5), updateCar)

//endpoint to get all product categories
router.get('/get-cars', authenticate, getAllCars)

//endpoint to get one category by id
router.get("/get-one-car/:carId", getCarById)

//endpoint to delete category by id
router.delete("/delete-car/:carId", authenticate, deleteCar)


module.exports = router