<?php
// api/get_questions.php
require_once 'db.php';

// Fetch questions and answers
$qry = "
SELECT q.id as qid, q.text as qtext, q.created_at as qcreated,
       a.id as aid, a.text as atext, a.created_at as acreated
FROM questions q
LEFT JOIN answers a ON a.question_id = q.id
ORDER BY q.created_at DESC, a.created_at ASC
";

$result = $mysqli->query($qry);
if (!$result) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Query failed']);
    $mysqli->close();
    exit;
}

$questions = [];
while ($row = $result->fetch_assoc()) {
    $qid = $row['qid'];
    if (!isset($questions[$qid])) {
        $questions[$qid] = [
            'id' => (int)$row['qid'],
            'text' => $row['qtext'],
            'created_at' => $row['qcreated'],
            'answers' => []
        ];
    }
    if ($row['aid'] !== null) {
        $questions[$qid]['answers'][] = [
            'id' => (int)$row['aid'],
            'text' => $row['atext'],
            'created_at' => $row['acreated']
        ];
    }
}

$result->free();
$mysqli->close();

// Re-index and return
$questionsList = array_values($questions);
echo json_encode(['success' => true, 'questions' => $questionsList], JSON_UNESCAPED_UNICODE);
