// js/plugins/plugin-preview.js
// Plugin de prévisualisation avec mode côte-à-côte et plein écran
// Version 2.0
// Dernière update le : 04/10/2025
registerPlugin({
    name: "preview",
    init({editor, preview, state}) {
        if(!editor || !preview) {
            console.error('[plugin-preview] Editor ou preview non fourni');
            return;
        }

        const btn = document.getElementById('preview-toggle');
        if(!btn) {
            console.warn('[plugin-preview] Bouton #preview-toggle introuvable');
            return;
        }

        let previewMode = 'hidden'; // hidden, inline, fullscreen
        let autoRefresh = true;
        let refreshInterval = null;

        /**
         * Initialise la toolbar de preview
         */
        function createPreviewToolbar() {
            const toolbar = document.createElement('div');
            toolbar.id = 'preview-toolbar';
            toolbar.style.display = 'none';
            toolbar.innerHTML = `
                <div class="d-flex justify-content-between align-items-center p-2 bg-light border rounded">
                    <div class="d-flex gap-2">
                        <button id="preview-refresh-btn" class="btn btn-sm btn-outline-primary" title="Actualiser">
                            🔄 Actualiser
                        </button>
                        <button id="preview-copy-btn" class="btn btn-sm btn-outline-secondary" title="Copier le HTML">
                            📋 Copier HTML
                        </button>
                        <button id="preview-fullscreen-btn" class="btn btn-sm btn-outline-info" title="Plein écran">
                            ⛶ Plein écran
                        </button>
                    </div>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="preview-auto-refresh" checked>
                        <label class="form-check-label small" for="preview-auto-refresh">Auto-refresh</label>
                    </div>
                </div>
            `;
            preview.parentNode.insertBefore(toolbar, preview);
            return toolbar;
        }

        /**
         * Met à jour la preview
         */
        function updatePreview() {
            if(state.devMode) {
                preview.innerHTML = '<div class="alert alert-warning">Désactivez le mode développement pour prévisualiser</div>';
                return;
            }

            try {
                // Nettoyer et copier le contenu
                const content = editor.innerHTML;
                preview.innerHTML = content;

                // Appliquer des styles de base à la preview
                preview.style.fontFamily = editor.style.fontFamily || 'inherit';
                preview.style.fontSize = editor.style.fontSize || 'inherit';

                console.log('[plugin-preview] Preview mise à jour');
            } catch(err) {
                console.error('[plugin-preview] Erreur mise à jour:', err);
                preview.innerHTML = '<div class="alert alert-danger">Erreur lors de la génération de la preview</div>';
            }
        }

        /**
         * Toggle entre les modes de preview
         */
        function togglePreview() {
            if(previewMode === 'hidden') {
                showInlinePreview();
            } else if(previewMode === 'inline') {
                hidePreview();
            }
        }

        /**
         * Affiche la preview inline
         */
        function showInlinePreview() {
            previewMode = 'inline';
            
            updatePreview();
            preview.style.display = 'block';
            document.getElementById('preview-toolbar').style.display = 'block';
            
            btn.textContent = '👁️ Masquer';
            btn.classList.remove('btn-info');
            btn.classList.add('btn-secondary');

            // Scroll vers la preview
            preview.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Démarrer l'auto-refresh si activé
            if(autoRefresh) {
                startAutoRefresh();
            }
        }

        /**
         * Cache la preview
         */
        function hidePreview() {
            previewMode = 'hidden';
            
            preview.style.display = 'none';
            document.getElementById('preview-toolbar').style.display = 'none';
            
            btn.textContent = '👁️ Preview';
            btn.classList.remove('btn-secondary', 'btn-warning');
            btn.classList.add('btn-info');

            stopAutoRefresh();

            // Quitter le plein écran si actif
            if(document.fullscreenElement) {
                document.exitFullscreen();
            }
        }

        /**
         * Mode plein écran
         */
        function toggleFullscreen() {
            const fullscreenBtn = document.getElementById('preview-fullscreen-btn');
            
            if(!document.fullscreenElement) {
                // Entrer en plein écran
                const container = preview.parentElement;
                
                if(container.requestFullscreen) {
                    container.requestFullscreen();
                    previewMode = 'fullscreen';
                    fullscreenBtn.innerHTML = '⛶ Quitter';
                    btn.classList.remove('btn-secondary', 'btn-info');
                    btn.classList.add('btn-warning');
                } else {
                    alert('Plein écran non supporté par votre navigateur');
                }
            } else {
                // Sortir du plein écran
                document.exitFullscreen();
                previewMode = 'inline';
                fullscreenBtn.innerHTML = '⛶ Plein écran';
                btn.classList.remove('btn-warning');
                btn.classList.add('btn-secondary');
            }
        }

        /**
         * Copie le HTML dans le presse-papier
         */
        async function copyHTML() {
            const copyBtn = document.getElementById('preview-copy-btn');
            const html = editor.innerHTML;

            try {
                await navigator.clipboard.writeText(html);
                
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '✅ Copié !';
                copyBtn.classList.remove('btn-outline-secondary');
                copyBtn.classList.add('btn-success');
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.classList.remove('btn-success');
                    copyBtn.classList.add('btn-outline-secondary');
                }, 2000);
            } catch(err) {
                console.error('[plugin-preview] Erreur copie:', err);
                alert('Erreur lors de la copie');
            }
        }

        /**
         * Démarre l'auto-refresh
         */
        function startAutoRefresh() {
            if(refreshInterval) return;

            refreshInterval = setInterval(() => {
                if(previewMode !== 'hidden' && autoRefresh) {
                    updatePreview();
                }
            }, 1000); // Refresh toutes les secondes
        }

        /**
         * Arrête l'auto-refresh
         */
        function stopAutoRefresh() {
            if(refreshInterval) {
                clearInterval(refreshInterval);
                refreshInterval = null;
            }
        }

        /**
         * Configure les événements de la toolbar preview
         */
        function setupToolbarEvents() {
            // Bouton refresh manuel
            document.getElementById('preview-refresh-btn')?.addEventListener('click', updatePreview);

            // Bouton copier HTML
            document.getElementById('preview-copy-btn')?.addEventListener('click', copyHTML);

            // Bouton plein écran
            document.getElementById('preview-fullscreen-btn')?.addEventListener('click', toggleFullscreen);

            // Toggle auto-refresh
            const autoRefreshCheckbox = document.getElementById('preview-auto-refresh');
            autoRefreshCheckbox?.addEventListener('change', (e) => {
                autoRefresh = e.target.checked;
                
                if(autoRefresh && previewMode !== 'hidden') {
                    startAutoRefresh();
                } else {
                    stopAutoRefresh();
                }
            });

            // Écouter la sortie de plein écran (ESC)
            document.addEventListener('fullscreenchange', () => {
                const fullscreenBtn = document.getElementById('preview-fullscreen-btn');
                if(!document.fullscreenElement && previewMode === 'fullscreen') {
                    previewMode = 'inline';
                    fullscreenBtn.innerHTML = '⛶ Plein écran';
                    btn.classList.remove('btn-warning');
                    btn.classList.add('btn-secondary');
                }
            });
        }

        /**
         * Injecte les styles CSS
         */
        function injectStyles() {
            if(document.getElementById('preview-plugin-styles')) return;

            const style = document.createElement('style');
            style.id = 'preview-plugin-styles';
            style.textContent = `
                #preview {
                    min-height: 200px;
                    max-height: 600px;
                    overflow-y: auto;
                    background: #ffffff;
                    border: 1px solid #cfe8ff;
                    border-radius: 8px;
                    padding: 20px;
                    margin-top: 10px;
                }
                
                #preview:fullscreen {
                    max-height: 100vh;
                    padding: 40px;
                    font-size: 1.1rem;
                    line-height: 1.8;
                }

                #preview-toolbar {
                    margin-top: 10px;
                }

                /* Amélioration de la lisibilité en preview */
                #preview h1, #preview h2, #preview h3 {
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                }
                #preview p {
                    margin-bottom: 1rem;
                }
                #preview img {
                    max-width: 100%;
                    height: auto;
                }
                #preview blockquote {
                    border-left: 4px solid #0d6efd;
                    padding-left: 1rem;
                    margin: 1rem 0;
                    color: #6c757d;
                    font-style: italic;
                }
            `;
            document.head.appendChild(style);
        }

        /**
         * Ajoute des raccourcis clavier
         */
        function setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl/Cmd + P : Toggle preview
                if((e.ctrlKey || e.metaKey) && e.key === 'p') {
                    e.preventDefault();
                    togglePreview();
                }

                // Ctrl/Cmd + Shift + P : Plein écran
                if((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
                    e.preventDefault();
                    if(previewMode !== 'hidden') {
                        toggleFullscreen();
                    }
                }
            });
        }

        /**
         * Détection de changements importants
         */
        function observeEditorChanges() {
            // Observer les changements majeurs dans l'éditeur
            const observer = new MutationObserver(() => {
                if(autoRefresh && previewMode !== 'hidden' && !state.devMode) {
                    // Le setTimeout évite trop de refreshes
                    clearTimeout(observer.timeout);
                    observer.timeout = setTimeout(updatePreview, 500);
                }
            });

            observer.observe(editor, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }

        // Initialisation
        createPreviewToolbar();
        setupToolbarEvents();
        injectStyles();
        setupKeyboardShortcuts();
        observeEditorChanges();

        // Event du bouton principal
        btn.addEventListener('click', togglePreview);

        console.log('[plugin-preview] Initialisé avec succès');
    }
});