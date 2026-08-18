const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { env } = require("./config");
const routes = require("./routes");
const notFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

// Required behind nginx / Cloudflare / load balancers so rate limits use real client IPs.
const trustProxy = process.env.TRUST_PROXY;
if (trustProxy === "false" || trustProxy === "0") {
  app.set("trust proxy", false);
} else if (trustProxy) {
  const asNumber = Number(trustProxy);
  app.set("trust proxy", Number.isFinite(asNumber) ? asNumber : trustProxy);
} else if (env.isProduction || env.nodeEnv === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

// Razorpay webhooks require the raw body for signature verification.
app.post(
  "/api/v1/orders/razorpay-webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    req.rawBody = req.body;
    // Keep Buffer on req.body for HMAC; controller/service accept Buffer or string.
    next();
  },
  require("./controllers/order.controller").razorpayWebhook
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    message: "Furalto API is running",
    version: "1.0.0",
    docs: "/api/v1/health",
  });
});

app.use(routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
