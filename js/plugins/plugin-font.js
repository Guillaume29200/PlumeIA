// js/plugins/plugin-fonts.js
// Plugin de gestion des polices avec preview et catégories
// Version 2.0
// Dernière update le 04/10/2025
registerPlugin({
    name: "fonts",
    init({ editor }) {
        if(!editor) {
            console.error('[plugin-fonts] Editor non fourni');
            return;
        }

        // Configuration des polices par catégorie
        const fontConfig = {
            'Sans-serif (Modernes)': [
                { name: 'Inter', weight: '300,400,500,600,700' },
                { name: 'Poppins', weight: '300,400,500,600,700' },
                { name: 'Montserrat', weight: '300,400,500,600,700' },
                { name: 'Nunito', weight: '300,400,600,700' },
                { name: 'Roboto', weight: '300,400,500,700' },
                { name: 'Lato', weight: '300,400,700' },
                { name: 'Open Sans', weight: '300,400,600,700' },
                { name: 'Raleway', weight: '300,400,600,700' }
            ],
            'Serif (Élégantes)': [
                { name: 'Playfair Display', weight: '400,600,700' },
                { name: 'Merriweather', weight: '300,400,700' },
                { name: 'Lora', weight: '400,600,700' },
                { name: 'Crimson Text', weight: '400,600,700' },
                { name: 'EB Garamond', weight: '400,600,700' }
            ],
            'Monospace (Code)': [
                { name: 'Fira Code', weight: '400,500,700' },
                { name: 'JetBrains Mono', weight: '400,600,700' },
                { name: 'Source Code Pro', weight: '400,600,700' },
                { name: 'IBM Plex Mono', weight: '400,600' }
            ],
            'Display (Titres)': [
                { name: 'Bebas Neue', weight: '400' },
                { name: 'Archivo Black', weight: '400' },
                { name: 'Righteous', weight: '400' },
                { name: 'Fredoka One', weight: '400' }
            ],
            'Handwriting (Manuscrites)': [
                { name: 'Caveat', weight: '400,700' },
                { name: 'Dancing Script', weight: '400,700' },
                { name: 'Pacifico', weight: '400' },
                { name: 'Shadows Into Light', weight: '400' }
            ]
        };

        /**
         * Charge les Google Fonts
         */
        function loadGoogleFonts() {
            // Vérifier si déjà chargé
            if(document.getElementById('google-fonts-link')) return;

            const allFonts = [];
            Object.values(fontConfig).forEach(category => {
                category.forEach(font => {
                    allFonts.push(`family=${font.name.replace(/ /g, '+')}:wght@${font.weight}`);
                });
            });

            const link = document.createElement('link');
            link.id = 'google-fonts-link';
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?${allFonts.join('&')}&display=swap`;
            document.head.appendChild(link);

            console.log('[plugin-fonts] Google Fonts chargées');
        }

        /**
         * Initialise le select de polices
         */
        function initializeFontPicker() {
            const fontSelect = document.getElementById('font-picker');
            if(!fontSelect) {
                console.warn('[plugin-fonts] Select #font-picker introuvable');
                return;
            }

            fontSelect.innerHTML = '<option value="">Police</option>';

            // Option pour police par défaut
            const defaultOpt = document.createElement('option');
            defaultOpt.value = 'default';
            defaultOpt.textContent = '↻ Police par défaut';
            fontSelect.appendChild(defaultOpt);

            // Ajouter les catégories
            Object.entries(fontConfig).forEach(([category, fonts]) => {
                const optgroup = document.createElement('optgroup');
                optgroup.label = category;

                fonts.forEach(font => {
                    const option = document.createElement('option');
                    option.value = font.name;
                    option.textContent = font.name;
                    option.style.fontFamily = `'${font.name}', sans-serif`;
                    optgroup.appendChild(option);
                });

                fontSelect.appendChild(optgroup);
            });

            // Event listener
            fontSelect.addEventListener('change', handleFontChange);
        }

        /**
         * Gère le changement de police
         */
        function handleFontChange(e) {
            const fontName = e.target.value;
            
            if(!fontName) {
                setTimeout(() => e.target.value = '', 100);
                return;
            }

            try {
                editor.focus();

                if(fontName === 'default') {
                    // Retirer la police personnalisée
                    document.execCommand('removeFormat', false, 'fontName');
                } else {
                    // Appliquer la police avec fallback
                    const fontFamily = `'${fontName}', sans-serif`;
                    
                    // Si pas de sélection, appliquer au paragraphe courant
                    const selection = window.getSelection();
                    if(!selection.rangeCount || selection.isCollapsed) {
                        const node = getParentBlock(selection.anchorNode);
                        if(node && node !== editor) {
                            node.style.fontFamily = fontFamily;
                        }
                    } else {
                        document.execCommand('fontName', false, fontName);
                    }
                }

                // Reset du select
                setTimeout(() => e.target.value = '', 100);

            } catch(err) {
                console.error('[plugin-fonts] Erreur changement police:', err);
            }
        }

        /**
         * Récupère le bloc parent
         */
        function getParentBlock(node) {
            while(node && node !== editor) {
                if(node.nodeType === Node.ELEMENT_NODE) {
                    const display = window.getComputedStyle(node).display;
                    if(display === 'block' || /^h[1-6]$/i.test(node.tagName)) {
                        return node;
                    }
                }
                node = node.parentNode;
            }
            return null;
        }

        /**
         * Crée un bouton "Font Manager" avancé (optionnel)
         */
        function createFontManagerButton() {
            const toolbar = document.getElementById('toolbar');
            if(!toolbar) return;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-light btn-sm';
            btn.title = 'Gestionnaire de polices avancé';
            btn.innerHTML = '🎨';
            btn.addEventListener('click', openFontManager);

            // Insérer après le select
            const fontSelect = document.getElementById('font-picker');
            if(fontSelect && fontSelect.parentNode) {
                fontSelect.parentNode.insertBefore(btn, fontSelect.nextSibling);
            }
        }

        /**
         * Ouvre un modal de gestion avancée des polices
         */
        function openFontManager() {
            let modal = document.getElementById('font-manager-modal');
            
            if(!modal) {
                modal = createFontManagerModal();
            }

            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        }

        /**
         * Crée le modal de gestion des polices
         */
        function createFontManagerModal() {
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = 'font-manager-modal';
            modal.setAttribute('tabindex', '-1');

            modal.innerHTML = `
                <div class="modal-dialog modal-lg modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">🎨 Gestionnaire de polices</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <input type="text" id="font-search" class="form-control mb-3" placeholder="🔍 Rechercher une police...">
                            <div id="font-grid" class="font-grid"></div>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Remplir la grille
            populateFontGrid();

            // Recherche
            const searchInput = modal.querySelector('#font-search');
            searchInput.addEventListener('input', (e) => {
                filterFonts(e.target.value);
            });

            injectFontManagerStyles();

            return modal;
        }

        /**
         * Remplit la grille de polices
         */
        function populateFontGrid() {
            const grid = document.getElementById('font-grid');
            if(!grid) return;

            grid.innerHTML = '';

            Object.entries(fontConfig).forEach(([category, fonts]) => {
                const categorySection = document.createElement('div');
                categorySection.className = 'font-category mb-4';
                categorySection.innerHTML = `<h6 class="text-muted mb-2">${category}</h6>`;

                fonts.forEach(font => {
                    const card = document.createElement('div');
                    card.className = 'font-card';
                    card.dataset.fontName = font.name.toLowerCase();
                    card.innerHTML = `
                        <div class="font-preview" style="font-family: '${font.name}', sans-serif;">
                            The quick brown fox jumps over the lazy dog
                        </div>
                        <div class="font-name">${font.name}</div>
                    `;

                    card.addEventListener('click', () => {
                        applyFontToSelection(font.name);
                        bootstrap.Modal.getInstance(document.getElementById('font-manager-modal')).hide();
                    });

                    categorySection.appendChild(card);
                });

                grid.appendChild(categorySection);
            });
        }

        /**
         * Filtre les polices
         */
        function filterFonts(query) {
            const cards = document.querySelectorAll('.font-card');
            const normalizedQuery = query.toLowerCase().trim();

            cards.forEach(card => {
                const fontName = card.dataset.fontName;
                if(!normalizedQuery || fontName.includes(normalizedQuery)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        /**
         * Applique une police à la sélection
         */
        function applyFontToSelection(fontName) {
            editor.focus();
            const fontFamily = `'${fontName}', sans-serif`;
            
            const selection = window.getSelection();
            if(!selection.rangeCount || selection.isCollapsed) {
                const node = getParentBlock(selection.anchorNode);
                if(node && node !== editor) {
                    node.style.fontFamily = fontFamily;
                }
            } else {
                document.execCommand('fontName', false, fontName);
            }
        }

        /**
         * Injecte les styles du modal
         */
        function injectFontManagerStyles() {
            if(document.getElementById('font-manager-styles')) return;

            const style = document.createElement('style');
            style.id = 'font-manager-styles';
            style.textContent = `
                .font-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .font-card {
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    padding: 15px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .font-card:hover {
                    border-color: #0d6efd;
                    background: #f8f9fa;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
                .font-preview {
                    font-size: 18px;
                    margin-bottom: 8px;
                    color: #333;
                }
                .font-name {
                    font-size: 14px;
                    color: #6c757d;
                    font-weight: 500;
                }
            `;
            document.head.appendChild(style);
        }

        // Initialisation
        loadGoogleFonts();
        initializeFontPicker();
        createFontManagerButton();

        console.log('[plugin-fonts] Initialisé avec succès');
    }
});