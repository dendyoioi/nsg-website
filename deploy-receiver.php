<?php
/**
 * Automated Deployment Receiver for PT Nattu Global Synergy
 * Receives deploy package via secure HTTPS POST and extracts it directly to public_html.
 */

error_reporting(0);
ini_set('display_errors', '0');

define('DEPLOY_SECRET', 'nsg_secret_deploy_key_998124018247');

// Security Check
$token = $_POST['token'] ?? $_GET['token'] ?? '';
if (!hash_equals(DEPLOY_SECRET, (string)$token)) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Forbidden: Invalid Deploy Token']);
    exit;
}

// Health check endpoint
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'ready', 'message' => 'Deploy Receiver is online and ready.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_FILES['package'])) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'No deploy package uploaded.']);
    exit;
}

$uploadedFile = $_FILES['package']['tmp_name'];
if (!is_uploaded_file($uploadedFile) || filesize($uploadedFile) < 100) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Invalid or empty upload package.']);
    exit;
}

$destDir = __DIR__;

function extractTar($tarPath, $destDir) {
    $fp = fopen($tarPath, 'rb');
    if (!$fp) return false;
    $count = 0;

    while (!feof($fp)) {
        $header = fread($fp, 512);
        if (strlen($header) < 512 || trim($header) === '') break;

        $filename = trim(substr($header, 0, 100));
        $prefix = trim(substr($header, 345, 155));
        if ($prefix) $filename = $prefix . '/' . $filename;
        if (!$filename) continue;

        $filesize = octdec(trim(substr($header, 124, 12)));
        $typeflag = substr($header, 156, 1);

        $cleanFilename = ltrim(str_replace('../', '', $filename), './');
        if ($cleanFilename === '' || $cleanFilename === 'deploy-receiver.php') continue;

        $target = $destDir . '/' . $cleanFilename;

        if ($typeflag === '5' || substr($cleanFilename, -1) === '/') {
            if (!is_dir($target)) {
                @mkdir($target, 0755, true);
            }
        } else {
            $parentDir = dirname($target);
            if (!is_dir($parentDir)) {
                @mkdir($parentDir, 0755, true);
            }
            $targetFp = fopen($target, 'wb');
            if ($targetFp) {
                $bytesLeft = $filesize;
                while ($bytesLeft > 0) {
                    $readSize = min(8192, $bytesLeft);
                    $chunk = fread($fp, $readSize);
                    fwrite($targetFp, $chunk);
                    $bytesLeft -= strlen($chunk);
                }
                fclose($targetFp);
                @chmod($target, 0644);
                $count++;
            }
            $padding = (512 - ($filesize % 512)) % 512;
            if ($padding > 0) {
                fread($fp, $padding);
            }
        }
    }
    fclose($fp);
    return $count;
}

$extractedCount = extractTar($uploadedFile, $destDir);

if ($extractedCount > 0) {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'success',
        'message' => 'Deployment successfully extracted.',
        'files_extracted' => $extractedCount,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} else {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Extraction failed or archive was empty.']);
}
