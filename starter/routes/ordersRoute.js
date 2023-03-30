const express = require("express");
const router = express.Router();
const auth = require("../middleware/authentication"); //middleware for authentication of user
const { authorizePermissions } = require("../middleware/authentication");
const order = require("../Methods/ordersController");

router.route("/").post(auth.authenticateUser, order.createOrder).get(
  // only admin can access this route
  auth.authenticateUser,
  authorizePermissions("admin"),
  order.getAllOrders
);

router
  .route("/showAllMyOrders")
  .get(auth.authenticateUser, order.getCurrentUserOrders);

router
  .route("/:id")
  .get(auth.authenticateUser, order.getSingleOrder)
  .patch(auth.authenticateUser, order.updateOrder);

module.exports = router;
