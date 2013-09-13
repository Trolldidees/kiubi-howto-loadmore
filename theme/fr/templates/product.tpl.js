/**
 * Méthode permettant le rendu d'un objet produit.
 * Cette méthode peut éventuellement être modifiée afin d'utiliser
 * un moteur de template javascript tel moustache, transparencyjs 
 * ou encore weld.js
 * 
 * @param product 
 * @param options 
 * @return Element|string
 */
render_product = function(product, context)
{
	if(context.affichage == 'v') return render_product_v(product, context);
	else                         return render_product_l(product, context);
}
	
/**
 * Template pour l'affichage en mode liste,
 * Ce template affiche la liste des tags ainsi qu'une liste
 * déroulante le cas échéant des variable pouvant être ajoutées
 * au panier
 */
render_product_l = function(product, options)
{
	// Rendu de l'illustration de produit
	var illustration = "";			
	if(product.main_thumb) {
		illustration = '<figure><a href="' + product.url + '" title="' + product.name + '" class="illustration"> \
			<img src="' + (options.affichage == "v" ? product.main_thumb.url_g_miniature : product.main_thumb.url_miniature) + '" alt=""></a> \
		</figure>';
	}

	tpl = '<li class="fadein scallup">' + 
		'<form method="post" action="/fr/ecommerce/panier.html"> \
			<input type="hidden" name="pid" value="' + product.id + '" /> \
			<input type="hidden" name="act" value="addP" /> \
			<input type="hidden" name="ctl" value="commandes/panier_detail" />' +
		'<div class="post_produit">' + illustration +
		'<div class="post_content" ' + (illustration ? 'style="margin-left: 120px;"':'') + '> \
			<h2><a href="' + product.url + '">' + product.name + '</a></h2> \
			<p class="tags">';

	$.each(product.tags.split(/,/), function(){ 
		tag_name = this.replace(/^\s+/, '').replace(/\s+$/, '');
		if(!tag_name) return;
		tag_url = '/fr/recherche/catalogue/tags:' + kiubi.escape(tag_name) + "/";
		tpl += '<a href="' + tag_url + '">' + tag_name + '</a>';
	});

	tpl += '</p>';
	
	if(product.in_stock == "no") {
		tpl += '<p class="alerte">Produit en rupture de stock</p>';
	}
	else if(product.available == "no") {
		tpl += '<p class="alerte">Disponible à partir du ' + product.release_date_f + '</p>';
	}
	else if(product.available == "partial") {
		tpl += '<p class="alerte">Certaines variantes sont indisponibles</p>';
	}
	
	tpl += '<div class="desc">' + product.header + '</div> \
		<p class="prix"> \
			<span class="' + (product.is_discounted?'promo':'') + '">' + product.price_inc_vat_label + '</span>' +
			(product.is_discounted ? ' <del>' + product.price_base_inc_vat_label + '</del>':'') + '</p> \
		<div class="produit_infos">';

	if(product.available != "no")
	{
		if(product.variants.length > 1) {
			tpl += '<select name="vid" class="variantes">';
			$.each(product.variants, function(){
				if(!this.is_available) return; // on ignore les variantes en rupture
				tpl += '<option value="' + parseInt(this.id) + '">' + this.name + ' - ' + this.price_inc_vat_label + '</option>';
			});
			tpl += '</select>';
		}
		tpl += '<input type="submit" class="bt_panier" value="Ajouter au panier" title="Ajouter au panier">';
	}
		
	tpl += '</div></div></div></form></li>';

	return tpl;
}

/**
 * Template pour l'affichage en mode vignettes,
 * Ce template est une version simplifié du template de
 * liste. Les tags et le bouton d'ajout au panier ne sont
 * pas présent.
 */
render_product_v = function(product, options)
{
	// Rendu de l'illustration de produit
	var illustration = "";			
	if(product.main_thumb) {
		illustration = '<figure><a href="' + product.url + '" title="' + product.name + '" class="illustration"> \
			<img src="' + (options.affichage == "v" ? product.main_thumb.url_g_miniature : product.main_thumb.url_miniature) + '" alt=""></a> \
		</figure>';
	}

	tpl = '<li class="fadein scallup">' + 
		'<div class="post_produit">' + illustration +
		'<div class="post_content" ' + (illustration ? 'style="margin-left: 120px;"':'') + '> \
			<h2><a href="' + product.url + '">' + product.name + '</a></h2> \
			<p class="prix"> \
				<span class="' + (product.is_discounted?'promo':'') + '">' + product.price_inc_vat_label + '</span>' +
				(product.is_discounted ? ' <del>' + product.price_base_inc_vat_label + '</del>':'') + '</p> \
			<div class="desc">' + product.header + '</div> \
		</div></div>';
	
	return tpl;
}