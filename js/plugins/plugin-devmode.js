// js/plugins/plugin-devmode.js
registerPlugin({
    name: "dev-mode",
    init({editor, state}){
        const btn = document.getElementById('dev-toggle');
        if(!btn) return;
        btn.addEventListener('click', ()=>{
            state.devMode = !state.devMode;
            if(state.devMode){
                editor.textContent = editor.innerHTML;
                editor.style.fontFamily = 'monospace';
                editor.style.whiteSpace = 'pre-wrap';
                editor.style.background = '#fffbea';
                alert('Mode développement activé');
            }else{
                editor.innerHTML = editor.textContent;
                editor.style.fontFamily = '';
                editor.style.whiteSpace = '';
                editor.style.background = '#fff';
                alert('Mode développement désactivé');
            }
        });
    }
});
