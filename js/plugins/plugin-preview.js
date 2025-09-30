// js/plugins/plugin-preview.js
registerPlugin({
    name: "preview",
    init({editor, preview, state}){
        const btn = document.getElementById('preview-toggle');
        if(!btn || !preview) return;
        btn.addEventListener('click', ()=>{
            if(state.devMode) return alert('Désactivez le mode développement pour prévisualiser');
            preview.innerHTML = editor.innerHTML;
            preview.style.display = 'block';
            preview.scrollIntoView({behavior:'smooth'});
        });
    }
});
