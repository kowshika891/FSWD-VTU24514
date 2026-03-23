<?php
// api/checkout.php
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "Not logged in"]);
    exit;
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $conn->beginTransaction();

        $stmt = $conn->prepare("
            SELECT c.qty, p.price, p.id as product_id
            FROM cart c 
            JOIN products p ON c.product_id = p.id 
            WHERE c.user_id = ?
        ");
        $stmt->execute([$user_id]);
        $items = $stmt->fetchAll();

        if (count($items) === 0) {
            $conn->rollBack();
            echo json_encode(["status" => "error", "message" => "Cart is empty"]);
            exit;
        }

        $total = 0;
        foreach ($items as $item) {
            $total += ($item['qty'] * $item['price']);
        }

        $orderStmt = $conn->prepare("INSERT INTO orders (user_id, total) VALUES (?, ?)");
        $orderStmt->execute([$user_id, $total]);
        $order_id = $conn->lastInsertId();

        $itemStmt = $conn->prepare("INSERT INTO order_items (order_id, product_id, qty, price) VALUES (?, ?, ?, ?)");
        foreach ($items as $item) {
            $itemStmt->execute([$order_id, $item['product_id'], $item['qty'], $item['price']]);
        }

        $clearCart = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
        $clearCart->execute([$user_id]);

        $conn->commit();
        echo json_encode(["status" => "success", "message" => "Order placed successfully! Order ID: #$order_id"]);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(["status" => "error", "message" => "Checkout failed: " . $e->getMessage()]);
    }
}
?>
