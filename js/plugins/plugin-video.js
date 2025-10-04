// js/plugins/plugin-video.js
// Plugin d'insertion de vidéos (YouTube, Vimeo, TikTok, Dailymotion, Twitch)
// Version 2.0 - Refonte complète
// Dernière update le 04/10/2025
registerPlugin({
    name: "video",
    init({editor}) {
        if(!editor) {
            console.error('[plugin-video] Editor non fourni');
            return;
        }

        let videoModal = null;
        let currentVideoData = null;

        // Plateformes supportées avec leurs patterns
        const platforms = {
            youtube: {
                name: 'YouTube',
                icon: '▶️',
                patterns: [
                    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
                    /youtube\.com\/embed\/([\w-]+)/,
                    /youtube\.com\/shorts\/([\w-]+)/
                ],
                embed: (id) => `https://www.youtube.com/embed/${id}`,
                attributes: {
                    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
                    allowfullscreen: true
                }
            },
            vimeo: {
                name: 'Vimeo',
                icon: '🎬',
                patterns: [
                    /vimeo\.com\/(\d+)/,
                    /player\.vimeo\.com\/video\/(\d+)/
                ],
                embed: (id) => `https://player.vimeo.com/video/${id}`,
                attributes: {
                    allow: 'autoplay; fullscreen; picture-in-picture',
                    allowfullscreen: true
                }
            },
            tiktok: {
                name: 'TikTok',
                icon: '🎵',
                patterns: [
                    /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
                    /tiktok\.com\/v\/(\d+)/,
                    /vm\.tiktok\.com\/([\w]+)/
                ],
                embed: (id) => `https://www.tiktok.com/embed/v2/${id}`,
                attributes: {
                    allow: 'autoplay; clipboard-write; encrypted-media',
                    allowfullscreen: true
                }
            },
            dailymotion: {
                name: 'Dailymotion',
                icon: '🎥',
                patterns: [
                    /dailymotion\.com\/video\/([\w]+)/,
                    /dai\.ly\/([\w]+)/
                ],
                embed: (id) => `https://www.dailymotion.com/embed/video/${id}`,
                attributes: {
                    allow: 'autoplay; fullscreen',
                    allowfullscreen: true
                }
            },
            twitch: {
                name: 'Twitch',
                icon: '🎮',
                patterns: [
                    /twitch\.tv\/videos\/(\d+)/,
                    /twitch\.tv\/([\w]+)/
                ],
                embed: (id) => `https://player.twitch.tv/?video=${id}&parent=${window.location.hostname}`,
                attributes: {
                    allow: 'autoplay; fullscreen',
                    allowfullscreen: true
                }
            }
        };

        /**
         * Crée le modal d'insertion vidéo
         */
        function createModal() {
            let modal = document.getElementById('video-modal');
            if(modal) return modal;

            modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = 'video-modal';
            modal.setAttribute('tabindex', '-1');
            modal.setAttribute('aria-labelledby', 'videoModalLabel');

            modal.innerHTML = `
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="videoModalLabel">🎬 Insérer une vidéo</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Plateformes supportées -->
                            <div class="alert alert-info mb-3">
                                <strong>Plateformes supportées :</strong>
                                <div class="d-flex gap-2 mt-2 flex-wrap">
                                    ${Object.entries(platforms).map(([key, platform]) => 
                                        `<span class="badge bg-primary">${platform.icon} ${platform.name}</span>`
                                    ).join('')}
                                </div>
                            </div>

                            <!-- Input URL -->
                            <div class="mb-3">
                                <label for="video-url-input" class="form-label">URL de la vidéo <span class="text-danger">*</span></label>
                                <input 
                                    type="url" 
                                    id="video-url-input" 
                                    class="form-control" 
                                    placeholder="https://www.youtube.com/watch?v=..." 
                                    required
                                >
                                <div class="form-text">Collez l'URL complète de la vidéo</div>
                            </div>

                            <!-- Bouton de détection -->
                            <button type="button" id="detect-video-btn" class="btn btn-primary mb-3">
                                🔍 Détecter la vidéo
                            </button>

                            <!-- Zone d'erreur -->
                            <div id="video-error" class="alert alert-danger" style="display:none;" role="alert"></div>

                            <!-- Preview de la vidéo -->
                            <div id="video-preview-container" style="display:none;">
                                <hr>
                                <h6 class="mb-2">Aperçu :</h6>
                                <div class="ratio ratio-16x9 mb-3">
                                    <iframe id="video-preview-iframe" frameborder="0"></iframe>
                                </div>
                                
                                <!-- Options d'insertion -->
                                <div class="row g-2">
                                    <div class="col-md-6">
                                        <label for="video-width" class="form-label">Largeur</label>
                                        <select id="video-width" class="form-select form-select-sm">
                                            <option value="100%">100% (Pleine largeur)</option>
                                            <option value="80%">80%</option>
                                            <option value="60%">60%</option>
                                            <option value="560px" selected>560px (Standard)</option>
                                            <option value="custom">Personnalisé</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label for="video-align" class="form-label">Alignement</label>
                                        <select id="video-align" class="form-select form-select-sm">
                                            <option value="left">Gauche</option>
                                            <option value="center" selected>Centre</option>
                                            <option value="right">Droite</option>
                                        </select>
                                    </div>
                                    <div class="col-12" id="custom-width-container" style="display:none;">
                                        <input type="text" id="custom-width-input" class="form-control form-control-sm" placeholder="Ex: 400px ou 50%">
                                    </div>
                                </div>

                                <!-- Détails de la vidéo -->
                                <div class="mt-3">
                                    <small class="text-muted">
                                        <strong>Plateforme détectée :</strong> <span id="detected-platform"></span><br>
                                        <strong>ID vidéo :</strong> <span id="detected-id"></span>
                                    </small>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                            <button type="button" id="insert-video-btn" class="btn btn-primary" disabled>Insérer la vidéo</button>
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
            videoModal = new bootstrap.Modal(modalEl);

            const urlInput = document.getElementById('video-url-input');
            const detectBtn = document.getElementById('detect-video-btn');
            const insertBtn = document.getElementById('insert-video-btn');
            const widthSelect = document.getElementById('video-width');
            const customWidthContainer = document.getElementById('custom-width-container');

            // Détection de vidéo
            detectBtn.addEventListener('click', detectVideo);

            // Insertion
            insertBtn.addEventListener('click', insertVideo);

            // Gestion du width personnalisé
            widthSelect.addEventListener('change', (e) => {
                customWidthContainer.style.display = e.target.value === 'custom' ? 'block' : 'none';
            });

            // Validation URL en temps réel
            urlInput.addEventListener('input', () => {
                hideError();
            });

            // Reset à la fermeture
            modalEl.addEventListener('hidden.bs.modal', resetModal);
        }

        /**
         * Détecte la plateforme et l'ID de la vidéo
         */
        function detectVideo() {
            const urlInput = document.getElementById('video-url-input');
            const url = urlInput.value.trim();

            if(!url) {
                showError('Veuillez entrer une URL');
                return;
            }

            hideError();

            // Tester chaque plateforme
            for(const [platformKey, platform] of Object.entries(platforms)) {
                for(const pattern of platform.patterns) {
                    const match = url.match(pattern);
                    if(match) {
                        const videoId = match[1];
                        showVideoPreview(platformKey, videoId, platform);
                        return;
                    }
                }
            }

            showError('URL non reconnue. Vérifiez que l\'URL provient de YouTube, Vimeo, TikTok, Dailymotion ou Twitch.');
        }

        /**
         * Affiche la preview de la vidéo
         */
        function showVideoPreview(platformKey, videoId, platform) {
            currentVideoData = {
                platform: platformKey,
                videoId: videoId,
                embedUrl: platform.embed(videoId),
                attributes: platform.attributes,
                name: platform.name
            };

            // Afficher le container de preview
            const previewContainer = document.getElementById('video-preview-container');
            const iframe = document.getElementById('video-preview-iframe');
            const platformSpan = document.getElementById('detected-platform');
            const idSpan = document.getElementById('detected-id');

            iframe.src = currentVideoData.embedUrl;
            
            // Appliquer les attributs
            Object.entries(platform.attributes).forEach(([key, value]) => {
                if(typeof value === 'boolean') {
                    if(value) iframe.setAttribute(key, '');
                } else {
                    iframe.setAttribute(key, value);
                }
            });

            platformSpan.textContent = `${platform.icon} ${platform.name}`;
            idSpan.textContent = videoId;

            previewContainer.style.display = 'block';
            document.getElementById('insert-video-btn').disabled = false;

            console.log(`[plugin-video] Vidéo détectée: ${platform.name} (${videoId})`);
        }

        /**
         * Insère la vidéo dans l'éditeur
         */
        function insertVideo() {
            if(!currentVideoData) return;

            const widthSelect = document.getElementById('video-width');
            const alignSelect = document.getElementById('video-align');
            const customWidthInput = document.getElementById('custom-width-input');

            let width = widthSelect.value;
            if(width === 'custom') {
                width = customWidthInput.value.trim() || '560px';
            }

            const align = alignSelect.value;

            // Créer le container
            const container = document.createElement('div');
            container.className = 'video-embed-container';
            container.style.width = width;
            container.style.margin = align === 'center' ? '20px auto' : '20px 0';
            container.style.textAlign = align;

            // Créer l'iframe
            const iframe = document.createElement('iframe');
            iframe.src = currentVideoData.embedUrl;
            iframe.style.width = '100%';
            iframe.style.aspectRatio = '16 / 9';
            iframe.style.border = 'none';
            iframe.style.borderRadius = '8px';

            // Appliquer les attributs spécifiques à la plateforme
            Object.entries(currentVideoData.attributes).forEach(([key, value]) => {
                if(typeof value === 'boolean') {
                    if(value) iframe.setAttribute(key, '');
                } else {
                    iframe.setAttribute(key, value);
                }
            });

            container.appendChild(iframe);

            // Insérer dans l'éditeur
            try {
                editor.focus();

                const selection = window.getSelection();
                if(selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(container);

                    // Ajouter un paragraphe après pour continuer à écrire
                    const p = document.createElement('p');
                    p.innerHTML = '<br>';
                    container.parentNode.insertBefore(p, container.nextSibling);

                    // Placer le curseur
                    const newRange = document.createRange();
                    newRange.setStart(p, 0);
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                } else {
                    editor.appendChild(container);
                }

                console.log('[plugin-video] Vidéo insérée avec succès');
                videoModal.hide();

            } catch(err) {
                console.error('[plugin-video] Erreur insertion:', err);
                showError('Erreur lors de l\'insertion de la vidéo');
            }
        }

        /**
         * Affiche une erreur
         */
        function showError(message) {
            const errorDiv = document.getElementById('video-error');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }

        /**
         * Cache l'erreur
         */
        function hideError() {
            const errorDiv = document.getElementById('video-error');
            errorDiv.style.display = 'none';
        }

        /**
         * Reset du modal
         */
        function resetModal() {
            currentVideoData = null;
            document.getElementById('video-url-input').value = '';
            document.getElementById('video-preview-container').style.display = 'none';
            document.getElementById('video-preview-iframe').src = '';
            document.getElementById('video-width').value = '560px';
            document.getElementById('video-align').value = 'center';
            document.getElementById('custom-width-container').style.display = 'none';
            document.getElementById('insert-video-btn').disabled = true;
            hideError();
        }

        /**
         * Injecte les styles CSS
         */
        function injectStyles() {
            if(document.getElementById('video-plugin-styles')) return;

            const style = document.createElement('style');
            style.id = 'video-plugin-styles';
            style.textContent = `
                .video-embed-container {
                    max-width: 100%;
                }
                .video-embed-container iframe {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
            `;
            document.head.appendChild(style);
        }

        /**
         * Configure le bouton de la toolbar
         */
        function setupToolbarButton() {
            const btn = document.querySelector('button[data-command="insertVideo"]');
            if(!btn) {
                console.warn('[plugin-video] Bouton toolbar introuvable');
                return;
            }

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                videoModal.show();
            });
        }

        // Initialisation
        initModal();
        setupToolbarButton();

        console.log('[plugin-video] Initialisé avec succès');
    }
});