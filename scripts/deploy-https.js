const fs = require("fs");
const https = require("https");

async function deploy() {
  console.log("🚀 Uploading site.tar.gz directly via secure HTTPS Receiver...");
  const filePath = "site.tar.gz";
  if (!fs.existsSync(filePath)) {
    throw new Error(`Package not found at ${filePath}`);
  }

  const stats = fs.statSync(filePath);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`📦 Package size: ${fileSizeMB} MB`);

  const options = {
    hostname: "nattuglobalsynergy.co.id",
    port: 443,
    path: "/deploy-receiver.php?token=nsg_secret_deploy_key_998124018247",
    method: "POST",
    headers: {
      "Content-Type": "application/gzip",
      "Content-Length": stats.size,
    },
    rejectUnauthorized: false,
    timeout: 60000,
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        console.log(`📡 Response [HTTP ${res.statusCode}]:`, data);
        if (res.statusCode >= 200 && res.statusCode < 300 && data.includes('"status":"success"')) {
          console.log("✨ Automated Deployment Completed Successfully!");
          resolve(data);
        } else {
          reject(new Error(`Deployment failed with status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", (e) => {
      console.error("❌ Request error:", e.message);
      reject(e);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timed out"));
    });

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(req);
  });
}

deploy().catch((err) => {
  console.error("💥 Deployment encountered an error:", err.message);
  process.exit(1);
});
