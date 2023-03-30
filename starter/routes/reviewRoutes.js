const express = require("express");
const router = express.Router();
const auth = require("../middleware/authentication"); //middleware for authentication of user
const review = require("../Methods/reviewController");

router
  .route("/")
  .post(auth.authenticateUser, review.createReview)
  .get(review.getAllReviews); // No need to attach user (as this is reviews only and anyone can access it)

router
  .route("/:id")
  .get(review.getSingleReview) // No need to attach user
  .patch(
    auth.authenticateUser,
    //authorizePermissions("admin"),
    review.updateReview
  )
  .delete(
    auth.authenticateUser,
    //authorizePermissions("admin"),
    review.deleteReview
  );

module.exports = router;
