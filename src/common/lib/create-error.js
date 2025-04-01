const { HTTP, RESPONSE } = require("../constants");

class CustomError extends Error {
  constructor(statusCode, errors) {
    super();

    const errorArray = Array.isArray(errors) ? errors : [errors];

    this.errors = errorArray.map((error) => ({
      status: error.status || RESPONSE.ERROR,
      message: error.message || "An error occurred",
      statusCode: error.statusCode || statusCode,
      data: error.data || null,
    }));
  }

  static create(statusCode, errorData) {
    return new CustomError(statusCode, errorData);
  }

  static createInternalServerError({
    message = "Internal Server Error",
    data = null,
  } = {}) {
    return new CustomError(HTTP.SERVER_ERROR, {
      status: RESPONSE.ERROR,
      message,
      data,
    });
  }
}

module.exports = { CustomError };
