#!/usr/bin/env bash
set -e

echo "📦 Package size: $(du -h site.tar.gz | cut -f1)"

echo "📤 Step 1/2: Uploading site.tar.gz and unpacker-gz.php via FTP (Passive Mode)..."
curl -s -S --ftp-pasv --connect-timeout 25 --retry 3 --retry-delay 2 \
  -u "${FTP_USERNAME}:${FTP_PASSWORD}" \
  -T site.tar.gz \
  "ftp://${FTP_SERVER}/site.tar.gz"

curl -s -S --ftp-pasv --connect-timeout 25 --retry 3 --retry-delay 2 \
  -u "${FTP_USERNAME}:${FTP_PASSWORD}" \
  -T unpacker-gz.php \
  "ftp://${FTP_SERVER}/unpacker-gz.php"

echo "✅ FTP upload completed successfully!"

echo "🔧 Step 2/2: Triggering remote extraction on server..."
sleep 2
RESPONSE=$(curl -sk --max-time 90 --resolve "nattuglobalsynergy.co.id:443:103.125.180.51" "https://nattuglobalsynergy.co.id/unpacker-gz.php?token=nsg_deploy_secret_2026" || true)
echo "📥 Unpacker response:"
echo "$RESPONSE"

if echo "$RESPONSE" | grep -q "DEPLOY_SUCCESS"; then
  echo "🎉 Deployment completed and extracted successfully!"
else
  echo "⚠️ Note: Extraction response received, proceeding to site verification..."
fi
