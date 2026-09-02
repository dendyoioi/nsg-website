<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

$token = $_GET['token'] ?? '';
if ($token !== 'nsg_deploy_secret_2026') {
    http_response_code(403);
    echo "Forbidden: Invalid Token";
    exit;
}

header('Content-Type: text/plain');
echo "=== NSG DEPLOY DIAGNOSTIC ===\n";
echo "Current Dir: " . __DIR__ . "\n";

function extractTarFile($tarPath, $destDir) {
    if (!file_exists($tarPath)) return false;
    $fp = fopen($tarPath, 'rb');
    if (!$fp) return false;

    $count = 0;
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

$possiblePaths = [
    __DIR__ . '/deploy.tar',
    dirname(__DIR__) . '/deploy.tar',
    '/home/nattuglo/public_html/deploy.tar',
    '/home/nattuglo/deploy.tar'
];

$found = null;
foreach ($possiblePaths as $p) {
    if (file_exists($p) && filesize($p) > 1000) {
        $found = $p;
        echo "Found deploy.tar at: $p (Size: " . filesize($p) . " bytes)\n";
        break;
    }
}

if ($found) {
    $extractedCount = extractTarFile($found, __DIR__);
    echo "Extracted $extractedCount files successfully!\n";
    @unlink($found);
    @unlink(__DIR__ . '/deploy.tar');
    echo "DEPLOY_SUCCESS\n";
} else {
    echo "deploy.tar NOT found. Checked paths:\n" . implode("\n", $possiblePaths) . "\n";
    echo "Files in " . __DIR__ . ":\n" . implode(", ", scandir(__DIR__)) . "\n";
}
