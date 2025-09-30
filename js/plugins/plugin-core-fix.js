// js/plugins/plugin-core-fix.js
// fix du comportement "h2 par défaut" quand l'éditeur est vide
registerPlugin({
    name: "core-fix-empty-block",
    init({editor}){
        function fixEmptyEditor() {
            // on veut un bloc neutre <div><br></div> au lieu d'un <h2><br></h2>
            if (editor.innerHTML.trim() === '' || editor.innerHTML.trim() === '<h2><br></h2>') {
                editor.innerHTML = '<div><br></div>';
                const sel = window.getSelection();
                const range = document.createRange();
                const div = editor.querySelector('div');
                if(div){
                    range.setStart(div, 0);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        }

        editor.addEventListener('keydown', (e) => {
            // si vide, on empêche le comportement par défaut et on corrige
            if (editor.innerHTML.trim() === '' || editor.innerHTML.trim() === '<h2><br></h2>') {
                // Ne bloque pas toutes les entrées — seulement quand on est sur la toute première frappe
                // on laisse les touches normales fonctionner mais forçons la structure
                // (on ne bloque pas systématiquement, juste un fix minimal)
                setTimeout(fixEmptyEditor, 0);
            }
        });

        editor.addEventListener('focus', fixEmptyEditor);
        // initial check
        fixEmptyEditor();
    }
});