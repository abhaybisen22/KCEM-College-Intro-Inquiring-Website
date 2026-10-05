<?php
// api/add_question.php
require_once 'db.php';

// Read input (supports form or JSON)
$input = json_decode(file_get_contents('php://input'), true);
$questionText = isset($input['text']) ? trim($input['text']) : (isset($_POST['text']) ? trim($_POST['text']) : '');

if ($questionText === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Empty question']);
    exit;
}

$stmt = $mysqli->prepare("INSERT INTO questions (text) VALUES (?)");
$stmt->bind_param('s', $questionText);
if ($stmt->execute()) {
    $insertId = $stmt->insert_id;
    echo json_encode(['success' => true, 'question_id' => $insertId]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Insert failed']);
}
$stmt->close();
$mysqli->close();
