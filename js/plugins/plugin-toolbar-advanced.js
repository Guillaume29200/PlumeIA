// js/plugins/plugin-toolbar-advanced.js
// Styles avancés : liens, highlight, blockquote, spoiler, code
// Version 2.0
// Dernière update le 04/10/2025
registerPlugin({
    name: "toolbar-advanced",
    init({editor}) {
        if(!editor) {
            console.error('[plugin-toolbar-advanced] Editor non fourni');
            return;
        }

        let linkModal = null;

        /**
         * Initialise la gestion des liens
         */
        function initLinkHandler() {
            const btn = document.querySelector('button[data-command="createLink"]');
            if(!btn) {
                console.warn('[plugin-toolbar-advanced] Bouton createLink introuvable');
                return;
            }

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openLinkModal();
            });
        }

        /**
         * Ouvre le modal de création de lien
         */
        function openLinkModal() {
            if(!linkModal) {
                linkModal = createLinkModal();
            }

            const modal = new bootstrap.Modal(document.getElementById('link-modal'));
            
            // Pré-remplir si lien existant
            const selection = window.getSelection();
            if(selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const anchor = range.commonAncestorContainer.parentElement?.closest('a');
                
                if(anchor) {
                    document.getElementById('link-url').value = anchor.href;
                    document.getElementById('link-text').value = anchor.textContent;
                    document.getElementById('link-title').value = anchor.title || '';
                    document.getElementById('link-target').checked = anchor.target === '_blank';
                } else {
                    document.getElementById('link-text').value = selection.toString();
                }
            }

            modal.show();
        }

        /**
         * Crée le modal de lien
         */
        function createLinkModal() {
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = 'link-modal';
            modal.setAttribute('tabindex', '-1');

            modal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">🔗 Insérer un lien</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="link-url" class="form-label">URL <span class="text-danger">*</span></label>
                                <input type="url" id="link-url" class="form-control" placeholder="https://example.com" required>
                            </div>
                            <div class="mb-3">
                                <label for="link-text" class="form-label">Texte du lien</label>
                                <input type="text" id="link-text" class="form-control" placeholder="Cliquez ici">
                                <div class="form-text">Si vide, l'URL sera utilisée</div>
                            </div>
                            <div class="mb-3">
                                <label for="link-title" class="form-label">Titre (tooltip)</label>
                                <input type="text" id="link-title" class="form-control" placeholder="Description au survol">
                            </div>
                            <div class="form-check">
                                <input type="checkbox" id="link-target" class="form-check-input" checked>
                                <label for="link-target" class="form-check-label">Ouvrir dans un nouvel onglet</label>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                            <button type="button" id="insert-link-btn" class="btn btn-primary">Insérer le lien</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Event listener insertion
            document.getElementById('insert-link-btn').addEventListener('click', insertLink);

            // Reset à la fermeture
            modal.addEventListener('hidden.bs.modal', () => {
                document.getElementById('link-url').value = '';
                document.getElementById('link-text').value = '';
                document.getElementById('link-title').value = '';
                document.getElementById('link-target').checked = true;
            });

            return modal;
        }

        /**
         * Insère ou modifie un lien
         */
        function insertLink() {
            const url = document.getElementById('link-url').value.trim();
            const text = document.getElementById('link-text').value.trim();
            const title = document.getElementById('link-title').value.trim();
            const targetBlank = document.getElementById('link-target').checked;

            if(!url) {
                alert('Veuillez entrer une URL');
                return;
            }

            // Validation basique de l'URL
            if(!/^https?:\/\//i.test(url)) {
                if(!confirm('L\'URL ne commence pas par http(s). Continuer ?')) {
                    return;
                }
            }

            try {
                editor.focus();

                const selection = window.getSelection();
                const range = selection.getRangeAt(0);

                // Vérifier si on modifie un lien existant
                const existingAnchor = range.commonAncestorContainer.parentElement?.closest('a');
                
                if(existingAnchor) {
                    // Modifier le lien existant
                    existingAnchor.href = url;
                    if(title) existingAnchor.title = title;
                    if(targetBlank) {
                        existingAnchor.target = '_blank';
                        existingAnchor.rel = 'noopener noreferrer';
                    } else {
                        existingAnchor.removeAttribute('target');
                        existingAnchor.removeAttribute('rel');
                    }
                    if(text) existingAnchor.textContent = text;
                } else {
                    // Créer un nouveau lien
                    const anchor = document.createElement('a');
                    anchor.href = url;
                    if(title) anchor.title = title;
                    if(targetBlank) {
                        anchor.target = '_blank';
                        anchor.rel = 'noopener noreferrer';
                    }

                    const linkText = text || selection.toString() || url;
                    anchor.textContent = linkText;

                    range.deleteContents();
                    range.insertNode(anchor);

                    // Placer le curseur après le lien
                    range.setStartAfter(anchor);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }

                bootstrap.Modal.getInstance(document.getElementById('link-modal')).hide();

            } catch(err) {
                console.error('[plugin-toolbar-advanced] Erreur insertion lien:', err);
                alert('Erreur lors de l\'insertion du lien');
            }
        }

        /**
         * Initialise le select de styles
         */
        function initStyleSelect() {
            const styleSelect = document.getElementById('style-tools');
            if(!styleSelect) {
                console.warn('[plugin-toolbar-advanced] Select #style-tools introuvable');
                return;
            }

            styleSelect.addEventListener('change', handleStyleChange);
        }

        /**
         * Gère le changement de style
         */
        function handleStyleChange(e) {
            const value = e.target.value;
            if(!value) return;

            const selection = window.getSelection();
            if(!selection.rangeCount) {
                e.target.value = '';
                return;
            }

            const range = selection.getRangeAt(0);

            // Pour blockquote et code, pas besoin de sélection
            if(!['BLOCKQUOTE', 'code'].includes(value) && range.collapsed) {
                alert('Veuillez sélectionner du texte');
                e.target.value = '';
                return;
            }

            try {
                switch(value) {
                    case 'BLOCKQUOTE':
                        applyBlockquote();
                        break;
                    case 'highlight':
                        applyHighlight(range);
                        break;
                    case 'spoiler':
                        applySpoiler(range);
                        break;
                    case 'code':
                        applyCodeBlock(range, selection);
                        break;
                    default:
                        console.warn('[plugin-toolbar-advanced] Style non géré:', value);
                }
            } catch(err) {
                console.error('[plugin-toolbar-advanced] Erreur application style:', err);
            } finally {
                e.target.value = '';
            }
        }

        /**
         * Applique un blockquote stylisé
         */
        function applyBlockquote() {
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);

            // Vérifier si déjà dans une blockquote
            const existingBlockquote = range.commonAncestorContainer.parentElement?.closest('blockquote');
            
            if(existingBlockquote) {
                // Retirer la blockquote
                const content = existingBlockquote.innerHTML;
                const p = document.createElement('p');
                p.innerHTML = content;
                existingBlockquote.parentNode.replaceChild(p, existingBlockquote);
            } else {
                // Créer une blockquote stylisée
                const blockquote = document.createElement('blockquote');
                blockquote.className = 'styled-blockquote';
                
                if(range.collapsed) {
                    blockquote.innerHTML = '<p>Votre citation ici...</p>';
                } else {
                    blockquote.appendChild(range.extractContents());
                }

                range.insertNode(blockquote);
            }
        }

        /**
         * Applique un surlignage
         */
        function applyHighlight(range) {
            const mark = document.createElement('mark');
            mark.style.backgroundColor = '#fff3b0';
            mark.style.padding = '2px 4px';
            mark.style.borderRadius = '3px';
            mark.appendChild(range.extractContents());
            range.insertNode(mark);
        }

        /**
         * Applique un spoiler interactif
         */
        function applySpoiler(range) {
            const spoiler = document.createElement('span');
            spoiler.className = 'spoiler-container';
            spoiler.dataset.revealed = 'false';

            const content = document.createElement('span');
            content.className = 'spoiler-content';
            content.appendChild(range.extractContents());

            spoiler.appendChild(content);

            // Toggle au clic
            spoiler.addEventListener('click', function() {
                const isRevealed = this.dataset.revealed === 'true';
                this.dataset.revealed = !isRevealed;
            });

            range.insertNode(spoiler);
        }

        /**
         * Applique un bloc de code
         */
        function applyCodeBlock(range, selection) {
            const pre = document.createElement('pre');
            pre.className = 'code-block';

            const code = document.createElement('code');
            
            if(range.collapsed) {
                code.textContent = '// Votre code ici';
            } else {
                code.textContent = selection.toString();
            }

            pre.appendChild(code);
            
            range.deleteContents();
            range.insertNode(pre);

            // Ajouter un paragraphe après pour continuer
            const p = document.createElement('p');
            p.innerHTML = '<br>';
            pre.parentNode.insertBefore(p, pre.nextSibling);
        }

        /**
         * Injecte les styles CSS
         */
        function injectStyles() {
            if(document.getElementById('toolbar-advanced-styles')) return;

            const style = document.createElement('style');
            style.id = 'toolbar-advanced-styles';
            style.textContent = `
                /* Blockquote stylisé */
                .styled-blockquote {
                    border-left: 4px solid #0d6efd;
                    padding: 15px 20px;
                    margin: 20px 0;
                    background: #f8f9fa;
                    border-radius: 0 8px 8px 0;
                    font-style: italic;
                    color: #495057;
                }
                .styled-blockquote::before {
                    content: '"';
                    font-size: 3rem;
                    color: #0d6efd;
                    opacity: 0.3;
                    position: absolute;
                    margin-left: -15px;
                    margin-top: -10px;
                }

                /* Spoiler */
                .spoiler-container {
                    display: inline-block;
                    cursor: pointer;
                    user-select: none;
                    transition: all 0.3s;
                }
                .spoiler-container[data-revealed="false"] .spoiler-content {
                    background: #2c3e50;
                    color: #2c3e50;
                    padding: 2px 8px;
                    border-radius: 4px;
                }
                .spoiler-container[data-revealed="false"]:hover .spoiler-content {
                    background: #34495e;
                }
                .spoiler-container[data-revealed="false"]::after {
                    content: " 👁️";
                    opacity: 0.5;
                }
                .spoiler-container[data-revealed="true"] .spoiler-content {
                    background: #fff3b0;
                    color: #000;
                    padding: 2px 8px;
                    border-radius: 4px;
                }

                /* Bloc de code */
                .code-block {
                    background: #1e1e1e;
                    color: #f8f8f2;
                    padding: 15px;
                    border-radius: 8px;
                    font-family: 'Fira Code', 'Consolas', monospace;
                    font-size: 14px;
                    line-height: 1.5;
                    overflow-x: auto;
                    border: 1px solid #444;
                    margin: 15px 0;
                }
                .code-block code {
                    background: none;
                    color: inherit;
                    padding: 0;
                    font-size: inherit;
                }

                /* Mark/Highlight */
                mark {
                    background-color: #fff3b0;
                    padding: 2px 4px;
                    border-radius: 3px;
                }
            `;
            document.head.appendChild(style);
        }

        // Initialisation
        initLinkHandler();
        initStyleSelect();
        injectStyles();

        console.log('[plugin-toolbar-advanced] Initialisé avec succès');
    }
});