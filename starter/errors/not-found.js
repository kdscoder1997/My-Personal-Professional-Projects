const CustomAPIError = require("./custom-api");
const codes = require("http-status-codes");

class NotFoundError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = codes.StatusCodes.NOT_FOUND;
  }
}

module.exports = NotFoundError;
