<?php

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");
header("X-Content-Type-Options: nosniff");

require_once __DIR__ . "/../../../private/database.php";

function respond($status, $payload)
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function isListArray($value)
{
    if (!is_array($value)) {
        return false;
    }

    if (count($value) === 0) {
        return true;
    }

    return array_keys($value) === range(0, count($value) - 1);
}

function stringValue($value, $maxLength, $field)
{
    if ($value === null || $value === "") {
        return null;
    }

    if (!is_string($value) && !is_numeric($value)) {
        respond(422, array(
            "success" => false,
            "error" => array(
                "code" => "VALIDATION_ERROR",
                "message" => $field . " must be a string"
            )
        ));
    }

    $value = trim((string) $value);

    if (strlen($value) > $maxLength) {
        respond(422, array(
            "success" => false,
            "error" => array(
                "code" => "VALIDATION_ERROR",
                "message" => $field . " is too long"
            )
        ));
    }

    return $value === "" ? null : $value;
}

function nullableNumber($value, $field)
{
    if ($value === null || $value === "") {
        return null;
    }

    if (!is_numeric($value)) {
        respond(422, array(
            "success" => false,
            "error" => array(
                "code" => "VALIDATION_ERROR",
                "message" => $field . " must be numeric"
            )
        ));
    }

    return (float) $value;
}

function boolValue($value, $default)
{
    if ($value === null) {
        return $default ? 1 : 0;
    }

    if (is_bool($value)) {
        return $value ? 1 : 0;
    }

    if ($value === 1 || $value === "1" || $value === "true") {
        return 1;
    }

    if ($value === 0 || $value === "0" || $value === "false") {
        return 0;
    }

    respond(422, array(
        "success" => false,
        "error" => array(
            "code" => "VALIDATION_ERROR",
            "message" => "Boolean value is invalid"
        )
    ));
}

function normalizeSlug($value)
{
    $value = strtolower(trim((string) $value));
    return str_replace("_", "-", $value);
}

function lookupId($pdo, $table, $slug)
{
    $allowedTables = array("skin_types", "skin_concerns", "skincare_goals");

    if (!in_array($table, $allowedTables, true) || !$slug) {
        return null;
    }

    $statement = $pdo->prepare("SELECT id FROM `" . $table . "` WHERE slug = :slug LIMIT 1");
    $statement->execute(array(":slug" => normalizeSlug($slug)));
    $id = $statement->fetchColumn();

    return $id === false ? null : (int) $id;
}

function cleanSlugList($value, $field)
{
    if ($value === null) {
        return array();
    }

    if (is_string($value)) {
        $value = trim($value);
        $value = $value === "" ? array() : explode(",", $value);
    }

    if (!isListArray($value)) {
        respond(422, array(
            "success" => false,
            "error" => array(
                "code" => "VALIDATION_ERROR",
                "message" => $field . " must be an array"
            )
        ));
    }

    $items = array();

    foreach ($value as $item) {
        $item = stringValue($item, 100, $field . " item");

        if ($item !== null) {
            $item = normalizeSlug($item);

            if (!in_array($item, $items, true)) {
                $items[] = $item;
            }
        }
    }

    return $items;
}

function removeMediaFields($value)
{
    $blockedKeys = array(
        "image",
        "image_url",
        "profile_image_url",
        "picture",
        "storage_path",
        "base64",
        "data_url"
    );

    if (is_array($value)) {
        $clean = array();

        foreach ($value as $key => $item) {
            if (in_array(strtolower((string) $key), $blockedKeys, true)) {
                continue;
            }

            $clean[$key] = removeMediaFields($item);
        }

        return $clean;
    }

    if (is_string($value) && strpos(strtolower($value), "data:image/") === 0) {
        return null;
    }

    return $value;
}

