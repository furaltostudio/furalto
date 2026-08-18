const { Router } = require("express");
const wishlistController = require("../controllers/wishlist.controller");
const { authenticate } = require("../middlewares/auth.middleware");

const router = Router();

router.use(authenticate);

router.get("/", wishlistController.getWishlist);
router.post("/", wishlistController.addItem);
router.delete("/:slug", wishlistController.removeItem);

module.exports = router;
