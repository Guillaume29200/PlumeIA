// js/plugins/plugin-ia.js
// Plugin complet permettant de contacter les divers providers
// Derniere update le 30/09/2025
registerPlugin({
    name: "ia",
    init({editor, state, currentProvider}) {
        const iaModalEl = document.getElementById('iaModal');
        if(!iaModalEl) return;
        const iaModal = new bootstrap.Modal(iaModalEl);
        const iaStatus = document.getElementById('iaStatus');
        const iaOutput = document.getElementById('iaOutput');
        const iaGenerateBtn = document.getElementById('iaGenerateBtn');
        const iaReplaceBtn = document.getElementById('iaReplaceBtn');
        const iaAppendBtn = document.getElementById('iaAppendBtn');

        // Split view HTML
        const htmlResult   = document.getElementById('htmlResult');
        const htmlPreview  = document.getElementById('htmlPreview');
        const htmlCode     = document.getElementById('htmlCode');
        const copyHtmlBtn  = document.getElementById('copyHtmlBtn');

        const providerMap = {
            text:   { provider: "ia_provider_text",   model: "ia_model_text" },
            html:   { provider: "ia_provider_html",   model: "ia_model_html" },
            corr:   { provider: "ia_provider_correction", model: "ia_model_correction" },
            trans:  { provider: "ia_provider_translate",  model: "ia_model_translate" }
        };

        const funLangs = ['goauld','klingon','dothraki','pirate','navis','elfique','minionais'];

        // ------------------- Gestion de la langue fun -------------------
        const langSelect = document.getElementById('ia_translate_lang');
        if(langSelect){
            langSelect.addEventListener('change', ()=>{
                const val = langSelect.value;
                if(funLangs.includes(val)){
                    iaStatus.innerHTML = '<div class="text-warning">⚠️ Langue fun sélectionnée : le texte généré sera approximatif ou stylisé.</div>';
                } else {
                    iaStatus.innerHTML = '';
                }
            });
        }

        // ------------------- Providers dynamiques -------------------
        async function loadProvidersFor(tabKey) {
            const providerEl = document.getElementById(providerMap[tabKey].provider);
            if(!providerEl) return;

            providerEl.innerHTML = '<option>Chargement…</option>';

            try {
                const resp = await fetch('./config/ia-providers.php');
                if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
                
                const data = await resp.json();

                providerEl.innerHTML = '';
                if(data && data.success && Array.isArray(data.providers)){
                    // Déterminer le provider par défaut AVANT de créer les options
                    const defaultProvider = currentProvider || data.default || data.providers[0]?.id || '';
                    
                    data.providers.forEach(p => {
                        const opt = document.createElement('option');
                        opt.value = p.id;
                        opt.textContent = p.name;
                        // Marquer l'option par défaut
                        if(p.id === defaultProvider) {
                            opt.selected = true;
                        }
                        providerEl.appendChild(opt);
                    });

                    // Charger les modèles pour ce provider
                    await loadModelsFor(tabKey, defaultProvider);
                } else {
                    providerEl.innerHTML = '<option value="">Aucun provider disponible</option>';
                }
            } catch(err){
                providerEl.innerHTML = '<option value="">Erreur de chargement</option>';
                console.error('Erreur loadProvidersFor:', err);
            }
        }

        // ------------------- Models dynamiques -------------------
        async function loadModelsFor(tabKey, providerOverride = '') {
            const providerEl = document.getElementById(providerMap[tabKey].provider);
            const modelEl = document.getElementById(providerMap[tabKey].model);
            if(!providerEl || !modelEl) return;

            // IMPORTANT : si providerOverride est fourni, on l'utilise en priorité
            // Sinon on attend un peu que le DOM se stabilise
            let provider = providerOverride;
            if(!provider) {
                // Attendre que le navigateur applique la sélection
                await new Promise(resolve => setTimeout(resolve, 50));
                provider = providerEl.value || currentProvider || 'mistralai';
            }
            
            if(!provider) {
                modelEl.innerHTML = '<option value="">Sélectionnez d\'abord un provider</option>';
                return;
            }
            
            modelEl.innerHTML = '<option>Chargement…</option>';

            try {
                const resp = await fetch('./config/ia-models.php?provider=' + encodeURIComponent(provider));
                if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
                
                const data = await resp.json();

                modelEl.innerHTML = '';
                if(data && data.success && Array.isArray(data.models)){
                    if(data.models.length === 0){
                        modelEl.innerHTML = '<option value="">Aucun modèle disponible</option>';
                    } else {
                        data.models.forEach(m => {
                            const opt = document.createElement('option');
                            opt.value = m.id;
                            opt.textContent = m.name;
                            modelEl.appendChild(opt);
                        });
                    }
                } else {
                    modelEl.innerHTML = '<option value="">Erreur : provider inconnu</option>';
                }
            } catch(err){
                modelEl.innerHTML = '<option value="">Erreur de chargement</option>';
                console.error('Erreur loadModelsFor:', err);
            }
        }

        // ------------------- Réinitialisation du modal -------------------
        function resetModal() {
            if(iaStatus) iaStatus.innerHTML = '';
            if(iaOutput) {
                iaOutput.classList.add('d-none');
                iaOutput.innerHTML = '';
                delete iaOutput.dataset.latest;
            }
            if(iaReplaceBtn) iaReplaceBtn.classList.add('d-none');
            if(iaAppendBtn) iaAppendBtn.classList.add('d-none');
            if(htmlResult) htmlResult.classList.add('d-none');
            if(htmlPreview) {
                const doc = htmlPreview.contentDocument || htmlPreview.contentWindow.document;
                doc.open();
                doc.write('');
                doc.close();
            }
            if(htmlCode) htmlCode.textContent = '';
        }

        // ------------------- Ouverture du modal -------------------
        const btnOpen = document.getElementById('btnIA');
        if(btnOpen){
            btnOpen.addEventListener('click', async () => {
                resetModal();
                iaModal.show();

                // Chargement séquentiel pour éviter les surcharges
                for(const key of ["text","html","corr","trans"]) {
                    await loadProvidersFor(key);
                }
            });
        }

        // ------------------- Changement de provider -------------------
        ["text","html","corr","trans"].forEach(key=>{
            const providerEl = document.getElementById(providerMap[key].provider);
            if(providerEl){
                providerEl.addEventListener("change", ()=> loadModelsFor(key));
            }
        });

        // ------------------- Nettoyage des code fences -------------------
        function cleanFences(text){
            if(!text) return text;
            return text.replace(/<p>\s*```html\s*<\/p>/gi, '')
                       .replace(/<p>\s*```\s*<\/p>/gi, '')
                       .replace(/^```html\s*/i, '')
                       .replace(/^```\s*/i, '')
                       .replace(/```\s*$/i, '')
                       .trim();
        }

        // ------------------- Timer de génération -------------------
        function startTimer() {
            if(state.timerInterval) clearInterval(state.timerInterval);
            let secs = 0;
            state.timerInterval = setInterval(() => {
                secs++;
                if(iaStatus) {
                    iaStatus.innerHTML = `<div class="text-muted"><span class="spinner-border spinner-border-sm"></span> Génération en cours… (${secs}s)</div>`;
                }
            }, 1000);
        }

        function stopTimer() {
            if(state.timerInterval) {
                clearInterval(state.timerInterval);
                state.timerInterval = null;
            }
        }

        // ------------------- Validation des inputs -------------------
        function validateInputs(activeTab) {
            if(activeTab === 'text-tab'){
                const topic = (document.getElementById('ia_topic')?.value || '').trim();
                if(!topic){
                    iaStatus.innerHTML = '<div class="text-danger">⚠️ Veuillez préciser un sujet.</div>';
                    return false;
                }
            } else if(activeTab === 'html-tab'){
                const req = (document.getElementById('ia_html_request')?.value || '').trim();
                if(!req){
                    iaStatus.innerHTML = '<div class="text-danger">⚠️ Décrivez la page HTML souhaitée.</div>';
                    return false;
                }
            } else if(activeTab === 'translate-tab'){
                const text = (editor?.innerText || '').trim();
                if(!text){
                    iaStatus.innerHTML = '<div class="text-danger">⚠️ Aucun texte à traduire dans l\'éditeur.</div>';
                    return false;
                }
            }
            return true;
        }

        // ------------------- Construction du prompt -------------------
        function buildPrompt(activeTab) {
            let prompt = '', mode = '', providerValue = '', modelValue = '', langTarget = '';

            if(activeTab === 'text-tab'){
                const topic = (document.getElementById('ia_topic')?.value || '').trim();
                const style = (document.getElementById('ia_style')?.value || '').trim();
                providerValue = document.getElementById('ia_provider_text')?.value || '';
                modelValue = document.getElementById('ia_model_text')?.value || '';
                prompt = `Génère un article complet sur : ${topic}` + (style ? `\nTon : ${style}` : '');
                mode = 'text';
            } else if(activeTab === 'html-tab'){
                const req = (document.getElementById('ia_html_request')?.value || '').trim();
                const template = (document.getElementById('ia_template')?.value || '').trim();
                providerValue = document.getElementById('ia_provider_html')?.value || '';
                modelValue = document.getElementById('ia_model_html')?.value || '';
                prompt = `Génère uniquement un fragment HTML pour : ${req}` + (template ? `\nTemplate: ${template}` : '') + "\nNe génère pas de <script>.";
                mode = 'html';
            } else if(activeTab === 'correction-tab'){
                prompt = (editor?.innerText || '').trim();
                providerValue = document.getElementById('ia_provider_correction')?.value || '';
                modelValue = document.getElementById('ia_model_correction')?.value || '';
                mode = 'spellcheck';
            } else if(activeTab === 'translate-tab'){
                prompt = (editor?.innerText || '').trim();
                providerValue = document.getElementById('ia_provider_translate')?.value || '';
                modelValue = document.getElementById('ia_model_translate')?.value || '';
                langTarget = document.getElementById('ia_translate_lang')?.value || 'en';
                mode = 'translate';
            }

            return { prompt, mode, providerValue, modelValue, langTarget };
        }

        // ------------------- Affichage des résultats -------------------
        function displayResult(cleaned, mode) {
            if(mode === 'html'){
                if(htmlResult) htmlResult.classList.remove('d-none');
                
                if(htmlPreview) {
                    const doc = htmlPreview.contentDocument || htmlPreview.contentWindow.document;
                    doc.open();
                    doc.write(cleaned);
                    doc.close();
                }
                
                if(htmlCode){
                    htmlCode.textContent = cleaned;
                    if(window.Prism) Prism.highlightElement(htmlCode);
                }
                
                if(copyHtmlBtn){
                    copyHtmlBtn.onclick = ()=>{
                        navigator.clipboard.writeText(cleaned).then(()=>{
                            const originalText = copyHtmlBtn.textContent;
                            copyHtmlBtn.textContent = "✔ Copié !";
                            setTimeout(()=> copyHtmlBtn.textContent = originalText, 1500);
                        }).catch(err => {
                            console.error('Erreur copie:', err);
                            alert('Erreur lors de la copie');
                        });
                    };
                }
                
                if(iaOutput) iaOutput.classList.add('d-none');
            } else {
                if(iaOutput) {
                    iaOutput.classList.remove('d-none');
                    iaOutput.innerHTML = cleaned;
                    iaOutput.dataset.latest = cleaned;
                }
                if(htmlResult) htmlResult.classList.add('d-none');
            }

            if(iaReplaceBtn) iaReplaceBtn.classList.remove('d-none');
            if(iaAppendBtn && mode === 'translate') iaAppendBtn.classList.remove('d-none');
        }

        // ------------------- Génération du contenu -------------------
        if(iaGenerateBtn){
            iaGenerateBtn.addEventListener('click', async () => {
                const activeTab = document.querySelector('#iaTab .nav-link.active')?.id || 'text-tab';

                // Validation
                if(!validateInputs(activeTab)) return;

                // Construction du prompt
                const { prompt, mode, providerValue, modelValue, langTarget } = buildPrompt(activeTab);

                // Désactivation du bouton pendant génération
                iaGenerateBtn.disabled = true;

                try {
                    startTimer();

                    const body = new URLSearchParams();
                    body.append('text', prompt);
                    body.append('mode', mode);
                    body.append('provider', providerValue || currentProvider || '');
                    body.append('model', modelValue || '');
                    if(mode === 'translate') body.append('lang', langTarget);

                    const resp = await fetch(`./config/ia-generateur.php`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
                        body: body.toString()
                    });

                    if(!resp.ok) throw new Error(`HTTP ${resp.status}`);

                    let data;
                    try {
                        data = await resp.json();
                    } catch(e) {
                        throw new Error('Réponse non JSON du serveur');
                    }

                    stopTimer();

                    if(data && data.success){
                        const cleaned = cleanFences(data.response || '');
                        iaStatus.innerHTML = '<div class="text-success">✅ Génération terminée avec succès.</div>';
                        displayResult(cleaned, mode);
                    } else {
                        iaStatus.innerHTML = `<div class="text-danger">❌ Erreur : ${data.error || 'Réponse invalide du serveur'}</div>`;
                        if(iaOutput) iaOutput.classList.add('d-none');
                        if(htmlResult) htmlResult.classList.add('d-none');
                    }
                } catch(err){
                    stopTimer();
                    iaStatus.innerHTML = `<div class="text-danger">❌ Erreur de connexion : ${err.message}</div>`;
                    console.error('Erreur génération IA:', err);
                } finally {
                    iaGenerateBtn.disabled = false;
                }
            });
        }

        // ------------------- Bouton Remplacer -------------------
        if(iaReplaceBtn){
            iaReplaceBtn.addEventListener('click', ()=>{
                const latest = iaOutput?.dataset?.latest || htmlCode?.textContent || '';
                if(latest && editor) {
                    editor.innerHTML = latest;
                    iaModal.hide();
                }
            });
        }

        // ------------------- Bouton Ajouter -------------------
        if(iaAppendBtn){
            iaAppendBtn.addEventListener('click', ()=>{
                const latest = iaOutput?.dataset?.latest || htmlCode?.textContent || '';
                if(latest && editor) {
                    editor.innerHTML += `<hr><div class="translated">${latest}</div>`;
                    iaModal.hide();
                }
            });
        }
    }
});