function requireInternalApiKey()
{
    $expectedKey = getenv("SKIN_ANALYSIS_WRITE_API_KEY");
    $providedKey = isset($_SERVER["HTTP_X_INTERNAL_API_KEY"])
        ? $_SERVER["HTTP_X_INTERNAL_API_KEY"]
        : "";

    if (!$expectedKey) {
        respond(500, array(
            "success" => false,
            "error" => array(
                "code" => "SERVER_MISCONFIGURED",
                "message" => "API authentication is not configured"
            )
        ));
    }

    if (!$providedKey || !hash_equals($expectedKey, $providedKey)) {
        respond(401, array(
            "success" => false,
            "error" => array(
                "code" => "UNAUTHORIZED",
                "message" => "Unauthorized"
            )
        ));
    }
}

function uuidV4()
{
    $bytes = openssl_random_pseudo_bytes(16);
    $bytes[6] = chr(ord($bytes[6]) & 0x0f | 0x40);
    $bytes[8] = chr(ord($bytes[8]) & 0x3f | 0x80);

    return vsprintf("%s%s-%s-%s-%s-%s%s%s", str_split(bin2hex($bytes), 4));
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Allow: POST");
    respond(405, array(
        "success" => false,
        "error" => array(
            "code" => "METHOD_NOT_ALLOWED",
            "message" => "POST only"
        )
    ));
}

requireInternalApiKey();

if (!isset($pdo) || !($pdo instanceof PDO)) {
    respond(500, array(
        "success" => false,
        "error" => array(
            "code" => "DATABASE_NOT_CONFIGURED",
            "message" => "Database connection is not available"
        )
    ));
}

$contentLength = isset($_SERVER["CONTENT_LENGTH"]) ? (int) $_SERVER["CONTENT_LENGTH"] : 0;

if ($contentLength > 1024 * 1024) {
    respond(413, array(
        "success" => false,
        "error" => array(
            "code" => "PAYLOAD_TOO_LARGE",
            "message" => "Request body is too large"
        )
    ));
}

$rawBody = file_get_contents("php://input");
$input = json_decode($rawBody, true);

if (!is_array($input)) {
    respond(400, array(
        "success" => false,
        "error" => array(
            "code" => "INVALID_JSON",
            "message" => "Invalid JSON body"
        )
    ));
}

$customer = isset($input["customer"]) && is_array($input["customer"])
    ? $input["customer"]
    : array();
$session = isset($input["session"]) && is_array($input["session"])
    ? $input["session"]
    : array();
$consent = isset($input["consent"]) && is_array($input["consent"])
    ? $input["consent"]
    : array();
$questionnaire = isset($input["questionnaire"]) && is_array($input["questionnaire"])
    ? $input["questionnaire"]
    : (isset($input["inputs"]) && is_array($input["inputs"]) ? $input["inputs"] : array());
$result = isset($input["result"]) && is_array($input["result"])
    ? $input["result"]
    : (isset($input["analysis_result"]) && is_array($input["analysis_result"]) ? $input["analysis_result"] : array());
$recommendations = isset($input["recommendations"]) && is_array($input["recommendations"])
    ? $input["recommendations"]
    : (isset($input["product_recommendations"]) && is_array($input["product_recommendations"])
        ? $input["product_recommendations"]
        : array());

$provider = stringValue(isset($customer["provider"]) ? $customer["provider"] : null, 32, "customer.provider");
$providerUserId = stringValue(isset($customer["provider_user_id"]) ? $customer["provider_user_id"] : null, 150, "customer.provider_user_id");
$email = stringValue(isset($customer["email"]) ? $customer["email"] : null, 320, "customer.email");
$displayName = stringValue(isset($customer["display_name"]) ? $customer["display_name"] : null, 255, "customer.display_name");
$emailVerified = boolValue(isset($customer["email_verified"]) ? $customer["email_verified"] : null, false);

if (($provider === null) !== ($providerUserId === null)) {
    respond(422, array(
        "success" => false,
        "error" => array(
            "code" => "VALIDATION_ERROR",
            "message" => "customer.provider and customer.provider_user_id must be provided together"
        )
    ));
}

$sessionUuid = stringValue(isset($session["session_uuid"]) ? $session["session_uuid"] : null, 36, "session.session_uuid");

