<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");
header("X-Content-Type-Options: nosniff");

require_once __DIR__ . "/../../../private/database.php";

function customerRespond($status, $payload)
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function customerString($value, $maxLength, $field)
{
    if (!is_string($value) && !is_numeric($value)) {
        customerRespond(422, array(
            "success" => false,
            "error" => array(
                "code" => "VALIDATION_ERROR",
                "message" => $field . " must be a string"
            )
        ));
    }

    $value = trim((string) $value);

    if ($value === "" || strlen($value) > $maxLength) {
        customerRespond(422, array(
            "success" => false,
            "error" => array(
                "code" => "VALIDATION_ERROR",
                "message" => $field . " is invalid"
            )
        ));
    }

    return $value;
}

function customerInternalKey()
{
    $expectedKey = getenv("SKIN_ANALYSIS_WRITE_API_KEY");
    $providedKey = isset($_SERVER["HTTP_X_INTERNAL_API_KEY"])
        ? $_SERVER["HTTP_X_INTERNAL_API_KEY"]
        : "";

    if (!$expectedKey) {
        customerRespond(500, array(
            "success" => false,
            "error" => array(
                "code" => "SERVER_MISCONFIGURED",
                "message" => "API authentication is not configured"
            )
        ));
    }

    if (!$providedKey || !hash_equals($expectedKey, $providedKey)) {
        customerRespond(401, array(
            "success" => false,
            "error" => array(
                "code" => "UNAUTHORIZED",
                "message" => "Unauthorized"
            )
        ));
    }
}

function customerBoolean($value)
{
    return (int) $value === 1;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Allow: POST");
    customerRespond(405, array(
        "success" => false,
        "error" => array(
            "code" => "METHOD_NOT_ALLOWED",
            "message" => "POST only"
        )
    ));
}

customerInternalKey();

if (!isset($pdo) || !($pdo instanceof PDO)) {
    customerRespond(500, array(
        "success" => false,
        "error" => array(
            "code" => "DATABASE_NOT_CONFIGURED",
            "message" => "Database connection is not available"
        )
    ));
}

$rawBody = file_get_contents("php://input");
$input = json_decode($rawBody, true);

if (!is_array($input)) {
    customerRespond(400, array(
        "success" => false,
        "error" => array(
            "code" => "INVALID_JSON",
            "message" => "Invalid JSON body"
        )
    ));
}

$provider = customerString(isset($input["provider"]) ? $input["provider"] : "", 32, "provider");
$providerUserId = customerString(isset($input["provider_user_id"]) ? $input["provider_user_id"] : "", 150, "provider_user_id");
$limit = isset($input["limit"]) && is_numeric($input["limit"]) ? (int) $input["limit"] : 20;
$offset = isset($input["offset"]) && is_numeric($input["offset"]) ? (int) $input["offset"] : 0;

$limit = max(1, min(50, $limit));
$offset = max(0, $offset);

