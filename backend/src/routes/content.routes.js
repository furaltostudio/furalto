const { Router } = require("express");
const contentController = require("../controllers/content.controller");

const router = Router();

router.get("/", contentController.listPublicContent);
router.get("/:key", contentController.getPublicContent);

module.exports = router;
