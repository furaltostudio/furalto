const { Router } = require("express");
const productController = require("../controllers/product.controller");

const router = Router();

router.get("/", productController.listProducts);
router.get("/search", productController.searchProducts);
router.get("/collections", productController.getCollections);
router.post("/seed", productController.seedProducts);
router.get("/:slug/related", productController.getRelatedProducts);
router.get("/:slug", productController.getProduct);

module.exports = router;
