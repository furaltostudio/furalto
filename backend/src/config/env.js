require("dotenv").config();

const DEV_ACCESS_SECRET = "dev-access-secret-change-in-production";
const DEV_REFRESH_SECRET = "dev-refresh-secret-change-in-production";
const DEV_SEED_SECRET = "dev-seed-secret";

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/furalto",
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || DEV_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET || DEV_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  },
  brevo: {
    apiKey: process.env.BREVO_API_KEY || "",
    senderEmail: process.env.BREVO_SENDER_EMAIL || "",
    senderName: process.env.BREVO_SENDER_NAME || "Furalto",
  },
  // Optional generic SMTP (unused when Brevo REST is configured)
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from:
      process.env.SMTP_FROM ||
      (process.env.BREVO_SENDER_EMAIL
        ? `${process.env.BREVO_SENDER_NAME || "Furalto"} <${process.env.BREVO_SENDER_EMAIL}>`
        : "Furalto <noreply@furalto.com>"),
  },
  seedSecret: process.env.SEED_SECRET || DEV_SEED_SECRET,
  admin: {
    email: process.env.ADMIN_EMAIL || "furaltostudio@gmail.com",
    password: process.env.ADMIN_PASSWORD || "Rahul@123",
    firstName: process.env.ADMIN_FIRST_NAME || "Furalto",
    lastName: process.env.ADMIN_LAST_NAME || "Admin",
  },
  billing: {
    email:
      process.env.BILLING_EMAIL ||
      process.env.ORDERS_EMAIL ||
      process.env.ADMIN_EMAIL ||
      "furaltostudio@gmail.com",
  },
  company: {
    legalName: process.env.COMPANY_LEGAL_NAME || "Furalto",
    gstin: (process.env.COMPANY_GSTIN || "").trim().toUpperCase(),
    address: process.env.COMPANY_ADDRESS || "",
    state: process.env.COMPANY_STATE || "",
  },
  razorpay: {
    keyId: (process.env.RAZORPAY_KEY_ID || "").trim(),
    keySecret: (process.env.RAZORPAY_KEY_SECRET || "").trim(),
    webhookSecret: (process.env.RAZORPAY_WEBHOOK_SECRET || "").trim(),
    // Only when explicitly enabled — never auto-on (skips Razorpay UI)
    mockPayments: process.env.PAYMENT_MOCK === "true",
  },
  cloudinary: (() => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
    const apiKey = process.env.CLOUDINARY_API_KEY || "";
    const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

    if (cloudName && apiKey && apiSecret) {
      return { cloudName, apiKey, apiSecret };
    }

    const cloudinaryUrl = process.env.CLOUDINARY_URL || "";
    const match = cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);

    if (!match) {
      return { cloudName, apiKey, apiSecret };
    }

    return {
      apiKey: match[1],
      apiSecret: match[2],
      cloudName: match[3],
    };
  })(),
  gemini: {
    apiKey: (process.env.GEMINI_API_KEY || "").trim(),
  },
};

const isProduction = env.nodeEnv === "production";

const assertProductionEnv = () => {
  if (!isProduction) {
    return;
  }

  const failures = [];

  if (!process.env.JWT_ACCESS_SECRET || env.jwt.accessSecret === DEV_ACCESS_SECRET) {
    failures.push("JWT_ACCESS_SECRET must be set to a strong unique value");
  } else if (env.jwt.accessSecret.length < 32) {
    failures.push("JWT_ACCESS_SECRET must be at least 32 characters");
  }

  if (!process.env.JWT_REFRESH_SECRET || env.jwt.refreshSecret === DEV_REFRESH_SECRET) {
    failures.push("JWT_REFRESH_SECRET must be set to a strong unique value");
  } else if (env.jwt.refreshSecret.length < 32) {
    failures.push("JWT_REFRESH_SECRET must be at least 32 characters");
  }

  if (env.jwt.accessSecret === env.jwt.refreshSecret) {
    failures.push("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different");
  }

  if (env.razorpay.mockPayments) {
    failures.push("PAYMENT_MOCK must be false in production");
  }

  if (!env.razorpay.keyId || !env.razorpay.keySecret) {
    failures.push("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required in production");
  }

  if (!env.razorpay.webhookSecret) {
    failures.push("RAZORPAY_WEBHOOK_SECRET is required in production");
  }

  if (!env.brevo.apiKey || !env.brevo.senderEmail) {
    failures.push("Email is required in production: set BREVO_API_KEY + BREVO_SENDER_EMAIL");
  }

  if (!env.company.gstin) {
    failures.push("COMPANY_GSTIN is required in production for tax invoices");
  } else if (
    !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(env.company.gstin)
  ) {
    failures.push("COMPANY_GSTIN must be a valid 15-character GSTIN");
  }

  if (!env.company.legalName || !env.company.address || !env.company.state) {
    failures.push("COMPANY_LEGAL_NAME, COMPANY_ADDRESS, and COMPANY_STATE are required in production");
  }

  if (!env.frontendUrl || /localhost|127\.0\.0\.1/i.test(env.frontendUrl)) {
    failures.push("FRONTEND_URL must be your public production URL");
  }

  if (!env.corsOrigin || /localhost|127\.0\.0\.1/i.test(env.corsOrigin)) {
    failures.push("CORS_ORIGIN must be your public frontend origin");
  }

  if (!process.env.SEED_SECRET || env.seedSecret === DEV_SEED_SECRET) {
    failures.push("SEED_SECRET must be set to a strong unique value (seed endpoint stays disabled)");
  }

  if (failures.length) {
    throw new Error(
      `Unsafe production configuration:\n- ${failures.join("\n- ")}`
    );
  }
};

env.isProduction = isProduction;
env.assertProductionEnv = assertProductionEnv;

module.exports = env;
