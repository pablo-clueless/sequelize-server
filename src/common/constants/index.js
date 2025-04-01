const HTTP = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  SERVER_ERROR: 500,
  UNPROCESSABLE_ENTITY: 422,
};

const RESPONSE = {
  SUCCESS: "success",
  ERROR: "error",
};

module.exports = {
  HTTP,
  RESPONSE,
};
