const CustomAPIError = require("./custom-api");
const codes = require("http-status-codes");

class UnauthenticatedError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = codes.StatusCodes.UNAUTHORIZED;
  }
}

module.exports = UnauthenticatedError;
