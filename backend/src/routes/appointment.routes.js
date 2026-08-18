const { Router } = require("express");
const appointmentController = require("../controllers/appointment.controller");
const validate = require("../middlewares/validate.middleware");
const { authenticate, optionalAuthenticate } = require("../middlewares/auth.middleware");
const { formLimiter } = require("../middlewares/rateLimit.middleware");
const { appointmentValidator } = require("../validators/appointment.validator");

const router = Router();

router.post(
  "/",
  formLimiter,
  optionalAuthenticate,
  validate(appointmentValidator),
  appointmentController.createAppointment
);
router.get("/", authenticate, appointmentController.getAppointments);

module.exports = router;
