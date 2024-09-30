const express = require("express")
const cartRouter=express.Router()

const {addToCart,
    updateCart,
     removeFromCart,
      viewCart,
       deleteCart,
       checkout,
       getOrderDetails,
       getAllOrders,
       getOrderProducts,
       returnProduct,
       processReturnRequest,
       trackOrder,
       updateOrderMovement} = require("../controllers/cartController")
const {authenticate} = require("../middlewares/authentication")

cartRouter.post('cart/add/:userId/:carId',  authenticate, addToCart);
cartRouter.delete('cart/remove/:userId/:carId', authenticate, removeFromCart);
cartRouter.get('cart/view/:userId', authenticate, viewCart);
cartRouter.put('cart/update/:userId/:carId', authenticate, updateCart);
cartRouter.delete('cart/delete/:userId', authenticate, deleteCart);
 cartRouter.post('/checkout/:userId', checkout);
 cartRouter.get("/order-details/:orderId", getOrderDetails)
 cartRouter.get('/orders', getAllOrders);
 cartRouter.get("/ordered-products", getOrderProducts)
 cartRouter.post('/return-product', returnProduct);
 cartRouter.post('/process-return-request/:orderId/:returnId', processReturnRequest);
 cartRouter.get('/track-order', trackOrder);
 cartRouter.post('/update-movement/:orderId', updateOrderMovement);


module.exports = cartRouter