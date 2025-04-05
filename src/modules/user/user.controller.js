const { createResponse } = require("../../common/lib/create-response");
const { CustomError } = require("../../common/lib/create-error");
const { HTTP, RESPONSE } = require("../../common/constants");
const { getUser, getUsers } = require("./user.service");

const getUsersController = async (req, res, next) => {
  try {
    const payload = req.params;
    const { error, message, data } = await getUsers(payload);
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
    return createResponse(message, data)(res, HTTP.OK);
  } catch (error) {
    console.log("controller", { error });
    return next(CustomError.createInternalServerError({ message: "" }));
  }
};

const getUserController = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { error, message, data } = await getUser(userId);
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
    return createResponse(message, data)(res, HTTP.OK);
  } catch (error) {
    console.log("controller", { error });
    return next(CustomError.createInternalServerError({ message: "" }));
  }
};

module.exports = { getUserController, getUsersController };
