// js/plugins/plugin-upload-image.js
// Plugin d'insertion d'images avec upload et URL
// Version 2.0 - Refonte complète
// Dernière update le : 03/10/2025
registerPlugin({
    name: "upload-image",
    init({editor}) {
        if(!editor) {
            console.error('[plugin-upload-image] Editor non fourni');
            return;
        }

        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

        let imageModal = null;
        let currentUploadedImage = null;

        /**
         * Crée le modal d'insertion d'image
         */
        function createModal() {
            // Vérifier si le modal existe déjà
            let modal = document.getElementById('image-modal');
            if(modal) return modal;

            modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = 'image-modal';
            modal.setAttribute('tabindex', '-1');
            modal.setAttribute('aria-labelledby', 'imageModalLabel');
            modal.setAttribute('aria-hidden', 'true');

            modal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="imageModalLabel">🖼️ Insérer une image</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Onglets -->
                            <ul class="nav nav-tabs mb-3" role="tablist">
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link active" id="upload-tab" data-bs-toggle="tab" data-bs-target="#upload-panel" type="button" role="tab">
                                        📤 Upload
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="url-tab" data-bs-toggle="tab" data-bs-target="#url-panel" type="button" role="tab">
                                        🔗 URL
                                    </button>
                                </li>
                            </ul>

                            <div class="tab-content">
                                <!-- Panneau Upload -->
                                <div class="tab-pane fade show active" id="upload-panel" role="tabpanel">
                                    <div class="upload-zone" id="upload-zone">
                                        <div class="upload-zone-content">
                                            <div class="upload-icon">📁</div>
                                            <p class="mb-2"><strong>Glissez une image ici</strong></p>
                                            <p class="text-muted small">ou cliquez pour parcourir</p>
                                            <input type="file" id="image-file-input" accept="image/*" hidden>
                                        </div>
                                    </div>
                                    <div class="text-muted small mt-2">
                                        Formats acceptés : JPG, PNG, GIF, WebP, SVG (max 5MB)
                                    </div>

                                    <!-- Preview upload -->
                                    <div id="upload-preview" class="mt-3" style="display:none;">
                                        <img id="upload-preview-img" src="" alt="Preview" class="img-fluid rounded">
                                        <div class="mt-2">
                                            <input type="text" id="upload-alt-text" class="form-control form-control-sm" placeholder="Texte alternatif (accessibilité)">
                                        </div>
                                    </div>
                                </div>

                                <!-- Panneau URL -->
                                <div class="tab-pane fade" id="url-panel" role="tabpanel">
                                    <div class="mb-3">
                                        <label for="image-url-input" class="form-label">URL de l'image</label>
                                        <input type="url" id="image-url-input" class="form-control" placeholder="https://example.com/image.jpg">
                                        <button type="button" id="preview-url-btn" class="btn btn-sm btn-outline-primary mt-2">
                                            👁️ Prévisualiser
                                        </button>
                                    </div>

                                    <!-- Preview URL -->
                                    <div id="url-preview" style="display:none;">
                                        <img id="url-preview-img" src="" alt="Preview" class="img-fluid rounded">
                                        <div class="mt-2">
                                            <input type="text" id="url-alt-text" class="form-control form-control-sm" placeholder="Texte alternatif (accessibilité)">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Zone d'erreur -->
                            <div id="image-error" class="alert alert-danger mt-3" style="display:none;" role="alert"></div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                            <button type="button" id="insert-image-btn" class="btn btn-primary" disabled>Insérer l'image</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            injectStyles();
            return modal;
        }

        /**
         * Initialise le modal et les événements
         */
        function initModal() {
            const modalEl = createModal();
            imageModal = new bootstrap.Modal(modalEl);

            const uploadZone = document.getElementById('upload-zone');
            const fileInput = document.getElementById('image-file-input');
            const urlInput = document.getElementById('image-url-input');
            const previewUrlBtn = document.getElementById('preview-url-btn');
            const insertBtn = document.getElementById('insert-image-btn');
            const errorDiv = document.getElementById('image-error');

            // Upload zone cliquable
            uploadZone.addEventListener('click', () => fileInput.click());

            // File input change
            fileInput.addEventListener('change', handleFileSelect);

            // Drag & drop sur la zone
            uploadZone.addEventListener('dragover', handleDragOver);
            uploadZone.addEventListener('dragleave', handleDragLeave);
            uploadZone.addEventListener('drop', handleDrop);

            // Preview URL
            previewUrlBtn.addEventListener('click', handleUrlPreview);

            // Validation URL en temps réel
            urlInput.addEventListener('input', () => {
                const url = urlInput.value.trim();
                previewUrlBtn.disabled = !isValidUrl(url);
            });

            // Insertion finale
            insertBtn.addEventListener('click', handleInsert);

            // Reset au changement d'onglet
            document.querySelectorAll('#image-modal .nav-link').forEach(tab => {
                tab.addEventListener('shown.bs.tab', resetModal);
            });

            // Reset à la fermeture
            modalEl.addEventListener('hidden.bs.modal', resetModal);
        }

        /**
         * Gère la sélection de fichier
         */
        function handleFileSelect(e) {
            const file = e.target.files[0];
            if(!file) return;

            processFile(file);
        }

        /**
         * Traite un fichier (validation + preview)
         */
        function processFile(file) {
            const errorDiv = document.getElementById('image-error');
            
            // Validation du type
            if(!ALLOWED_TYPES.includes(file.type)) {
                showError('Format de fichier non supporté. Utilisez JPG, PNG, GIF, WebP ou SVG.');
                return;
            }

            // Validation de la taille
            if(file.size > MAX_FILE_SIZE) {
                showError(`Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum : 5MB`);
                return;
            }

            errorDiv.style.display = 'none';

            // Lecture du fichier
            const reader = new FileReader();
            reader.onload = (e) => {
                currentUploadedImage = {
                    data: e.target.result,
                    name: file.name,
                    type: 'upload'
                };

                // Afficher preview
                const preview = document.getElementById('upload-preview');
                const img = document.getElementById('upload-preview-img');
                const altInput = document.getElementById('upload-alt-text');

                img.src = e.target.result;
                altInput.value = file.name.replace(/\.[^/.]+$/, ''); // Nom sans extension
                preview.style.display = 'block';

                // Activer le bouton d'insertion
                document.getElementById('insert-image-btn').disabled = false;
            };

            reader.onerror = () => {
                showError('Erreur lors de la lecture du fichier');
            };

            reader.readAsDataURL(file);
        }

        /**
         * Gère le drag over
         */
        function handleDragOver(e) {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.add('drag-over');
        }

        /**
         * Gère le drag leave
         */
        function handleDragLeave(e) {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('drag-over');
        }

        /**
         * Gère le drop
         */
        function handleDrop(e) {
            e.preventDefault();
            e.stopPropagation();
            e.currentTarget.classList.remove('drag-over');

            const files = e.dataTransfer.files;
            if(files.length === 0) return;

            const file = files[0];
            if(file.type.startsWith('image/')) {
                processFile(file);
            } else {
                showError('Veuillez déposer un fichier image');
            }
        }

        /**
         * Preview de l'URL
         */
        function handleUrlPreview() {
            const urlInput = document.getElementById('image-url-input');
            const url = urlInput.value.trim();

            if(!isValidUrl(url)) {
                showError('URL invalide');
                return;
            }

            const errorDiv = document.getElementById('image-error');
            errorDiv.style.display = 'none';

            // Tester si l'image charge
            const testImg = new Image();
            testImg.onload = () => {
                currentUploadedImage = {
                    data: url,
                    name: url,
                    type: 'url'
                };

                // Afficher preview
                const preview = document.getElementById('url-preview');
                const img = document.getElementById('url-preview-img');
                const altInput = document.getElementById('url-alt-text');

                img.src = url;
                altInput.value = '';
                preview.style.display = 'block';

                // Activer le bouton d'insertion
                document.getElementById('insert-image-btn').disabled = false;
            };

            testImg.onerror = () => {
                showError('Impossible de charger l\'image depuis cette URL');
            };

            testImg.src = url;
        }

        /**
         * Insère l'image dans l'éditeur
         */
        function handleInsert() {
            if(!currentUploadedImage) return;

            const activeTab = document.querySelector('#image-modal .tab-pane.active').id;
            const altText = activeTab === 'upload-panel' 
                ? document.getElementById('upload-alt-text').value.trim()
                : document.getElementById('url-alt-text').value.trim();

            insertImageInEditor(currentUploadedImage.data, altText || 'Image insérée');

            // Fermer le modal
            imageModal.hide();
        }

        /**
         * Insère l'image dans l'éditeur
         */
        function insertImageInEditor(src, alt) {
            try {
                editor.focus();

                const img = document.createElement('img');
                img.src = src;
                img.alt = alt;
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.display = 'block';
                img.style.margin = '10px auto';
                img.style.borderRadius = '6px';

                const selection = window.getSelection();
                if(selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(img);
                    
                    // Ajouter un paragraphe après l'image pour continuer à écrire
                    const p = document.createElement('p');
                    p.innerHTML = '<br>';
                    img.parentNode.insertBefore(p, img.nextSibling);
                    
                    // Placer le curseur dans le nouveau paragraphe
                    const newRange = document.createRange();
                    newRange.setStart(p, 0);
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                } else {
                    editor.appendChild(img);
                }

                console.log('[plugin-upload-image] Image insérée avec succès');

            } catch(err) {
                console.error('[plugin-upload-image] Erreur insertion:', err);
                showError('Erreur lors de l\'insertion de l\'image');
            }
        }

        /**
         * Drag & drop sur l'éditeur complet
         */
        function setupEditorDragDrop() {
            editor.addEventListener('dragover', (e) => {
                if(e.dataTransfer.types.includes('Files')) {
                    e.preventDefault();
                    editor.style.borderColor = '#0d6efd';
                    editor.style.borderWidth = '2px';
                }
            });

            editor.addEventListener('dragleave', () => {
                editor.style.borderColor = '';
                editor.style.borderWidth = '';
            });

            editor.addEventListener('drop', (e) => {
                editor.style.borderColor = '';
                editor.style.borderWidth = '';

                if(e.dataTransfer.files.length > 0) {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    
                    if(file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                            insertImageInEditor(evt.target.result, file.name);
                        };
                        reader.readAsDataURL(file);
                    }
                }
            });
        }

        /**
         * Valide une URL
         */
        function isValidUrl(string) {
            try {
                const url = new URL(string);
                return url.protocol === 'http:' || url.protocol === 'https:';
            } catch(_) {
                return false;
            }
        }

        /**
         * Affiche une erreur
         */
        function showError(message) {
            const errorDiv = document.getElementById('image-error');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }

        /**
         * Reset du modal
         */
        function resetModal() {
            currentUploadedImage = null;
            
            document.getElementById('image-file-input').value = '';
            document.getElementById('image-url-input').value = '';
            document.getElementById('upload-preview').style.display = 'none';
            document.getElementById('url-preview').style.display = 'none';
            document.getElementById('image-error').style.display = 'none';
            document.getElementById('insert-image-btn').disabled = true;
            document.getElementById('preview-url-btn').disabled = true;
        }

        /**
         * Injecte les styles CSS
         */
        function injectStyles() {
            if(document.getElementById('upload-image-styles')) return;

            const style = document.createElement('style');
            style.id = 'upload-image-styles';
            style.textContent = `
                .upload-zone {
                    border: 2px dashed #dee2e6;
                    border-radius: 8px;
                    padding: 40px 20px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s;
                    background: #f8f9fa;
                }
                .upload-zone:hover {
                    border-color: #0d6efd;
                    background: #e7f3ff;
                }
                .upload-zone.drag-over {
                    border-color: #0d6efd;
                    background: #cfe2ff;
                    transform: scale(1.02);
                }
                .upload-zone-content {
                    pointer-events: none;
                }
                .upload-icon {
                    font-size: 3rem;
                    margin-bottom: 10px;
                }
                #upload-preview img,
                #url-preview img {
                    max-height: 300px;
                    object-fit: contain;
                }
            `;
            document.head.appendChild(style);
        }

        /**
         * Attache le bouton de la toolbar
         */
        function setupToolbarButton() {
            const btn = document.querySelector('button[data-command="insertImage"]');
            if(!btn) {
                console.warn('[plugin-upload-image] Bouton toolbar introuvable');
                return;
            }

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                imageModal.show();
            });
        }

        // Initialisation
        initModal();
        setupToolbarButton();
        setupEditorDragDrop();

        console.log('[plugin-upload-image] Initialisé avec succès');
    }
});