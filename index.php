<!doctype html>
<html lang="fr">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width,initial-scale=1">
		<meta name="description" content="Éditeur WYSIWYG avec intégration IA multi-providers">
		<title>Éditeur texte IA — Powered by eSport-CMS</title>
		<!-- Bootstrap CSS -->
		<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
		<!-- Prism.js pour coloration syntaxique -->
		<link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css" rel="stylesheet">
		<style>
			:root {
				--primary-color: #0d6efd;
				--bg-light: #f7f8fa;
				--border-color: #e0e6ee;
				--shadow-focus: rgba(13,110,253,0.06);
			}
			body { 
				background: var(--bg-light); 
				font-family: "Inter", "Segoe UI", Roboto, Arial, sans-serif; 
				padding: 18px; 
			}
			.container { 
				max-width: 1100px; 
				margin: auto; 
			}
			#toolbar { 
				display: flex; 
				flex-wrap: wrap; 
				gap: 6px; 
				margin-bottom: 8px; 
				align-items: center; 
				background: #fff;
				padding: 10px;
				border-radius: 8px;
				border: 1px solid var(--border-color);
			}
			#editor-container { 
				min-height: 300px; 
				border: 1px solid var(--border-color); 
				padding: 14px; 
				border-radius: 8px; 
				background: #fff; 
				outline: none;
				line-height: 1.6;
			}
			#editor-container[contenteditable="true"]:focus { 
				box-shadow: 0 0 0 3px var(--shadow-focus); 
				border-color: var(--primary-color); 
			}
			#preview { 
				display: none; 
				min-height: 200px; 
				border-radius: 8px; 
				padding: 14px; 
				background: #f1f9ff; 
				border: 1px solid #cfe8ff; 
				margin-top: 10px; 
			}
			#iaOutput { 
				white-space: pre-wrap; 
				max-height: 320px; 
				overflow: auto; 
				background: #fff; 
				padding: 12px; 
				border-radius: 6px; 
				border: 1px solid #ddd;
				line-height: 1.6; 
			}
			.spinner-border-sm { 
				width: 1rem; 
				height: 1rem; 
			}
			/* Responsive toolbar */
			@media (max-width: 768px) {
				#toolbar {
					gap: 4px;
				}
				.form-select-sm {
					font-size: 0.8rem;
				}
			}
			/* Accessibility */
			.btn:focus-visible {
				outline: 2px solid var(--primary-color);
				outline-offset: 2px;
			}
		</style>
	</head>
	<body>
		<div class="container">
			<!-- Header -->
			<header class="d-flex justify-content-between align-items-center mb-3">
				<h1 class="h4 mb-0">Éditeur WYSIWYG avec IA</h1>
				<small class="text-muted">Multi-providers : OpenAI, Mistral, Claude</small>
			</header>

			<!-- Barre d'outils -->
			<nav id="toolbar" aria-label="Barre d'outils de l'éditeur">
				<select id="basic-tools" class="form-select form-select-sm" style="width:130px;" aria-label="Outils de typographie">
					<option value="">Typographie</option>
					<option value="bold">Gras</option>
					<option value="italic">Italique</option>
					<option value="underline">Souligné</option>
					<option value="strikeThrough">Barré</option>
					<option value="insertUnorderedList">Liste à puces</option>
					<option value="insertOrderedList">Liste numérotée</option>
					<option value="P">Paragraphe</option>
					<option value="H1">Titre H1</option>
					<option value="H2">Titre H2</option>
					<option value="H3">Titre H3</option>
					<option value="H4">Titre H4</option>
					<option value="H5">Titre H5</option>
					<option value="H6">Titre H6</option>
				</select>
				
				<select id="style-tools" class="form-select form-select-sm" style="width:130px;" aria-label="Styles et effets">
					<option value="">Styles / Effets</option>
					<option value="BLOCKQUOTE">Citation</option>
					<option value="highlight">Surbrillance</option>
					<option value="spoiler">Spoiler</option>
					<option value="code">Code</option>
				</select>
				
				<select id="align-tools" class="form-select form-select-sm" style="width:120px;" aria-label="Alignement du texte">
					<option value="">Alignement</option>
					<option value="left">Gauche</option>
					<option value="center">Centre</option>
					<option value="right">Droite</option>
					<option value="justify">Justifié</option>
				</select>
				
				<select id="emoji-select" class="form-select form-select-sm" style="width:96px;" aria-label="Sélection d'emoji">
					<option value="">Emojis</option>
				</select>
				
				<button type="button" class="btn btn-light btn-sm" data-command="insertVideo" title="Insérer une vidéo" aria-label="Vidéo">🎬</button>
				<button type="button" class="btn btn-light btn-sm" data-command="createLink" title="Créer un lien" aria-label="Lien">🔗</button>
				<button type="button" class="btn btn-light btn-sm" data-command="insertImage" title="Insérer une image" aria-label="Image">🖼️</button>
				
				<button id="preview-toggle" type="button" class="btn btn-info btn-sm ms-auto" aria-label="Basculer l'aperçu">👀 Preview</button>
				<button id="dev-toggle" type="button" class="btn btn-warning btn-sm" aria-label="Mode développeur">🛠️ Dev</button>
				<button id="btnIA" type="button" class="btn btn-primary btn-sm ms-2" aria-label="Ouvrir l'assistance IA">🤖 Assistance IA</button>
			</nav>

			<!-- Éditeur contenteditable -->
			<main>
				<div id="editor-container" contenteditable="true" spellcheck="true" aria-label="Zone d'édition de texte" role="textbox" aria-multiline="true"></div>
				
				<!-- Zone preview -->
				<div id="preview" class="mt-2" aria-live="polite"></div>
			</main>

			<!-- Formulaire de sauvegarde -->
			<form method="post" class="mt-3" aria-label="Formulaire de sauvegarde">
				<textarea id="editor-hidden" name="content" class="d-none" aria-hidden="true"></textarea>
				<div class="d-flex gap-2">
					<button type="submit" class="btn btn-success">💾 Enregistrer</button>
					<button type="button" id="clear-btn" class="btn btn-outline-secondary">🗑️ Vider</button>
				</div>
			</form>

			<!-- Résultat IA rapide -->
			<div id="iaResult" class="mt-3" aria-live="polite"></div>
		</div>

		<!-- Modal IA -->
		<?php 
		$modalPath = __DIR__ . '/modal.php';
		if (file_exists($modalPath)) {
			include $modalPath;
		} else {
			echo '<!-- Erreur : modal.php introuvable -->';
		}
		?>

		<!-- Bootstrap JS -->
		<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"></script>
		
		<!-- Prism.js pour coloration syntaxique -->
		<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-markup.min.js"></script>
		
		<!-- Configuration du provider -->
		<script>
			<?php 
			$configPath = __DIR__ . '/config/ia-config.php';
			if (file_exists($configPath)) {
				$cfg = include $configPath;
				$provider = isset($cfg['default_provider']) ? strtolower(trim($cfg['default_provider'])) : 'mistralai';
			} else {
				$provider = 'mistralai';
			}
			?>
			window.currentProvider = <?php echo json_encode($provider, JSON_HEX_TAG | JSON_HEX_AMP); ?>;
			console.log('[Index] Provider configuré:', window.currentProvider);
		</script>
		
		<!-- Chargement de l'éditeur -->
		<script type="module" src="js/editor.js"></script>
	</body>
</html>