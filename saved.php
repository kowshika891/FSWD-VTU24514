<?php
// api/saved.php
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Not logged in"]);
    exit;
}

$user_id = $_SESSION['user_id'];
$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'get') {
    $stmt = $conn->prepare("
        SELECT s.id as saved_id, p.id as product_id, p.name, p.price, p.img 
        FROM saved_items s 
        JOIN products p ON s.product_id = p.id 
        WHERE s.user_id = ?
    ");
    $stmt->execute([$user_id]);
    $items = $stmt->fetchAll();
    echo json_encode(["status" => "success", "data" => $items]);
} 
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $product_id = $data['product_id'] ?? 0;
    
    if ($action === 'add') {
        $stmt = $conn->prepare("SELECT id FROM saved_items WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$user_id, $product_id]);
        if (!$stmt->fetch()) {
            $insert = $conn->prepare("INSERT INTO saved_items (user_id, product_id) VALUES (?, ?)");
            $insert->execute([$user_id, $product_id]);
        }
        echo json_encode(["status" => "success"]);
    }
    elseif ($action === 'remove') {
        $del = $conn->prepare("DELETE FROM saved_items WHERE user_id = ? AND product_id = ?");
        $del->execute([$user_id, $product_id]);
        echo json_encode(["status" => "success"]);
    }
}
?>
