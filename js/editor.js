// js/editor.js
(async function(){
    'use strict';

    // =============== Vérification des éléments DOM ===============
    const editor = document.getElementById('editor-container');
    const hidden = document.getElementById('editor-hidden');
    const preview = document.getElementById('preview');

    if(!editor){
        console.error('[editor] Élément #editor-container introuvable');
        return;
    }

    // =============== Configuration ===============
    const currentProvider = window.currentProvider || 'mistralai';

    // =============== État partagé global ===============
    if(!window.editorState){
        window.editorState = {
            devMode: false,
            timerInterval: null,
            isInitialized: false
        };
    }

    // =============== Registry des plugins ===============
    const plugins = [];
    const pluginNames = new Set(); // Pour éviter les doublons

    window.registerPlugin = function(plugin){
        try {
            if(!plugin){
                console.warn('[editor] registerPlugin: plugin null ou undefined');
                return false;
            }

            if(typeof plugin.init !== 'function'){
                console.warn('[editor] registerPlugin: plugin.init n\'est pas une fonction', plugin);
                return false;
            }

            const pluginName = plugin.name || 'unnamed';

            if(pluginNames.has(pluginName)){
                console.warn(`[editor] registerPlugin: "${pluginName}" déjà enregistré`);
                return false;
            }

            plugins.push(plugin);
            pluginNames.add(pluginName);
            console.log(`[editor] ✓ Plugin enregistré: ${pluginName}`);
            return true;
        } catch(e){
            console.error('[editor] Erreur registerPlugin:', e);
            return false;
        }
    };

    // =============== Contexte partagé ===============
    const context = Object.freeze({
        editor, 
        hidden, 
        preview, 
        state: window.editorState, 
        registerPlugin, 
        currentProvider
    });

    // =============== Chargement des plugins ===============
    async function loadPluginsList(){
        try {
            const resp = await fetch('./js/plugins/plugins.json.php');
            if(!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);

            const contentType = resp.headers.get('content-type');
            if(!contentType || !contentType.includes('application/json')){
                console.warn('[editor] plugins.json.php ne retourne pas du JSON');
            }

            const data = await resp.json();
            if(!Array.isArray(data)){
                console.error('[editor] plugins.json.php ne retourne pas un tableau', data);
                return [];
            }
            return data;
        } catch(err){
            console.error('[editor] Erreur lors du chargement de plugins.json.php:', err);
            return [];
        }
    }

    async function loadPlugin(file){
        try {
            await import(`./plugins/${file}`);
            return { success: true, file };
        } catch(err){
            console.warn(`[editor] ⚠️ Impossible de charger: ${file}`, err.message);
            return { success: false, file, error: err.message };
        }
    }

    async function initializePlugins(){
        let successCount = 0;
        let errorCount = 0;

        for(const plugin of plugins){
            const pluginName = plugin.name || 'unnamed';
            try {
                await plugin.init(context);
                successCount++;
                console.log(`[editor] ✓ Plugin initialisé: ${pluginName}`);
            } catch(err){
                errorCount++;
                console.error(`[editor] ✗ Erreur init plugin "${pluginName}":`, err);
            }
        }
        return { successCount, errorCount };
    }

    async function loadPlugins(){
        console.log('[editor] 🚀 Démarrage du chargement des plugins...');
        const pluginFiles = await loadPluginsList();
        if(pluginFiles.length === 0){
            console.warn('[editor] Aucun plugin à charger');
            return;
        }

        console.log(`[editor] ${pluginFiles.length} plugin(s) détecté(s):`, pluginFiles);

        const loadResults = await Promise.all(
            pluginFiles.map(file => loadPlugin(file))
        );

        const loadedCount = loadResults.filter(r => r.success).length;
        const failedCount = loadResults.filter(r => !r.success).length;
        console.log(`[editor] Chargement: ${loadedCount} réussi(s), ${failedCount} échoué(s)`);

        if(plugins.length > 0){
            const { successCount, errorCount } = await initializePlugins();
            console.log(`[editor] Initialisation: ${successCount} réussi(s), ${errorCount} échoué(s)`);
            console.log(`[editor] 📦 Plugins actifs:`, plugins.map(p => p.name || 'unnamed'));
        } else {
            console.warn('[editor] Aucun plugin enregistré');
        }

        window.editorState.isInitialized = true;

        window.dispatchEvent(new CustomEvent('editorReady', { 
            detail: { pluginCount: plugins.length, currentProvider }
        }));

        console.log('[editor] ✅ Éditeur initialisé avec succès');
    }

    // =============== Gestion d'erreurs globale ===============
    window.addEventListener('error', function(event){
        if(event.filename && event.filename.includes('/plugins/')){
            console.error('[editor] Erreur dans un plugin:', {
                message: event.message,
                file: event.filename,
                line: event.lineno,
                col: event.colno
            });
        }
    });

    // =============== Lancement ===============
    try {
        await loadPlugins();
    } catch(err){
        console.error('[editor] Erreur fatale lors du chargement:', err);
    }
})();
