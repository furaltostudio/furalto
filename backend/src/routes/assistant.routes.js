const { Router } = require("express");
const validate = require("../middlewares/validate.middleware");
const { chatLimiter } = require("../middlewares/rateLimit.middleware");
const assistantController = require("../controllers/assistant.controller");
const { chatValidator } = require("../validators/custom-furniture.validator");

const router = Router();

router.post("/chat", chatLimiter, validate(chatValidator), assistantController.postChat);

module.exports = router;
