const { Router } = require("express");
const contactController = require("../controllers/contact.controller");
const validate = require("../middlewares/validate.middleware");
const { formLimiter } = require("../middlewares/rateLimit.middleware");
const { contactValidator } = require("../validators/contact.validator");

const router = Router();

router.post("/", formLimiter, validate(contactValidator), contactController.submitContact);

module.exports = router;
