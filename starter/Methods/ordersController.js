const codes = require("http-status-codes");
const Product = require("../models/Products");
// const codes = require("http-status-codes");
const errors = require("../errors");
const Order = require("../models/Order");

async function getAllOrders(req, res) {
  const orders = await Order.find({});
  res.status(codes.StatusCodes.OK).json({ orders, count: orders.length });
}

async function getSingleOrder(req, res) {
  const order = await Order.findOne({ _id: req.params.id });
  //console.log(order.user.toString(), req.user.userId);
  if (order) {
    if (order.user.toString() === req.user.userId) {
      res.status(codes.StatusCodes.OK).json({ order });
    } else new errors.BadRequestError("Not authorized to update the review.");
  } else
    throw new errors.BadRequestError(
      `No order with id: ${req.params.id} found.`
    );
}
async function getCurrentUserOrders(req, res) {
  const orders = await Order.find({ user: req.user.userId });
  res.status(codes.StatusCodes.OK).json({ orders, count: orders.length });
}

async function createOrder(req, res) {
  //console.log(`HIi`);
  if (!req.body.items || req.body.items.length < 1)
    // Checking if cart is empty or not
    throw new errors.BadRequestError("No items in cart.");
  if (!req.body.tax || !req.body.shippingFee)
    throw new errors.BadRequestError(
      `Please provide both tax and shipping fee`
    );

  let orderItems = [];
  let subTotal = 0;
  let counter = 0;
  //iterating each product/item from cart23999
  let item;
  for (item of req.body.items) {
    // for of is used bcz we cannot use await function inside foreach or map functions
    const productFromDB = await Product.findOne({ _id: item.product });
    if (!productFromDB)
      //check if product exist in the db
      throw new errors.BadRequestError(
        `No product with id : ${item.product} found.`
      );
    const { name, price, image, _id } = productFromDB; //if yes populating data in orders

    const singleItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    // counter = orderItems.length
    orderItems[counter] = singleItem; //order items with
    counter++;
    subTotal += item.amount * price;
  }
  console.log(orderItems);
  console.log(subTotal);

  const { tax, shippingFee } = req.body;
  //calculate total
  const total = subTotal + tax + shippingFee;

  // get client secret
  const paymentIntent = await fakeStipeAPI({
    amount: total,
    currency: "usd",
  });
  const order = await Order.create({
    orderItems,
    total,
    shippingFee,
    subTotal,
    tax,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  res
    .status(codes.StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
}

async function updateOrder(req, res) {
  const order = await Order.findOne({ _id: req.params.id });
  if (order) {
    if (order.user.toString() === req.user.userId) {
      order.paymentIntentId = req.body.paymentIntentId;
      order.status = "paid";
      await order.save();
      res.status(codes.StatusCodes.OK).json({ order });
    } else new errors.BadRequestError("Not authorized to update the review.");
  } else
    throw new errors.BadRequestError(
      `No order with id: ${req.params.id} found.`
    );
}

async function fakeStipeAPI({ amount, currency }) {
  const client_secret = "randomvalue";
  return { client_secret, amount };
}

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
