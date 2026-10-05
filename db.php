<?php
// api/db.php
header('Content-Type: application/json; charset=utf-8');

// DB credentials — XAMPP default typically user=root, no password (change if different)
$DB_HOST = 'localhost';
$DB_USER = 'root';
$DB_PASS = ''; // if you set the password then enter
$DB_NAME = 'karanjekar_college';

$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'DB connection failed: '.$mysqli->connect_error]);
    exit;
}
$mysqli->set_charset('utf8mb4');
