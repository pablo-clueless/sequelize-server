const { User } = require("../../sql");

const getUser = async (payload) => {
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

const getUsers = async () => {
  try {
    const users = await User.findAndCountAll();
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
