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

		// Param�tres par d�faut
		var options = $.extend({
			
			current_page : 0,
			
			/**
			 * M�thode permettant le rendu d'un �lement
			 * Cette m�thode doit retourner un noeud DOM ou une
			 * chaine repr�sentant le code HTML de l'�lement
			 * @param item
			 * @return Element|string
			 */
			render_item : function(item){ 
				return item;
			},
			
			/**
			 * Cette m�thode ajoute un �lement au listing
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
		 * M�thode permettant de charger la page suivante
		 * @return Promise
		 */
		this.getNextPage = function(){

			return nav.getNextPage().done(function(meta, data){

				// on it�re sur chaque �lement
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