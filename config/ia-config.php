<?php
return [
    // Provider par défaut "chatgpt" ou "mistralai"
    "default_provider" => "mistralai",

    // Liste des providers disponibles
    "providers" => [
        "mistralai" => [
            "api_key" => "VOTE-CLES"
        ],
        "chatgpt" => [
            "api_key" => "CLE_OPENAI_ICI"
        ],
        "claude" => [
            "api_key" => "sk-ant-api03-VOTRE_CLE_ICI"
        ],
    ]
];