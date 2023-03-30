const Product = require("../models/Products");
const Review = require("../models/Review");
const codes = require("http-status-codes");
const errors = require("../errors");

async function createReview(req, res) {
  const isProductValid = await Product.findOne({ _id: req.body.product });
  if (isProductValid) {
    const reviewAlreadySubmitted = await Review.findOne({
      product: req.body.product,
      user: req.user.userId,
    }); //Checking if review is submitted by single user and for single product
    //console.log(reviewAlreadySubmitted);
    if (!reviewAlreadySubmitted) {
      req.body.user = req.user.userId;
      const review = await Review.create(req.body);
      res.status(codes.StatusCodes.OK).json({ review });
    } else throw new errors.BadRequestError("Review already submitted!");
  } else
    throw new errors.BadRequestError(
      `No product with id : ${req.body.product} found.`
    );
}

async function getAllReviews(req, res) {
  const reviews = await Review.find({})
    .populate({
      path: "product", //product is name of the property used while creating schema
      select: "name company price", //'name company price' name of the property used while creating schema/ select includes the properties to find
    })
    .populate({ path: "user", select: "name role" }); //used to populate the data from other database which has been referenced while creating schema.

  res.status(codes.StatusCodes.OK).json({ reviews, count: reviews.length });
}

async function getSingleReview(req, res) {
  const id = req.params.id;
  const review = await Review.findOne({ _id: id });
  if (review)
    res
      .status(codes.StatusCodes.OK)
      .json({ review })
      .populate({ path: "user", select: "name" });
  else throw new errors.BadRequestError(`No review with id : ${id} found.`);
}

async function updateReview(req, res) {
  const id = req.params.id;
  // console.log(re);
  const review = await Review.findOne({ _id: id });
  if (review) {
    console.log(review);
    //Only the user who has written the review has access to update
    if (req.user.userId === review.user.toString()) {
      if (req.body.rating) review.rating = req.body.rating;
      if (req.body.title) review.title = req.body.title;
      if (req.body.comment) review.comment = req.body.comment;

      //trigger pre.save hook
      await review.save();

      res
        .status(codes.StatusCodes.OK)
        .json({ msg: `Success, review updated`, review });
    } else
      throw new errors.BadRequestError("Not authorized to update the review.");
  } else throw new errors.BadRequestError(`No review with id : ${id} found.`);
}

async function deleteReview(req, res) {
  const id = req.params.id;
  const review = await Review.findOne({ _id: id });
  if (review) {
    //Only the user who has written the review has access to delete
    if (req.user.userId === review.user.toString()) {
      await review.remove(); //trigger pre.remove hook
      res.status(codes.StatusCodes.OK).json({ msg: `Success, review removed` });
    } else
      throw new errors.BadRequestError("Not authorized to delete the review.");
  } else throw new errors.BadRequestError(`No review with id : ${id} found.`);
}

async function getSingleProductReview(req, res) {
  //anyone can access it
  const productId = req.params.id;
  const reviews = await Review.find({ product: productId });
  res.status(codes.StatusCodes.OK).json({ reviews, count: reviews.length });
}

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReview,
};
