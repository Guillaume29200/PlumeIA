// js/plugins/plugin-form.js
// Gestion du formulaire de sauvegarde et bouton clear
// Version 2.0
// Derniere update le : 04/10/2025
registerPlugin({
    name: "form",
    init({editor, hidden, state}) {
        if(!editor) {
            console.error('[plugin-form] Editor non fourni');
            return;
        }

        /**
         * Gère la soumission du formulaire
         */
        function handleFormSubmit(e) {
            e.preventDefault();

            if(!hidden) {
                console.warn('[plugin-form] Champ hidden introuvable');
                return;
            }

            try {
                // En mode dev, on enregistre le code brut
                if(state.devMode) {
                    const codeBlock = editor.querySelector('code');
                    hidden.value = codeBlock ? codeBlock.textContent : editor.textContent;
                } else {
                    hidden.value = editor.innerHTML;
                }

                // Validation du contenu
                if(!hidden.value.trim()) {
                    alert('L\'éditeur est vide. Rien à enregistrer.');
                    return;
                }

                // Afficher les stats du contenu
                const stats = getContentStats();
                const message = `Contenu prêt à être envoyé :\n\n` +
                    `• ${stats.chars} caractères\n` +
                    `• ${stats.words} mots\n` +
                    `• ${stats.paragraphs} paragraphes\n` +
                    `• ${stats.images} images\n\n` +
                    `Mode : ${state.devMode ? 'Développeur (code)' : 'Visuel (HTML)'}`;

                alert(message);

                // Dans un vrai cas, on soumettrait le formulaire
                // e.target.submit();

            } catch(err) {
                console.error('[plugin-form] Erreur soumission:', err);
                alert('Erreur lors de la préparation du contenu');
            }
        }

        /**
         * Calcule les statistiques du contenu
         */
        function getContentStats() {
            const text = editor.innerText || '';
            const html = editor.innerHTML || '';

            return {
                chars: text.length,
                words: text.split(/\s+/).filter(w => w.length > 0).length,
                paragraphs: (html.match(/<p>/g) || []).length,
                images: (html.match(/<img/g) || []).length,
                links: (html.match(/<a/g) || []).length
            };
        }

        /**
         * Gère le bouton clear
         */
        function handleClearButton() {
            if(state.devMode) {
                alert('Désactivez le mode développement avant de vider l\'éditeur');
                return;
            }

            const stats = getContentStats();
            
            if(stats.chars === 0) {
                alert('L\'éditeur est déjà vide');
                return;
            }

            const message = `Voulez-vous vraiment vider l'éditeur ?\n\n` +
                `Vous allez perdre :\n` +
                `• ${stats.chars} caractères\n` +
                `• ${stats.words} mots\n` +
                `• ${stats.images} images\n\n` +
                `Cette action est irréversible.`;

            if(confirm(message)) {
                editor.innerHTML = '<p><br></p>';
                editor.focus();
                console.log('[plugin-form] Éditeur vidé');
            }
        }

        /**
         * Auto-sauvegarde locale (localStorage)
         */
        function setupAutoSave() {
            const AUTOSAVE_KEY = 'editor-autosave';
            const AUTOSAVE_INTERVAL = 30000; // 30 secondes

            // Charger l'auto-save au démarrage
            const saved = localStorage.getItem(AUTOSAVE_KEY);
            if(saved && editor.innerHTML.trim() === '<p><br></p>') {
                if(confirm('Un brouillon a été trouvé. Voulez-vous le restaurer ?')) {
                    editor.innerHTML = saved;
                    console.log('[plugin-form] Brouillon restauré');
                }
            }

            // Auto-save périodique
            setInterval(() => {
                if(!state.devMode && editor.innerHTML.trim()) {
                    localStorage.setItem(AUTOSAVE_KEY, editor.innerHTML);
                }
            }, AUTOSAVE_INTERVAL);

            // Sauvegarder avant fermeture de la page
            window.addEventListener('beforeunload', (e) => {
                const stats = getContentStats();
                if(stats.chars > 100) {
                    localStorage.setItem(AUTOSAVE_KEY, editor.innerHTML);
                    
                    // Avertir l'utilisateur
                    e.preventDefault();
                    e.returnValue = 'Vous avez du contenu non enregistré. Êtes-vous sûr de vouloir quitter ?';
                    return e.returnValue;
                }
            });
        }

        /**
         * Bouton d'export
         */
        function createExportButton() {
            const form = document.querySelector('form');
            if(!form) return;

            const exportBtn = document.createElement('button');
            exportBtn.type = 'button';
            exportBtn.className = 'btn btn-outline-info';
            exportBtn.innerHTML = '💾 Exporter HTML';
            exportBtn.title = 'Télécharger le contenu en fichier HTML';

            exportBtn.addEventListener('click', exportAsHTML);

            // Ajouter après le bouton enregistrer
            const submitBtn = form.querySelector('button[type="submit"]');
            if(submitBtn && submitBtn.parentNode) {
                submitBtn.parentNode.insertBefore(exportBtn, submitBtn.nextSibling);
            }
        }

        /**
         * Exporte le contenu en fichier HTML
         */
        function exportAsHTML() {
            const content = editor.innerHTML;
            const template = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Export éditeur</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
        img { max-width: 100%; height: auto; }
        blockquote { border-left: 4px solid #0d6efd; padding-left: 1rem; color: #6c757d; font-style: italic; }
    </style>
</head>
<body>
${content}
</body>
</html>`;

            const blob = new Blob([template], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `export-${Date.now()}.html`;
            a.click();
            URL.revokeObjectURL(url);

            console.log('[plugin-form] Export HTML effectué');
        }

        // Initialisation
        const form = document.querySelector('form');
        if(form) {
            form.addEventListener('submit', handleFormSubmit);
        }

        const clearBtn = document.getElementById('clear-btn');
        if(clearBtn) {
            clearBtn.addEventListener('click', handleClearButton);
        }

        setupAutoSave();
        createExportButton();

        console.log('[plugin-form] Initialisé avec succès');
    }
});