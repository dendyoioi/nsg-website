const fs = require("fs");
const https = require("https");

const SERVER_IP = "103.125.180.51";
const DOMAIN = "nattuglobalsynergy.co.id";
const DEPLOY_SECRET = "nsg_secret_deploy_key_998124018247";
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uploadAttempt(filePath, attemptNumber) {
  return new Promise((resolve, reject) => {
    const stats = fs.statSync(filePath);
    const options = {
      host: SERVER_IP,
      port: 443,
      path: `/deploy-receiver.php?token=${DEPLOY_SECRET}`,
      method: "POST",
      servername: DOMAIN,
      headers: {
        "Host": DOMAIN,
        "Content-Type": "application/gzip",
        "Content-Length": stats.size,
        "User-Agent": "NSG-AutoDeploy/2.0",
        "Connection": "close",
      },
      rejectUnauthorized: false,
      timeout: 60000,
    };

    console.log(`📡 [Attempt ${attemptNumber}/${MAX_RETRIES}] Connecting directly to IPv4 ${SERVER_IP}:443 (SNI: ${DOMAIN})...`);

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        console.log(`📥 [Attempt ${attemptNumber}] Response HTTP ${res.statusCode}: ${data.trim()}`);
        if (res.statusCode >= 200 && res.statusCode < 300 && data.includes('"status":"success"')) {
          resolve(data);
        } else {
          reject(new Error(`Server returned HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", (err) => {
      req.destroy();
      reject(err);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Socket timeout reached after 60s"));
    });

    const fileStream = fs.createReadStream(filePath);
    fileStream.on("error", (err) => {
      req.destroy();
      reject(err);
    });

    fileStream.pipe(req);
  });
}

async function runDeploy() {
  const filePath = "site.tar.gz";
  if (!fs.existsSync(filePath)) {
    throw new Error(`Deployment archive ${filePath} not found.`);
  }

  const stats = fs.statSync(filePath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`🚀 Starting Direct IPv4 Automated Deployment Pipeline (${sizeMB} MB)...`);

  let lastError = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await uploadAttempt(filePath, attempt);
      console.log("✨ Deployment Verified and Completed Successfully!");
      process.exit(0);
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ Attempt ${attempt} failed: ${err.message}`);
      if (attempt < MAX_RETRIES) {
        console.log(`⏳ Waiting ${RETRY_DELAY_MS / 1000}s before next attempt...`);
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  console.error("💥 All deployment attempts exhausted.");
  throw lastError;
}

runDeploy().catch((err) => {
  console.error("❌ Fatal Deployment Error:", err.message);
  process.exit(1);
});
