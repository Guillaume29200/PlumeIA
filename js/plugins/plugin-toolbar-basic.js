// js/plugins/plugin-toolbar-basic.js
// Gestion de la barre d'outils de base avec détection d'état et validation
// Version 2.0
// Dernière update : 04/10/2025
registerPlugin({
    name: "toolbar-basic",
    init({editor}) {
        if(!editor) {
            console.error('[plugin-toolbar-basic] Editor non fourni');
            return;
        }

        // Commandes supportées
        const COMMANDS = {
            formatting: ['bold', 'italic', 'underline', 'strikeThrough'],
            lists: ['insertUnorderedList', 'insertOrderedList'],
            blocks: ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P']
        };

        /**
         * Initialise les boutons de la toolbar
         */
        function initToolbarButtons() {
            const buttons = document.querySelectorAll('#toolbar button[data-command]');
            
            buttons.forEach(btn => {
                const cmd = btn.getAttribute('data-command');
                if(!cmd) return;

                // Vérifier si c'est une commande supportée
                const isSupported = [
                    ...COMMANDS.formatting,
                    ...COMMANDS.lists,
                    'formatBlock'
                ].includes(cmd);

                if(!isSupported) return;

                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleButtonClick(btn, cmd);
                });
            });

            console.log(`[plugin-toolbar-basic] ${buttons.length} boutons initialisés`);
        }

        /**
         * Gère le clic sur un bouton
         */
        function handleButtonClick(btn, cmd) {
            try {
                editor.focus();

                if(cmd === 'formatBlock') {
                    const value = btn.getAttribute('data-value') || 'P';
                    executeCommand(cmd, value);
                } else {
                    executeCommand(cmd, null);
                }

                // Mettre à jour l'état des boutons
                updateButtonStates();

            } catch(err) {
                console.error('[plugin-toolbar-basic] Erreur commande:', err);
            }
        }

        /**
         * Initialise le select de base
         */
        function initBasicSelect() {
            const select = document.getElementById('basic-tools');
            if(!select) {
                console.warn('[plugin-toolbar-basic] Select #basic-tools introuvable');
                return;
            }

            select.addEventListener('change', handleSelectChange);
        }

        /**
         * Gère le changement du select
         */
        function handleSelectChange(e) {
            const value = e.target.value;
            if(!value) return;

            try {
                editor.focus();

                // Déterminer le type de commande
                if(COMMANDS.blocks.includes(value)) {
                    executeCommand('formatBlock', value);
                } else if(COMMANDS.lists.includes(value)) {
                    executeCommand(value, null);
                } else if(COMMANDS.formatting.includes(value)) {
                    executeCommand(value, null);
                } else {
                    console.warn('[plugin-toolbar-basic] Commande inconnue:', value);
                }

                // Mettre à jour l'état des boutons
                updateButtonStates();

            } catch(err) {
                console.error('[plugin-toolbar-basic] Erreur select:', err);
            } finally {
                // Reset du select
                setTimeout(() => e.target.value = '', 100);
            }
        }

        /**
         * Exécute une commande avec validation
         */
        function executeCommand(cmd, value) {
            // Vérifier s'il y a une sélection pour les commandes de formatage
            const selection = window.getSelection();
            
            if(COMMANDS.formatting.includes(cmd) && (!selection || selection.isCollapsed)) {
                // Pour le formatage de texte, on a besoin d'une sélection
                // Mais on laisse quand même passer pour que le prochain texte tapé soit formaté
            }

            const success = document.execCommand(cmd, false, value);
            
            if(!success) {
                console.warn(`[plugin-toolbar-basic] execCommand('${cmd}', '${value}') a échoué`);
            }

            return success;
        }

        /**
         * Met à jour l'état visuel des boutons (actif/inactif)
         */
        function updateButtonStates() {
            const buttons = document.querySelectorAll('#toolbar button[data-command]');

            buttons.forEach(btn => {
                const cmd = btn.getAttribute('data-command');
                
                if(COMMANDS.formatting.includes(cmd)) {
                    const isActive = document.queryCommandState(cmd);
                    btn.classList.toggle('active', isActive);
                }
            });
        }

        /**
         * Détecte le bloc courant et met à jour le select
         */
        function updateCurrentBlockDisplay() {
            const select = document.getElementById('basic-tools');
            if(!select) return;

            try {
                const selection = window.getSelection();
                if(!selection.rangeCount) return;

                const node = selection.anchorNode;
                const element = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;

                // Chercher le bloc parent
                let currentBlock = element;
                while(currentBlock && currentBlock !== editor) {
                    const tagName = currentBlock.tagName;
                    if(COMMANDS.blocks.includes(tagName)) {
                        // Optionnel : afficher visuellement le bloc actuel
                        // select.style.fontWeight = 'bold';
                        break;
                    }
                    currentBlock = currentBlock.parentElement;
                }
            } catch(err) {
                // Silencieux, pas critique
            }
        }

        /**
         * Ajoute des raccourcis clavier
         */
        function setupKeyboardShortcuts() {
            editor.addEventListener('keydown', (e) => {
                // Ctrl/Cmd + B : Gras
                if((e.ctrlKey || e.metaKey) && e.key === 'b') {
                    e.preventDefault();
                    executeCommand('bold', null);
                    updateButtonStates();
                }

                // Ctrl/Cmd + I : Italique
                if((e.ctrlKey || e.metaKey) && e.key === 'i') {
                    e.preventDefault();
                    executeCommand('italic', null);
                    updateButtonStates();
                }

                // Ctrl/Cmd + U : Souligné
                if((e.ctrlKey || e.metaKey) && e.key === 'u') {
                    e.preventDefault();
                    executeCommand('underline', null);
                    updateButtonStates();
                }
            });
        }

        /**
         * Observe les changements de sélection
         */
        function observeSelection() {
            // Mettre à jour l'état des boutons lors du changement de sélection
            editor.addEventListener('mouseup', updateButtonStates);
            editor.addEventListener('keyup', updateButtonStates);
            editor.addEventListener('focus', updateButtonStates);

            // Mettre à jour l'affichage du bloc actuel
            editor.addEventListener('mouseup', updateCurrentBlockDisplay);
            editor.addEventListener('keyup', updateCurrentBlockDisplay);
        }

        /**
         * Injecte les styles pour les états actifs
         */
        function injectStyles() {
            if(document.getElementById('toolbar-basic-styles')) return;

            const style = document.createElement('style');
            style.id = 'toolbar-basic-styles';
            style.textContent = `
                #toolbar button[data-command].active {
                    background-color: #0d6efd !important;
                    color: white !important;
                    border-color: #0d6efd !important;
                }
                #toolbar button[data-command]:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `;
            document.head.appendChild(style);
        }

        /**
         * Gère le nettoyage du formatage
         */
        function setupFormatCleaner() {
            // Ajouter un bouton "Nettoyer le formatage" si souhaité
            // Optionnel : peut être ajouté dans un futur update
        }

        /**
         * Valide que l'éditeur est prêt
         */
        function validateEditor() {
            if(!editor.isContentEditable) {
                console.warn('[plugin-toolbar-basic] L\'éditeur n\'est pas en mode éditable');
            }
        }

        // Initialisation
        validateEditor();
        initToolbarButtons();
        initBasicSelect();
        setupKeyboardShortcuts();
        observeSelection();
        injectStyles();

        // État initial
        updateButtonStates();

        console.log('[plugin-toolbar-basic] Initialisé avec succès');
    }
});