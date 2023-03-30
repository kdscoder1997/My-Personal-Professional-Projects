// const { StatusCodes } = require('http-status-codes');
// const errorHandlerMiddleware = (err, req, res, next) => {
//   let customError = {
//     // set default
//     statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
//     msg: err.message || 'Something went wrong try again later',
//   };
//   if (err.name === 'ValidationError') {
//     customError.msg = Object.values(err.errors)
//       .map((item) => item.message)
//       .join(',');
//     customError.statusCode = 400;
//   }
//   if (err.code && err.code === 11000) {
//     customError.msg = `Duplicate value entered for ${Object.keys(
//       err.keyValue
//     )} field, please choose another value`;
//     customError.statusCode = 400;
//   }
//   if (err.name === 'CastError') {
//     customError.msg = `No item found with id : ${err.value}`;
//     customError.statusCode = 404;
//   }

//   return res.status(customError.statusCode).json({ msg: customError.msg });
// };

// module.exports = errorHandlerMiddleware;

const codes = require("http-status-codes");

const errorHandlerMiddleware = (err, req, res, next) => {
  let errStatusCode = err.statusCode || codes.StatusCodes.INTERNAL_SERVER_ERROR;
  let errMsg = err.message || "Something went wrong, please try again later";

  if (err.name === "ValidationError") {
    errStatusCode = 400;
    errMsg = Object.values(err.errors)
      .map((items) => {
        return items.message;
      })
      .join(",");
  }
  if (err.name === "CastError") {
    errMsg = `Object with id : ${err.value} not found`;
    errStatusCode = 404;
  }
  if (err.code === 11000) {
    //
    errMsg = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please provide another value.`;
    errStatusCode = 400;
  }

  return res.status(errStatusCode).json({ msg: errMsg });
};

module.exports = errorHandlerMiddleware;
