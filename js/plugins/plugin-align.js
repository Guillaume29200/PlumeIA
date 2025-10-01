// js/plugins/plugin-align.js
// Permet l'alignement de texte : gauche, centre, droite, justifié
// Derniere update le 01/10/2025
registerPlugin({
    name: "align",
    init({editor}) {
        const select = document.getElementById('align-tools');
        
        if(!select) {
            console.warn('[plugin-align] Select #align-tools introuvable');
            return;
        }

        // Vérification que l'éditeur existe
        if(!editor) {
            console.error('[plugin-align] Editor non fourni');
            return;
        }

        // Mapping des valeurs vers les commandes execCommand
        const alignCommands = {
            'left': 'justifyLeft',
            'center': 'justifyCenter',
            'right': 'justifyRight',
            'justify': 'justifyFull'
        };

        // Fonction pour vérifier si une sélection existe
        function hasSelection() {
            const selection = window.getSelection();
            return selection && selection.rangeCount > 0 && !selection.isCollapsed;
        }

        // Fonction pour obtenir le bloc parent
        function getParentBlock() {
            const selection = window.getSelection();
            if(!selection.rangeCount) return null;
            
            let node = selection.getRangeAt(0).commonAncestorContainer;
            
            // Remonter jusqu'à trouver un bloc ou l'éditeur
            while(node && node !== editor) {
                if(node.nodeType === Node.ELEMENT_NODE) {
                    const display = window.getComputedStyle(node).display;
                    if(display === 'block' || display === 'table-cell') {
                        return node;
                    }
                }
                node = node.parentNode;
            }
            return editor;
        }

        // Gestionnaire d'événement
        select.addEventListener('change', (e) => {
            const value = e.target.value.trim();
            
            // Reset du select
            const resetSelect = () => {
                setTimeout(() => select.value = '', 100);
            };

            if(!value) {
                resetSelect();
                return;
            }

            // Vérification que la commande existe
            const command = alignCommands[value];
            if(!command) {
                console.warn(`[plugin-align] Option non gérée: "${value}"`);
                resetSelect();
                return;
            }

            try {
                // Focus sur l'éditeur si nécessaire
                if(document.activeElement !== editor && !editor.contains(document.activeElement)) {
                    editor.focus();
                }

                // Si pas de sélection, sélectionner le bloc parent
                if(!hasSelection()) {
                    const block = getParentBlock();
                    if(block && block !== editor) {
                        const range = document.createRange();
                        range.selectNodeContents(block);
                        const selection = window.getSelection();
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }

                // Exécution de la commande
                const success = document.execCommand(command, false, null);
                
                if(!success) {
                    console.warn(`[plugin-align] execCommand('${command}') a échoué`);
                }

                // Feedback visuel optionnel
                const block = getParentBlock();
                if(block && block !== editor) {
                    block.style.transition = 'background-color 0.3s';
                    block.style.backgroundColor = '#e7f3ff';
                    setTimeout(() => {
                        block.style.backgroundColor = '';
                    }, 300);
                }

            } catch(err) {
                console.error('[plugin-align] Erreur lors de l\'alignement:', err);
            } finally {
                resetSelect();
            }
        });

        // Mise à jour visuelle du select selon l'alignement actuel (optionnel)
        editor.addEventListener('mouseup', updateAlignIndicator);
        editor.addEventListener('keyup', updateAlignIndicator);

        function updateAlignIndicator() {
            // Vérifier l'alignement du bloc courant
            const block = getParentBlock();
            if(!block || block === editor) return;

            const align = window.getComputedStyle(block).textAlign;
            
            // Correspondance entre CSS et valeurs du select
            const alignMap = {
                'left': 'left',
                'center': 'center',
                'right': 'right',
                'justify': 'justify',
                'start': 'left', // Direction LTR par défaut
                'end': 'right'
            };

            const mappedValue = alignMap[align];
            
            // Ne pas modifier le select si une option valide correspond
            if(mappedValue && select.querySelector(`option[value="${mappedValue}"]`)) {
                // On pourrait ajouter une classe pour indiquer l'état actif
                // mais on évite de changer la valeur pour ne pas perturber l'UX
            }
        }

        console.log('[plugin-align] Initialisé avec succès');
    }
});