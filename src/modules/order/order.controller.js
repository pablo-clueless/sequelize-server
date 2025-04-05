const { createResponse } = require("../../common/lib/create-response");
const { CustomError } = require("../../common/lib/create-error");
const { HTTP, RESPONSE } = require("../../common/constants");
const {
  createOrder,
  getOrderById,
  getOrders,
  deleteOrder,
  updateOrder,
} = require("./order.service");

const createOrderController = async (req, res, next) => {
  try {
    const payload = req.body;
    const { error, message, data } = await createOrder(payload);
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
const getOrdersController = async (req, res, next) => {
  try {
    const payload = req.params;
    const { error, message, data } = await getOrders(payload);
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
const getOrderController = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { error, message, data } = await getOrderById(orderId);
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
const updateOrderController = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const payload = req.body;
    const { error, message, data } = await updateOrder(orderId, payload);
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
const deleteOrderController = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { error, message, data } = await deleteOrder(orderId);
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

module.exports = {
  createOrderController,
  getOrdersController,
  getOrderController,
  updateOrderController,
  deleteOrderController,
};
