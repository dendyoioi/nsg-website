<?php
/**
 * Automated Universal Deployment Extractor for PT Nattu Global Synergy
 * Supports ZipArchive, shell unzip, tar.gz, and PharData
 */

error_reporting(0);
ini_set('display_errors', '0');

$token = $_GET['token'] ?? '';
if ($token !== 'nsg_deploy_secret_2026') {
    http_response_code(403);
    header('Content-Type: text/plain');
    echo "Forbidden: Invalid Token";
    exit;
}

$extracted = false;
$msg = "";

// Method 1: shell_exec / exec unzip
if (!$extracted && (file_exists(__DIR__ . '/deploy.zip'))) {
    if (function_exists('exec')) {
        @exec('unzip -o ' . escapeshellarg(__DIR__ . '/deploy.zip') . ' 2>&1', $out, $ret);
        if ($ret === 0) {
            $extracted = true;
            $msg = "Extracted via system unzip";
        }
    }
}

// Method 2: shell_exec / exec tar
if (!$extracted && file_exists(__DIR__ . '/deploy.tar.gz')) {
    if (function_exists('exec')) {
        @exec('tar -xzf ' . escapeshellarg(__DIR__ . '/deploy.tar.gz') . ' -C ' . escapeshellarg(__DIR__) . ' 2>&1', $out, $ret);
        if ($ret === 0) {
            $extracted = true;
            $msg = "Extracted via system tar";
        }
    }
}

// Method 3: PharData (.tar.gz)
if (!$extracted && file_exists(__DIR__ . '/deploy.tar.gz') && class_exists('PharData')) {
    try {
        $phar = new PharData(__DIR__ . '/deploy.tar.gz');
        $phar->extractTo(__DIR__, null, true);
        $extracted = true;
        $msg = "Extracted via PHP PharData";
    } catch (Exception $e) {
        $msg = "PharData error: " . $e->getMessage();
    }
}

// Method 4: ZipArchive extension
if (!$extracted && file_exists(__DIR__ . '/deploy.zip') && class_exists('ZipArchive')) {
    $zip = new ZipArchive();
    if ($zip->open(__DIR__ . '/deploy.zip') === TRUE) {
        $zip->extractTo(__DIR__);
        $zip->close();
        $extracted = true;
        $msg = "Extracted via ZipArchive";
    }
}

if ($extracted) {
    @unlink(__DIR__ . '/deploy.zip');
    @unlink(__DIR__ . '/deploy.tar.gz');
    @unlink(__FILE__);
    
    header('Content-Type: text/plain');
    echo "DEPLOY_SUCCESS: " . $msg;
} else {
    http_response_code(500);
    header('Content-Type: text/plain');
    echo "Error: Extraction failed. " . $msg;
}
