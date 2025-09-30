// js/plugins/plugin-emojis.js
// charge config/emojis.json et remplit #emoji-select (ou #emoji-container)
registerPlugin({
    name: "emojis",
    init({editor}){
        async function load(){
            try{
                const resp = await fetch('config/emojis.json');
                if(!resp.ok) throw new Error('HTTP ' + resp.status);
                const emojis = await resp.json();
                const select = document.getElementById('emoji-select');
                const container = document.getElementById('emoji-container');

                if(select){
                    select.innerHTML = '<option value="">Emoji</option>';
                    emojis.forEach(e=>{
                        const opt = document.createElement('option');
                        opt.value = e.char;
                        opt.textContent = `${e.char} ${e.name}`;
                        select.appendChild(opt);
                    });
                    select.addEventListener('change', ()=>{
                        if(!select.value) return;
                        document.execCommand('insertText', false, select.value);
                        select.value = '';
                    });
                }

                if(container){
                    container.innerHTML = '';
                    emojis.forEach(e=>{
                        const btn = document.createElement('button');
                        btn.type = 'button';
                        btn.className = 'btn btn-light btn-sm me-1 mb-1';
                        btn.textContent = e.char;
                        btn.title = e.name;
                        btn.addEventListener('click', ()=> document.execCommand('insertText', false, e.char));
                        container.appendChild(btn);
                    });
                }
            }catch(err){
                console.error('plugin-emojis load error', err);
            }
        }
        load();
    }
});
