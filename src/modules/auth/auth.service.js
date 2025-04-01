const validator = require("validator");

const { comparePassword, hashPassword } = require("../../common/lib/bcrypt");
const { generateToken } = require("../../common/lib/jwt");
const { User } = require("../../sql");

const register = async (payload) => {
  try {
    if (!payload.email) {
      return {
        error: true,
        message: "Email is required!",
        data: null,
      };
    }
    const user = await User.findOne({
      where: {
        email: payload.email,
      },
    });
    if (user) {
      const response = {
        error: true,
        message: "Email already exists!",
        data: null,
      };
      return response;
    }
    const isValideEmail = validator.isEmail(payload.email);
    if (!isValideEmail) {
      const response = {
        error: true,
        message: "Invalid email!",
        data: null,
      };
      return response;
    }
    const hashedPassword = await hashPassword(payload.password);
    const newUser = await User.create({
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      password: hashedPassword,
      phoneNumber: payload.phoneNumber,
      address: payload.address,
    });
    if (!newUser) {
      const response = {
        error: true,
        message: "Unable to create account!",
        data: null,
      };
      return response;
    }
    newUser.save;
    const response = {
      error: false,
      message: "Account created successfully!",
      data: newUser,
    };
    return response;
  } catch (error) {
    console.log(error);
    const response = {
      error: true,
      message: error.message || "Unable to create account!",
      data: null,
    };
    return response;
  }
};

const login = async (payload) => {
  try {
    const user = await User.findOne({
      where: {
        email: payload.email,
      },
    });
    if (!user) {
      const response = {
        error: true,
        message: "User not found. Please create an account to continue.",
        data: null,
      };
      return response;
    }
    const isMatch = await comparePassword(payload.password, user.password);
    if (!isMatch) {
      const response = {
        error: true,
        message: "Invalid credentials!",
        data: null,
      };
      return response;
    }
    const token = await generateToken(user.id);
    const response = {
      error: false,
      message: "Login successful!",
      data: {
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: user.address,
        },
      },
    };
    return response;
  } catch (error) {
    console.log(error);
    const response = {
      error: true,
      message: error.message || "Unable to create account!",
      data: null,
    };
    return response;
  }
};

module.exports = {
  register,
  login,
};
