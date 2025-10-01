<center><h3>/!\ATTENTION NE PAS UTILISER POUR LE MOMENT/!\</h3></center>
<hr />

## 🪶 PlumeIA – Votre plume numérique intelligente

PlumeIA est un module **WYSIWYG d’assistance à l’écriture basé sur l’intelligence artificielle**.  
Il vous accompagne dans vos créations en vous proposant :

- ✍️ **Rédaction** : générez des articles, textes ou idées en quelques secondes.  
- 📝 **Correction** : améliorez automatiquement le style, la grammaire et la clarté.  
- 🌍 **Traduction** : traduisez vos contenus en plusieurs langues, rapidement et fidèlement.  
- 💻 **Code & HTML** : créez des structures HTML propres, prêtes à l’emploi, sans effort.  

Que vous soyez **rédacteur, développeur ou simple utilisateur**, PlumeIA vous apporte une écriture fluide, précise et créative, optimisée par la puissance des modèles d’IA modernes.  

---

## ✅ Compatibilité

PlumeIA est actuellement compatible avec :  
- OpenAI (ChatGPT)  
- MistralAI  
- Anthropic (Claude)  

---

## 🛠️ Édition & fonctionnalités natives

PlumeIA intègre toutes les fonctions essentielles d’un éditeur moderne :  

- Gestion typographique  
- Styles & effets : citation, surbrillance, spoiler, code (préformaté)  
- Alignement du texte  
- Gestion des émojis  
- Insertion de médias : vidéos (YouTube, Facebook, TikTok), images, URL  

---

## 🤖 Génération & assistance IA

Avec PlumeIA, vous pouvez :  

- Générer automatiquement des articles à partir de mots-clés  
- Choisir votre IA préférée, sélectionner un modèle, et produire un contenu adapté  
- Générer du **code HTML** aussi facilement qu’un article  
- Corriger vos textes grâce à une IA spécialisée en grammaire et orthographe  
- Améliorer la mise en page de vos articles avec l’option **mise en forme automatique**  
- Traduire vos textes ou pages en **multilingue**, simplement et efficacement  

---

## ⚙️ Configuration & API Keys

Pour fonctionner, PlumeIA nécessite de renseigner vos clés API dans le fichier **`/config/ia-config.php`** :  

```php
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

```

## 🔑 Où obtenir vos clés API ?

- [Mistral AI — console.mistral.ai](https://console.mistral.ai/) — *(accès gratuit / console)*
- [OpenAI — platform.openai.com/api-keys](https://platform.openai.com/api-keys) — *(service payant)*
- [Anthropic (Claude) — console.anthropic.com](https://console.anthropic.com/) — *(service payant)*

## 💰 Gratuit vs Payant

- **MistralAI** : actuellement **gratuit** (aucun dépôt requis).  
- **OpenAI (ChatGPT)** et **Anthropic (Claude)** : **payants** — un dépôt initial (par exemple ~5 $) peut être demandé pour activer la facturation ; vérifiez les conditions et tarifs sur leurs consoles respectives.
