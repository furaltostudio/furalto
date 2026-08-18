/**
 * Diagnose Brevo REST email delivery.
 * Usage: node scripts/test-brevo-email.js [toEmail]
 */
require("dotenv").config();
const { env } = require("../src/config");

(async () => {
  const to = (process.argv[2] || env.brevo.senderEmail || env.admin.email).toLowerCase();
  const apiKey = env.brevo.apiKey || "";
  const senderEmail = env.brevo.senderEmail || "";
  const senderName = env.brevo.senderName || "Furalto";

  console.log("Brevo config check:");
  console.log("- key prefix:", apiKey.slice(0, 12) || "(empty)");
  console.log("- key type:", /^xkeysib-/i.test(apiKey) ? "REST API" : "invalid (need xkeysib-)");
  console.log("- senderEmail:", senderEmail || "(empty)");
  console.log("- senderName:", senderName);
  console.log("- to:", to);

  if (!apiKey || !/^xkeysib-/i.test(apiKey)) {
    console.error("FAIL: set BREVO_API_KEY to an xkeysib- API key");
    process.exit(1);
  }
  if (!senderEmail) {
    console.error("FAIL: BREVO_SENDER_EMAIL missing");
    process.exit(1);
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: to }],
      subject: "Furalto Brevo REST test",
      htmlContent: "<p>Test email from Furalto backend (REST).</p>",
      textContent: "Test email from Furalto backend (REST).",
    }),
  });

  console.log("REST status:", response.status, await response.text());
  if (!response.ok) process.exit(1);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
