<?php
/**
 * Automated .tar.gz Unpacker for PT Nattu Global Synergy
 * Receives site.tar.gz via FTP, then extracts in-place.
 */

error_reporting(E_ALL);
ini_set('display_errors', '1');
set_time_limit(120);
ini_set('memory_limit', '256M');

$token = $_GET['token'] ?? '';
if ($token !== 'nsg_deploy_secret_2026') {
    http_response_code(403);
    echo "Forbidden: Invalid Token";
    exit;
}

header('Content-Type: text/plain');
echo "=== NSG DEPLOY UNPACKER v3.0 ===\n";
echo "Time: " . date('Y-m-d H:i:s') . "\n\n";

$tarGzFile = __DIR__ . '/site.tar.gz';
if (!file_exists($tarGzFile) || filesize($tarGzFile) < 1000) {
    echo "FAILED: site.tar.gz not found or too small\n";
    echo "Files in dir: " . implode(", ", array_diff(scandir(__DIR__), ['.', '..'])) . "\n";
    exit;
}

$fileSize = filesize($tarGzFile);
echo "Found: site.tar.gz (" . number_format($fileSize) . " bytes)\n";

// Step 1: Decompress gzip
echo "Step 1: Decompressing gzip...\n";
$gzData = file_get_contents($tarGzFile);
$tarData = @gzdecode($gzData);
if (!$tarData) {
    echo "FAILED: gzdecode failed\n";
    exit;
}
echo "Decompressed: " . number_format(strlen($tarData)) . " bytes of tar data\n";

// Step 2: Extract tar
echo "Step 2: Extracting tar...\n";
$destDir = __DIR__;
$count = 0;
$offset = 0;
$len = strlen($tarData);

$skipFiles = ['deploy-receiver.php', 'unpacker-gz.php', 'unpacker.php', 'deploy.php', 'extract.php'];

while ($offset < $len) {
    if ($offset + 512 > $len) break;
    $header = substr($tarData, $offset, 512);
    $offset += 512;
    
    if (trim($header) === '') {
        // Check for double null block (end of archive)
        if ($offset + 512 <= $len) {
            $nextBlock = substr($tarData, $offset, 512);
            if (trim($nextBlock) === '') break;
        }
        continue;
    }

    $filename = trim(substr($header, 0, 100));
    $prefix = trim(substr($header, 345, 155));
    if ($prefix) $filename = $prefix . '/' . $filename;
    if (!$filename) continue;

    $filesize = octdec(trim(substr($header, 124, 12)));
    $typeflag = substr($header, 156, 1);

    $cleanFilename = ltrim(str_replace('../', '', $filename), './');
    if ($cleanFilename === '') continue;
    
    // Skip protected files
    if (in_array($cleanFilename, $skipFiles)) {
        $offset += $filesize;
        $padding = (512 - ($filesize % 512)) % 512;
        $offset += $padding;
        continue;
    }

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
        $content = substr($tarData, $offset, $filesize);
        file_put_contents($target, $content);
        @chmod($target, 0644);
        $count++;
        
        $offset += $filesize;
        $padding = (512 - ($filesize % 512)) % 512;
        $offset += $padding;
    }
}

echo "Extracted $count files successfully!\n\n";

// Step 3: Cleanup
echo "Step 3: Cleanup...\n";
@unlink($tarGzFile);
echo "Removed site.tar.gz\n";

// Verify key files exist
$verifyFiles = ['index.html', '_next', 'support', 'en'];
$allGood = true;
echo "\nStep 4: Verification...\n";
foreach ($verifyFiles as $vf) {
    $vPath = $destDir . '/' . $vf;
    $exists = file_exists($vPath) || is_dir($vPath);
    echo ($exists ? "  ✓ " : "  ✗ ") . $vf . "\n";
    if (!$exists) $allGood = false;
}

echo "\n";
if ($allGood && $count > 0) {
    echo "DEPLOY_SUCCESS\n";
    echo "Total files extracted: $count\n";
    echo "Completed at: " . date('Y-m-d H:i:s') . "\n";
    // Self-cleanup
    @unlink(__FILE__);
} else {
    echo "DEPLOY_PARTIAL: $count files extracted but verification incomplete\n";
}
