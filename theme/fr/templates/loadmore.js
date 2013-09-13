/** 
 * Kiubi API - load_more plugin
 * 
 * Copyright 2013 Troll d'idees
 * 
 * exemple d'utilisation :
 * 
 * 	$("div.listing").loadmore({
 *		'api_endpoint' : '/api/v1/catalog/product.json',
 *		'api_params' : {..},
 *		'ui_button' : $('a.load_more'),
 *		'render_item' : function(product) { 
 *			return '<div>' + product.name + '</div>';
 *		}
 *	});
 */
(function($){
	
	'use strict';
	$.fn.loadmore = function(opts) {
		
		var self = this;
		var listing = $(self[0]);

		// Paramètres par défaut
		var options = $.extend({
			
			current_page : 0,
			
			/**
			 * Méthode permettant le rendu d'un élement
			 * Cette méthode doit retourner un noeud DOM ou une
			 * chaine représentant le code HTML de l'élement
			 * @param item
			 * @return Element|string
			 */
			render_item : function(item){ 
				return item;
			},
			
			/**
			 * Cette méthode ajoute un élement au listing
			 * @param item
			 * @return void
			 */
			append_item : function(item, Element){
				listing.append(Element);
			}
			
		}, opts);

		var nav = new kiubi.api_navigator({
			endpoint : options.api_endpoint,
			params : options.api_params,
			current_page : options.current_page
		});

		/**
		 * Méthode permettant de charger la page suivante
		 * @return Promise
		 */
		this.getNextPage = function(){

			return nav.getNextPage().done(function(meta, data){

				// on itère sur chaque élement
				$.each(data, function(index, item){
					var Element = options.render_item.call(self, item);
					options.append_item.call(self, item, Element);
					self.trigger('loadmore.append_item', [item, Element]);
				});
				
				self.trigger('loadmore.append_page');
				
				if(nav.hasNextPage() === false){
					self.trigger('loadmore.complete');				
				}
			});

		};
		
		this.hasNextPage = function()
		{
			return nav.hasNextPage();
		}

		self.trigger('loadmore.init');
		
		return this;
	}

})(jQuery);