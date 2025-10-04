<?php
// plugins.json.php
// Liste dynamique des plugins disponibles
header('Content-Type: application/json; charset=utf-8');

// Supprimer les warnings
error_reporting(0);

try {
    $pluginsDir = __DIR__;
    
    // Vérification que le dossier existe
    if(!is_dir($pluginsDir)) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Dossier plugins introuvable'
        ], JSON_PRETTY_PRINT);
        exit;
    }

    // Vérification des permissions de lecture
    if(!is_readable($pluginsDir)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'Permissions insuffisantes'
        ], JSON_PRETTY_PRINT);
        exit;
    }

    // Scan du dossier
    $files = scandir($pluginsDir);
    
    if($files === false) {
        throw new Exception('Impossible de lire le dossier plugins');
    }

    // Filtrer uniquement les fichiers plugin-*.js
    $plugins = array_filter($files, function($file) {
        return preg_match('/^plugin-[a-z0-9_-]+\.js$/i', $file) === 1;
    });

    // Réindexer le tableau (enlever les trous)
    $plugins = array_values($plugins);

    // Ordre de chargement recommandé (certains plugins doivent se charger avant d'autres)
    $loadOrder = [
        'plugin-core-fix.js',           // En premier : corrige le comportement de base
        'plugin-toolbar-basic.js',      // Toolbar de base
        'plugin-toolbar-advanced.js',   // Toolbar avancée
        'plugin-align.js',              // Alignement
        'plugin-fonts.js',              // Polices
        'plugin-emojis.js',             // Emojis
        'plugin-upload-image.js',       // Upload images
        'plugin-video.js',              // Vidéos
        'plugin-ia.js',                 // IA (modal complexe)
        'plugin-preview.js',            // Preview
        'plugin-devmode.js'             // Dev mode en dernier
    ];

    // Trier les plugins selon l'ordre défini
    $sortedPlugins = [];
    
    // D'abord ajouter les plugins dans l'ordre défini
    foreach($loadOrder as $orderedPlugin) {
        if(in_array($orderedPlugin, $plugins)) {
            $sortedPlugins[] = $orderedPlugin;
        }
    }
    
    // Puis ajouter les plugins non listés (alphabétiquement)
    foreach($plugins as $plugin) {
        if(!in_array($plugin, $sortedPlugins)) {
            $sortedPlugins[] = $plugin;
        }
    }

    // Construction de la réponse avec métadonnées
    $response = [
        'success' => true,
        'count' => count($sortedPlugins),
        'plugins' => $sortedPlugins,
        'timestamp' => time()
    ];

    // Mode debug (optionnel)
    if(isset($_GET['debug']) && $_GET['debug'] === '1') {
        $response['debug'] = [
            'directory' => $pluginsDir,
            'all_files' => $files,
            'load_order_used' => array_intersect($loadOrder, $sortedPlugins)
        ];
    }

    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur serveur',
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}