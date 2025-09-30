<h4>🪶 PlumeIA – Votre plume numérique intelligente</h4>

PlumeIA est un module WYSIWYG d’assistance à l’écriture basé sur l’intelligence artificielle.
Il vous accompagne dans vos créations en vous proposant :

- Rédaction : générez des articles, textes ou idées en quelques secondes.
- Correction : améliorez automatiquement le style, la grammaire et la clarté.
- Traduction : traduisez vos contenus en plusieurs langues, rapidement et fidèlement.
- Code & HTML : créez des structures HTML propres, prêtes à l’emploi, sans effort.

Que vous soyez rédacteur, développeur ou simple utilisateur, PlumeIA vous apporte une écriture fluide, précise et créative, optimisée par la puissance des modèles d’IA modernes.

<h4>✅ Compatibilité</h4>

- PlumeIA est actuellement compatible avec :
- OpenAI (ChatGPT)
- MistralAI
- Anthropic (Claude)

<h4>🛠️ Édition & fonctionnalités natives</h4>

PlumeIA intègre toutes les fonctions essentielles d’un éditeur moderne :

- Gestion typographique
- Styles & effets : citation, surbrillance, spoiler, code (préformaté)
- Alignement du texte
- Gestion des émojis
- Insertion de médias : vidéos (YouTube, Facebook, TikTok), images, URL

<h4>🤖 Génération & assistance IA</h4>

Avec PlumeIA, vous pouvez :

- Générer automatiquement des articles à partir de mots-clés
- Choisir votre IA préférée, sélectionner un modèle, et produire un contenu adapté
- Générer du code HTML aussi facilement qu’un article
- Corriger vos textes grâce à une IA spécialisée en grammaire et orthographe
- Améliorer la mise en page de vos articles avec l’option mise en forme automatique
- Traduire vos textes ou pages en multilingue, simplement et efficacement

<h4>⚙️ Configuration & API Keys</h4>

Pour fonctionner, PlumeIA nécessite de renseigner vos clés API dans le fichier ia-config.php disponible dans le repertoire /config/ :

<pre>
<?php
return [
    // Provider par défaut "chatgpt" ou "mistralai"
    "default_provider" => "mistralai",

    // Liste des providers disponibles
    "providers" => [
        "mistralai" => [
            "api_key" => "CLE_MISTRAL_ICI"
        ],
        "chatgpt" => [
            "api_key" => "CLE_OPENAI_ICI"
        ],
        "claude" => [
            "api_key" => "sk-ant-api03-VOTRE_CLE_ICI"
        ],
    ]
];
</pre>

<h4>🔑 Où obtenir vos clés API ?</h4>

<ul>
  <li>
    <a href="https://console.mistral.ai/" target="_blank" rel="noopener noreferrer">Mistral AI — console.mistral.ai</a>
    <small class="text-muted"> (accès gratuit / console)</small>
  </li>
  <li>
    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI — platform.openai.com/api-keys</a>
    <small class="text-muted"> (création de clé API — service payant)</small>
  </li>
  <li>
    <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">Anthropic (Claude) — console.anthropic.com</a>
    <small class="text-muted"> (création de clé API — service payant)</small>
  </li>
</ul>

<h4>💰 Gratuit vs Payant</h4>

- MistralAI : actuellement gratuit (aucun dépôt requis).
- OpenAI (ChatGPT) et Anthropic (Claude) : payants, avec un dépôt minimum de 5 $ pour activer les clés API.
