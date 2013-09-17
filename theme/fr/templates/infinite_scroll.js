/** 
 * Kiubi API - infinite_scroll plugin
 * 
 * Copyright 2013 Troll d'idees
 * 
 *
 * Exemple d'utilisation :
 * 
 *	$("div.listing").infinite_scroll({
 *		'api_endpoint' : '/api/v1/catalog/product.json',
 *		'api_params'   : {
 *			'limit' : 10,
 *			'sort'  : '-spotlight,name'
 *		},
 *		'threshold' : 50, // seuil en pixels
 *		'render_item'  : function(product) { 
 *			return '<div>' + product.name + '</div>';
 *		}
 *	});
 *	
 */
(function($){
	
	'use strict';
	$.fn.infinite_scroll = function(opts) {
		
		opts = opts || {}
		
		/**
		 * V�rification des d�pendances
		 */
		if(!$.fn.loadmore) {
			console.error && console.error(
				'Le plugin infinite_scroll.js requiert le plugin loadmore.js'
			);
			return this;
		}

		/**
		 * Initialisation du plugin loadmore.js
		 */
		var listing = this.loadmore(opts);
		
		var scroll_offset = false;

		var _update_offset = function () {
			scroll_offset = listing.parent().innerHeight() + listing.offset().top - parseInt(opts.threshold);
		}
		
		$(document).scroll(function(){
			// Bas de page actuel en pixel.
			var bottom = window.innerHeight + window.scrollY;

			// si l'objet comporte un seuil de d�clanchement et que celui-ci est
			// atteint, on charge la page suivante.
			if(scroll_offset && bottom > scroll_offset) {
				// on d�sactive le seuil, celui-ci sera recalcul� 
				// plus tard par la m�thode _load_more. Ceci �vite
				// les appels surnum�raires ind�sirables � l'API
				scroll_offset = false; 
				listing.getNextPage();
			}
		});
		
		listing.on('loadmore.append_page', function(){
			// Une page a �t� charg�e, on met � jour le prochain offset
			if(listing.hasNextPage()) _update_offset();
			
		});
		
		_update_offset();
		
		return this;
		
	}

})(jQuery);