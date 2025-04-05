const { User } = require("../../sql");

/**
 * Retrieves a user with their associated orders and order items from the database
 * @param {number|string} userId - The unique identifier of the user to retrieve
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *   - error {boolean} - Indicates if an error occurred
 *   - message {string} - Success/error message
 *   - data {Object} - When successful, contains users and count from findAndCountAll
 */
const getUser = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      include: [{ model: Order, include: [OrderItem] }],
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      const response = {
        error: true,
        message: "User not found!",
      };
      return response;
    }
    const response = {
      error: false,
      message: "User found!",
      data: user,
    };
    return response;
  } catch (error) {
    console.log(error);
    const response = {
      error: true,
      message: error.message || "Unable to create account!",
    };
    return response;
  }
};

/**
 * Retrieves a paginated list of users from the database
 * @param {number} limit - The maximum number of users to return per page
 * @param {number} page - The page number to retrieve (starts from 1)
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *   - error {boolean} - Indicates if an error occurred
 *   - message {string} - Success/error message
 *   - data {Object} - When successful, contains users and count from findAndCountAll
 */
const getUsers = async (limit, page) => {
  try {
    const users = await User.findAndCountAll({
      limit: limit,
      offset: (page - 1) * limit,
    });
    const response = {
      error: false,
      message: "User found!",
      data: users,
    };
    return response;
  } catch (error) {
    console.log(error);
    const response = {
      error: true,
      message: error.message || "Unable to create account!",
    };
    return response;
  }
};

module.exports = {
  getUser,
  getUsers,
};
