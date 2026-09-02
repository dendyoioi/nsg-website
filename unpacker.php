<?php
/**
 * Standalone Unpacker for PT Nattu Global Synergy
 */

error_reporting(E_ALL);
ini_set('display_errors', '1');

$token = $_GET['token'] ?? '';
if ($token !== 'nsg_deploy_secret_2026') {
    http_response_code(403);
    echo "Forbidden: Invalid Token";
    exit;
}

header('Content-Type: text/plain');
echo "=== UNPACKER STARTED ===\n";

function extractTarFile($tarPath, $destDir) {
    if (!file_exists($tarPath) || filesize($tarPath) === 0) return 0;
    $fp = fopen($tarPath, 'rb');
    if (!$fp) return 0;

    $count = 0;
    while (!feof($fp)) {
        $header = fread($fp, 512);
        if (strlen($header) < 512) break;
        if (trim($header) === '') break;

        $filename = trim(substr($header, 0, 100));
        $prefix = trim(substr($header, 345, 155));
        if ($prefix) $filename = $prefix . '/' . $filename;
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

$tarFiles = [
    __DIR__ . '/site.tar',
    __DIR__ . '/deploy.tar',
    dirname(__DIR__) . '/site.tar',
    dirname(__DIR__) . '/deploy.tar'
];

$extracted = false;
foreach ($tarFiles as $tar) {
    if (file_exists($tar) && filesize($tar) > 1000) {
        echo "Extracting: $tar (" . filesize($tar) . " bytes)...\n";
        $n = extractTarFile($tar, __DIR__);
        echo "Extracted $n files successfully!\n";
        @unlink($tar);
        $extracted = true;
        break;
    }
}

if ($extracted) {
    @unlink(__DIR__ . '/extract.php');
    @unlink(__DIR__ . '/deploy.php');
    @unlink(__FILE__);
    echo "DEPLOY_SUCCESS\n";
} else {
    echo "FAILED: No valid tar file found.\n";
    echo "Files in dir: " . implode(", ", scandir(__DIR__)) . "\n";
}
