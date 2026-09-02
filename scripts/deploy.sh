#!/usr/bin/env bash
set -e

echo "📦 Step 1/3: Checking/Installing lftp..."
if ! command -v lftp &> /dev/null; then
  sudo apt-get update -qq && sudo apt-get install -y -qq lftp > /dev/null 2>&1
fi
echo "✅ lftp installed"

echo "📤 Step 2/3: Uploading files via FTP to $FTP_SERVER..."
lftp -c "
open -u \"$FTP_USERNAME\",\"$FTP_PASSWORD\" \"ftp://$FTP_SERVER\"
set ssl:verify-certificate false
set ftp:ssl-allow false
set net:timeout 30
set net:max-retries 3
set net:reconnect-interval-base 5
pwd
put site.tar.gz
put unpacker-gz.php
bye
"
echo "✅ FTP upload completed!"

echo "🔧 Step 3/3: Triggering remote extraction..."
sleep 2
RESPONSE=$(curl -sk --max-time 120 --resolve "nattuglobalsynergy.co.id:443:103.125.180.51" "https://nattuglobalsynergy.co.id/unpacker-gz.php?token=nsg_deploy_secret_2026" || true)
echo "📥 Unpacker response:"
echo "$RESPONSE"

if echo "$RESPONSE" | grep -q "DEPLOY_SUCCESS"; then
  echo "🎉 Deployment completed successfully!"
else
  echo "⚠️ Warning: DEPLOY_SUCCESS not in output, checking verification step next..."
fi
