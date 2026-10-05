<?php
// api/add_answer.php
require_once 'db.php';

$input = json_decode(file_get_contents('php://input'), true);
$question_id = isset($input['question_id']) ? intval($input['question_id']) : (isset($_POST['question_id']) ? intval($_POST['question_id']) : 0);
$answerText = isset($input['text']) ? trim($input['text']) : (isset($_POST['text']) ? trim($_POST['text']) : '');

if ($question_id <= 0 || $answerText === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid input']);
    exit;
}

// ensure question exists
$chk = $mysqli->prepare("SELECT id FROM questions WHERE id = ?");
$chk->bind_param('i', $question_id);
$chk->execute();
$chk->store_result();
if ($chk->num_rows === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Question not found']);
    $chk->close();
    $mysqli->close();
    exit;
}
$chk->close();

$stmt = $mysqli->prepare("INSERT INTO answers (question_id, text) VALUES (?, ?)");
$stmt->bind_param('is', $question_id, $answerText);
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'answer_id' => $stmt->insert_id]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Insert failed']);
}
$stmt->close();
$mysqli->close();
