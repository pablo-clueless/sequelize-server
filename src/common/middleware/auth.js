const { createError } = require("../lib/create-error");
const { HTTP, RESPONSE } = require("../constants");
const { decode } = require("../lib/jwt");
const { User } = require("../../sql");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization && req.headers["api-key"];
    if (!token) {
      next(
        createError(HTTP.BAD_REQUEST, [
          {
            status: RESPONSE.ERROR,
            message: "APi key token is missing",
            statusCode: HTTP.UNAUTHORIZED,
          },
        ]),
      );
    }
    const id = decode(token);
    const user = User.findByPk(id);
    if (!user) {
      next(
        createError(HTTP.BAD_REQUEST, [
          {
            status: RESPONSE.ERROR,
            message: "User not found",
            statusCode: HTTP.UNAUTHORIZED,
          },
        ]),
      );
    }
    req.user = user;
    next();
  } catch (error) {
    return next(
      createError(HTTP.BAD_REQUEST, [
        {
          status: RESPONSE.ERROR,
          message: error.message,
          statusCode: HTTP.UNAUTHORIZED,
        },
      ]),
    );
  }
};

module.exports = authMiddleware;
