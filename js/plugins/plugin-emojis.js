// js/plugins/plugin-emojis.js
// Charge les emojis depuis config/emojis.json et propose deux interfaces
// Version 2.0 - Amélioration avec catégories, recherche, et récents
// Derniere update : 01/10/2025
registerPlugin({
    name: "emojis",
    init({editor}) {
        if(!editor) {
            console.error('[plugin-emojis] Editor non fourni');
            return;
        }

        // État du plugin
        const pluginState = {
            emojis: [],
            recentEmojis: JSON.parse(localStorage.getItem('recent-emojis') || '[]'),
            favorites: JSON.parse(localStorage.getItem('favorite-emojis') || '[]'),
            categories: {}
        };

        const MAX_RECENT = 12;

        /**
         * Charge les emojis depuis le fichier JSON
         */
        async function loadEmojis() {
            try {
                const resp = await fetch('config/emojis.json');
                
                if(!resp.ok) {
                    throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
                }

                pluginState.emojis = await resp.json();

                // Grouper par catégories si disponibles
                pluginState.emojis.forEach(emoji => {
                    const category = emoji.category || 'Autres';
                    if(!pluginState.categories[category]) {
                        pluginState.categories[category] = [];
                    }
                    pluginState.categories[category].push(emoji);
                });

                // Initialiser les interfaces
                initializeSelect();
                initializeContainer();

                console.log(`[plugin-emojis] ${pluginState.emojis.length} emojis chargés`);

            } catch(err) {
                console.error('[plugin-emojis] Erreur de chargement:', err);
                
                // Fallback avec emojis basiques
                pluginState.emojis = getFallbackEmojis();
                initializeSelect();
                initializeContainer();
            }
        }

        /**
         * Emojis de secours si le fichier JSON échoue
         */
        function getFallbackEmojis() {
            return [
                {char: '😀', name: 'Sourire', category: 'Visages'},
                {char: '😂', name: 'Rire', category: 'Visages'},
                {char: '❤️', name: 'Cœur', category: 'Symboles'},
                {char: '👍', name: 'Pouce levé', category: 'Mains'},
                {char: '🎉', name: 'Fête', category: 'Objets'},
                {char: '🔥', name: 'Feu', category: 'Nature'},
                {char: '💡', name: 'Ampoule', category: 'Objets'},
                {char: '✨', name: 'Étincelles', category: 'Symboles'}
            ];
        }

        /**
         * Initialise le select dropdown
         */
        function initializeSelect() {
            const select = document.getElementById('emoji-select');
            if(!select) return;

            select.innerHTML = '<option value="">Emojis</option>';

            // Ajouter les récents
            if(pluginState.recentEmojis.length > 0) {
                const recentGroup = document.createElement('optgroup');
                recentGroup.label = '⏱️ Récents';
                pluginState.recentEmojis.forEach(char => {
                    const emoji = pluginState.emojis.find(e => e.char === char);
                    if(emoji) {
                        const opt = createOption(emoji);
                        recentGroup.appendChild(opt);
                    }
                });
                select.appendChild(recentGroup);
            }

            // Ajouter les favoris
            if(pluginState.favorites.length > 0) {
                const favGroup = document.createElement('optgroup');
                favGroup.label = '⭐ Favoris';
                pluginState.favorites.forEach(char => {
                    const emoji = pluginState.emojis.find(e => e.char === char);
                    if(emoji) {
                        const opt = createOption(emoji);
                        favGroup.appendChild(opt);
                    }
                });
                select.appendChild(favGroup);
            }

            // Ajouter par catégories
            Object.keys(pluginState.categories).sort().forEach(category => {
                const group = document.createElement('optgroup');
                group.label = category;
                
                pluginState.categories[category].forEach(emoji => {
                    const opt = createOption(emoji);
                    group.appendChild(opt);
                });
                
                select.appendChild(group);
            });

            // Event listener
            select.addEventListener('change', handleSelectChange);
        }

        /**
         * Crée une option pour le select
         */
        function createOption(emoji) {
            const opt = document.createElement('option');
            opt.value = emoji.char;
            opt.textContent = `${emoji.char} ${emoji.name}`;
            opt.dataset.keywords = emoji.keywords?.join(' ') || '';
            return opt;
        }

        /**
         * Gère le changement de sélection
         */
        function handleSelectChange(e) {
            const select = e.target;
            if(!select.value) return;

            insertEmoji(select.value);
            select.value = '';
        }

        /**
         * Initialise le container avec boutons
         */
        function initializeContainer() {
            const container = document.getElementById('emoji-container');
            if(!container) return;

            container.innerHTML = '';
            container.className = 'emoji-picker-container';

            // Créer la barre de recherche
            const searchBar = createSearchBar();
            container.appendChild(searchBar);

            // Créer les onglets de catégories
            const tabs = createCategoryTabs();
            container.appendChild(tabs);

            // Créer la zone d'affichage des emojis
            const emojiGrid = document.createElement('div');
            emojiGrid.id = 'emoji-grid';
            emojiGrid.className = 'emoji-grid';
            container.appendChild(emojiGrid);

            // Afficher les récents par défaut
            displayCategory('recent');

            // Styles CSS
            injectStyles();
        }

        /**
         * Crée la barre de recherche
         */
        function createSearchBar() {
            const wrapper = document.createElement('div');
            wrapper.className = 'emoji-search-wrapper';
            wrapper.innerHTML = `
                <input 
                    type="text" 
                    id="emoji-search" 
                    class="form-control form-control-sm" 
                    placeholder="🔍 Rechercher un emoji..."
                    autocomplete="off"
                >
            `;

            const input = wrapper.querySelector('#emoji-search');
            input.addEventListener('input', handleSearch);

            return wrapper;
        }

        /**
         * Gère la recherche d'emojis
         */
        function handleSearch(e) {
            const query = e.target.value.toLowerCase().trim();
            const grid = document.getElementById('emoji-grid');

            if(!query) {
                displayCategory('recent');
                return;
            }

            const results = pluginState.emojis.filter(emoji => {
                return emoji.name.toLowerCase().includes(query) ||
                       emoji.keywords?.some(k => k.toLowerCase().includes(query)) ||
                       emoji.char === query;
            });

            grid.innerHTML = '';
            
            if(results.length === 0) {
                grid.innerHTML = '<p class="text-muted text-center p-3">Aucun emoji trouvé</p>';
                return;
            }

            results.forEach(emoji => {
                const btn = createEmojiButton(emoji);
                grid.appendChild(btn);
            });
        }

        /**
         * Crée les onglets de catégories
         */
        function createCategoryTabs() {
            const nav = document.createElement('div');
            nav.className = 'emoji-category-tabs';

            // Onglet récents
            if(pluginState.recentEmojis.length > 0) {
                const tab = createTab('⏱️', 'Récents', 'recent');
                nav.appendChild(tab);
            }

            // Onglet favoris
            if(pluginState.favorites.length > 0) {
                const tab = createTab('⭐', 'Favoris', 'favorites');
                nav.appendChild(tab);
            }

            // Onglets catégories
            Object.keys(pluginState.categories).sort().forEach(category => {
                const icon = getCategoryIcon(category);
                const tab = createTab(icon, category, category);
                nav.appendChild(tab);
            });

            return nav;
        }

        /**
         * Crée un onglet de catégorie
         */
        function createTab(icon, label, categoryKey) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'emoji-tab';
            btn.innerHTML = `<span class="emoji-tab-icon">${icon}</span>`;
            btn.title = label;
            btn.dataset.category = categoryKey;
            
            if(categoryKey === 'recent') {
                btn.classList.add('active');
            }

            btn.addEventListener('click', () => {
                document.querySelectorAll('.emoji-tab').forEach(t => t.classList.remove('active'));
                btn.classList.add('active');
                displayCategory(categoryKey);
            });

            return btn;
        }

        /**
         * Affiche une catégorie d'emojis
         */
        function displayCategory(categoryKey) {
            const grid = document.getElementById('emoji-grid');
            grid.innerHTML = '';

            let emojisToDisplay = [];

            if(categoryKey === 'recent') {
                emojisToDisplay = pluginState.recentEmojis
                    .map(char => pluginState.emojis.find(e => e.char === char))
                    .filter(Boolean);
                
                if(emojisToDisplay.length === 0) {
                    grid.innerHTML = '<p class="text-muted text-center p-3">Aucun emoji récent</p>';
                    return;
                }
            } else if(categoryKey === 'favorites') {
                emojisToDisplay = pluginState.favorites
                    .map(char => pluginState.emojis.find(e => e.char === char))
                    .filter(Boolean);
                
                if(emojisToDisplay.length === 0) {
                    grid.innerHTML = '<p class="text-muted text-center p-3">Aucun favori</p>';
                    return;
                }
            } else {
                emojisToDisplay = pluginState.categories[categoryKey] || [];
            }

            emojisToDisplay.forEach(emoji => {
                const btn = createEmojiButton(emoji);
                grid.appendChild(btn);
            });
        }

        /**
         * Crée un bouton emoji
         */
        function createEmojiButton(emoji) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'emoji-btn';
            btn.textContent = emoji.char;
            btn.title = emoji.name;
            btn.dataset.char = emoji.char;

            // Indicateur de favori
            if(pluginState.favorites.includes(emoji.char)) {
                btn.classList.add('favorite');
            }

            btn.addEventListener('click', () => insertEmoji(emoji.char));

            // Click droit pour ajouter/retirer des favoris
            btn.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleFavorite(emoji.char);
                btn.classList.toggle('favorite');
            });

            return btn;
        }

        /**
         * Insère un emoji dans l'éditeur
         */
        function insertEmoji(char) {
            try {
                // Focus sur l'éditeur
                if(document.activeElement !== editor && !editor.contains(document.activeElement)) {
                    editor.focus();
                }

                // Insertion
                const success = document.execCommand('insertText', false, char);
                
                if(!success) {
                    // Fallback manuel
                    const selection = window.getSelection();
                    if(selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        range.deleteContents();
                        range.insertNode(document.createTextNode(char));
                        range.collapse(false);
                    }
                }

                // Ajouter aux récents
                addToRecent(char);

            } catch(err) {
                console.error('[plugin-emojis] Erreur insertion:', err);
            }
        }

        /**
         * Ajoute un emoji aux récents
         */
        function addToRecent(char) {
            // Retirer si déjà présent
            pluginState.recentEmojis = pluginState.recentEmojis.filter(c => c !== char);
            
            // Ajouter au début
            pluginState.recentEmojis.unshift(char);
            
            // Limiter la taille
            if(pluginState.recentEmojis.length > MAX_RECENT) {
                pluginState.recentEmojis.pop();
            }

            // Sauvegarder
            localStorage.setItem('recent-emojis', JSON.stringify(pluginState.recentEmojis));
        }

        /**
         * Bascule un emoji en favori
         */
        function toggleFavorite(char) {
            const index = pluginState.favorites.indexOf(char);
            
            if(index > -1) {
                pluginState.favorites.splice(index, 1);
            } else {
                pluginState.favorites.push(char);
            }

            localStorage.setItem('favorite-emojis', JSON.stringify(pluginState.favorites));
        }

        /**
         * Retourne l'icône d'une catégorie
         */
        function getCategoryIcon(category) {
            const icons = {
                'Visages': '😀',
                'Personnes': '👤',
                'Animaux': '🐶',
                'Nature': '🌿',
                'Nourriture': '🍔',
                'Activités': '⚽',
                'Voyages': '✈️',
                'Objets': '💡',
                'Symboles': '❤️',
                'Drapeaux': '🚩'
            };
            return icons[category] || '📦';
        }

        /**
         * Injecte les styles CSS
         */
        function injectStyles() {
            if(document.getElementById('emoji-picker-styles')) return;

            const style = document.createElement('style');
            style.id = 'emoji-picker-styles';
            style.textContent = `
                .emoji-picker-container {
                    border: 1px solid #dee2e6;
                    border-radius: 8px;
                    background: #fff;
                    padding: 8px;
                    max-width: 400px;
                }
                .emoji-search-wrapper {
                    margin-bottom: 8px;
                }
                .emoji-category-tabs {
                    display: flex;
                    gap: 4px;
                    margin-bottom: 8px;
                    flex-wrap: wrap;
                    border-bottom: 1px solid #dee2e6;
                    padding-bottom: 8px;
                }
                .emoji-tab {
                    border: none;
                    background: transparent;
                    padding: 6px 10px;
                    font-size: 1.2rem;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: background 0.2s;
                }
                .emoji-tab:hover {
                    background: #f8f9fa;
                }
                .emoji-tab.active {
                    background: #e7f3ff;
                }
                .emoji-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
                    gap: 4px;
                    max-height: 300px;
                    overflow-y: auto;
                }
                .emoji-btn {
                    border: 1px solid transparent;
                    background: transparent;
                    padding: 8px;
                    font-size: 1.5rem;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: all 0.2s;
                    position: relative;
                }
                .emoji-btn:hover {
                    background: #f8f9fa;
                    border-color: #dee2e6;
                    transform: scale(1.15);
                }
                .emoji-btn.favorite::after {
                    content: '⭐';
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    font-size: 0.6rem;
                }
            `;
            document.head.appendChild(style);
        }

        // Initialisation
        loadEmojis();

        console.log('[plugin-emojis] Initialisé avec succès');
    }
});