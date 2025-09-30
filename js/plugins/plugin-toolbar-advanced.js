// js/plugins/plugin-toolbar-advanced.js
// advanced: createLink, insertImage, insertVideo, insertCode, highlight, citation (BLOCKQUOTE), spoiler
registerPlugin({
    name: "toolbar-advanced",
    init({editor}){
        // createLink
        document.querySelectorAll('#toolbar button[data-command="createLink"]').forEach(btn=>{
            btn.addEventListener('click', ()=>{
                const url = prompt('URL du lien','https://');
                if(!url) return;
                if(!/^https?:\/\//i.test(url) && !confirm('L’URL ne commence pas par http(s). Continuer ?')) return;
                document.execCommand('createLink', false, url);
            });
        });

        // insertImage
        document.querySelectorAll('#toolbar button[data-command="insertImage"]').forEach(btn=>{
            btn.addEventListener('click', ()=>{
                const url = prompt('URL de l’image','https://');
                if(!url) return;
                document.execCommand('insertImage', false, url);
            });
        });

        // insertVideo (YouTube, Vimeo, Facebook, TikTok)
        document.querySelectorAll('#toolbar button[data-command="insertVideo"]').forEach(btn=>{
            btn.addEventListener('click', ()=>{
                const url = prompt('URL de la vidéo','https://');
                if(!url) return;

                let videoId, iframe;

                // YouTube
                if(/(?:youtube\.com\/watch\?v=|youtu\.be\/)/.test(url)){
                    videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)[1];
                    iframe = document.createElement('iframe');
                    iframe.src = `https://www.youtube.com/embed/${videoId}`;
                    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                }
                // Vimeo
                else if(/vimeo\.com/.test(url)){
                    videoId = url.match(/vimeo\.com\/(\d+)/)[1];
                    iframe = document.createElement('iframe');
                    iframe.src = `https://player.vimeo.com/video/${videoId}`;
                    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
                }
                // Facebook (vidéo standard ou reel)
                else if(/facebook\.com/.test(url)){
                    let match = url.match(/videos\/(\d+)/) || url.match(/reel\/(\d+)/);
                    if(!match){ alert('URL Facebook non supportée ou non publique'); return; }
                    videoId = match[1];
                    iframe = document.createElement('iframe');
                    iframe.src = `https://www.facebook.com/video/embed?video_id=${videoId}`;
                    iframe.allow = 'autoplay; clipboard-write; encrypted-media';
                }
                // TikTok
                else if(/tiktok\.com/.test(url)){
                    videoId = url.match(/\/video\/(\d+)/);
                    if(!videoId){ alert('Impossible de détecter l’ID TikTok'); return; }
                    videoId = videoId[1];
                    iframe = document.createElement('iframe');
                    iframe.src = `https://www.tiktok.com/embed/${videoId}`;
                    iframe.allow = 'autoplay; clipboard-write; encrypted-media';
                }
                else {
                    alert('URL vidéo non supportée');
                    return;
                }

                iframe.width = '560';
                iframe.height = '315';
                iframe.frameBorder = '0';
                iframe.allowFullscreen = true;

                editor.appendChild(iframe);
            });
        });

        // --- Nouveau select pour Styles / Effets ---
        const styleSelect = document.getElementById('style-tools');
        if(styleSelect){
            styleSelect.addEventListener('change', e=>{
                const val = e.target.value;
                if(!val) return;

                const sel = window.getSelection();
                if(!sel.rangeCount) return;
                const range = sel.getRangeAt(0);
                if(range.collapsed && !['BLOCKQUOTE','code'].includes(val)) return;

                switch(val){
                    case 'BLOCKQUOTE':
                        document.execCommand('formatBlock', false, 'BLOCKQUOTE');
                        break;
                    case 'highlight':
                        const span = document.createElement('span');
                        span.style.backgroundColor = '#fff3b0';
                        span.appendChild(range.extractContents());
                        range.insertNode(span);
                        break;
					case 'spoiler':
						const spoiler = document.createElement('span');
						spoiler.style.backgroundColor = '#444';
						spoiler.style.color = '#fff';
						spoiler.style.borderRadius = '4px';
						spoiler.style.padding = '0 4px';
						spoiler.style.cursor = 'pointer';
						spoiler.style.display = 'inline-block';
						
						// texte réel
						const realText = document.createElement('span');
						realText.appendChild(range.extractContents());
						realText.style.color = '#fff';
						realText.style.backgroundColor = '#444';
						realText.style.display = 'none'; // caché par défaut
						
						// texte indicatif
						const hintText = document.createElement('span');
						hintText.textContent = '"Attention : spoiler potentiel"';
						hintText.style.color = '#fff';
						
						spoiler.appendChild(hintText);
						spoiler.appendChild(realText);
						
						spoiler.onmouseover = () => {
							hintText.style.display = 'none';
							realText.style.display = 'inline';
						};
						spoiler.onmouseout = () => {
							hintText.style.display = 'inline';
							realText.style.display = 'none';
						};
						
						range.insertNode(spoiler);
						break;
                    case 'code':
                        const pre = document.createElement('pre');
                        pre.style.background = '#1e1e1e';
                        pre.style.color = '#f8f8f2';
                        pre.style.padding = '10px';
                        pre.style.borderRadius = '6px';
                        pre.style.fontFamily = 'Consolas, "Courier New", monospace';
                        pre.style.whiteSpace = 'pre-wrap';
                        pre.style.overflowX = 'auto';
                        pre.style.border = '1px solid #444';
                        pre.appendChild(document.createTextNode(sel.toString()));
                        range.deleteContents();
                        range.insertNode(pre);
                        break;
                    default:
                        console.warn('Option non gérée :', val);
                }

                styleSelect.value = "";
            });
        }
    }
});
