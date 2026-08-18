const { Router } = require("express");
const blogController = require("../controllers/blog.controller");
const validate = require("../middlewares/validate.middleware");
const { listPublicValidator, slugValidator } = require("../validators/blog.validator");

const router = Router();

router.get("/", validate(listPublicValidator), blogController.listPublished);
router.get("/:slug", validate(slugValidator), blogController.getPublishedBySlug);

module.exports = router;