if ($sessionUuid !== null && !preg_match("/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/", $sessionUuid)) {
    respond(422, array(
        "success" => false,
        "error" => array(
            "code" => "VALIDATION_ERROR",
            "message" => "session.session_uuid must be a valid UUID"
        )
    ));
}

$sessionUuid = $sessionUuid ?: uuidV4();
$status = stringValue(isset($session["status"]) ? $session["status"] : null, 30, "session.status") ?: "completed";
$source = stringValue(isset($session["source"]) ? $session["source"] : null, 30, "session.source");
$modelVersion = stringValue(isset($session["model_version"]) ? $session["model_version"] : null, 100, "session.model_version");
$inferenceMs = nullableNumber(isset($session["inference_ms"]) ? $session["inference_ms"] : null, "session.inference_ms");
$failureCode = stringValue(isset($session["failure_code"]) ? $session["failure_code"] : null, 100, "session.failure_code");
$failureMessage = stringValue(isset($session["failure_message"]) ? $session["failure_message"] : null, 500, "session.failure_message");

$gender = stringValue(isset($questionnaire["gender"]) ? $questionnaire["gender"] : null, 30, "questionnaire.gender");
$ageRange = stringValue(isset($questionnaire["age_range"]) ? $questionnaire["age_range"] : (isset($questionnaire["ageRange"]) ? $questionnaire["ageRange"] : null), 30, "questionnaire.age_range");
$selfReportedSkinType = isset($questionnaire["skin_type"])
    ? $questionnaire["skin_type"]
    : (isset($questionnaire["skinType"]) ? $questionnaire["skinType"] : null);
$selfReportedSkinType = stringValue($selfReportedSkinType, 100, "questionnaire.skin_type");
$concerns = cleanSlugList(isset($questionnaire["concerns"]) ? $questionnaire["concerns"] : null, "questionnaire.concerns");
$goals = cleanSlugList(isset($questionnaire["goals"]) ? $questionnaire["goals"] : (isset($questionnaire["goal"]) ? $questionnaire["goal"] : null), "questionnaire.goals");

if ($goals === array() && isset($questionnaire["goal"]) && is_string($questionnaire["goal"]) && strpos($questionnaire["goal"], ",") !== false) {
    $goals = cleanSlugList(array_map("trim", explode(",", $questionnaire["goal"])), "questionnaire.goals");
}

$rawAnswers = removeMediaFields($questionnaire);
$rawResult = removeMediaFields($result);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$skinTypeValue = isset($result["skin_type"]) ? $result["skin_type"] : null;

if (is_array($skinTypeValue)) {
    $skinTypeValue = isset($skinTypeValue["class_name"]) ? $skinTypeValue["class_name"] : null;
}

$detectedSkinTypeId = lookupId($pdo, "skin_types", stringValue($skinTypeValue, 100, "result.skin_type"));
$selfReportedSkinTypeId = lookupId($pdo, "skin_types", $selfReportedSkinType);

$features = isset($result["skin_features"]) && is_array($result["skin_features"])
    ? $result["skin_features"]
    : array();

function metricValue($result, $features, $key, $fallbackKey = null)
{
    $value = array_key_exists($key, $result) ? $result[$key] : null;

    if ($value === null && $fallbackKey !== null && array_key_exists($fallbackKey, $result)) {
        $value = $result[$fallbackKey];
    }

    if ($value === null && array_key_exists($key, $features)) {
        $value = $features[$key];
    }

    if (is_array($value)) {
        $value = isset($value["score"]) ? $value["score"] : null;
    }

    return nullableNumber($value, "result." . $key);
}

$skinScore = metricValue($result, $features, "skin_score");
$skinEvenness = metricValue($result, $features, "skin_evenness");
$cleanliness = metricValue($result, $features, "cleanliness");
$smoothness = metricValue($result, $features, "smoothness");
$rednessRatio = metricValue($result, $features, "redness_ratio");
$glow = metricValue($result, $features, "glow");
$poreRatio = metricValue($result, $features, "pore_ratio");
$toneVariance = metricValue($result, $features, "tone_variance");
$analysisSummary = stringValue(isset($result["analysis_summary"]) ? $result["analysis_summary"] : (isset($result["summary"]) ? $result["summary"] : null), 65535, "result.summary");

