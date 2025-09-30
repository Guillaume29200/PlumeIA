// js/plugins/plugin-paste-clean.js
registerPlugin({
    name: "paste-clean",
    init({editor}){
        editor.addEventListener('paste', (e)=>{
            e.preventDefault();
            const clipboard = e.clipboardData || window.clipboardData;
            let html = clipboard.getData('text/html') || clipboard.getData('text/plain') || '';
            if(!html) return;
            html = html.replace(/<\s*div[^>]*>/gi,'').replace(/<\s*\/\s*div\s*>/gi,'<br>');
            html = html.replace(/(<br\s*\/?>\s*){2,}/gi,'<br>');
            html = html.replace(/(href|src)\s*=\s*(['"]?)\s*javascript:[^'"]*\2/gi,'');
            document.execCommand('insertHTML', false, html);
        });
    }
});
