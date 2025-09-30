// js/plugins/plugin-align.js
// Permet l'alignement de texte : gauche, centre, droite, justifié
registerPlugin({
    name: "align",
    init({editor}) {
        const select = document.getElementById('align-tools');
        if(select){
            select.addEventListener('change', e=>{
                const val = e.target.value;
                if(!val) return;

                let cmd = '';
                switch(val){
                    case 'left':
                        cmd = 'justifyLeft';
                        break;
                    case 'center':
                        cmd = 'justifyCenter';
                        break;
                    case 'right':
                        cmd = 'justifyRight';
                        break;
                    case 'justify':
                        cmd = 'justifyFull';
                        break;
                    default:
                        console.warn('Option align non gérée :', val);
                        return;
                }

                document.execCommand(cmd, false, null);
                select.value = '';
            });
        }
    }
});