try {
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $customerStatement = $pdo->prepare("
        SELECT
            id,
            provider,
            email,
            display_name,
            email_verified,
            created_at,
            updated_at,
            last_seen_at
        FROM customers
        WHERE provider = :provider
          AND provider_user_id = :provider_user_id
        LIMIT 1
    ");
    $customerStatement->execute(array(
        ":provider" => $provider,
        ":provider_user_id" => $providerUserId
    ));
    $customer = $customerStatement->fetch(PDO::FETCH_ASSOC);

    if (!$customer) {
        customerRespond(404, array(
            "success" => false,
            "error" => array(
                "code" => "CUSTOMER_NOT_FOUND",
                "message" => "Customer not found"
            )
        ));
    }

    $customer["email_verified"] = customerBoolean($customer["email_verified"]);

    $countStatement = $pdo->prepare("SELECT COUNT(*) FROM skin_analysis_sessions WHERE customer_id = :customer_id");
    $countStatement->execute(array(":customer_id" => $customer["id"]));
    $totalAnalyses = (int) $countStatement->fetchColumn();

    $sessionStatement = $pdo->prepare(
        "SELECT
            id,
            session_uuid,
            status,
            source,
            model_version,
            inference_ms,
            failure_code,
            failure_message,
            started_at,
            completed_at,
            created_at,
            updated_at
        FROM skin_analysis_sessions
        WHERE customer_id = :customer_id
        ORDER BY started_at DESC, id DESC
        LIMIT " . $limit . " OFFSET " . $offset
    );
    $sessionStatement->execute(array(":customer_id" => $customer["id"]));
    $sessions = $sessionStatement->fetchAll(PDO::FETCH_ASSOC);

    $consentStatement = $pdo->prepare("SELECT image_consent, privacy_consent, policy_version, consented_at, withdrawn_at FROM skin_analysis_consents WHERE analysis_id = :analysis_id LIMIT 1");
    $inputStatement = $pdo->prepare("SELECT i.id, i.gender, i.age_range, st.slug AS self_reported_skin_type, st.name AS self_reported_skin_type_name, i.raw_answers, i.created_at FROM skin_analysis_inputs i LEFT JOIN skin_types st ON st.id = i.self_reported_skin_type_id WHERE i.analysis_id = :analysis_id LIMIT 1");
    $concernStatement = $pdo->prepare("SELECT sc.slug, sc.name FROM skin_analysis_input_concerns sic INNER JOIN skin_concerns sc ON sc.id = sic.concern_id WHERE sic.analysis_input_id = :input_id ORDER BY sc.id ASC");
    $goalStatement = $pdo->prepare("SELECT sg.slug, sg.name FROM skin_analysis_input_goals sig INNER JOIN skincare_goals sg ON sg.id = sig.goal_id WHERE sig.analysis_input_id = :input_id ORDER BY sg.id ASC");
    $resultStatement = $pdo->prepare("SELECT id, detected_skin_type_id, skin_score, skin_evenness, cleanliness, smoothness, redness_ratio, glow, pore_ratio, tone_variance, analysis_summary, created_at FROM skin_analysis_results WHERE analysis_id = :analysis_id LIMIT 1");
    $detectionStatement = $pdo->prepare("SELECT id, class_name, confidence, severity, region, bbox_x1, bbox_y1, bbox_x2, bbox_y2, created_at FROM skin_analysis_detections WHERE analysis_id = :analysis_id ORDER BY id ASC");
    $recommendationStatement = $pdo->prepare("SELECT r.id, r.product_id, r.rank_no, r.recommendation_reason, r.skin_type_score, r.concern_score, r.goal_score, r.product_name_snapshot, r.product_brand_snapshot, p.name AS product_name, p.slug AS product_slug, p.brand AS product_brand, p.description AS product_description, p.recommendation_focus, p.price, p.product_url, pc.name AS category FROM skin_analysis_recommendations r LEFT JOIN products p ON p.id = r.product_id LEFT JOIN product_categories pc ON pc.id = p.category_id WHERE r.analysis_id = :analysis_id ORDER BY r.rank_no ASC, r.id ASC");

    foreach ($sessions as &$session) {
        $analysisId = (int) $session["id"];

        $consentStatement->execute(array(":analysis_id" => $analysisId));
        $consent = $consentStatement->fetch(PDO::FETCH_ASSOC);
        $session["consent"] = $consent ?: null;

        if ($consent) {
            $session["consent"]["image_consent"] = customerBoolean($consent["image_consent"]);
            $session["consent"]["privacy_consent"] = customerBoolean($consent["privacy_consent"]);
        }

        $inputStatement->execute(array(":analysis_id" => $analysisId));
        $analysisInput = $inputStatement->fetch(PDO::FETCH_ASSOC);

        if ($analysisInput) {
            $inputId = (int) $analysisInput["id"];
            unset($analysisInput["id"]);

            $concernStatement->execute(array(":input_id" => $inputId));
            $analysisInput["concerns"] = $concernStatement->fetchAll(PDO::FETCH_ASSOC);

            $goalStatement->execute(array(":input_id" => $inputId));
            $analysisInput["goals"] = $goalStatement->fetchAll(PDO::FETCH_ASSOC);
        }

        $session["questionnaire"] = $analysisInput ?: null;

        $resultStatement->execute(array(":analysis_id" => $analysisId));
        $session["result"] = $resultStatement->fetch(PDO::FETCH_ASSOC) ?: null;

        $detectionStatement->execute(array(":analysis_id" => $analysisId));
        $session["detections"] = $detectionStatement->fetchAll(PDO::FETCH_ASSOC);

        $recommendationStatement->execute(array(":analysis_id" => $analysisId));
        $session["recommendations"] = $recommendationStatement->fetchAll(PDO::FETCH_ASSOC);

        unset($session["id"]);
    }
    unset($session);

    customerRespond(200, array(
        "success" => true,
        "data" => array(
            "customer" => $customer,
            "pagination" => array(
                "total" => $totalAnalyses,
                "limit" => $limit,
                "offset" => $offset,
                "has_more" => $offset + count($sessions) < $totalAnalyses
            ),
            "analyses" => $sessions
        )
    ));
} catch (PDOException $error) {
    error_log("Customer analysis lookup failed: " . $error->getMessage());

    customerRespond(500, array(
        "success" => false,
        "error" => array(
            "code" => "DATABASE_ERROR",
            "message" => "Unable to load customer analysis"
        )
    ));
}
