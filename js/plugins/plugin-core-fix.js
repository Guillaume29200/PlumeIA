// js/plugins/plugin-core-fix.js
// Corrige le comportement par défaut des éditeurs contenteditable
// qui créent des <h2>, <div>, ou autres balises indésirables au démarrage
// Derniere update le 01/10/2025
registerPlugin({
    name: "core-fix-empty-block",
    init({editor}) {
        if(!editor) {
            console.error('[plugin-core-fix] Editor non fourni');
            return;
        }

        // Liste des balises indésirables par défaut
        const unwantedDefaultTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
        
        // Balise par défaut souhaitée
        const defaultTag = 'P';
        const defaultContent = `<${defaultTag.toLowerCase()}><br></${defaultTag.toLowerCase()}>`;

        /**
         * Vérifie si l'éditeur est considéré comme vide
         * @returns {boolean}
         */
        function isEditorEmpty() {
            const content = editor.innerHTML.trim();
            
            // Éditeur complètement vide
            if(content === '') return true;
            
            // Contient uniquement un <br>
            if(content === '<br>') return true;
            
            // Contient uniquement une balise vide avec <br>
            const emptyTagPattern = /^<([a-z1-6]+)><br><\/\1>$/i;
            if(emptyTagPattern.test(content)) {
                const match = content.match(emptyTagPattern);
                const tagName = match[1].toUpperCase();
                // Si c'est une balise indésirable
                return unwantedDefaultTags.includes(tagName);
            }
            
            return false;
        }

        /**
         * Réinitialise l'éditeur avec une structure par défaut propre
         */
        function fixEmptyEditor() {
            if(!isEditorEmpty()) return;

            try {
                // Sauvegarder si du contenu existe malgré tout
                const text = editor.innerText.trim();
                
                // Réinitialiser avec la structure par défaut
                editor.innerHTML = defaultContent;

                // Restaurer le texte si présent
                if(text) {
                    const p = editor.querySelector(defaultTag.toLowerCase());
                    if(p) {
                        p.textContent = text;
                    }
                }

                // Placer le curseur au début du nouveau paragraphe
                setCursorAtStart();

            } catch(err) {
                console.error('[plugin-core-fix] Erreur lors de la correction:', err);
            }
        }

        /**
         * Place le curseur au début de l'éditeur
         */
        function setCursorAtStart() {
            try {
                const firstElement = editor.querySelector(defaultTag.toLowerCase());
                if(!firstElement) return;

                const range = document.createRange();
                const selection = window.getSelection();

                // Si l'élément contient du texte, se placer au début
                if(firstElement.childNodes.length > 0) {
                    range.setStart(firstElement.childNodes[0], 0);
                } else {
                    range.setStart(firstElement, 0);
                }
                
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            } catch(err) {
                console.error('[plugin-core-fix] Erreur placement curseur:', err);
            }
        }

        /**
         * Empêche la création de balises indésirables lors de la frappe
         */
        function preventUnwantedTags(e) {
            // Seulement si l'éditeur est vide
            if(!isEditorEmpty()) return;

            // Ne pas bloquer les touches de contrôle
            if(e.ctrlKey || e.metaKey || e.altKey) return;
            
            // Ne pas bloquer les touches spéciales
            const specialKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
            if(specialKeys.includes(e.key)) return;

            // Corriger après la frappe
            setTimeout(fixEmptyEditor, 0);
        }

        /**
         * Nettoie l'éditeur lors du collage
         */
        function handlePaste(e) {
            if(!isEditorEmpty()) return;

            e.preventDefault();
            
            try {
                // Récupérer le texte collé (sans formatage)
                const text = (e.clipboardData || window.clipboardData).getData('text/plain');
                
                if(text.trim()) {
                    // Insérer le texte dans un paragraphe propre
                    editor.innerHTML = `<${defaultTag.toLowerCase()}>${text}</${defaultTag.toLowerCase()}>`;
                    setCursorAtStart();
                } else {
                    fixEmptyEditor();
                }
            } catch(err) {
                console.error('[plugin-core-fix] Erreur lors du collage:', err);
                fixEmptyEditor();
            }
        }

        /**
         * Gère le comportement de la touche Entrée
         */
        function handleEnter(e) {
            // Si on presse Entrée dans un éditeur vide
            if(isEditorEmpty() && e.key === 'Enter') {
                e.preventDefault();
                
                // Créer un nouveau paragraphe
                editor.innerHTML = defaultContent;
                setCursorAtStart();
            }
        }

        // Événements
        editor.addEventListener('keydown', preventUnwantedTags);
        editor.addEventListener('keydown', handleEnter);
        editor.addEventListener('paste', handlePaste);
        editor.addEventListener('focus', fixEmptyEditor);

        // Observer les modifications DOM pour cas edge
        const observer = new MutationObserver((mutations) => {
            // Vérifier seulement si des nœuds ont été ajoutés/supprimés
            const hasStructureChange = mutations.some(m => 
                m.type === 'childList' && (m.addedNodes.length > 0 || m.removedNodes.length > 0)
            );
            
            if(hasStructureChange && isEditorEmpty()) {
                fixEmptyEditor();
            }
        });

        observer.observe(editor, {
            childList: true,
            subtree: false
        });

        // Nettoyage lors de la destruction (si implémenté)
        editor.dataset.coreFixObserver = 'active';
        
        // Correction initiale
        if(isEditorEmpty()) {
            fixEmptyEditor();
        }

        console.log('[plugin-core-fix] Initialisé - Balise par défaut:', defaultTag);
    }
});