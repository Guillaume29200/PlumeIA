// js/plugins/plugin-devmode.js
// Plugin permettant de passer en mode développeur avec coloration syntaxique
registerPlugin({
    name: "dev-mode",
    init({ editor, state }) {
        const btn = document.getElementById('dev-toggle');
        if (!btn) return;

        // Charger Prism si besoin
        if (typeof Prism === "undefined") {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "https://cdn.jsdelivr.net/npm/prismjs/themes/prism-tomorrow.css"; // thème sombre
            document.head.appendChild(link);

            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/prismjs/prism.js";
            document.head.appendChild(script);

            const scriptHtml = document.createElement("script");
            scriptHtml.src = "https://cdn.jsdelivr.net/npm/prismjs/components/prism-markup.min.js";
            document.head.appendChild(scriptHtml);

            const scriptCss = document.createElement("script");
            scriptCss.src = "https://cdn.jsdelivr.net/npm/prismjs/components/prism-css.min.js";
            document.head.appendChild(scriptCss);

            const scriptJs = document.createElement("script");
            scriptJs.src = "https://cdn.jsdelivr.net/npm/prismjs/components/prism-javascript.min.js";
            document.head.appendChild(scriptJs);
        }

        btn.addEventListener('click', () => {
            state.devMode = !state.devMode;

            if (state.devMode) {
                // Récupérer le code
                const code = editor.innerHTML.trim();

                // Afficher en code brut avec coloration Prism
                editor.innerHTML = `<pre><code class="language-html">${escapeHtml(code)}</code></pre>`;
                editor.style.fontFamily = 'monospace';
                editor.style.background = '#1e1e1e'; // fond noir VSCode-like
                editor.style.color = '#ddd';

                // Attendre que Prism soit prêt
                setTimeout(() => {
                    if (window.Prism) Prism.highlightAllUnder(editor);
                }, 200);

                alert('Mode développement activé');
            } else {
                // Revenir au contenu éditable normal
                const codeBlock = editor.querySelector("code");
                if (codeBlock) {
                    editor.innerHTML = codeBlock.textContent;
                }

                editor.style.fontFamily = '';
                editor.style.background = '#fff';
                editor.style.color = '#000';
                alert('Mode développement désactivé');
            }
        });

        // Fonction d’échappement HTML pour éviter que <div> ne soit rendu
        function escapeHtml(str) {
            return str.replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;");
        }
    }
});