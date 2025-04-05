const { Op } = require("sequelize");

const { Tracking, Order } = require("../../sql");

/**
 * Creates a new order in the system
 * @param {Object} payload - The order details
 * @param {string} payload.riderId - The ID of the rider making the order
 * @param {string} payload.pickupLocation - The pickup location for the order
 * @param {string} payload.dropoffLocation - The dropoff location for the order
 * @param {number} payload.distance - The distance of the trip
 * @param {number} payload.duration - The duration of the trip
 * @param {number} payload.fare - The fare amount for the trip
 * @param {string} [payload.driverId] - The ID of the assigned driver (optional)
 * @param {string} [payload.paymentMethod] - The payment method for the order
 * @param {string} [payload.notes] - Additional notes for the order
 * @param {Date} [payload.scheduledTime] - Scheduled time for the order
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *                           - error: boolean indicating if there was an error
 *                           - message: status message
 *                           - data: created order object (if successful)
 * @throws {Error} When required fields are missing or database operation fails
 */
const createOrder = async (payload) => {
  try {
    const {
      riderId,
      pickupLocation,
      dropoffLocation,
      distance,
      duration,
      fare,
      paymentMethod,
      notes,
      scheduledTime,
    } = payload;

    if (
      !riderId ||
      !pickupLocation ||
      !dropoffLocation ||
      !distance ||
      !duration ||
      fare === undefined
    ) {
      return {
        error: true,
        message:
          "Missing required fields: riderId, pickupLocation, dropoffLocation, distance, duration, or fare",
      };
    }

    const order = await Order.create({
      riderId,
      driverId: payload.driverId,
      pickupLocation,
      dropoffLocation,
      distance,
      duration,
      fare,
      status: "pending",
      paymentMethod,
      paymentStatus: "pending",
      notes,
      scheduledTime,
    });

    return {
      error: false,
      message: "Order created successfully",
      data: order,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message || "Unable to create order!",
    };
  }
};

/**
 * Retrieves an order by its ID with associated user and tracking information
 * @async
 * @param {number|string} orderId - The unique identifier of the order to retrieve
 * @returns {Promise<Object>} An object containing:
 *   @property {boolean} error - Indicates if an error occurred
 *   @property {(Object|undefined)} data - The order data if found
 *   @property {(string|undefined)} message - Error message if an error occurred
 * @throws Will return error object if database query fails
 */
const getOrderById = async (orderId) => {
  try {
    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: User,
          as: "rider",
          attributes: ["id", "firstName", "lastName", "email", "phoneNumber"],
        },
        {
          model: User,
          as: "driver",
          attributes: ["id", "firstName", "lastName", "email", "phoneNumber"],
        },
        {
          model: Tracking,
        },
      ],
    });

    if (!order) {
      return {
        error: true,
        message: "Order not found",
      };
    }

    return {
      error: false,
      data: order,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message || "Unable to retrieve order details!",
    };
  }
};

/**
 * Retrieves paginated orders with optional filters
 * @param {Object} filters - Filtering options for orders
 * @param {string} [filters.riderId] - ID of the rider to filter by
 * @param {string} [filters.driverId] - ID of the driver to filter by
 * @param {string} [filters.status] - Order status to filter by
 * @param {string} [filters.orderNumber] - Order number to search (partial match)
 * @param {string} [filters.startDate] - Start date for date range filter (ISO format)
 * @param {string} [filters.endDate] - End date for date range filter (ISO format)
 * @param {string} [filters.paymentStatus] - Payment status to filter by
 * @param {number} [page=1] - Page number for pagination
 * @param {number} [limit=10] - Number of items per page
 * @returns {Promise<Object>} Object containing:
 *   - error {boolean} - Indicates if there was an error
 *   - data {Object} - Present if error is false
 *     - orders {Array} - List of order objects with rider and driver information
 *     - pagination {Object} - Pagination details
 *       - total {number} - Total number of orders
 *       - page {number} - Current page
 *       - limit {number} - Items per page
 *       - totalPages {number} - Total number of pages
 *   - message {string} - Error message if error is true
 */
