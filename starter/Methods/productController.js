const Product = require("../models/Products");
const errors = require("../errors");
const codes = require("http-status-codes");
const { max } = require("lodash");
const path = require("path");

async function createProduct(req, res) {
  //only by admin
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(codes.StatusCodes.CREATED).json({ product });
}

async function getAllProducts(req, res) {
  //by all users
  const products = await Product.find({});
  res.status(codes.StatusCodes.OK).json({ products, count: products.length });
}

async function getSingleProduct(req, res) {
  //by all users
  const productId = req.params.id;
  const product = await Product.findOne({ _id: productId }).populate({
    path: "reviews", //connect reviews virtually bcz we have not referenced reviews in while creating schema
  });
  if (product) res.status(codes.StatusCodes.OK).json({ product });
  else
    throw new errors.BadRequestError(
      `No product found with id : ${productId} found.`
    );
}

async function updateProduct(req, res) {
  //by admin only
  const productId = req.params.id;
  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (product) res.status(codes.StatusCodes.OK).json({ product });
  else
    throw new errors.BadRequestError(`No product found with id : ${id} found.`);
}

async function deleteProduct(req, res) {
  //by admin only
  const productId = req.params.id;
  const product = await Product.findOne({ _id: productId });
  if (product) {
    product.remove(); //triggers pre hook created in model. with name remove
    res.status(codes.StatusCodes.OK).json({ msg: `Success, Product removed` });
  } else
    throw new errors.BadRequestError(`No product found with id : ${id} found.`);
}

async function uploadImage(req, res) {
  //by admin only
  console.log(req.files.image.name.toString());
  if (req.files) {
    if (
      req.files.image.mimetype.startsWith("image") ||
      req.files.image.mimetype.endsWith("jpg") ||
      req.files.image.mimetype.endsWith("jpeg") ||
      req.files.image.mimetype.endsWith("png")
    ) {
      const maxImageSize = 1024 * 1024 * 1024;
      if (req.files.image.size <= maxImageSize) {
        const filePath = path.join(
          //creating a path
          __dirname,
          "../public/uploads/" + `${req.files.image.name}`
        );
        await req.files.image.mv(filePath); // moving/uploading image from front end to server
        res
          .status(codes.StatusCodes.OK)
          .json({ image: `/uploads/${req.files.image.name}` });
      } else
        throw new errors.BadRequestError(
          "File size more than limit size of 10 MB"
        );
    } else throw new errors.BadRequestError("Invalid type");
  } else throw new errors.BadRequestError("No files uploaded.");
}

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  // updateProduct,
  uploadImage,
};
