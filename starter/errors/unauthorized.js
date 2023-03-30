const CustomAPIError = require("./custom-api");
const codes = require("http-status-codes");

class UnauthorizedError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = codes.StatusCodes.FORBIDDEN;
  }
}

module.exports = UnauthorizedError;
