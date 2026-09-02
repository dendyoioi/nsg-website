<?php
/**
 * Automated Deployment Extractor for PT Nattu Global Synergy
 * Extracts deploy.zip directly into public_html and cleans up.
 */

$token = $_GET['token'] ?? '';
if ($token !== 'nsg_deploy_secret_2026') {
    http_response_code(403);
    header('Content-Type: text/plain');
    echo "Forbidden: Invalid Token";
    exit;
}

$zipPath = __DIR__ . '/deploy.zip';

if (!file_exists($zipPath)) {
    http_response_code(404);
    header('Content-Type: text/plain');
    echo "Error: deploy.zip not found in " . __DIR__;
    exit;
}

if (!class_exists('ZipArchive')) {
    http_response_code(500);
    header('Content-Type: text/plain');
    echo "Error: ZipArchive extension is not enabled in PHP";
    exit;
}

$zip = new ZipArchive();
$res = $zip->open($zipPath);

if ($res === TRUE) {
    $zip->extractTo(__DIR__);
    $zip->close();
    
    // Clean up archive and extractor script
    @unlink($zipPath);
    @unlink(__FILE__);
    
    header('Content-Type: text/plain');
    echo "DEPLOY_SUCCESS: Website files extracted successfully!";
} else {
    http_response_code(500);
    header('Content-Type: text/plain');
    echo "Error: Failed to extract zip file. Error code: " . $res;
}
