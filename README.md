<center><h3>/!\ATTENTION NE PAS UTILISER POUR LE MOMENT/!\</h3></center>
<hr />

<p align="center">
  <img src="https://logo.svgcdn.com/l/mistral-ai-8x.png" width="150" alt="Mistral AI" />
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Claude_AI_logo.svg/1280px-Claude_AI_logo.svg.png" width="150" alt="Claude AI" />
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/2560px-OpenAI_Logo.svg.png" width="150" alt="OpenAI" />
</p>

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
- Styles & effets : citation, surbrillance, spoiler
- Véritable éditeur de code digne de VSCode !
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

## 🤖 Comparatif des providers IA de PlumeIA

PlumeIA intègre plusieurs fournisseurs IA pour générer du contenu, corriger ou traduire du texte. Voici un aperçu comparatif des fonctionnalités principales :

| Fonctionnalité           | MistralAI                     | Claude                       | OpenAI                        |
|---------------------------|-------------------------------|-------------------------------|-------------------------------|
| **Génération de texte**    | ✅ Très bonne fluidité, style naturel | ✅ Très cohérent, adapté à la rédaction | ✅ Polyvalent, plus créatif et flexible |
| **Génération HTML**        | ✅ Bon pour snippets simples | ⚠️ Limitée aux structures simples | ✅ Excellente pour HTML complet et propre |
| **Correction / Relecture** | ✅ Orthographe et style correct | ✅ Très précis pour la grammaire | ✅ Très complet, peut reformuler et améliorer |
| **Traduction**             | ⚠️ Basique, parfois approximative | ✅ Bonne traduction, style naturel | ✅ Traductions précises et idiomatiques |
| **Vitesse**               | Rapide                        | Moyenne                       | Rapide selon modèle choisi     |
| **Accessibilité / API**    | Libre / Open-source           | Sur inscription / API         | Sur abonnement / API           |

> ⚡ Astuce : choisissez le provider en fonction de votre tâche. Pour HTML complexe ou traduction précise, OpenAI reste le plus fiable. Pour un usage léger et gratuit, MistralAI fait parfaitement l’affaire. Claude est idéal pour la rédaction et la correction de texte.


## ⚙️ Configuration & API Keys

Pour fonctionner, PlumeIA nécessite de renseigner vos clés API dans le fichier **`/config/ia-config.php`** :  

```php
<?php
return [
    // Provider par défaut "chatgpt" , "mistralai" ou "claude"
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
            "api_key" => "CLE_CLAUDE_ICI"
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

## 📜 Licence & utilisation

PlumeIA est distribué sous la licence GPL-3.0. Cela signifie que :

- Vous pouvez utiliser, copier, modifier et partager PlumeIA gratuitement.
- Vous ne pouvez pas revendiquer PlumeIA comme votre création ni le vendre sous votre nom.
- Si vous modifiez PlumeIA et le redistribuez, les modifications doivent rester libres sous GPL-3.0.
- Aucune garantie n’est fournie : utilisez PlumeIA à vos risques et périls.

⚠️ <b>Propriété :</b> PlumeIA est développé et maintenu par <b>Guillaume R.</b> Vous êtes libre de créer des plugins, des extensions ou des modifications, mais l’éditeur principal reste la propriété de son auteur.

💡 Une documentation pour la création de plugins sera bientôt disponible pour permettre aux développeurs de contribuer facilement sans toucher au cœur de l’éditeur.

## 🧑‍💻 Auteur
Développé par **Guillaume R.** dans le cadre de eSport-CMS/GameServer Hub.

🖥️ [https://esport-cms.net](https://esport-cms.net)

---

> Libre d'utilisation, adaptation et redistribution. Pas besoin de crédit, mais ça fait toujours plaisir. 😉
