const ftp = require("basic-ftp");
const path = require("path");
const https = require("https");

const DOMAIN = "nattuglobalsynergy.co.id";
const SERVER_IP = "103.125.180.51";
const UNPACK_TOKEN = "nsg_deploy_secret_2026";

async function deploy() {
  const client = new ftp.Client(30000);
  client.ftp.verbose = true;

  const server = process.env.FTP_SERVER || SERVER_IP;
  const user = process.env.FTP_USERNAME;
  const password = process.env.FTP_PASSWORD;

  if (!user || !password) {
    console.error("❌ Missing FTP credentials. Set FTP_USERNAME and FTP_PASSWORD.");
    process.exit(1);
  }

  // ===== STEP 1: FTP Upload =====
  console.log(`📦 Step 1/3: Connecting to FTP server ${server}...`);
  try {
    await client.access({
      host: server,
      user: user,
      password: password,
      secure: false,
      secureOptions: { rejectUnauthorized: false },
    });
    console.log("✅ FTP connected!");
    
    // List current directory to see where we are
    const pwd = await client.pwd();
    console.log(`📂 Current directory: ${pwd}`);
    
    // Try to navigate to public_html if it exists
    try {
      await client.cd("public_html");
      const newPwd = await client.pwd();
      console.log(`📂 Changed to: ${newPwd}`);
    } catch {
      // Already in public_html or doesn't have that structure
      console.log("📂 Staying in current directory (likely already public_html)");
    }
  } catch (err) {
    console.error("❌ FTP connection failed:", err.message);
    process.exit(1);
  }

  try {
    // Upload site.tar.gz
    const tarGzPath = path.join(__dirname, "../site.tar.gz");
    const fs = require("fs");
    const fileSize = fs.statSync(tarGzPath).size;
    console.log(`📤 Step 2/3: Uploading site.tar.gz (${(fileSize / 1024 / 1024).toFixed(2)} MB)...`);
    await client.uploadFrom(tarGzPath, "site.tar.gz");
    console.log("✅ site.tar.gz uploaded!");

    // Upload unpacker
    const unpackerPath = path.join(__dirname, "../unpacker-gz.php");
    console.log("📤 Uploading unpacker-gz.php...");
    await client.uploadFrom(unpackerPath, "unpacker-gz.php");
    console.log("✅ unpacker-gz.php uploaded!");

    // Verify files exist on server
    const listing = await client.list();
    const hasTar = listing.some(f => f.name === "site.tar.gz");
    const hasUnpacker = listing.some(f => f.name === "unpacker-gz.php");
    console.log(`📋 Verification: site.tar.gz=${hasTar}, unpacker-gz.php=${hasUnpacker}`);

    if (!hasTar || !hasUnpacker) {
      throw new Error("Files not found on server after upload");
    }
  } catch (err) {
    console.error("❌ FTP upload failed:", err.message);
    process.exit(1);
  } finally {
    client.close();
    console.log("🔌 FTP connection closed.");
  }

  // ===== STEP 2: Trigger HTTP Unpacker =====
  console.log("🔧 Step 3/3: Triggering remote extraction via HTTPS...");

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await triggerUnpacker(attempt);
      if (result.includes("DEPLOY_SUCCESS")) {
        console.log("🎉 Deployment completed successfully!");
        process.exit(0);
      } else {
        console.log(`⚠️ Unpacker returned unexpected response:\n${result}`);
        if (attempt < maxRetries) {
          console.log(`⏳ Retrying in 3s...`);
          await sleep(3000);
        }
      }
    } catch (err) {
      console.error(`⚠️ Attempt ${attempt} error: ${err.message}`);
      if (attempt < maxRetries) {
        console.log(`⏳ Retrying in 3s...`);
        await sleep(3000);
      }
    }
  }

  console.error("💥 All unpacker attempts exhausted.");
  process.exit(1);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function triggerUnpacker(attempt) {
  return new Promise((resolve, reject) => {
    const urlPath = `/unpacker-gz.php?token=${UNPACK_TOKEN}`;
    console.log(`📡 [Attempt ${attempt}] GET https://${DOMAIN}${urlPath}`);

    const options = {
      host: SERVER_IP,
      port: 443,
      path: urlPath,
      method: "GET",
      servername: DOMAIN,
      headers: { "Host": DOMAIN, "User-Agent": "NSG-AutoDeploy/3.0" },
      rejectUnauthorized: false,
      timeout: 120000,
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        console.log(`📥 HTTP ${res.statusCode}:\n${data}`);
        resolve(data);
      });
    });

    req.on("error", (err) => reject(err));
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timed out after 120s"));
    });
    req.end();
  });
}

deploy().catch((err) => {
  console.error("💥 Fatal error:", err.message);
  process.exit(1);
});
