<!-- Modal IA -->
<div class="modal fade" id="iaModal" tabindex="-1" aria-labelledby="iaModalLabel" aria-hidden="true">
	<div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
		<div class="modal-content">
			<div class="modal-header bg-primary text-white">
				<h5 class="modal-title" id="iaModalLabel">🤖 Assistance IA — Générateur multi-providers</h5>
				<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fermer"></button>
			</div>
			<div class="modal-body">
				<!-- Tabs -->
				<ul class="nav nav-pills mb-3" id="iaTab" role="tablist">
					<li class="nav-item" role="presentation">
						<button class="nav-link active" id="text-tab" data-bs-toggle="tab" data-bs-target="#tab-text" type="button" role="tab" aria-controls="tab-text" aria-selected="true">
							📝 Texte
						</button>
					</li>
					<li class="nav-item" role="presentation">
						<button class="nav-link" id="html-tab" data-bs-toggle="tab" data-bs-target="#tab-html" type="button" role="tab" aria-controls="tab-html" aria-selected="false">
							💻 HTML
						</button>
					</li>
					<li class="nav-item" role="presentation">
						<button class="nav-link" id="correction-tab" data-bs-toggle="tab" data-bs-target="#tab-correction" type="button" role="tab" aria-controls="tab-correction" aria-selected="false">
							✏️ Correction
						</button>
					</li>
					<li class="nav-item" role="presentation">
						<button class="nav-link" id="translate-tab" data-bs-toggle="tab" data-bs-target="#tab-translate" type="button" role="tab" aria-controls="tab-translate" aria-selected="false">
							🌍 Traduction
						</button>
					</li>
				</ul>

				<div class="tab-content" id="iaTabContent">
					<!-- Onglet Texte -->
					<div class="tab-pane fade show active" id="tab-text" role="tabpanel" aria-labelledby="text-tab">
						<div class="alert alert-info mb-3">
							<strong>💡 Astuce :</strong> Soyez précis dans votre demande pour obtenir un meilleur résultat.
						</div>
						<div class="row g-3">
							<div class="col-md-6">
								<label for="ia_topic" class="form-label fw-bold">Sujet <span class="text-danger">*</span></label>
								<input id="ia_topic" class="form-control" placeholder="Ex: L'importance de l'IA dans le e-sport" required aria-required="true">
								<div class="form-text">Décrivez le sujet de votre article</div>
							</div>
							<div class="col-md-6">
								<label for="ia_style" class="form-label fw-bold">Ton / Style</label>
								<input id="ia_style" class="form-control" placeholder="Ex: informatif, humoristique, professionnel">
								<div class="form-text">Optionnel - Définit le style d'écriture</div>
							</div>
							<div class="col-md-6">
								<label for="ia_provider_text" class="form-label fw-bold">Provider IA <span class="text-danger">*</span></label>
								<select id="ia_provider_text" class="form-select" required aria-required="true">
									<option value="">⏳ Chargement…</option>
								</select>
							</div>
							<div class="col-md-6">
								<label for="ia_model_text" class="form-label fw-bold">Modèle IA <span class="text-danger">*</span></label>
								<select id="ia_model_text" class="form-select" required aria-required="true">
									<option value="">⏳ Chargement…</option>
								</select>
							</div>
						</div>
					</div>

					<!-- Onglet HTML -->
					<div class="tab-pane fade" id="tab-html" role="tabpanel" aria-labelledby="html-tab">
						<div class="alert alert-warning mb-3">
							<strong>⚠️ Important :</strong> Le code généré ne contiendra pas de scripts JavaScript pour des raisons de sécurité.
						</div>
						<div class="row g-3">
							<div class="col-12">
								<label for="ia_html_request" class="form-label fw-bold">Description de la page <span class="text-danger">*</span></label>
								<textarea id="ia_html_request" class="form-control" rows="3" placeholder="Ex: Une carte de profil avec photo, nom, description et bouton contact" required aria-required="true"></textarea>
								<div class="form-text">Décrivez précisément la structure HTML souhaitée</div>
							</div>
							<div class="col-md-4">
								<label for="ia_provider_html" class="form-label fw-bold">Provider IA <span class="text-danger">*</span></label>
								<select id="ia_provider_html" class="form-select" required aria-required="true">
									<option value="">⏳ Chargement…</option>
								</select>
							</div>
							<div class="col-md-4">
								<label for="ia_template" class="form-label fw-bold">Template</label>
								<select id="ia_template" class="form-select">
									<option value="">Aucun (libre)</option>
									<optgroup label="Layouts">
										<option value="sidebar-right">📄 Sidebar droite</option>
										<option value="sidebar-left">📄 Sidebar gauche</option>
										<option value="hero-3blocks">🎯 Hero + 3 blocs</option>
									</optgroup>
								</select>
							</div>
							<div class="col-md-4">
								<label for="ia_model_html" class="form-label fw-bold">Modèle IA <span class="text-danger">*</span></label>
								<select id="ia_model_html" class="form-select" required aria-required="true">
									<option value="">⏳ Chargement…</option>
								</select>
							</div>
						</div>
						
						<!-- Résultat HTML split view -->
						<div id="htmlResult" class="mt-4 d-none">
							<hr>
							<div class="row g-3">
								<div class="col-lg-6">
									<div class="d-flex justify-content-between align-items-center mb-2">
										<h6 class="mb-0">👁️ Aperçu en direct</h6>
										<button class="btn btn-sm btn-outline-primary" onclick="document.getElementById('htmlPreview').contentWindow.location.reload()">🔄 Actualiser</button>
									</div>
									<iframe 
										id="htmlPreview" 
										sandbox="allow-same-origin"
										style="width:100%;height:400px;border:2px solid #dee2e6;border-radius:8px;background:#fff;"
										title="Aperçu HTML généré"
										loading="lazy">
									</iframe>
								</div>
								<div class="col-lg-6 d-flex flex-column">
									<div class="d-flex justify-content-between align-items-center mb-2">
										<h6 class="mb-0">💻 Code source</h6>
										<button class="btn btn-sm btn-outline-secondary" id="copyHtmlBtn">📋 Copier</button>
									</div>
									<pre class="flex-grow-1 mb-0" style="max-height:400px;overflow:auto;border:2px solid #dee2e6;border-radius:8px;padding:12px;background:#f8f9fa;"><code id="htmlCode" class="language-html"></code></pre>
								</div>
							</div>
						</div>
					</div>

					<!-- Onglet Correction -->
					<div class="tab-pane fade" id="tab-correction" role="tabpanel" aria-labelledby="correction-tab">
						<div class="alert alert-info mb-3">
							<strong>💡 Info :</strong> L'IA analysera le contenu actuel de votre éditeur.
						</div>
						<div class="row g-3">
							<div class="col-12">
								<label for="ia_correction_action" class="form-label fw-bold">Action souhaitée <span class="text-danger">*</span></label>
								<select id="ia_correction_action" class="form-select" required aria-required="true">
									<option value="correction">✏️ Correction orthographique uniquement</option>
									<option value="formatting">📐 Mise en forme blog uniquement</option>
									<option value="both">✨ Correction + Mise en forme complète</option>
								</select>
							</div>
							<div class="col-md-6">
								<label for="ia_provider_correction" class="form-label fw-bold">Provider IA <span class="text-danger">*</span></label>
								<select id="ia_provider_correction" class="form-select" required aria-required="true">
									<option value="">⏳ Chargement…</option>
								</select>
							</div>
							<div class="col-md-6">
								<label for="ia_model_correction" class="form-label fw-bold">Modèle IA <span class="text-danger">*</span></label>
								<select id="ia_model_correction" class="form-select" required aria-required="true">
									<option value="">⏳ Chargement…</option>
								</select>
							</div>
						</div>
					</div>

					<!-- Onglet Traduction -->
					<div class="tab-pane fade" id="tab-translate" role="tabpanel" aria-labelledby="translate-tab">
						<div class="alert alert-info mb-3">
							<strong>💡 Info :</strong> L'IA traduira le contenu actuel de votre éditeur.
						</div>
						<div class="row g-3">
							<div class="col-md-4">
								<label for="ia_translate_lang" class="form-label fw-bold">Langue cible <span class="text-danger">*</span></label>
								<select id="ia_translate_lang" class="form-select" required aria-required="true">
									<optgroup label="Langues courantes">
										<option value="fr">Français</option>
										<option value="en">Anglais</option>
										<option value="de">Allemand</option>
										<option value="es">Espagnol</option>
										<option value="it">Italien</option>
										<option value="pt">Portugais</option>
										<option value="nl">Néerlandais</option>
										<option value="ru">Russe</option>
										<option value="ja">Japonais</option>
										<option value="zh">Chinois</option>
									</optgroup>
									<optgroup label="Langues fictives (fun)">
										<option value="goauld">👽 Goa'uld (Stargate)</option>
										<option value="klingon">🖖 Klingon (Star Trek)</option>
										<option value="dothraki">🐴 Dothraki (GoT)</option>
										<option value="pirate">🏴‍☠️ Pirate Talk</option>
										<option value="navis">💙 Na'vi (Avatar)</option>
										<option value="elfique">🧝 Elfique (LOTR)</option>
									</optgroup>
								</select>
							</div>
							<div class="col-md-4">
								<label for="ia_provider_translate" class="form-label fw-bold">Provider IA <span class="text-danger">*</span></label>
								<select id="ia_provider_translate" class="form-select" required aria-required="true">
									<option value="">⏳ Chargement…</option>
								</select>
							</div>
							<div class="col-md-4">
								<label for="ia_model_translate" class="form-label fw-bold">Modèle IA <span class="text-danger">*</span></label>
								<select id="ia_model_translate" class="form-select" required aria-required="true">
									<option value="">⏳ Chargement…</option>
								</select>
							</div>
						</div>
					</div>
				</div>

				<!-- Zone de statut et résultat -->
				<hr class="my-3">
				<div id="iaStatus" class="mb-2" role="status" aria-live="polite"></div>
				<div id="iaOutput" class="d-none p-3 bg-light border rounded" style="max-height:300px;overflow-y:auto;"></div>
			</div>

			<div class="modal-footer bg-light">
				<button id="iaGenerateBtn" type="button" class="btn btn-primary px-4">
					<span class="spinner-border spinner-border-sm d-none me-2" role="status" aria-hidden="true"></span>
					✨ Générer
				</button>
				<button id="iaReplaceBtn" type="button" class="btn btn-danger d-none">🔄 Remplacer tout</button>
				<button id="iaAppendBtn" type="button" class="btn btn-success d-none">➕ Ajouter en dessous</button>
				<button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Fermer</button>
			</div>
		</div>
	</div>
</div>

<style>
/* Amélioration visuelle du modal IA */
#iaModal .nav-pills .nav-link {
	border-radius: 8px;
	transition: all 0.2s ease;
}
#iaModal .nav-pills .nav-link:hover {
	background-color: rgba(13, 110, 253, 0.1);
}
#iaModal .nav-pills .nav-link.active {
	background-color: #0d6efd;
}
#iaModal .form-label.fw-bold {
	font-size: 0.9rem;
	margin-bottom: 0.5rem;
}
#iaModal .alert {
	border-left: 4px solid;
	font-size: 0.9rem;
}
#iaModal .form-text {
	font-size: 0.85rem;
	color: #6c757d;
}
/* Responsive */
@media (max-width: 768px) {
	#iaModal .modal-dialog {
		margin: 0.5rem;
	}
	#iaModal .nav-pills {
		flex-wrap: nowrap;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}
	#iaModal .nav-pills .nav-link {
		white-space: nowrap;
		font-size: 0.9rem;
		padding: 0.5rem 0.8rem;
	}
}
</style>