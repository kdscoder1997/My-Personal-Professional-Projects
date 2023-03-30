const express = require("express");
const app = express();
const codes = require("http-status-codes");
const rateLimiter = require("express-rate-limit");
require("./db/connect");
require("dotenv").config();
require("express-async-errors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
//Routes
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const orderRouter = require("./routes/ordersRoute");
//error handler middleware
const notFound = (req, res) =>
  res.status(codes.StatusCodes.NOT_FOUND).send(`Route does not exist`);
const errorHandlerMiddleware = require("./middleware/error-handler");
const connectDb = require("./db/connect");
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, //15 minutes
    max: 100, //limit set to 100 request per 15 minutes
  })
);
//middleware
app.use(morgan("tiny"));
app.use(cookieParser(process.env.JWT_SIGN)); //sign cookies with JWT signature
app.use(express.json());
app.use(express.static("./public"));
app.use(fileUpload());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/review", reviewRouter);
app.use("/api/v1/orders", orderRouter);

app.use(errorHandlerMiddleware);
app.use(notFound);

const port = process.env.PORT || 5000;

async function start() {
  try {
    await connectDb(process.env.MONGO_URL);
    app.listen(port, () => {
      console.log(`Server is listening at port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
}

start();
