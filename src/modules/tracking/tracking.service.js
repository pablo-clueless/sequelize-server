const { Tracking, TrackingHistory, Order } = require("../../sql");

/**
 * Creates a new tracking record for an order
 * @param {Object} payload - The tracking information payload
 * @param {string} payload.orderId - The ID of the order to track
 * @param {string} [payload.status='pending'] - The tracking status
 * @param {string} [payload.currentLocation] - Current location of the order
 * @param {Date} [payload.estimatedArrival] - Estimated arrival date/time
 * @param {string} [payload.notes] - Additional notes about the tracking
 * @returns {Promise<Object>} Object containing:
 *   - error: boolean indicating if operation failed
 *   - message: status message
 *   - data: tracking record if successful
 * @throws {Error} When database operations fail
 */
const createTracking = async (payload) => {
  try {
    const { orderId, status, currentLocation, estimatedArrival, notes } =
      payload;

    if (!orderId) {
      return {
        error: true,
        message: "Missing required field: orderId",
      };
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return {
        error: true,
        message: "Order not found",
      };
    }

    const existingTracking = await Tracking.findOne({ where: { orderId } });
    if (existingTracking) {
      return {
        error: true,
        message: "Tracking already exists for this order",
        data: existingTracking,
      };
    }

    const tracking = await Tracking.create({
      orderId,
      status: status || "pending",
      currentLocation,
      estimatedArrival,
      notes,
    });

    await addTrackingHistory({
      trackingId: tracking.id,
      status: tracking.status,
      location: currentLocation,
      description: `Order tracking initialized with status: ${tracking.status}`,
    });

    return {
      error: false,
      message: "Tracking created successfully",
      data: tracking,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message || "Unable to create tracking!",
    };
  }
};

/**
 * Retrieves tracking information by its ID including associated tracking history and order details.
 * @param {number|string} trackingId - The unique identifier of the tracking record to retrieve
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *   @returns {boolean} error - Indicates if an error occurred
 *   @returns {Object} [data] - The tracking data if found, including associated tracking history and order details
 *   @returns {string} [message] - Error message if an error occurred
 * @throws Will return an error object if database query fails
 */
const getTrackingById = async (trackingId) => {
  try {
    const tracking = await Tracking.findByPk(trackingId, {
      include: [
        {
          model: TrackingHistory,
          order: [["timestamp", "DESC"]],
        },
        {
          model: Order,
          include: ["rider", "driver"],
        },
      ],
    });

    if (!tracking) {
      return {
        error: true,
        message: "Tracking not found",
      };
    }

    return {
      error: false,
      data: tracking,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message || "Unable to retrieve tracking details!",
    };
  }
};

/**
 * Retrieves tracking information and its history for a specific order.
 * @param {string} orderId - The unique identifier of the order to find tracking for
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *   - error {boolean} - Indicates if an error occurred
 *   - data {Object} - The tracking information and history if found
 *   - message {string} - Error message if error is true
 * @throws Will return an error object if database query fails
 */
const getTrackingByOrderId = async (orderId) => {
  try {
    const tracking = await Tracking.findOne({
      where: { orderId },
      include: [
        {
          model: TrackingHistory,
          order: [["timestamp", "DESC"]],
        },
      ],
    });

    if (!tracking) {
      return {
        error: true,
        message: "Tracking not found for this order",
      };
    }

    return {
      error: false,
      data: tracking,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message || "Unable to retrieve tracking details!",
    };
  }
};

/**
 * Retrieves tracking information by tracking number
 * @param {string} trackingNumber - The tracking number to search for
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *  - error {boolean} - Indicates if an error occurred
 *  - data {Object|undefined} - The tracking data if found
 *  - message {string|undefined} - Error message if applicable
 * @throws Will return an error object if database query fails
 */
const getTrackingByNumber = async (trackingNumber) => {
  try {
    const tracking = await Tracking.findOne({
      where: { trackingNumber },
      include: [
        {
          model: TrackingHistory,
          order: [["timestamp", "DESC"]],
        },
        {
          model: Order,
          include: ["rider", "driver"],
        },
      ],
    });

    if (!tracking) {
      return {
        error: true,
        message: "Tracking not found",
      };
    }

    return {
      error: false,
      data: tracking,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message || "Unable to retrieve tracking details!",
    };
  }
};

