const ftp = require("basic-ftp");
const path = require("path");
const https = require("https");

const DOMAIN = "nattuglobalsynergy.co.id";
const SERVER_IP = "103.125.180.51";
const UNPACK_TOKEN = "nsg_deploy_secret_2026";

async function deploy() {
  const client = new ftp.Client(30000);
  client.ftp.verbose = true;

  const server = process.env.FTP_SERVER;
  const user = process.env.FTP_USERNAME;
  const password = process.env.FTP_PASSWORD;

  if (!server && !user) {
    console.error("❌ Missing FTP credentials. Set FTP_SERVER, FTP_USERNAME, FTP_PASSWORD.");
    process.exit(1);
  }

  // ===== STEP 1: FTP Upload =====
  console.log("📦 Step 1/3: Connecting to FTP server...");
  try {
    await client.access({
      host: server || SERVER_IP,
      user: user,
      password: password,
      secure: false,
      secureOptions: { rejectUnauthorized: false },
    });
    console.log("✅ FTP connected successfully!");
  } catch (err) {
    console.error("❌ FTP connection failed:", err.message);
    process.exit(1);
  }

  try {
    // Navigate to public_html
    try {
      await client.cd("/public_html");
      console.log("📂 Changed to /public_html");
    } catch {
      console.log("📂 Already in root (public_html)");
    }

    // Upload the tar.gz package
    const tarGzPath = path.join(__dirname, "../site.tar.gz");
    console.log("📤 Step 2/3: Uploading site.tar.gz...");
    await client.uploadFrom(tarGzPath, "site.tar.gz");
    console.log("✅ site.tar.gz uploaded!");

    // Upload the unpacker script
    const unpackerPath = path.join(__dirname, "../unpacker-gz.php");
    console.log("📤 Uploading unpacker-gz.php...");
    await client.uploadFrom(unpackerPath, "unpacker-gz.php");
    console.log("✅ unpacker-gz.php uploaded!");

  } catch (err) {
    console.error("❌ FTP upload failed:", err.message);
    process.exit(1);
  } finally {
    client.close();
  }

  // ===== STEP 2: Trigger HTTP Unpacker =====
  console.log("🔧 Step 3/3: Triggering remote extraction via HTTPS...");
  
  await new Promise((resolve, reject) => {
    const url = `/unpacker-gz.php?token=${UNPACK_TOKEN}`;
    const options = {
      host: SERVER_IP,
      port: 443,
      path: url,
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
        console.log(`📥 Unpacker Response (HTTP ${res.statusCode}):`);
        console.log(data);
        if (data.includes("DEPLOY_SUCCESS")) {
          console.log("🎉 Deployment completed successfully!");
          resolve();
        } else {
          reject(new Error("Unpacker did not return DEPLOY_SUCCESS"));
        }
      });
    });

    req.on("error", (err) => reject(err));
    req.on("timeout", () => { req.destroy(); reject(new Error("Unpacker request timed out")); });
    req.end();
  });
}

deploy().catch((err) => {
  console.error("💥 Deployment failed:", err.message);
  process.exit(1);
});
