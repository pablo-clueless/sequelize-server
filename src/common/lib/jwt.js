const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  try {
    const id = jwt.verify(userId, process.env.JWT_SECRET);
    return id;
  } catch (error) {
    console.log(error);
    return {};
  }
};

const validateToken = (token) => {
  try {
    const id = jwt.verify(token, process.env.JWT_SECRET);
    return id;
  } catch (error) {
    console.log(error);
    return {};
  }
};

const decode = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.log(error);
    return {};
  }
};

module.exports = { decode, generateToken, validateToken };
