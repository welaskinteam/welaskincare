<?php

header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/../../../private/database.php";

try {

    $stmt = $pdo->prepare("
        SELECT
            p.id,
            p.name,
            p.slug,
            p.brand,
            p.description,
            p.recommendation_focus,
            p.price,
            p.image_url,
            p.product_url,
            pc.name AS category
        FROM products p
        LEFT JOIN product_categories pc
            ON pc.id = p.category_id
        WHERE p.is_active = 1
        ORDER BY p.id ASC
    ");

    $stmt->execute();

    $products = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "count" => count($products),
        "items" => $products
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "Failed to fetch products"
    ], JSON_UNESCAPED_UNICODE);
}