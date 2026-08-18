const ApiResponse = require("../utils/ApiResponse");
const { HTTP_STATUS } = require("../constants");
const asyncHandler = require("../utils/asyncHandler");
const appointmentService = require("../services/appointment.service");

const createAppointment = asyncHandler(async (req, res) => {
  const appointment = await appointmentService.createAppointment(req.body, req.user?._id);

  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(
      HTTP_STATUS.CREATED,
      { appointmentId: appointment._id, status: appointment.status },
      "Appointment request submitted"
    )
  );
});

const getAppointments = asyncHandler(async (req, res) => {
  const appointments = await appointmentService.getUserAppointments(req.user._id);

  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, { appointments }, "Appointments fetched"));
});

module.exports = {
  createAppointment,
  getAppointments,
};
