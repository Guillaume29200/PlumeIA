<?php
// ia-generateur.php
header('Content-Type: application/json; charset=utf-8');

// Supprimer tous les warnings/echo indésirables
ob_start();
error_reporting(0);

function jsonExit($arr){
    if(ob_get_length()) ob_clean();
    echo json_encode($arr, JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $configPath = __DIR__ . '/ia-config.php';
    if(!file_exists($configPath)) jsonExit(['success'=>false,'error'=>'Fichier de config introuvable']);

    $config = include $configPath;
    if(!is_array($config)) jsonExit(['success'=>false,'error'=>'Config invalide']);

    $modelsPath = __DIR__ . '/ia-models.json';
    $modelsList = [];
    if(file_exists($modelsPath)){
        $modelsList = json_decode(file_get_contents($modelsPath), true);
        if(!is_array($modelsList)) $modelsList = [];
    }

    // Charger les prompts externes
    $promptsPath = __DIR__ . '/ia-prompts.json';
    $promptsList = [];
    if(file_exists($promptsPath)){
        $promptsList = json_decode(file_get_contents($promptsPath), true);
        if(!is_array($promptsList)) $promptsList = [];
    }

    $inputText = trim($_POST['text'] ?? '');
    $mode = $_POST['mode'] ?? 'text';
    $overrideProvider = strtolower(trim($_POST['provider'] ?? ''));
    $overrideModel = trim($_POST['model'] ?? '');
    $targetLang = trim($_POST['lang'] ?? '');

    if(!$inputText) jsonExit(['success'=>false,'error'=>'Aucun texte fourni']);

    $provider = $overrideProvider ?: strtolower($config['default_provider'] ?? '');
    if(!$provider || !isset($config['providers'][$provider])) {
        jsonExit(['success'=>false,'error'=>"Provider '$provider' non configuré"]);
    }

    $apiKey = $config['providers'][$provider]['api_key'] ?? '';
    if(!$apiKey) jsonExit(['success'=>false,'error'=>"Clé API manquante pour le provider '$provider'"]);

    // Gestion des modèles
    $model = '';
    if($overrideModel && isset($modelsList[$provider]) && in_array($overrideModel, $modelsList[$provider])){
        $model = $overrideModel;
    } elseif(!empty($modelsList[$provider][0])){
        $model = $modelsList[$provider][0];
    }
    if(!$model) jsonExit(['success'=>false,'error'=>"Modèle manquant pour le provider '$provider'"]);

    // Prompt système selon le mode (depuis ia-prompts.json)
    if(isset($promptsList[$mode])){
        $system = $promptsList[$mode];
    } else {
        $system = $promptsList['default'] ?? "Tu es un assistant générique.";
    }

    // Remplacer {{lang}} si présent dans un prompt
    if($mode === 'translate'){
        $langName = $targetLang ?: 'fr';
        $system = str_replace('{{lang}}', $langName, $system);
    }

    // Construction du payload selon le provider
    $payloadArr = [];
    $headers = ['Content-Type: application/json'];
    $url = '';

    if(in_array($provider, ['chatgpt', 'openai'])){
        // OpenAI
        $url = "https://api.openai.com/v1/chat/completions";
        $headers[] = 'Authorization: Bearer '.$apiKey;
        $payloadArr = [
            'model'=>$model,
            'messages'=>[
                ['role'=>'system','content'=>$system],
                ['role'=>'user','content'=>$inputText]
            ],
            'temperature'=>0.6,
            'max_tokens'=>1000
        ];
    } 
    elseif(in_array($provider, ['mistralai', 'mistral'])){
        // Mistral AI
        $url = "https://api.mistral.ai/v1/chat/completions";
        $headers[] = 'Authorization: Bearer '.$apiKey;
        $payloadArr = [
            'model'=>$model,
            'messages'=>[
                ['role'=>'system','content'=>$system],
                ['role'=>'user','content'=>$inputText]
            ],
            'temperature'=>0.6,
            'max_tokens'=>1000
        ];
    }
    elseif($provider === 'claude'){
        // Claude (Anthropic)
        $url = "https://api.anthropic.com/v1/messages";
        $headers[] = 'x-api-key: '.$apiKey;
        $headers[] = 'anthropic-version: 2023-06-01';
        $payloadArr = [
            'model'=>$model,
            'max_tokens'=>1000,
            'system'=>$system,
            'messages'=>[
                ['role'=>'user','content'=>$inputText]
            ],
            'temperature'=>0.6
        ];
    }
    else {
        jsonExit(['success'=>false,'error'=>'Provider inconnu']);
    }

    // Appel API
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payloadArr));
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    $response = curl_exec($ch);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if($curlErr) jsonExit(['success'=>false,'error'=>'Erreur cURL: '.$curlErr]);

    $data = json_decode($response,true);
    if(!$data) jsonExit(['success'=>false,'error'=>'Réponse API invalide']);

    // Extraction du texte selon le provider
    $aiText = '';
    if($provider === 'claude'){
        // Format de réponse Claude
        $aiText = $data['content'][0]['text'] ?? json_encode($data);
    } else {
        // Format OpenAI/Mistral
        $aiText = $data['choices'][0]['message']['content'] ?? 
                  $data['choices'][0]['text'] ?? 
                  ($data['result'] ?? json_encode($data));
    }

    $clean = $aiText;

    // Nettoyage selon le mode
    if($mode==='html'){
        $purifierPaths = [
            __DIR__.'/vendor/ezyang/htmlpurifier/library/HTMLPurifier.auto.php',
            __DIR__.'/config/vendor/ezyang/htmlpurifier/library/HTMLPurifier.auto.php',
            __DIR__.'/../vendor/ezyang/htmlpurifier/library/HTMLPurifier.auto.php'
        ];
        foreach($purifierPaths as $pp){
            if(file_exists($pp)){ require_once $pp; $cfg = HTMLPurifier_Config::createDefault(); $found=true; break; }
        }
        if(!empty($found)){
            $cfg->set('HTML.Allowed', 'p,br,b,strong,i,em,u,s,ul,ol,li,a[href|title|target],img[src|alt|title|width|height],h1,h2,h3,h4,h5,h6,table,thead,tbody,tfoot,tr,th,td,blockquote,pre,code,div,span');
            $cfg->set('Attr.AllowedFrameTargets',['_blank']);
            $cfg->set('HTML.ForbiddenAttributes',['on*']);
            $cfg->set('AutoFormat.AutoParagraph',true);
            $cfg->set('AutoFormat.RemoveEmpty',true);
            $purifier = new HTMLPurifier($cfg);
            $clean = $purifier->purify($aiText);
        } else {
            $clean = strip_tags($aiText,'<p><br><b><strong><i><em><u><s><ul><ol><li><a><img><h1><h2><h3><h4><h5><h6><table><thead><tbody><tfoot><tr><th><td><blockquote><pre><code><div><span>');
        }
    } elseif($mode==='spellcheck' || $mode==='translate'){
        $clean = $aiText;
    } else {
        $clean = preg_replace('#<\s*script[^>]*>.*?<\s*/\s*script\s*>#is','',$aiText);
        $clean = preg_replace('#<\s*iframe[^>]*>.*?<\s*/\s*iframe\s*>#is','',$clean);
    }

    if(strlen($clean)>300000) $clean = substr($clean,0,300000);

    jsonExit(['success'=>true,'response'=>$clean]);

} catch(Exception $e){
    jsonExit(['success'=>false,'error'=>'Exception: '.$e->getMessage()]);
}