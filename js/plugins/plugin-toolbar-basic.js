// js/plugins/plugin-toolbar-basic.js
// Gestion de la barre d'outils de base — boutons et select pour formatage texte
registerPlugin({
    name: "toolbar-basic",
    init({editor}){

        // ---- BOUTONS classiques ----
        const buttons = document.querySelectorAll('#toolbar button');
        buttons.forEach(btn => {
            const cmd = btn.getAttribute('data-command');
            if(!cmd) return;

            const basicCmds = ['bold','italic','underline','strikeThrough','insertUnorderedList','insertOrderedList','formatBlock'];
            if(basicCmds.includes(cmd)){
                btn.addEventListener('click', ()=>{
                    if(cmd === 'formatBlock'){
                        const value = btn.getAttribute('data-value') || 'P';
                        document.execCommand('formatBlock', false, value);
                    } else {
                        document.execCommand(cmd, false, null);
                    }
                    editor.focus();
                });
            }
        });

        // ---- SELECT pour regrouper tout ----
        const select = document.getElementById('basic-tools');
        if(select){
            select.addEventListener('change', (e)=>{
                const val = e.target.value;
                if(!val) return;

                // Titres / paragraphes
                if(['H1','H2','H3','H4','H5','H6','P'].includes(val)){
                    document.execCommand('formatBlock', false, val);
                } 
                // Listes
                else if(['insertUnorderedList','insertOrderedList'].includes(val)){
                    document.execCommand(val, false, null);
                } 
                // Texte (gras, italic, etc.)
                else if(['bold','italic','underline','strikeThrough'].includes(val)){
                    document.execCommand(val, false, null);
                }

                // Réinitialise le select
                select.value = "";
                editor.focus();
            });
        }
    }
});
