<?php
// ia-models.php
header('Content-Type: application/json; charset=utf-8');

// Supprimer les warnings/notices
error_reporting(0);

// Fonction pour renvoyer une réponse JSON propre
function jsonResponse($data, $httpCode = 200) {
    http_response_code($httpCode);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Validation du chemin du fichier
    $modelsPath = __DIR__ . '/ia-models.json';
    
    if (!file_exists($modelsPath)) {
        jsonResponse([
            'success' => false,
            'error'   => 'Fichier ia-models.json introuvable'
        ], 404);
    }

    // Vérification des permissions de lecture
    if (!is_readable($modelsPath)) {
        jsonResponse([
            'success' => false,
            'error'   => 'Impossible de lire ia-models.json (permissions insuffisantes)'
        ], 403);
    }

    // Lecture et décodage du fichier JSON
    $jsonContent = file_get_contents($modelsPath);
    
    if ($jsonContent === false) {
        jsonResponse([
            'success' => false,
            'error'   => 'Erreur lors de la lecture de ia-models.json'
        ], 500);
    }

    $modelsList = json_decode($jsonContent, true);
    
    if ($modelsList === null) {
        jsonResponse([
            'success' => false,
            'error'   => 'JSON invalide dans ia-models.json',
            'details' => json_last_error_msg()
        ], 500);
    }

    // Validation et nettoyage du paramètre provider
    $provider = isset($_GET['provider']) ? strtolower(trim($_GET['provider'])) : '';
    
    // Sécurité : empêcher les caractères dangereux
    if (!preg_match('/^[a-z0-9_-]+$/i', $provider)) {
        jsonResponse([
            'success' => false,
            'error'   => 'Nom de provider invalide (caractères non autorisés)',
            'provider' => $provider
        ], 400);
    }

    if (empty($provider)) {
        jsonResponse([
            'success' => false,
            'error'   => 'Paramètre "provider" manquant',
            'hint'    => 'Utilisez ?provider=chatgpt ou ?provider=mistralai ou ?provider=claude'
        ], 400);
    }

    if (!isset($modelsList[$provider])) {
        // Liste des providers disponibles pour aider l'utilisateur
        $availableProviders = array_filter(
            array_keys($modelsList),
            function($key) { return $key !== 'display_names'; }
        );
        
        jsonResponse([
            'success'   => false,
            'error'     => 'Provider inconnu',
            'provider'  => $provider,
            'available' => array_values($availableProviders)
        ], 404);
    }

    // Vérification que c'est bien un tableau
    if (!is_array($modelsList[$provider])) {
        jsonResponse([
            'success' => false,
            'error'   => 'Configuration invalide pour ce provider',
            'provider' => $provider
        ], 500);
    }

    // Récupération des display_names
    $displayNames = isset($modelsList['display_names']) && is_array($modelsList['display_names'])
        ? $modelsList['display_names']
        : [];

    // Construction du résultat
    $result = [];
    foreach ($modelsList[$provider] as $modelId) {
        // Sécurité : s'assurer que modelId est une chaîne
        if (!is_string($modelId)) {
            continue;
        }
        
        $result[] = [
            'id'   => $modelId,
            'name' => isset($displayNames[$modelId]) ? $displayNames[$modelId] : $modelId
        ];
    }

    // Vérification qu'il y a au moins un modèle
    if (empty($result)) {
        jsonResponse([
            'success' => false,
            'error'   => 'Aucun modèle disponible pour ce provider',
            'provider' => $provider
        ], 404);
    }

    // Réponse de succès
    jsonResponse([
        'success'  => true,
        'provider' => $provider,
        'models'   => $result,
        'count'    => count($result)
    ], 200);

} catch (Exception $e) {
    // Gestion des erreurs inattendues
    jsonResponse([
        'success' => false,
        'error'   => 'Erreur serveur',
        'message' => $e->getMessage()
    ], 500);
}