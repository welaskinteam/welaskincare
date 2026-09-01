<?php

header("Content-Type: application/json; charset=utf-8");


/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

require_once __DIR__ . "/../../private/database.php";


try {

    /*
    |--------------------------------------------------------------------------
    | Check PDO
    |--------------------------------------------------------------------------
    */

    if (!isset($pdo)) {

        throw new Exception("PDO does not exist.");

    }


    /*
    |--------------------------------------------------------------------------
    | Method
    |--------------------------------------------------------------------------
    */

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {

        http_response_code(405);

        echo json_encode(
            array(
                "success" => false,
                "message" => "POST only"
            ),
            JSON_UNESCAPED_UNICODE
        );

        exit;

    }


    /*
    |--------------------------------------------------------------------------
    | Read JSON
    |--------------------------------------------------------------------------
    */

    $raw = file_get_contents("php://input");

    $input = json_decode($raw, true);


    /*
    |--------------------------------------------------------------------------
    | Validate JSON
    |--------------------------------------------------------------------------
    */

    if (!is_array($input)) {

        http_response_code(400);

        echo json_encode(
            array(
                "success" => false,
                "message" => "Invalid JSON body"
            ),
            JSON_UNESCAPED_UNICODE
        );

        exit;

    }


    /*
    |--------------------------------------------------------------------------
    | Input
    |--------------------------------------------------------------------------
    */

    $skinType = null;
    $concerns = array();
    $goal = null;


    if (isset($input["skin_type"])) {
        $skinType = $input["skin_type"];
    }


    if (isset($input["concerns"])) {
        $concerns = $input["concerns"];
    }


    if (isset($input["goal"])) {
        $goal = $input["goal"];
    }


    /*
    |--------------------------------------------------------------------------
    | Validate Skin Type
    |--------------------------------------------------------------------------
    */

    if (!$skinType) {

        http_response_code(400);

        echo json_encode(
            array(
                "success" => false,
                "message" => "skin_type is required"
            ),
            JSON_UNESCAPED_UNICODE
        );

        exit;

    }


    /*
    |--------------------------------------------------------------------------
    | Validate Concerns
    |--------------------------------------------------------------------------
    */

    if (!is_array($concerns) || count($concerns) === 0) {

        http_response_code(400);

        echo json_encode(
            array(
                "success" => false,
                "message" => "concerns must be a non-empty array"
            ),
            JSON_UNESCAPED_UNICODE
        );

        exit;

    }


    /*
    |--------------------------------------------------------------------------
    | Validate Goal
    |--------------------------------------------------------------------------
    */

    if (!$goal) {

        http_response_code(400);

        echo json_encode(
            array(
                "success" => false,
                "message" => "goal is required"
            ),
            JSON_UNESCAPED_UNICODE
        );

        exit;

    }


    /*
    |--------------------------------------------------------------------------
    | Clean Concerns
    |--------------------------------------------------------------------------
    */

    $cleanConcerns = array();


    foreach ($concerns as $concern) {

        if (is_string($concern)) {

            $concern = trim($concern);

            if ($concern !== "") {

                $cleanConcerns[] = $concern;

            }

        }

    }


    $concerns = $cleanConcerns;


    if (count($concerns) === 0) {

        http_response_code(400);

        echo json_encode(
            array(
                "success" => false,
                "message" => "concerns cannot be empty"
            ),
            JSON_UNESCAPED_UNICODE
        );

        exit;

    }


    /*
    |--------------------------------------------------------------------------
    | Create Concern Placeholders
    |--------------------------------------------------------------------------
    |
    | Example:
    |
    | concerns:
    | ["acne", "pores"]
    |
    | becomes:
    |
    | :concern_0, :concern_1
    |
    */

    $concernPlaceholders = array();


    foreach ($concerns as $index => $concern) {

        $concernPlaceholders[] = ":concern_" . $index;

    }


    $concernSql = implode(
        ", ",
        $concernPlaceholders
    );


    /*
    |--------------------------------------------------------------------------
    | Recommendation Query
    |--------------------------------------------------------------------------
    */

    $sql = "

        SELECT

            scored.*,

            (
                scored.skin_score
                + scored.concern_score
                + scored.goal_score
            ) AS total_score


        FROM (

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


                pc.name AS category,


                /*
                |--------------------------------------------------------------------------
                | Skin Type Score
                |--------------------------------------------------------------------------
                */

                CASE

                    WHEN EXISTS (

                        SELECT 1

                        FROM product_skin_types pst

                        WHERE pst.product_id = p.id

                        AND pst.skin_type_id = (

                            SELECT id

                            FROM skin_types

                            WHERE slug = :skin_type

                            LIMIT 1

                        )

                    )

                    THEN 3

                    ELSE 0

                END AS skin_score,


                /*
                |--------------------------------------------------------------------------
                | Concern Score
                |--------------------------------------------------------------------------
                */

                CASE

                    WHEN EXISTS (

                        SELECT 1

                        FROM product_concerns pcon

                        WHERE pcon.product_id = p.id

                        AND pcon.concern_id IN (

                            SELECT id

                            FROM skin_concerns

                            WHERE slug IN (
                                $concernSql
                            )

                        )

                    )

                    THEN 3

                    ELSE 0

                END AS concern_score,


                /*
                |--------------------------------------------------------------------------
                | Goal Score
                |--------------------------------------------------------------------------
                */

                CASE

                    WHEN EXISTS (

                        SELECT 1

                        FROM product_goals pg

                        WHERE pg.product_id = p.id

                        AND pg.goal_id = (

                            SELECT id

                            FROM skincare_goals

                            WHERE slug = :goal

                            LIMIT 1

                        )

                    )

                    THEN 3

                    ELSE 0

                END AS goal_score


            FROM products p


            LEFT JOIN product_categories pc

                ON pc.id = p.category_id


            WHERE p.is_active = 1

        ) AS scored


        WHERE (

            scored.skin_score
            + scored.concern_score
            + scored.goal_score

        ) > 0


        ORDER BY

            total_score DESC,
            id ASC


        LIMIT 10

    ";


    /*
    |--------------------------------------------------------------------------
    | Prepare
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare($sql);


    /*
    |--------------------------------------------------------------------------
    | Bind Skin Type
    |--------------------------------------------------------------------------
    */

    $stmt->bindValue(
        ":skin_type",
        $skinType,
        PDO::PARAM_STR
    );


    /*
    |--------------------------------------------------------------------------
    | Bind Goal
    |--------------------------------------------------------------------------
    */

    $stmt->bindValue(
        ":goal",
        $goal,
        PDO::PARAM_STR
    );


    /*
    |--------------------------------------------------------------------------
    | Bind Concerns
    |--------------------------------------------------------------------------
    */

    foreach ($concerns as $index => $concern) {

        $stmt->bindValue(
            ":concern_" . $index,
            $concern,
            PDO::PARAM_STR
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Execute
    |--------------------------------------------------------------------------
    */

    $stmt->execute();


    /*
    |--------------------------------------------------------------------------
    | Fetch
    |--------------------------------------------------------------------------
    */

    $products = $stmt->fetchAll(
        PDO::FETCH_ASSOC
    );


    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    echo json_encode(
        array(

            "success" => true,

            "skin_type" => $skinType,

            "concerns" => $concerns,

            "goal" => $goal,

            "count" => count($products),

            "items" => $products

        ),
        JSON_UNESCAPED_UNICODE
    );


} catch (PDOException $e) {

    /*
    |--------------------------------------------------------------------------
    | Database Error
    |--------------------------------------------------------------------------
    */

    http_response_code(500);

    echo json_encode(
        array(
            "success" => false,
            "message" => "Database query failed"
        ),
        JSON_UNESCAPED_UNICODE
    );


} catch (Exception $e) {

    /*
    |--------------------------------------------------------------------------
    | General Error
    |--------------------------------------------------------------------------
    */

    http_response_code(500);

    echo json_encode(
        array(
            "success" => false,
            "message" => "Server error"
        ),
        JSON_UNESCAPED_UNICODE
    );

}
