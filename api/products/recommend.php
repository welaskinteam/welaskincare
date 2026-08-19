<?php

header("Content-Type: application/json; charset=utf-8");

try {

    // ========================================
    // MARK: Database
    // ========================================

    require_once __DIR__ . "/../../../private/database.php";

    if (!isset($pdo)) {
        throw new Exception("PDO does not exist");
    }


    // ========================================
    // MARK: Method
    // ========================================

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {

        http_response_code(405);

        echo json_encode(array(
            "success" => false,
            "message" => "POST only"
        ), JSON_UNESCAPED_UNICODE);

        exit;
    }


    // ========================================
    // MARK: Read JSON
    // ========================================

    $raw = file_get_contents("php://input");

    $input = json_decode($raw, true);

    if (!is_array($input)) {
        throw new Exception("Invalid JSON");
    }


    // ========================================
    // MARK: Skin Type
    // ========================================

    $skinType = isset($input["skin_type"])
        ? $input["skin_type"]
        : null;


    if ($skinType !== null) {

        if (!is_string($skinType) || trim($skinType) === "") {
            throw new Exception("skin_type must be a non-empty string");
        }

        $skinType = trim($skinType);
    }


    // ========================================
    // MARK: Concerns
    // ========================================

    $concerns = isset($input["concerns"])
        ? $input["concerns"]
        : null;


    if (!is_array($concerns)) {
        throw new Exception("concerns must be an array");
    }


    $validConcerns = array();


    foreach ($concerns as $concern) {

        if (is_string($concern) && trim($concern) !== "") {

            $validConcerns[] = trim($concern);
        }
    }


    $concerns = array_values(array_unique($validConcerns));


    if (count($concerns) === 0) {
        throw new Exception("concerns cannot be empty");
    }


    // ========================================
    // MARK: Goals
    // ========================================

    $goals = isset($input["goals"])
        ? $input["goals"]
        : array();


    if (!is_array($goals)) {
        throw new Exception("goals must be an array");
    }


    $validGoals = array();


    foreach ($goals as $goal) {

        if (is_string($goal) && trim($goal) !== "") {

            $validGoals[] = trim($goal);
        }
    }


    $goals = array_values(array_unique($validGoals));


    // ========================================
    // MARK: SQL Parameters
    // ========================================

    $slugPlaceholders = array();
    $namePlaceholders = array();

    $params = array();


    foreach ($concerns as $index => $concern) {

        $slugPlaceholder = ":slug_" . $index;
        $namePlaceholder = ":name_" . $index;

        $slugPlaceholders[] = $slugPlaceholder;
        $namePlaceholders[] = $namePlaceholder;

        $params[$slugPlaceholder] = $concern;
        $params[$namePlaceholder] = $concern;
    }


    // ========================================
    // MARK: Query
    // ========================================

    $sql = "
        SELECT DISTINCT
            p.id,
            p.name,
            p.slug,
            p.brand,
            p.description,
            p.recommendation_focus,
            p.price,
            p.image_url,
            p.product_url,
            pc.name AS category,
            sc.slug AS matched_concern

        FROM products p

        INNER JOIN product_concerns pcon
            ON pcon.product_id = p.id

        INNER JOIN skin_concerns sc
            ON sc.id = pcon.concern_id

        LEFT JOIN product_categories pc
            ON pc.id = p.category_id

        WHERE p.is_active = 1

        AND (
            sc.slug IN (" . implode(",", $slugPlaceholders) . ")
            OR sc.name IN (" . implode(",", $namePlaceholders) . ")
        )

        ORDER BY p.name
    ";


    $stmt = $pdo->prepare($sql);

    $stmt->execute($params);


    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);


    // ========================================
    // MARK: Calculate Concern Score
    // ========================================

    $products = array();


    foreach ($rows as $row) {

        $productId = $row["id"];


        if (!isset($products[$productId])) {

            $products[$productId] = array(
                "id" => $row["id"],
                "name" => $row["name"],
                "slug" => $row["slug"],
                "brand" => $row["brand"],
                "description" => $row["description"],
                "recommendation_focus" => $row["recommendation_focus"],
                "price" => $row["price"],
                "image_url" => $row["image_url"],
                "product_url" => $row["product_url"],
                "category" => $row["category"],

                "score" => 0,

                "matched_concerns" => array()
            );
        }


        $matchedConcern = $row["matched_concern"];


        if (
            $matchedConcern !== null &&
            !in_array(
                $matchedConcern,
                $products[$productId]["matched_concerns"]
            )
        ) {

            $products[$productId]["matched_concerns"][] =
                $matchedConcern;

            $products[$productId]["score"]++;
        }
    }


    // ========================================
    // MARK: Convert Array
    // ========================================

    $products = array_values($products);


    // ========================================
    // MARK: Sort
    // ========================================

    usort($products, function ($a, $b) {

        if ($a["score"] != $b["score"]) {

            return ($a["score"] < $b["score"])
                ? 1
                : -1;
        }


        return strcmp($a["name"], $b["name"]);
    });


    // ========================================
    // MARK: Response
    // ========================================

    echo json_encode(array(
        "success" => true,

        "skin_type" => $skinType,

        "concerns" => $concerns,

        "goals" => $goals,

        "count" => count($products),

        "items" => $products

    ), JSON_UNESCAPED_UNICODE);


} catch (Exception $e) {

    http_response_code(500);

    echo json_encode(array(
        "success" => false,
        "error" => get_class($e),
        "message" => $e->getMessage(),
        "file" => basename($e->getFile()),
        "line" => $e->getLine()
    ), JSON_UNESCAPED_UNICODE);
}