const express = require("express");
const router = express.Router();
const product = require("../Methods/productController");
const auth = require("../middleware/authentication"); //middleware for authentication of user
const { authorizePermissions } = require("../middleware/authentication");
const reviews = require("../Methods/reviewController");

router //Access -> admin
  .route("/")
  .post(
    auth.authenticateUser,
    authorizePermissions("admin"),
    product.createProduct
  );

router.route("/").get(auth.authenticateUser, product.getAllProducts);

router //Access -> admin
  .route("/uploadImage")
  .post(
    auth.authenticateUser,
    authorizePermissions("admin"),
    product.uploadImage
  );

router.route("/:id").get(auth.authenticateUser, product.getSingleProduct);

router
  .route("/:id") //Access -> admin
  .patch(
    auth.authenticateUser,
    authorizePermissions("admin"),
    product.updateProduct
  );

router
  .route("/:id") //Access -> admin
  .delete(
    auth.authenticateUser,
    authorizePermissions("admin"),
    product.deleteProduct
  );

router.route("/:id/reviews").get(reviews.getSingleProductReview);

module.exports = router;
