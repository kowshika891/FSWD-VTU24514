<?php
// setup_db.php - Run this script once to initialize the database and tables for Venom Store

$servername = "localhost";
$username = "root"; // Default XAMPP MySQL user
$password = "";     // Default XAMPP MySQL password (empty)
$dbname = "venom_store";

try {
    // 1. Connect to MySQL Server without selecting a database
    $conn = new PDO("mysql:host=$servername;port=3312", $username, $password);
    // set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 2. Create the Database if it doesn't exist
    $sql = "CREATE DATABASE IF NOT EXISTS $dbname";
    $conn->exec($sql);
    echo "Database created or already exists.<br>";

    // 3. Connect specifically to the new database
    $conn->exec("USE $dbname");

    // 4. Create Users Table
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conn->exec($sql);
    echo "Table 'users' created.<br>";

    // 5. Create Products Table
    $sql = "CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        img VARCHAR(255) NOT NULL
    )";
    $conn->exec($sql);
    echo "Table 'products' created.<br>";

    // 6. Create Cart Table
    $sql = "CREATE TABLE IF NOT EXISTS cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        qty INT DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )";
    $conn->exec($sql);
    echo "Table 'cart' created.<br>";

    // 7. Create Orders Table
    $sql = "CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    $conn->exec($sql);
    echo "Table 'orders' created.<br>";

    // 8. Create Order Items Table
    $sql = "CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        qty INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )";
    $conn->exec($sql);
    echo "Table 'order_items' created.<br>";

    // 9. Create Saved Items Table
    $sql = "CREATE TABLE IF NOT EXISTS saved_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )";
    $conn->exec($sql);
    echo "Table 'saved_items' created.<br>";

    // 10. Insert initial products (if the table is empty)
    $check_products = $conn->query("SELECT COUNT(*) FROM products")->fetchColumn();
    if ($check_products == 0) {
        $inventory = [
            ["Racing Helmet", 3500, "images/helmet.jpg"],
            ["Racing Jacket", 12000, "images/jacket.jpg"],
            ["Racing Gloves", 1500, "images/gloves.jpg"],
            ["Racing Cover", 3000, "images/cover.jpg"],
            ["Racing Harness", 5000, "images/goggles.jpg"]
        ];

        $stmt = $conn->prepare("INSERT INTO products (name, price, img) VALUES (?, ?, ?)");
        foreach ($inventory as $item) {
            $stmt->execute($item);
        }
        echo "Initial products inserted correctly.<br>";
    } else {
        echo "Products table already has data, skipping insert.<br>";
    }

    echo "<h3>Setup Complete successfully! 🎉</h3>";
    echo "<p>You can now delete this file and start using your backend.</p>";

} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
$conn = null;
?>
