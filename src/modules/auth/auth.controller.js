const { createResponse } = require("../../common/lib/create-response");
const { CustomError } = require("../../common/lib/create-error");
const { HTTP, RESPONSE } = require("../../common/constants");
const { login, register } = require("./auth.service");

const registerController = async (req, res, next) => {
  try {
    const payload = req.body;
    const { error, message, data } = await register(payload);
    if (error) {
      return next(
        CustomError.create(HTTP.BAD_REQUEST, [
          {
            status: RESPONSE.ERROR,
            message,
            statusCode:
              data instanceof Error ? HTTP.SERVER_ERROR : HTTP.BAD_REQUEST,
            data,
          },
        ]),
      );
    }
    return createResponse(message, data)(res, HTTP.CREATED);
  } catch (error) {
    console.log("controller", { error });
    return next(CustomError.createInternalServerError({ message: "" }));
  }
};

const loginController = async (req, res, next) => {
  try {
    const payload = req.body;
    const { error, message, data } = await login(payload);
    if (error) {
      return next(
        CustomError.create(HTTP.BAD_REQUEST, [
          {
            status: RESPONSE.ERROR,
            message,
            statusCode:
              data instanceof Error ? HTTP.SERVER_ERROR : HTTP.BAD_REQUEST,
            data,
          },
        ]),
      );
    }
    return createResponse(message, data)(res, HTTP.CREATED);
  } catch (error) {
    console.log(error);
    return next(CustomError.createInternalServerError({ message: "" }));
  }
};

module.exports = {
  registerController,
  loginController,
};
