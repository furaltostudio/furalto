const ApiResponse = require("../utils/ApiResponse");
const { HTTP_STATUS } = require("../constants");

const getHealth = (req, res) => {
  res
    .status(HTTP_STATUS.OK)
    .json(
      new ApiResponse(HTTP_STATUS.OK, {
        status: "ok",
        timestamp: new Date().toISOString(),
      })
    );
};

module.exports = {
  getHealth,
};
