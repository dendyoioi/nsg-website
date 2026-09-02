const ftp = require("basic-ftp");
const path = require("path");

async function deploy() {
  const client = new ftp.Client(30000);
  client.ftp.verbose = true;

  const server = process.env.FTP_SERVER;
  const user = process.env.FTP_USERNAME;
  const password = process.env.FTP_PASSWORD;

  if (!server || !user || !password) {
    console.error("Error: Missing FTP credentials in environment.");
    process.exit(1);
  }

  // Try FTPS first, fallback to standard FTP if needed
  let connected = false;
  
  try {
    console.log(`Connecting to ${server} via FTPS (explicit TLS)...`);
    await client.access({
      host: server,
      user: user,
      password: password,
      secure: false, // Explicit TLS negotiated automatically if available
      secureOptions: { rejectUnauthorized: false }
    });
    connected = true;
    console.log("Connected successfully!");
  } catch (err) {
    console.warn("FTPS connect failed, retrying with standard FTP:", err.message);
    try {
      await client.access({
        host: server,
        user: user,
        password: password,
        secure: false,
        secureOptions: { rejectUnauthorized: false }
      });
      connected = true;
      console.log("Connected via standard FTP!");
    } catch (err2) {
      console.error("All FTP connections failed:", err2);
      process.exit(1);
    }
  }

  try {
    console.log("Uploading site.tar...");
    await client.uploadFrom(path.join(__dirname, "../site.tar"), "site.tar");

    console.log("Uploading unpacker.php...");
    await client.uploadFrom(path.join(__dirname, "../unpacker.php"), "unpacker.php");

    console.log("Uploading deploy-receiver.php...");
    await client.uploadFrom(path.join(__dirname, "../deploy-receiver.php"), "deploy-receiver.php");

    console.log("All deploy files uploaded successfully to cPanel!");
  } catch (err) {
    console.error("Upload error:", err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
