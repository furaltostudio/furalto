const { Router } = require("express");
const { API_PREFIX } = require("../constants");
const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const productRoutes = require("./product.routes");
const cartRoutes = require("./cart.routes");
const orderRoutes = require("./order.routes");
const wishlistRoutes = require("./wishlist.routes");
const appointmentRoutes = require("./appointment.routes");
const contactRoutes = require("./contact.routes");
const newsletterRoutes = require("./newsletter.routes");
const adminRoutes = require("./admin.routes");
const contentRoutes = require("./content.routes");
const customFurnitureRoutes = require("./custom-furniture.routes");
const reviewRoutes = require("./review.routes");

const router = Router();

router.use(`${API_PREFIX}/health`, healthRoutes);
router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/products`, productRoutes);
router.use(`${API_PREFIX}/reviews`, reviewRoutes);
router.use(`${API_PREFIX}/categories`, require("./category.routes"));
router.use(`${API_PREFIX}/cart`, cartRoutes);
router.use(`${API_PREFIX}/orders`, orderRoutes);
router.use(`${API_PREFIX}/wishlist`, wishlistRoutes);
router.use(`${API_PREFIX}/appointments`, appointmentRoutes);
router.use(`${API_PREFIX}/contact`, contactRoutes);
router.use(`${API_PREFIX}/newsletter`, newsletterRoutes);
router.use(`${API_PREFIX}/content`, contentRoutes);
router.use(`${API_PREFIX}/custom-furniture`, customFurnitureRoutes);
router.use(`${API_PREFIX}/assistant`, require("./assistant.routes"));
router.use(`${API_PREFIX}/blog`, require("./blog.routes"));
router.use(`${API_PREFIX}/admin`, adminRoutes);

module.exports = router;
