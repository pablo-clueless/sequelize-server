const { createResponse } = require("../../common/lib/create-response");
const { CustomError } = require("../../common/lib/create-error");
const { HTTP, RESPONSE } = require("../../common/constants");
const {
  addTrackingHistory,
  getTrackingHistory,
  createTracking,
  getTrackingById,
  getTrackingByNumber,
  getTrackingByOrderId,
  updateTracking,
} = require("./tracking.service");

const createTrackingController = async (req, res, next) => {
  try {
    const payload = req.body;
    const { error, message, data } = await createTracking(payload);
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

const addTrackingHistoryController = async (req, res, next) => {
  try {
    const payload = req.body;
    const { error, message, data } = await addTrackingHistory(payload);
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

const getTrackingHistoryController = async (req, res, next) => {
  try {
    const { trackingId } = req.params;
    const { error, message, data } = await getTrackingHistory(trackingId);
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

const getTrackingByIdController = async (req, res, next) => {
  try {
    const { trackingId } = req.params;
    const { error, message, data } = await getTrackingById(trackingId);
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

const getTrackingByNumberController = async (req, res, next) => {
  try {
    const { trackingNumber } = req.params;
    const { error, message, data } = await getTrackingByNumber(trackingNumber);
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

const getTrackingByOrderIdController = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { error, message, data } = await getTrackingByOrderId(orderId);
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

const updateTrackingHistoryController = async (req, res, next) => {
  try {
    const { trackingId } = req.params;
    const payload = req.body;
    const { error, message, data } = await updateTracking(trackingId, payload);
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
  createTrackingController,
  addTrackingHistoryController,
  getTrackingHistoryController,
  getTrackingByIdController,
  getTrackingByNumberController,
  getTrackingByOrderIdController,
  updateTrackingHistoryController,
};