/**
 * Updates an existing tracking record with new information.
 *
 * @param {string} trackingId - The unique identifier of the tracking record to update
 * @param {Object} payload - The details to update in the tracking record
 * @param {string} [payload.status] - Optional new status for the tracking
 * @param {string} [payload.currentLocation] - Optional new current location
 * @param {string} [payload.estimatedArrival] - Optional new estimated arrival time
 * @param {string} [payload.notes] - Optional additional notes
 * @returns {Promise<{error: boolean, message: string, data?: Tracking}>} Result of updating the tracking record
 */
const updateTracking = async (trackingId, payload) => {
  try {
    const tracking = await Tracking.findByPk(trackingId);

    if (!tracking) {
      return {
        error: true,
        message: "Tracking not found",
      };
    }

    if (tracking.status === "completed" || tracking.status === "cancelled") {
      return {
        error: true,
        message: `Cannot update tracking with status: ${tracking.status}`,
      };
    }

    const updatableFields = [
      "status",
      "currentLocation",
      "estimatedArrival",
      "notes",
    ];
    const updates = {};

    updatableFields.forEach((field) => {
      if (payload[field] !== undefined) {
        updates[field] = payload[field];
      }
    });

    if (Object.keys(updates).length > 0) {
      await tracking.update(updates);

      if (payload.status) {
        await addTrackingHistory({
          trackingId,
          status: payload.status,
          location: payload.currentLocation || tracking.currentLocation,
          description: `Status updated to: ${payload.status}`,
        });
      } else if (
        payload.currentLocation &&
        payload.currentLocation !== tracking.currentLocation
      ) {
        await addTrackingHistory({
          trackingId,
          status: tracking.status,
          location: payload.currentLocation,
          description: `Location updated to: ${payload.currentLocation}`,
        });
      }
    }

    const updatedTracking = await Tracking.findByPk(trackingId, {
      include: [
        {
          model: TrackingHistory,
          order: [["timestamp", "DESC"]],
        },
      ],
    });

    return {
      error: false,
      message: "Tracking updated successfully",
      data: updatedTracking,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message || "Unable to update tracking!",
    };
  }
};

/**
 * Adds a new entry to the tracking history for a specific tracking record.
 *
 * @param {Object} payload - The tracking history entry details
 * @param {string} payload.trackingId - The unique identifier of the tracking record
 * @param {string} payload.status - The current status of the tracking
 * @param {string} [payload.location] - Optional location information
 * @param {string} [payload.description] - Optional description of the tracking history entry
 * @returns {Promise<{error: boolean, message: string, data?: TrackingHistory}>} Result of adding tracking history
 */
const addTrackingHistory = async (payload) => {
  try {
    const { trackingId, status, location, description } = payload;

    if (!trackingId || !status) {
      return {
        error: true,
        message: "Missing required fields: trackingId or status",
      };
    }

    const tracking = await Tracking.findByPk(trackingId);
    if (!tracking) {
      return {
        error: true,
        message: "Tracking not found",
      };
    }

    const history = await TrackingHistory.create({
      trackingId,
      status,
      location,
      description,
      timestamp: new Date(),
    });

    return {
      error: false,
      message: "Tracking history added successfully",
      data: history,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message || "Unable to add tracking history!",
    };
  }
};

/**
 * Retrieves the tracking history for a specific tracking ID.
 * Returns tracking history entries sorted by timestamp in descending order.
 *
 * @param {string} trackingId - The unique identifier of the tracking record
 * @returns {Promise<{error: boolean, data?: TrackingHistory[]}>} An object containing the tracking history or error information
 */
const getTrackingHistory = async (trackingId) => {
  try {
    const history = await TrackingHistory.findAll({
      where: { trackingId },
      order: [["timestamp", "DESC"]],
    });

    return {
      error: false,
      data: history,
    };
  } catch (error) {
    return {
      error: true,
      message: error.message || "Unable to retrieve tracking history!",
    };
  }
};

module.exports = {
  createTracking,
  getTrackingById,
  getTrackingByOrderId,
  getTrackingByNumber,
  updateTracking,
  addTrackingHistory,
  getTrackingHistory,
};