try {
    $pdo->beginTransaction();

    $customerId = null;

    if ($provider !== null && $providerUserId !== null) {
        $customerStatement = $pdo->prepare("
            INSERT INTO customers
                (provider, provider_user_id, email, display_name, email_verified, last_seen_at)
            VALUES
                (:provider, :provider_user_id, :email, :display_name, :email_verified, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE
                email = VALUES(email),
                display_name = VALUES(display_name),
                email_verified = VALUES(email_verified),
                last_seen_at = CURRENT_TIMESTAMP
        ");
        $customerStatement->execute(array(
            ":provider" => $provider,
            ":provider_user_id" => $providerUserId,
            ":email" => $email,
            ":display_name" => $displayName,
            ":email_verified" => $emailVerified
        ));

        $customerLookup = $pdo->prepare("SELECT id FROM customers WHERE provider = :provider AND provider_user_id = :provider_user_id LIMIT 1");
        $customerLookup->execute(array(
            ":provider" => $provider,
            ":provider_user_id" => $providerUserId
        ));
        $customerId = (int) $customerLookup->fetchColumn();
    }

    $sessionStatement = $pdo->prepare("
        INSERT INTO skin_analysis_sessions
            (session_uuid, customer_id, status, source, model_version, inference_ms, failure_code, failure_message, completed_at)
        VALUES
            (:session_uuid, :customer_id, :status, :source, :model_version, :inference_ms, :failure_code, :failure_message,
             CASE WHEN :status_completed IN ('completed', 'failed', 'cancelled') THEN CURRENT_TIMESTAMP ELSE NULL END)
    ");
    $sessionStatement->execute(array(
        ":session_uuid" => $sessionUuid,
        ":customer_id" => $customerId ?: null,
        ":status" => $status,
        ":source" => $source,
        ":model_version" => $modelVersion,
        ":inference_ms" => $inferenceMs,
        ":failure_code" => $failureCode,
        ":failure_message" => $failureMessage,
        ":status_completed" => $status
    ));
    $analysisId = (int) $pdo->lastInsertId();

    if (count($consent) > 0) {
        $consentStatement = $pdo->prepare("
            INSERT INTO skin_analysis_consents
                (analysis_id, image_consent, privacy_consent, policy_version, consented_at)
            VALUES
                (:analysis_id, :image_consent, :privacy_consent, :policy_version,
                 CASE WHEN :has_consent = 1 THEN CURRENT_TIMESTAMP ELSE NULL END)
        ");
        $imageConsent = boolValue(isset($consent["image_consent"]) ? $consent["image_consent"] : null, false);
        $privacyConsent = boolValue(isset($consent["privacy_consent"]) ? $consent["privacy_consent"] : null, false);
        $consented = $imageConsent && $privacyConsent ? 1 : 0;
        $consentStatement->execute(array(
            ":analysis_id" => $analysisId,
            ":image_consent" => $imageConsent,
            ":privacy_consent" => $privacyConsent,
            ":policy_version" => stringValue(isset($consent["policy_version"]) ? $consent["policy_version"] : null, 50, "consent.policy_version"),
            ":has_consent" => $consented
        ));
    }

    if ($gender !== null || $ageRange !== null || $selfReportedSkinType !== null || count($concerns) > 0 || count($goals) > 0) {
        $inputStatement = $pdo->prepare("
            INSERT INTO skin_analysis_inputs
                (analysis_id, gender, age_range, self_reported_skin_type_id, raw_answers)
            VALUES
                (:analysis_id, :gender, :age_range, :self_reported_skin_type_id, :raw_answers)
        ");
        $inputStatement->execute(array(
            ":analysis_id" => $analysisId,
            ":gender" => $gender,
            ":age_range" => $ageRange,
            ":self_reported_skin_type_id" => $selfReportedSkinTypeId,
            ":raw_answers" => json_encode($rawAnswers, JSON_UNESCAPED_UNICODE)
        ));
        $inputId = (int) $pdo->lastInsertId();

        foreach ($concerns as $concern) {
            $concernId = lookupId($pdo, "skin_concerns", $concern);

            if ($concernId !== null) {
                $statement = $pdo->prepare("INSERT IGNORE INTO skin_analysis_input_concerns (analysis_input_id, concern_id) VALUES (:input_id, :concern_id)");
                $statement->execute(array(":input_id" => $inputId, ":concern_id" => $concernId));
            }
        }

        foreach ($goals as $goal) {
            $goalId = lookupId($pdo, "skincare_goals", $goal);

            if ($goalId !== null) {
                $statement = $pdo->prepare("INSERT IGNORE INTO skin_analysis_input_goals (analysis_input_id, goal_id) VALUES (:input_id, :goal_id)");
                $statement->execute(array(":input_id" => $inputId, ":goal_id" => $goalId));
            }
        }
    }

    if (count($result) > 0) {
        $resultStatement = $pdo->prepare("
            INSERT INTO skin_analysis_results
                (analysis_id, detected_skin_type_id, skin_score, skin_evenness, cleanliness, smoothness,
                 redness_ratio, glow, pore_ratio, tone_variance, analysis_summary, raw_result)
            VALUES
                (:analysis_id, :detected_skin_type_id, :skin_score, :skin_evenness, :cleanliness, :smoothness,
                 :redness_ratio, :glow, :pore_ratio, :tone_variance, :analysis_summary, :raw_result)
        ");
        $resultStatement->execute(array(
            ":analysis_id" => $analysisId,
            ":detected_skin_type_id" => $detectedSkinTypeId,
            ":skin_score" => $skinScore,
            ":skin_evenness" => $skinEvenness,
            ":cleanliness" => $cleanliness,
            ":smoothness" => $smoothness,
            ":redness_ratio" => $rednessRatio,
            ":glow" => $glow,
            ":pore_ratio" => $poreRatio,
            ":tone_variance" => $toneVariance,
            ":analysis_summary" => $analysisSummary,
            ":raw_result" => json_encode($rawResult, JSON_UNESCAPED_UNICODE)
        ));
    }

    $detections = isset($result["detections"]) && isListArray($result["detections"]) ? $result["detections"] : array();
    $detectionStatement = $pdo->prepare("
        INSERT INTO skin_analysis_detections
            (analysis_id, class_name, confidence, severity, region, bbox_x1, bbox_y1, bbox_x2, bbox_y2, raw_detection)
        VALUES
            (:analysis_id, :class_name, :confidence, :severity, :region, :bbox_x1, :bbox_y1, :bbox_x2, :bbox_y2, :raw_detection)
    ");

    foreach ($detections as $detection) {
        if (!is_array($detection)) {
            continue;
        }

        $className = stringValue(isset($detection["class_name"]) ? $detection["class_name"] : (isset($detection["condition"]) ? $detection["condition"] : null), 100, "result.detections.class_name");

        if ($className === null) {
            continue;
        }

        $bbox = isset($detection["bbox"]) && is_array($detection["bbox"]) ? $detection["bbox"] : array();
        $detectionStatement->execute(array(
            ":analysis_id" => $analysisId,
            ":class_name" => $className,
            ":confidence" => nullableNumber(isset($detection["confidence"]) ? $detection["confidence"] : null, "result.detections.confidence"),
            ":severity" => nullableNumber(isset($detection["severity"]) ? $detection["severity"] : null, "result.detections.severity"),
            ":region" => stringValue(isset($detection["region"]) ? $detection["region"] : null, 50, "result.detections.region"),
            ":bbox_x1" => nullableNumber(isset($bbox["x1"]) ? $bbox["x1"] : null, "result.detections.bbox.x1"),
            ":bbox_y1" => nullableNumber(isset($bbox["y1"]) ? $bbox["y1"] : null, "result.detections.bbox.y1"),
            ":bbox_x2" => nullableNumber(isset($bbox["x2"]) ? $bbox["x2"] : null, "result.detections.bbox.x2"),
            ":bbox_y2" => nullableNumber(isset($bbox["y2"]) ? $bbox["y2"] : null, "result.detections.bbox.y2"),
            ":raw_detection" => json_encode(removeMediaFields($detection), JSON_UNESCAPED_UNICODE)
        ));
    }

    $recommendationStatement = $pdo->prepare("
        INSERT INTO skin_analysis_recommendations
            (analysis_id, product_id, rank_no, recommendation_reason, skin_type_score, concern_score, goal_score,
             product_name_snapshot, product_brand_snapshot)
        VALUES
            (:analysis_id, :product_id, :rank_no, :recommendation_reason, :skin_type_score, :concern_score, :goal_score,
             :product_name_snapshot, :product_brand_snapshot)
    ");

    foreach ($recommendations as $index => $recommendation) {
        if (!is_array($recommendation)) {
            continue;
        }

        $rawProductId = isset($recommendation["product_id"])
            ? $recommendation["product_id"]
            : (isset($recommendation["id"]) ? $recommendation["id"] : null);
        $productId = $rawProductId !== null && is_numeric($rawProductId)
            ? (int) $rawProductId
            : null;
        $productName = stringValue(isset($recommendation["name"]) ? $recommendation["name"] : null, 255, "recommendations.name");
        $productBrand = stringValue(isset($recommendation["brand"]) ? $recommendation["brand"] : null, 150, "recommendations.brand");

        if ($productId !== null) {
            $productLookup = $pdo->prepare("SELECT name, brand FROM products WHERE id = :product_id LIMIT 1");
            $productLookup->execute(array(":product_id" => $productId));
            $product = $productLookup->fetch(PDO::FETCH_ASSOC);

            if (!$product) {
                $productId = null;
            } else {
                $productName = $product["name"];
                $productBrand = $product["brand"];
            }
        }

        $rank = isset($recommendation["rank"]) && is_numeric($recommendation["rank"])
            ? (int) $recommendation["rank"]
            : ($index + 1);

        $recommendationStatement->execute(array(
            ":analysis_id" => $analysisId,
            ":product_id" => $productId,
            ":rank_no" => $rank,
            ":recommendation_reason" => stringValue(isset($recommendation["recommendation_reason"]) ? $recommendation["recommendation_reason"] : (isset($recommendation["reason"]) ? $recommendation["reason"] : (isset($recommendation["recommendation_focus"]) ? $recommendation["recommendation_focus"] : null)), 500, "recommendations.reason"),
            ":skin_type_score" => nullableNumber(isset($recommendation["skin_type_score"]) ? $recommendation["skin_type_score"] : null, "recommendations.skin_type_score"),
            ":concern_score" => nullableNumber(isset($recommendation["concern_score"]) ? $recommendation["concern_score"] : null, "recommendations.concern_score"),
            ":goal_score" => nullableNumber(isset($recommendation["goal_score"]) ? $recommendation["goal_score"] : null, "recommendations.goal_score"),
            ":product_name_snapshot" => $productName,
            ":product_brand_snapshot" => $productBrand
        ));
    }

    $pdo->commit();

    respond(201, array(
        "success" => true,
        "data" => array(
            "analysis_id" => $analysisId,
            "session_uuid" => $sessionUuid,
            "customer_id" => $customerId
        )
    ));
} catch (PDOException $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log("Skin analysis save failed: " . $error->getMessage());

    respond(500, array(
        "success" => false,
        "error" => array(
            "code" => "DATABASE_ERROR",
            "message" => "Unable to save skin analysis"
        )
    ));
} catch (Exception $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log("Skin analysis request failed: " . $error->getMessage());

    respond(500, array(
        "success" => false,
        "error" => array(
            "code" => "SERVER_ERROR",
            "message" => "Unable to save skin analysis"
        )
    ));
}
