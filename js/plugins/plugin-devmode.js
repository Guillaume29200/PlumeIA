// js/plugins/plugin-devmode.js
// Plugin mode développeur avec éditeur de code avancé
// Version 2.0 - Amélioration majeure avec fonctionnalités IDE
// Derniere update : 01/10/2025
registerPlugin({
    name: "dev-mode",
    init({ editor, state }) {
        const btn = document.getElementById('dev-toggle');
        if (!btn) {
            console.warn('[plugin-devmode] Bouton #dev-toggle introuvable');
            return;
        }

        // État du plugin
        const pluginState = {
            originalContent: '',
            isFullscreen: false,
            theme: localStorage.getItem('devmode-theme') || 'tomorrow'
        };

        // Thèmes disponibles
        const themes = {
            tomorrow: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css',
            twilight: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-twilight.min.css',
            okaidia: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-okaidia.min.css',
            dark: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-dark.min.css',
            light: 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css'
        };

        // Charger Prism.js
        function loadPrism() {
            return new Promise((resolve) => {
                if (typeof Prism !== "undefined") {
                    resolve();
                    return;
                }

                // Charger le thème
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = themes[pluginState.theme];
                link.id = "prism-theme";
                document.head.appendChild(link);

                // Charger Prism core
                const script = document.createElement("script");
                script.src = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js";
                script.onload = () => {
                    // Charger les langages
                    const languages = ['markup', 'css', 'javascript'];
                    let loaded = 0;

                    languages.forEach(lang => {
                        const langScript = document.createElement("script");
                        langScript.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${lang}.min.js`;
                        langScript.onload = () => {
                            loaded++;
                            if (loaded === languages.length) resolve();
                        };
                        document.head.appendChild(langScript);
                    });
                };
                document.head.appendChild(script);
            });
        }

        // Changer de thème
        function changeTheme(themeName) {
            if (!themes[themeName]) return;
            
            pluginState.theme = themeName;
            localStorage.setItem('devmode-theme', themeName);
            
            const existingLink = document.getElementById('prism-theme');
            if (existingLink) {
                existingLink.href = themes[themeName];
            }
            
            if (state.devMode) {
                highlightCode();
            }
        }

        // Créer la barre d'outils du mode dev
        function createDevToolbar() {
            const toolbar = document.createElement('div');
            toolbar.id = 'dev-toolbar';
            toolbar.innerHTML = `
                <div style="display:flex;gap:8px;padding:8px;background:#2d2d2d;border-radius:8px 8px 0 0;align-items:center;flex-wrap:wrap;">
                    <select id="dev-theme-select" class="form-select form-select-sm" style="width:auto;" title="Changer le thème">
                        <option value="tomorrow" ${pluginState.theme === 'tomorrow' ? 'selected' : ''}>Tomorrow Night</option>
                        <option value="twilight" ${pluginState.theme === 'twilight' ? 'selected' : ''}>Twilight</option>
                        <option value="okaidia" ${pluginState.theme === 'okaidia' ? 'selected' : ''}>Okaidia</option>
                        <option value="dark" ${pluginState.theme === 'dark' ? 'selected' : ''}>Dark</option>
                        <option value="light" ${pluginState.theme === 'light' ? 'selected' : ''}>Light</option>
                    </select>
                    <button id="dev-format-btn" class="btn btn-sm btn-light" title="Formater le code (Ctrl+Shift+F)">
                        🎨 Formater
                    </button>
                    <button id="dev-copy-btn" class="btn btn-sm btn-light" title="Copier le code">
                        📋 Copier
                    </button>
                    <button id="dev-minify-btn" class="btn btn-sm btn-light" title="Minifier le code">
                        📦 Minifier
                    </button>
                    <button id="dev-validate-btn" class="btn btn-sm btn-info" title="Valider le HTML">
                        ✓ Valider
                    </button>
                    <button id="dev-fullscreen-btn" class="btn btn-sm btn-warning" title="Plein écran (F11)">
                        ⛶ Plein écran
                    </button>
                    <span class="ms-auto text-white-50" style="font-size:0.85rem;" id="dev-stats"></span>
                </div>
            `;
            editor.parentNode.insertBefore(toolbar, editor);
            return toolbar;
        }

        // Formater le code HTML
        function formatHTML(html) {
            try {
                const div = document.createElement('div');
                div.innerHTML = html.trim();
                return formatElement(div, 0).trim();
            } catch(e) {
                console.error('[plugin-devmode] Erreur formatage:', e);
                return html;
            }
        }

        function formatElement(element, level) {
            const indent = '  '.repeat(level);
            let result = '';

            Array.from(element.childNodes).forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const tagName = node.tagName.toLowerCase();
                    const attrs = Array.from(node.attributes)
                        .map(attr => ` ${attr.name}="${attr.value}"`)
                        .join('');
                    
                    if (node.childNodes.length === 0) {
                        result += `${indent}<${tagName}${attrs}></${tagName}>\n`;
                    } else if (node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE) {
                        result += `${indent}<${tagName}${attrs}>${node.textContent}</${tagName}>\n`;
                    } else {
                        result += `${indent}<${tagName}${attrs}>\n`;
                        result += formatElement(node, level + 1);
                        result += `${indent}</${tagName}>\n`;
                    }
                } else if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent.trim();
                    if (text) result += `${indent}${text}\n`;
                }
            });

            return result;
        }

        // Minifier le HTML
        function minifyHTML(html) {
            return html.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim();
        }

        // Valider le HTML
        function validateHTML(html) {
            const errors = [];
            const div = document.createElement('div');
            
            try {
                div.innerHTML = html;
                
                // Vérifier les balises non fermées
                const openTags = (html.match(/<[^/>][^>]*>/g) || []).length;
                const closeTags = (html.match(/<\/[^>]+>/g) || []).length;
                
                if (openTags !== closeTags) {
                    errors.push(`⚠️ Balises non équilibrées: ${openTags} ouvertes, ${closeTags} fermées`);
                }
                
                // Vérifier les attributs obligatoires
                div.querySelectorAll('img').forEach((img, i) => {
                    if (!img.hasAttribute('alt')) {
                        errors.push(`⚠️ Image #${i+1} sans attribut alt`);
                    }
                });
                
                div.querySelectorAll('a').forEach((a, i) => {
                    if (!a.hasAttribute('href')) {
                        errors.push(`⚠️ Lien #${i+1} sans attribut href`);
                    }
                });
                
                if (errors.length === 0) {
                    return '✅ HTML valide !';
                }
                
                return errors.join('\n');
            } catch(e) {
                return `❌ Erreur de parsing: ${e.message}`;
            }
        }

        // Statistiques du code
        function updateStats(code) {
            const lines = code.split('\n').length;
            const chars = code.length;
            const words = code.split(/\s+/).filter(w => w.length > 0).length;
            
            const statsEl = document.getElementById('dev-stats');
            if (statsEl) {
                statsEl.textContent = `${lines} lignes • ${chars} caractères • ${words} mots`;
            }
        }

        // Coloration syntaxique
        function highlightCode() {
            if (!window.Prism) return;
            
            setTimeout(() => {
                const codeBlock = editor.querySelector('code');
                if (codeBlock) {
                    Prism.highlightElement(codeBlock);
                }
            }, 50);
        }

        // Échapper le HTML
        function escapeHtml(str) {
            return str.replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/"/g, "&quot;")
                      .replace(/'/g, "&#039;");
        }

        // Activer le mode dev
        async function enableDevMode() {
            await loadPrism();
            
            pluginState.originalContent = editor.innerHTML;
            const code = editor.innerHTML.trim();
            
            // Créer la toolbar
            const toolbar = createDevToolbar();
            
            // Transformer en éditeur de code
            editor.innerHTML = `<pre style="margin:0;"><code class="language-html" contenteditable="true" spellcheck="false">${escapeHtml(code)}</code></pre>`;
            editor.style.fontFamily = "'Fira Code', 'Consolas', monospace";
            editor.style.fontSize = '14px';
            editor.style.background = '#1e1e1e';
            editor.style.color = '#d4d4d4';
            editor.style.padding = '16px';
            editor.style.borderRadius = '0 0 8px 8px';
            editor.style.lineHeight = '1.6';
            editor.style.minHeight = '400px';
            editor.style.maxHeight = '80vh';
            editor.style.overflow = 'auto';
            
            highlightCode();
            updateStats(code);
            
            // Events toolbar
            setupToolbarEvents(toolbar);
            
            // Raccourcis clavier
            setupKeyboardShortcuts();
            
            btn.textContent = '🛠️ Mode visuel';
            btn.classList.remove('btn-warning');
            btn.classList.add('btn-success');
        }

        // Désactiver le mode dev
        function disableDevMode() {
            const toolbar = document.getElementById('dev-toolbar');
            if (toolbar) toolbar.remove();
            
            const codeBlock = editor.querySelector("code");
            if (codeBlock) {
                // Récupérer le code édité (non échappé)
                const editedCode = codeBlock.textContent;
                editor.innerHTML = editedCode;
            } else {
                editor.innerHTML = pluginState.originalContent;
            }
            
            // Restaurer les styles
            editor.style.fontFamily = '';
            editor.style.fontSize = '';
            editor.style.background = '#fff';
            editor.style.color = '#000';
            editor.style.padding = '14px';
            editor.style.borderRadius = '8px';
            editor.style.minHeight = '300px';
            editor.style.maxHeight = '';
            editor.style.lineHeight = '';
            
            if (pluginState.isFullscreen) {
                exitFullscreen();
            }
            
            btn.textContent = '🛠️ Dev';
            btn.classList.remove('btn-success');
            btn.classList.add('btn-warning');
        }

        // Configuration des événements toolbar
        function setupToolbarEvents(toolbar) {
            // Changement de thème
            const themeSelect = toolbar.querySelector('#dev-theme-select');
            themeSelect?.addEventListener('change', (e) => {
                changeTheme(e.target.value);
            });
            
            // Formater
            toolbar.querySelector('#dev-format-btn')?.addEventListener('click', () => {
                const codeBlock = editor.querySelector('code');
                if (codeBlock) {
                    const formatted = formatHTML(codeBlock.textContent);
                    codeBlock.textContent = formatted;
                    highlightCode();
                    updateStats(formatted);
                }
            });
            
            // Copier
            toolbar.querySelector('#dev-copy-btn')?.addEventListener('click', async () => {
                const codeBlock = editor.querySelector('code');
                if (codeBlock) {
                    try {
                        await navigator.clipboard.writeText(codeBlock.textContent);
                        const btn = toolbar.querySelector('#dev-copy-btn');
                        const originalText = btn.textContent;
                        btn.textContent = '✅ Copié !';
                        setTimeout(() => btn.textContent = originalText, 2000);
                    } catch(e) {
                        alert('Erreur lors de la copie');
                    }
                }
            });
            
            // Minifier
            toolbar.querySelector('#dev-minify-btn')?.addEventListener('click', () => {
                const codeBlock = editor.querySelector('code');
                if (codeBlock) {
                    const minified = minifyHTML(codeBlock.textContent);
                    codeBlock.textContent = minified;
                    highlightCode();
                    updateStats(minified);
                }
            });
            
            // Valider
            toolbar.querySelector('#dev-validate-btn')?.addEventListener('click', () => {
                const codeBlock = editor.querySelector('code');
                if (codeBlock) {
                    const result = validateHTML(codeBlock.textContent);
                    alert(result);
                }
            });
            
            // Plein écran
            toolbar.querySelector('#dev-fullscreen-btn')?.addEventListener('click', toggleFullscreen);
        }

        // Raccourcis clavier
        function setupKeyboardShortcuts() {
            editor.addEventListener('keydown', (e) => {
                // Ctrl+Shift+F : Formater
                if (e.ctrlKey && e.shiftKey && e.key === 'F') {
                    e.preventDefault();
                    document.getElementById('dev-format-btn')?.click();
                }
                
                // F11 : Plein écran
                if (e.key === 'F11') {
                    e.preventDefault();
                    toggleFullscreen();
                }
                
                // Tab : Indentation
                if (e.key === 'Tab') {
                    e.preventDefault();
                    document.execCommand('insertText', false, '  ');
                }
                
                // Mise à jour des stats après frappe
                setTimeout(() => {
                    const codeBlock = editor.querySelector('code');
                    if (codeBlock) updateStats(codeBlock.textContent);
                }, 100);
            });
        }

        // Plein écran
        function toggleFullscreen() {
            if (!pluginState.isFullscreen) {
                editor.style.position = 'fixed';
                editor.style.top = '0';
                editor.style.left = '0';
                editor.style.width = '100vw';
                editor.style.height = '100vh';
                editor.style.zIndex = '9999';
                editor.style.maxHeight = '100vh';
                
                const toolbar = document.getElementById('dev-toolbar');
                if (toolbar) {
                    toolbar.style.position = 'fixed';
                    toolbar.style.top = '0';
                    toolbar.style.left = '0';
                    toolbar.style.width = '100%';
                    toolbar.style.zIndex = '10000';
                }
                
                pluginState.isFullscreen = true;
            } else {
                exitFullscreen();
            }
        }

        function exitFullscreen() {
            editor.style.position = '';
            editor.style.top = '';
            editor.style.left = '';
            editor.style.width = '';
            editor.style.height = '';
            editor.style.zIndex = '';
            editor.style.maxHeight = '80vh';
            
            const toolbar = document.getElementById('dev-toolbar');
            if (toolbar) {
                toolbar.style.position = '';
                toolbar.style.top = '';
                toolbar.style.left = '';
                toolbar.style.width = '';
                toolbar.style.zIndex = '';
            }
            
            pluginState.isFullscreen = false;
        }

        // Event principal du bouton
        btn.addEventListener('click', () => {
            state.devMode = !state.devMode;
            
            if (state.devMode) {
                enableDevMode();
            } else {
                disableDevMode();
            }
        });

        console.log('[plugin-devmode] Initialisé avec succès');
    }
});