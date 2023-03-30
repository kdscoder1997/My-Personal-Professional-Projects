const CustomAPIError = require("./custom-api");
const codes = require("http-status-codes");

class BadRequestError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = codes.StatusCodes.BAD_REQUEST;
  }
}

module.exports = BadRequestError;
