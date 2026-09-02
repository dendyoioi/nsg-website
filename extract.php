<?php
/**
 * Universal Zero-Dependency Tar & Zip Extractor for PT Nattu Global Synergy
 * Works on every PHP installation without requiring ZipArchive, shell_exec, or Phar.
 */

error_reporting(E_ALL);
ini_set('display_errors', '1');

$token = $_GET['token'] ?? '';
if ($token !== 'nsg_deploy_secret_2026') {
    http_response_code(403);
    header('Content-Type: text/plain');
    echo "Forbidden: Invalid Token";
    exit;
}

function extractTarFile($tarPath, $destDir) {
    if (!file_exists($tarPath)) return false;
    $fp = fopen($tarPath, 'rb');
    if (!$fp) return false;

    while (!feof($fp)) {
        $header = fread($fp, 512);
        if (strlen($header) < 512) break;
        if (trim($header) === '') break;

        $filename = trim(substr($header, 0, 100));
        $prefix = trim(substr($header, 345, 155));
        if ($prefix) {
            $filename = $prefix . '/' . $filename;
        }
        if (!$filename) continue;

        $filesize = octdec(trim(substr($header, 124, 12)));
        $typeflag = substr($header, 156, 1);

        $cleanFilename = ltrim(str_replace('../', '', $filename), './');
        if ($cleanFilename === '') continue;

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
            }
            $padding = (512 - ($filesize % 512)) % 512;
            if ($padding > 0) {
                fread($fp, $padding);
            }
        }
    }
    fclose($fp);
    return true;
}

$tarPath = __DIR__ . '/deploy.tar';
$zipPath = __DIR__ . '/deploy.zip';
$success = false;
$method = "";

if (file_exists($tarPath)) {
    if (extractTarFile($tarPath, __DIR__)) {
        $success = true;
        $method = "Pure PHP Tar Extractor";
    }
}

if (!$success && file_exists($zipPath) && function_exists('exec')) {
    @exec('unzip -o ' . escapeshellarg($zipPath) . ' -d ' . escapeshellarg(__DIR__) . ' 2>&1', $out, $ret);
    if ($ret === 0) {
        $success = true;
        $method = "System Unzip";
    }
}

if ($success) {
    @unlink($tarPath);
    @unlink($zipPath);
    @unlink(__FILE__);
    
    header('Content-Type: text/plain');
    echo "DEPLOY_SUCCESS: Extracted via " . $method;
} else {
    http_response_code(500);
    header('Content-Type: text/plain');
    echo "Error: Extraction failed. deploy.tar not found or not readable in " . __DIR__;
}
