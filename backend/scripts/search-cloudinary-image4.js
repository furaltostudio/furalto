require("dotenv").config();
const cloudinary = require("cloudinary").v2;

// Product assets live on m1zm0cpq (see image URLs), not the active upload cloud.
cloudinary.config({
  cloud_name: "m1zm0cpq",
  api_key: "873332485114949",
  api_secret: "jNVcknApzAaAf8zKY_SFwsDomyY",
});

async function findFoursNear(versionHint) {
  // Search recent 4_ public ids — broad net
  const result = await cloudinary.search
    .expression("filename:4_* OR filename:4v_*")
    .sort_by("uploaded_at", "desc")
    .max_results(100)
    .execute();
  return result.resources || [];
}

(async () => {
  try {
    const resources = await findFoursNear();
    console.log("Found", resources.length, "4_/4v_ resources (sample 30):");
    resources.slice(0, 30).forEach((r) => {
      console.log(r.public_id, r.format, r.secure_url?.split("/upload/")[1]?.slice(0, 60));
    });
  } catch (error) {
    console.error("Cloudinary search failed:", error.message || error);
  }
})();
