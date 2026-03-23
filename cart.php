<?php
// api/cart.php
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Not logged in"]);
    exit;
}

$user_id = $_SESSION['user_id'];
$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'get') {
    $stmt = $conn->prepare("
        SELECT c.id as cart_id, c.qty, p.id as product_id, p.name, p.price, p.img 
        FROM cart c 
        JOIN products p ON c.product_id = p.id 
        WHERE c.user_id = ?
    ");
    $stmt->execute([$user_id]);
    $items = $stmt->fetchAll();
    echo json_encode(["status" => "success", "data" => $items]);
} 
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if ($action === 'add') {
        $product_id = $data['product_id'] ?? 0;
        
        $stmt = $conn->prepare("SELECT id, qty FROM cart WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$user_id, $product_id]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            $new_qty = $existing['qty'] + 1;
            $update = $conn->prepare("UPDATE cart SET qty = ? WHERE id = ?");
            $update->execute([$new_qty, $existing['id']]);
        } else {
            $insert = $conn->prepare("INSERT INTO cart (user_id, product_id, qty) VALUES (?, ?, 1)");
            $insert->execute([$user_id, $product_id]);
        }
        echo json_encode(["status" => "success", "message" => "Added to cart"]);
    }
    elseif ($action === 'update_qty') {
        $product_id = $data['product_id'] ?? 0;
        $delta = $data['delta'] ?? 0;

        $stmt = $conn->prepare("SELECT id, qty FROM cart WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$user_id, $product_id]);
        $existing = $stmt->fetch();

        if ($existing) {
            $new_qty = max(1, $existing['qty'] + $delta);
            $update = $conn->prepare("UPDATE cart SET qty = ? WHERE id = ?");
            $update->execute([$new_qty, $existing['id']]);
        }
        echo json_encode(["status" => "success"]);
    }
    elseif ($action === 'remove') {
        $product_id = $data['product_id'] ?? 0;
        $del = $conn->prepare("DELETE FROM cart WHERE user_id = ? AND product_id = ?");
        $del->execute([$user_id, $product_id]);
        echo json_encode(["status" => "success"]);
    }
}
?>
