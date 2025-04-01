const createResponse =
  (message, data, status = "success") =>
  (res, code) => {
    return res.status(code).json({ code, status, message, data });
  };

module.exports = {
  createResponse,
};
