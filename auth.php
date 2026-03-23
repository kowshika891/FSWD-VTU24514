<?php
// api/auth.php
require 'db.php';

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if ($action === 'register') {
        $username = trim($data['username'] ?? '');
        $password = trim($data['password'] ?? '');

        if (!$username || !$password) {
            echo json_encode(["status" => "error", "message" => "Please provide a username and password"]);
            exit;
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        try {
            $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
            $stmt->execute([$username, $hash]);
            echo json_encode(["status" => "success", "message" => "Registration successful. You can now login!"]);
        } catch(PDOException $e) {
            if ($e->errorInfo[1] == 1062) { // 1062 is Duplicate entry for unique key
                echo json_encode(["status" => "error", "message" => "Username already exists"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Database error"]);
            }
        }
    } 
    elseif ($action === 'login') {
        $username = trim($data['username'] ?? '');
        $password = trim($data['password'] ?? '');

        $stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            echo json_encode(["status" => "success", "user" => $user['username']]);
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid username or password"]);
        }
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'logout') {
        session_destroy();
        echo json_encode(["status" => "success", "message" => "Logged out successfully"]);
    } elseif ($action === 'me') {
        if (isset($_SESSION['user_id'])) {
            echo json_encode(["status" => "success", "user" => $_SESSION['username']]);
        } else {
            echo json_encode(["status" => "error", "message" => "Not logged in"]);
        }
    }
}
?>
