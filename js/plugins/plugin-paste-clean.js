// js/plugins/plugin-paste-clean.js
// Nettoyage intelligent du contenu collé (Word, Google Docs, etc.)
// Version 2.0
// Derniere update le : 04/10/2025
registerPlugin({
    name: "paste-clean",
    init({editor}) {
        if(!editor) {
            console.error('[plugin-paste-clean] Editor non fourni');
            return;
        }

        /**
         * Nettoie le HTML collé
         */
        function cleanHTML(html) {
            if(!html) return '';

            // Supprimer les balises dangereuses
            html = html.replace(/<script[^>]*>.*?<\/script>/gi, '');
            html = html.replace(/<style[^>]*>.*?<\/style>/gi, '');
            html = html.replace(/<link[^>]*>/gi, '');
            html = html.replace(/<meta[^>]*>/gi, '');

            // Supprimer les attributs dangereux
            html = html.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, ''); // onclick, onerror, etc.
            html = html.replace(/(href|src)\s*=\s*(['"]?)\s*javascript:[^'"]*\2/gi, ''); // javascript: URLs

            // Nettoyer les styles inline (garder seulement essentiels)
            html = html.replace(/style\s*=\s*["'][^"']*["']/gi, (match) => {
                // Garder seulement font-weight, font-style, text-decoration
                const allowedStyles = match.match(/(font-weight|font-style|text-decoration|color):\s*[^;]+;?/gi);
                return allowedStyles ? `style="${allowedStyles.join(' ')}"` : '';
            });

            // Remplacer les divs par des paragraphes
            html = html.replace(/<\s*div[^>]*>/gi, '<p>');
            html = html.replace(/<\s*\/\s*div\s*>/gi, '</p>');

            // Remplacer les spans inutiles
            html = html.replace(/<span[^>]*>(.*?)<\/span>/gi, '$1');

            // Nettoyer les classes et IDs (sauf celles de l'éditeur)
            html = html.replace(/\s*class\s*=\s*["'][^"']*["']/gi, '');
            html = html.replace(/\s*id\s*=\s*["'][^"']*["']/gi, '');

            // Nettoyer les attributs MS Office
            html = html.replace(/\s*(mso-[^=]*=["'][^"']*["']|xmlns[^=]*=["'][^"']*["'])/gi, '');

            // Normaliser les espaces
            html = html.replace(/&nbsp;/g, ' ');
            html = html.replace(/\u00A0/g, ' '); // Non-breaking space

            // Nettoyer les br multiples
            html = html.replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>');

            // Nettoyer les paragraphes vides
            html = html.replace(/<p[^>]*>\s*<\/p>/gi, '');

            // Normaliser les sauts de ligne
            html = html.replace(/\r\n/g, '\n');
            html = html.replace(/\r/g, '\n');

            return html.trim();
        }

        /**
         * Détecte la source du contenu collé
         */
        function detectSource(html, text) {
            if(!html) return 'plain';

            if(html.includes('urn:schemas-microsoft-com:office:word')) return 'word';
            if(html.includes('docs-internal-guid')) return 'googledocs';
            if(html.includes('Apple-interchange-newline')) return 'pages';
            if(html.includes('notion')) return 'notion';
            if(html.match(/<meta[^>]*Excel/i)) return 'excel';
            
            return 'html';
        }

        /**
         * Nettoyage spécifique MS Word
         */
        function cleanWordHTML(html) {
            // Supprimer les commentaires conditionnels
            html = html.replace(/<!--\[if[^\]]*\]>[\s\S]*?<!\[endif\]-->/gi, '');
            
            // Supprimer les balises MS Office
            html = html.replace(/<\/?o:[^>]*>/gi, '');
            html = html.replace(/<\/?w:[^>]*>/gi, '');
            html = html.replace(/<\/?m:[^>]*>/gi, '');
            html = html.replace(/<\/?v:[^>]*>/gi, '');

            // Nettoyer les listes Word
            html = html.replace(/<p[^>]*mso-list[^>]*>(.*?)<\/p>/gi, '<li>$1</li>');

            return html;
        }

        /**
         * Nettoyage spécifique Google Docs
         */
        function cleanGoogleDocsHTML(html) {
            // Supprimer les IDs Google Docs
            html = html.replace(/id="docs-internal-guid-[^"]*"/gi, '');
            
            // Nettoyer les spans de Google Docs
            html = html.replace(/<span[^>]*google-docs[^>]*>(.*?)<\/span>/gi, '$1');

            return html;
        }

        /**
         * Gère l'événement paste
         */
        function handlePaste(e) {
            e.preventDefault();

            const clipboard = e.clipboardData || window.clipboardData;
            if(!clipboard) {
                console.warn('[plugin-paste-clean] Clipboard non disponible');
                return;
            }

            // Récupérer les données
            const htmlData = clipboard.getData('text/html');
            const textData = clipboard.getData('text/plain');

            if(!htmlData && !textData) {
                console.warn('[plugin-paste-clean] Aucune donnée à coller');
                return;
            }

            try {
                let cleanedHTML = '';

                if(htmlData) {
                    const source = detectSource(htmlData, textData);
                    console.log(`[plugin-paste-clean] Source détectée: ${source}`);

                    // Nettoyage selon la source
                    switch(source) {
                        case 'word':
                            cleanedHTML = cleanWordHTML(htmlData);
                            break;
                        case 'googledocs':
                            cleanedHTML = cleanGoogleDocsHTML(htmlData);
                            break;
                        default:
                            cleanedHTML = htmlData;
                    }

                    // Nettoyage général
                    cleanedHTML = cleanHTML(cleanedHTML);

                } else {
                    // Texte brut : convertir en paragraphes
                    const lines = textData.split('\n').filter(line => line.trim());
                    cleanedHTML = lines.map(line => `<p>${line}</p>`).join('');
                }

                // Insérer dans l'éditeur
                if(cleanedHTML) {
                    document.execCommand('insertHTML', false, cleanedHTML);
                    console.log('[plugin-paste-clean] Contenu collé et nettoyé');
                }

            } catch(err) {
                console.error('[plugin-paste-clean] Erreur lors du collage:', err);
                
                // Fallback : insérer le texte brut
                if(textData) {
                    document.execCommand('insertText', false, textData);
                }
            }
        }

        /**
         * Configuration du paste spécial (Ctrl+Shift+V)
         */
        function handlePastePlain(e) {
            if((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'v') {
                e.preventDefault();
                
                navigator.clipboard.readText().then(text => {
                    const cleanText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    document.execCommand('insertText', false, cleanText);
                    console.log('[plugin-paste-clean] Texte brut collé');
                }).catch(err => {
                    console.error('[plugin-paste-clean] Erreur lecture clipboard:', err);
                });
            }
        }

        /**
         * Notification visuelle
         */
        function showPasteNotification(source) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #0d6efd;
                color: white;
                padding: 10px 20px;
                border-radius: 6px;
                z-index: 10000;
                font-size: 14px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            notification.textContent = `✓ Contenu collé et nettoyé (${source})`;
            document.body.appendChild(notification);

            setTimeout(() => notification.remove(), 2000);
        }

        // Événements
        editor.addEventListener('paste', handlePaste);
        editor.addEventListener('keydown', handlePastePlain);

        console.log('[plugin-paste-clean] Initialisé avec succès');
    }
});