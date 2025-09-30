// js/plugins/plugin-form.js
registerPlugin({
    name: "form",
    init({editor, hidden}){
        const form = document.querySelector('form');
        if(form){
            form.addEventListener('submit', (e)=>{
                hidden.value = window.editorState.devMode ? editor.textContent : editor.innerHTML;
                e.preventDefault();
                alert('Contenu prêt à être envoyé (demo)');
            });
        }
        const clearBtn = document.getElementById('clear-btn');
        if(clearBtn){
            clearBtn.addEventListener('click', ()=>{
                if(confirm('Vider l’éditeur ?')) editor.innerHTML = '';
            });
        }
    }
});