const getOrders = async (filters = {}, page = 1, limit = 10) => {
  try {
    const where = {};
    const {
      riderId,
      driverId,
      status,
      orderNumber,
      startDate,
      endDate,
      paymentStatus,
    } = filters;

    if (riderId) where.riderId = riderId;
    if (driverId) where.driverId = driverId;
    if (status) where.status = status;
    if (orderNumber) where.orderNumber = { [Op.iLike]: `%${orderNumber}%` };
    if (paymentStatus) where.paymentStatus = paymentStatus;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = endDateTime;
      }
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "rider",
          attributes: ["id", "firstName", "lastName", "email", "phoneNumber"],
        },
        {
          model: User,
          as: "driver",
          attributes: ["id", "firstName", "lastName", "email", "phoneNumber"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return {
      error: false,
      data: {
        orders: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      },
    };
  } catch (error) {
    return {
      error: true,
      message: error.message || "Unable to retrieve orders!",
    };
  }
};

/**
 * Updates an existing order with the provided payload
 * @param {string|number} orderId - The ID of the order to update
 * @param {Object} payload - The update payload
 * @param {string|number} [payload.driverId] - The ID of the driver to assign
 * @param {string} [payload.status] - The new status of the order
 * @param {string} [payload.paymentMethod] - The payment method for the order
 * @param {string} [payload.paymentStatus] - The status of the payment
 * @param {string} [payload.notes] - Additional notes for the order
 * @param {Date|string} [payload.scheduledTime] - Scheduled time for the order
 * @returns {Promise<Object>} Object containing error status, message and updated order data
 * @returns {boolean} return.error - Indicates if operation encountered an error
 * @returns {string} return.message - Description of the operation result
 * @returns {Object} [return.data] - The updated order data with associated user and tracking information
 */
const updateOrder = async (orderId, payload) => {
  try {
    const order = await Order.findByPk(orderId);

    if (!order) {
      return {
        error: true,
        message: "Order not found",
      };
    }

    if (order.status === "completed" || order.status === "cancelled") {
      return {
        error: true,
        message: `Cannot update a ${order.status} order`,
      };
    }

    const updatableFields = [
      "driverId",
      "status",
      "paymentMethod",
      "paymentStatus",
      "notes",
      "scheduledTime",
    ];
    const updates = {};

    updatableFields.forEach((field) => {
      if (payload[fiel] !== undefined) {
        updates[field] = payload[field];
      }
    });

    if (Object.keys(updates).length > 0) {
      await order.update(updates);
    }

    const updatedOrder = await Order.findByPk(orderId, {
      include: [
        {
          model: User,
          as: "rider",
          attributes: ["id", "firstName", "lastName", "email", "phoneNumber"],
        },
        {
          model: User,
          as: "driver",
          attributes: ["id", "firstName", "lastName", "email", "phoneNumber"],
        },
        {
          model: Tracking,
        },
      ],
    });

    return {
      error: false,
      message: "Order updated successfully",
      data: updatedOrder,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message || "Unable to update order!",
    };
  }
};

/**
 * Deletes an order from the database if it exists and has a 'pending' status
 * @param {string|number} orderId - The ID of the order to delete
 * @returns {Promise<Object>} An object containing:
 *  - error {boolean} - Indicates if an error occurred
 *  - message {string} - Success/error message describing the operation result
 * @throws Will return an error object if database operation fails
 */
const deleteOrder = async (orderId) => {
  try {
    const order = await Order.findByPk(orderId);

    if (!order) {
      return {
        error: true,
        message: "Order not found",
      };
    }

    if (order.status !== "pending") {
      return {
        error: true,
        message: `Cannot delete an order with status: ${order.status}. Only pending orders can be deleted.`,
      };
    }

    await order.destroy();

    return {
      error: false,
      message: "Order deleted successfully",
    };
  } catch (error) {
    return {
      error: true,
      message: error.message || "Unable to delete order!",
    };
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getOrders,
  updateOrder,
  deleteOrder,
};
