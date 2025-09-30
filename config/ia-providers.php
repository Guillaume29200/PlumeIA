<?php
// ia-providers.php
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
    $jsonFile = __DIR__ . '/ia-models.json';
    
    if (!file_exists($jsonFile)) {
        jsonResponse([
            'success' => false,
            'error'   => 'Fichier ia-models.json introuvable'
        ], 404);
    }

    // Vérification des permissions de lecture
    if (!is_readable($jsonFile)) {
        jsonResponse([
            'success' => false,
            'error'   => 'Impossible de lire ia-models.json (permissions insuffisantes)'
        ], 403);
    }

    // Lecture et décodage du fichier JSON
    $jsonContent = file_get_contents($jsonFile);
    
    if ($jsonContent === false) {
        jsonResponse([
            'success' => false,
            'error'   => 'Erreur lors de la lecture de ia-models.json'
        ], 500);
    }

    $data = json_decode($jsonContent, true);
    
    if ($data === null) {
        jsonResponse([
            'success' => false,
            'error'   => 'JSON invalide dans ia-models.json',
            'details' => json_last_error_msg()
        ], 500);
    }

    if (!is_array($data)) {
        jsonResponse([
            'success' => false,
            'error'   => 'Format de données invalide (tableau attendu)'
        ], 500);
    }

    // Mapping des noms affichables pour les providers
    $providerNames = [
        'chatgpt'   => 'ChatGPT (OpenAI)',
        'openai'    => 'OpenAI',
        'mistralai' => 'Mistral AI',
        'mistral'   => 'Mistral',
        'claude'    => 'Claude (Anthropic)'
    ];

    // Construction de la liste des providers
    $providers = [];
    foreach ($data as $key => $value) {
        // Ignorer les clés non-providers
        if ($key === 'display_names') continue;
        
        // Valider que c'est bien un provider (doit avoir un tableau de modèles)
        if (!is_array($value)) continue;
        
        // Ignorer les providers sans modèles
        if (empty($value)) continue;
        
        $providers[] = [
            'id'    => $key,
            'name'  => isset($providerNames[$key]) ? $providerNames[$key] : ucfirst($key),
            'count' => count($value) // Nombre de modèles disponibles
        ];
    }

    // Vérification qu'il y a au moins un provider
    if (empty($providers)) {
        jsonResponse([
            'success' => false,
            'error'   => 'Aucun provider disponible dans ia-models.json'
        ], 404);
    }

    // Chargement de la configuration pour déterminer le provider par défaut
    $configPath = __DIR__ . '/ia-config.php';
    $defaultProvider = '';
    
    if (file_exists($configPath) && is_readable($configPath)) {
        $config = @include $configPath;
        if (is_array($config) && isset($config['default_provider'])) {
            $defaultProvider = $config['default_provider'];
        }
    }
    
    // Si pas de default dans config, prendre le premier provider disponible
    if (empty($defaultProvider) || !isset($data[$defaultProvider])) {
        $defaultProvider = $providers[0]['id'];
    }

    // Tri alphabétique des providers (optionnel, pour cohérence UI)
    usort($providers, function($a, $b) {
        return strcmp($a['name'], $b['name']);
    });

    // Réponse de succès
    jsonResponse([
        'success'   => true,
        'default'   => $defaultProvider,
        'providers' => $providers,
        'count'     => count($providers)
    ], 200);

} catch (Exception $e) {
    // Gestion des erreurs inattendues
    jsonResponse([
        'success' => false,
        'error'   => 'Erreur serveur',
        'message' => $e->getMessage()
    ], 500);
}