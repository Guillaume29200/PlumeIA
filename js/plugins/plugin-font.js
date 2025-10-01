// js/plugins/plugin-fonts.js
// Plugin permettant de changer la police du texte dans PlumeIA
registerPlugin({
    name: "fonts",
    init({ editor }) {
        // ---- Charger Google Fonts dynamiquement ----
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href =
            "https://fonts.googleapis.com/css2?" +
            "family=Inter:wght@400;600" +
            "&family=Poppins:wght@400;600" +
            "&family=Nunito:wght@400;600" +
            "&family=Montserrat:wght@400;700" +
            "&family=Playfair+Display:wght@400;600" +
            "&family=Roboto:wght@400;700" +
            "&family=Lato:wght@400;700" +
            "&family=Raleway:wght@400;700" +
            "&family=Merriweather:wght@400;700" +
            "&display=swap";
        document.head.appendChild(link);

        // ---- Récupérer ton select existant ----
        const fontSelect = document.getElementById("font-picker");
        if (!fontSelect) return; // rien si pas trouvé

        // ---- Appliquer la police choisie ----
        fontSelect.addEventListener("change", (e) => {
            const font = e.target.value;
            if (!font) return;
            document.execCommand("fontName", false, font);
            editor.focus();
        });
    }
});