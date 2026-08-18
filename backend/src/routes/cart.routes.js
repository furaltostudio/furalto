const { Router } = require("express");
const cartController = require("../controllers/cart.controller");
const validate = require("../middlewares/validate.middleware");
const { authenticate } = require("../middlewares/auth.middleware");
const { cartItemValidator, updateCartItemValidator } = require("../validators/cart.validator");

const router = Router();

router.use(authenticate);

router.get("/", cartController.getCart);
router.post("/items", validate(cartItemValidator), cartController.addItem);
router.put("/items/:itemId", validate(updateCartItemValidator), cartController.updateItem);
router.delete("/items/:itemId", cartController.removeItem);
router.delete("/", cartController.clearCart);

module.exports = router;
