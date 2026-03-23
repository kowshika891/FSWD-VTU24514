<?php
// api/products.php
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $conn->query("SELECT * FROM products");
        $products = $stmt->fetchAll();
        echo json_encode(["status" => "success", "data" => $products]);
    } catch(PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Could not fetch products"]);
    }
}
?>
