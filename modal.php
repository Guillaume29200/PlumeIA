	<!-- Modal IA -->
	<div class="modal fade" id="iaModal" tabindex="-1" aria-hidden="true">
		<div class="modal-dialog modal-lg modal-dialog-centered">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">Assistance IA — Générateur</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
				</div>
				<div class="modal-body">
					<ul class="nav nav-tabs" id="iaTab" role="tablist">
						<li class="nav-item" role="presentation">
							<button class="nav-link active" id="text-tab" data-bs-toggle="tab" data-bs-target="#tab-text" type="button">Texte / Blog</button>
						</li>
						<li class="nav-item" role="presentation">
							<button class="nav-link" id="html-tab" data-bs-toggle="tab" data-bs-target="#tab-html" type="button">Page / HTML</button>
						</li>
						<li class="nav-item" role="presentation">
							<button class="nav-link" id="correction-tab" data-bs-toggle="tab" data-bs-target="#tab-correction" type="button">Correction / Mise en forme</button>
						</li>
						<li class="nav-item" role="presentation">
							<button class="nav-link" id="translate-tab" data-bs-toggle="tab" data-bs-target="#tab-translate" type="button">Traduction</button>
						</li>
					</ul>
					<div class="tab-content mt-3">
						<!-- Onglet Texte -->
						<div class="tab-pane fade show active" id="tab-text">
							<p class="text-muted">
							Besoin d’aide pour rédiger vos articles ? Saisissez le sujet ou la consigne, choisissez le ton souhaité et le modèle IA. L’outil générera un texte clair, structuré et prêt à l’emploi.
							</p>
							<div class="row g-2 mb-2">
								<div class="col-md-6">
									<label class="form-label">Sujet</label>
									<input id="ia_topic" class="form-control" placeholder="Saisissez le sujet ou la consigne">
								</div>
								<div class="col-md-6">
									<label class="form-label">Ton / style (optionnel)</label>
									<input id="ia_style" class="form-control" placeholder="ex: informatif, marketing, léger">
								</div>
								<div class="col-md-6">
									<label class="form-label">Provider IA</label>
									<!-- options chargées dynamiquement depuis ia-config.php via JS -->
									<select id="ia_provider_text" class="form-select">
										<option value="">Chargement…</option>
									</select>
								</div>
								<div class="col-md-6">
									<label class="form-label">Choix du modèle IA</label>
									<select id="ia_model_text" class="form-select">
										<option value="">Chargement…</option>
									</select>
								</div>
							</div>
						</div>
						<!-- Onglet HTML -->
						<div class="tab-pane fade" id="tab-html">
							<p class="text-muted">
							Besoin d’aide pour créer vos pages web ? Cet outil génère automatiquement une page selon vos indications.
							</p>
							<div class="row g-2 mb-2">
								<div class="col-md-12">
									<label class="form-label">Demande HTML</label>
									<input id="ia_html_request" class="form-control" placeholder="Décris la structure souhaitée">
								</div>
								<div class="col-md-4">
									<label class="form-label">Provider IA</label>
									<select id="ia_provider_html" class="form-select">
										<option value="">Chargement…</option>
									</select>
								</div>
								<div class="col-md-4">
									<label class="form-label">Type de template (optionnel)</label>
									<select id="ia_template" class="form-select">
										<option value="">Aucun (IA libre)</option>
										<optgroup label="Structure classique">
											<option value="sidebar-right">Sidebar droite</option>
											<option value="sidebar-left">Sidebar gauche</option>
											<option value="hero-3blocks">Hero + 3 blocs</option>
										</optgroup>
									</select>
								</div>
								<div class="col-md-4">
									<label class="form-label">Choix du modèle IA</label>
									<select id="ia_model_html" class="form-select">
										<option value="">Chargement…</option>
									</select>
								</div>
							</div>
							<!-- Résultat split -->
							<div id="htmlResult" class="row mt-3 d-none">
								<div class="col-md-6">
									<h6>👁️ Aperçu</h6>
									<iframe id="htmlPreview" style="width:100%;height:350px;border:1px solid #ddd;border-radius:6px;background:#fff;"></iframe>
								</div>
								<div class="col-md-6 d-flex flex-column">
									<h6>💻 Code généré</h6>
									<pre class="flex-grow-1" style="max-height:350px;overflow:auto;border:1px solid #ddd;border-radius:6px;padding:8px;background:#f8f9fa;">
										<code id="htmlCode" class="language-html"></code>
									</pre>
									<button class="btn btn-sm btn-outline-secondary mt-2 align-self-end" id="copyHtmlBtn">📋 Copier</button>
								</div>
							</div>
						</div>
						<!-- Onglet Correction -->
						<div class="tab-pane fade" id="tab-correction">
							<p class="text-muted">Utilisez cet outil pour corriger automatiquement votre texte et l’adapter à un style professionnel ou blog.</p>
							<div class="row g-2 mb-2">
								<div class="col-md-12">
								<label class="form-label">Action</label>
									<select id="ia_correction_action" class="form-select">
										<option value="correction">Correction orthographique</option>
										<option value="formatting">Mise en forme blog</option>
										<option value="both">Correction + Mise en forme</option>
									</select>
								</div>
								<div class="col-md-6">
									<label class="form-label">Provider IA</label>
									<select id="ia_provider_correction" class="form-select">
										<option value="">Chargement…</option>
									</select>
								</div>
								<div class="col-md-6">
									<label class="form-label">Choix du modèle IA</label>
									<select id="ia_model_correction" class="form-select">
										<option value="">Chargement…</option>
									</select>
								</div>
							</div>
						</div>
						<!-- Onglet Traduction -->
						<div class="tab-pane fade" id="tab-translate">
							<p class="text-muted">Traduisez automatiquement votre contenu dans une autre langue.<br> Choisissez la langue cible, le provider et le modèle.</p>
							<div class="row g-2 mb-2">
								<div class="col-md-6">
									<label class="form-label">Langue cible</label>
									<select id="ia_translate_lang" class="form-select">
										<optgroup label="Langue par default">
											<option value="fr">Français</option>
											<option value="en">Anglais</option>
											<option value="de">Allemand</option>
											<option value="es">Espagnol</option>
											<option value="it">Italien</option>
											<option value="pt">Portugais</option>
										</optgroup>
										<optgroup label="Langue fun">
											<option value="goauld">Goa'uld (Univers Stargate)</option>
											<option value="klingon">Klingon (Univers Star Trek)</option>
											<option value="dothraki">Dothraki (Game of Thrones)</option>
											<option value="pirate">Pirate Talk</option>
											<option value="navis">Na'vi (Avatar)</option>
											<option value="elfique">Elfique (Le Seigneur des Anneaux)</option>
										</optgroup>
									</select>				
								</div>
								<div class="col-md-6">
									<label class="form-label">Provider IA</label>
									<select id="ia_provider_translate" class="form-select">
										<option value="mistralai">Mistral AI (Gratuit)</option>
										<option value="chatgpt">ChatGPT (Payant)</option>
									</select>
								</div>
								<div class="col-md-12">
									<label class="form-label">Choix du modèle IA</label>
									<select id="ia_model_translate" class="form-select">
										<option value="">Chargement…</option>
									</select>
								</div>
							</div>
						</div>
					</div>
					<hr>
					<div id="iaStatus" class="mb-2"></div>
					<div id="iaOutput" class="d-none"></div>
				</div>
				<div class="modal-footer">
					<button id="iaGenerateBtn" type="button" class="btn btn-primary">Générer</button>
					<button id="iaReplaceBtn" type="button" class="btn btn-danger d-none">Remplacer tout</button>
					<button id="iaAppendBtn" type="button" class="btn btn-success d-none">Ajouter en dessous</button>
					<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
				</div>
			</div>
		</div>
	</div>