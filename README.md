# Créer un listing dynamique avec l'API de son site Kiubi


## Introduction

Ce dépôt est un tutoriel qui explique comment utiliser l'API de son site [Kiubi](http://www.kiubi.com) pour créer une navigation dynamique, en chargeant des éléments à la demande.

Bien qu'applicable à tout un ensemble d'éléments, ce tutoriel s'attache plus particulièrement aux listings de produits. Il peut être adapté pour fonctionner par exemple avec les listings de billets du blog ou de commentaires. 

La première partie expliquera comment ajouter un lien "charger davantage" au bas d'un widget de liste de produits. Ce lien permettra de naviguer dans la liste des produits sans recharger la page, à l'aide de l'API Front-office. 

La deuxième partie est une variante de la première. Cette fois, le chargement de nouveaux produits se fera automatiquement au fur et à mesure que l'internaute va scroller dans la page. 


##Prérequis

Ce tutoriel suppose que vous avez un site Kiubi et qu'il est bien configuré : 

 - l'API est activée
 - l'e-commerce est activé
 - le site est en thème personnalisé, basé sur Shiroi

Il est préférable d'être à l'aise avec la manipulation des thèmes personnalisés. En cas de besoin, le [guide du designer](http://doc.kiubi.com) est là.

Ce tutoriel est applicable à tout thème graphique mais les exemples de codes donnés sont optimisés pour un rendu basé sur le thème Shiroi.


## Ajout d'un bouton *charger davantage* sur un listing produit existant 

L'objectif est d'intégrer un bouton à un widget "Liste de produits" permettant de charger davantage d'éléments au clic et de le masquer lorsqu'il n'y a plus d'élément à afficher.

Pour y arriver, on utilise ici plusieurs composants :

 - le framework jQuery pour les manipulations javascript de base
 - le client Javascript API Front-office de Kiubi (qui est un plugin jQuery) pour récupérer les produits
 - le plugin jQuery *loadmore.js* qui ajoute la capacité de chargement automatique d'éléments de listing produit, billets de blog, ou encore commentaires produit.

On va créer un modèle de widget spécifique pour faciliter sa mise en place. 

### Mise en place 

Tout d'abord, il faut inclure les fichiers javascript du tutoriel. Le framework jQuery étant inclus de base dans Shiroi, il n'est nécessaire d'inclure que les feuilles de styles et scripts ci-dessous dans le `<head>` des templates du thème. Vous trouverez ces templates dans le répertoire `/theme/fr/templates/`.

<pre lang="html">
&lt;link rel="stylesheet" href="{racine}/{theme}/{lg}/templates/loadmore.css" /&gt;
&lt;script type="text/javascript" src="{cdn}/js/kiubi.api.pfo.jquery-1.0.min.js"&gt;&lt;/script&gt;
&lt;script type="text/javascript" src="{racine}/{theme}/{lg}/templates/loadmore.min.js"&gt;&lt;/script&gt;
&lt;script type="text/javascript" src="{racine}/{theme}/{lg}/templates/product.tpl.min.js"&gt;&lt;/script&gt;
</pre>
Ajouter les fichiers javascript et CSS du répertoire `/theme/fr/templates` de ce dépôt dans le répertoire du même nom de votre thème graphique.

Créer ensuite un nouveau modèle pour le widget "Liste de produits". 
Pour cela copier le dossier `/theme/fr/widgets/catalogue/liste_produits/button` de ce dépôt au même endroit dans votre thème graphique. 

Aller ensuite dans le Back-office du site et placer le widget "Liste de produit" dans la page de votre choix. Editer la configuration du widget et choisir le modèle "button". Mettre le paramètre "Afficher la navigation" à "Oui" et limiter l'affichage à quelques produits.

La page sur le site affiche désormais une liste de produits ainsi qu'un bouton "Charger davantage". Si le bouton ne s'affiche pas, c'est que le widget affiche d'ores et déjà tous les produits du listing. Il suffit alors d'ajouter quelques produits ou de diminuer le nombre de produits à afficher dans la configuration du widget pour remédier à la situation.

### Explications

Examinons en détail le code HTML du modèle `button` du widget "Liste de produits"` :

<pre lang="html">
&lt;script type="text/javascript"&gt;
	var afficher_navigation = parseInt("{widget_afficher_navigation}");
	var current_page        = parseInt('{num_page}') - 1;
	var page_count          = parseInt('{nb_pages}');
</pre>
Une fois la page générée par le CMS, les balises `{widget_afficher_navigation}` `{num_page}` `{nb_pages}` seront substituées par leur valeur correspondante.
<pre lang="javascript">
	if(afficher_navigation == 1 && page_count > 1 && current_page == 0) {
</pre>
Cette première condition permet de mettre en place la navigation dynamique uniquement si toutes les conditions suivantes sont satisfaites :
 
 - la configuration du widget autorise la navigation
 - le listing actuel comporte plus d'une page
 - la page actuellement affichée est bien la première page du listing

Si l'une de ces conditions n'est pas satisfaite, la navigation dynamique n'est pas mise en place
<pre lang="javascript">
		$("#listing_{serial} .nav").hide();
</pre>
On masque la navigation statique générée par le CMS
<pre lang="javascript">
		var listing = $('#listing_{serial} ul:first').loadmore({
			api_endpoint  : '/catalog' + ('{widget_categorie_id}' ? '/categories/{widget_categorie_id}' : '') + '/products.json',
			api_params    : {
				'limit'        : parseInt("{widget_limit}"),
				'sort'         : "{widget_order_api}",
				'available'    : "{widget_dispo}",
				'in_stock'     : "{widget_stock}",
				'extra_fields' : 'price_label,variants,description',
				'tags'         : "{widget_tags}",
				'tags_rule'    : ("{widget_tags_logique}" == "et" ? "and" : "or")
			},
</pre>
Ces premières options déterminent les paramètres de la requête API correspondant au listing en cours d'affichage. On récupère la configuration du widget (ordre de tri, limite d'affichage, limitations aux tags, disponibilité du produit, restriction à une catégorie). On récupère ainsi exactement les mêmes produits qui auraient été affichés en utilisant le lien "page suivante" de la navigation classique du widget.
<pre lang="javascript">
			render_item : function(product) {
				item.header = (item.header || item.description || "");
				if("{widget_resume}" && item.header.length > parseInt("{widget_resume}")) {
					item.header = item.header.substr(0,parseInt("{widget_resume}")) + "...";
				}
				// définition du contexte
				var ctx = { // liste des balises Kiubi utiles au rendu du template
					'affichage'  : "{widget_affichage}"
				};
				return render_product(product, ctx);
			}
		});
</pre>
La méthode `render_product` définit la façon dont sera "rendu" un objet `product`. Cette méthode, appelée également "template javascript", sera appelée pour chaque nouvel élément avant son ajout au listing existant. Elle peut soit retourner du code HTML, soit un élément DOM. 

Un exemple d'implémentation de cette méthode est proposé dans le fichier `theme/fr/templates/product.tpl.js`.

Le plugin est désormais instancié. On créé ensuite un bouton "Charger davantage"

<pre lang="javascript">
		var BUTTON = $('&lt;div class="more"&gt;')
			.append($('&lt;a&gt;', {text: "Charger davantage"}))
			.insertAfter("#listing_{serial}");
</pre>

Un clic sur le lien de cet élément doit charger la page suivante du listing

<pre lang="javascript">
		$('a', BUTTON).click(function(){ 
			listing.getNextPage();
		});
</pre>

Enfin, le bouton est masqué lorsque la dernière page du listing a été affichée

<pre lang="javascript">
		listing.on('loadmore.complete', function(){
			BUTTON.hide();
		});
	}
	
&lt;/script>
</pre>

### Options avancées

#### Paramètre append_item

Le plugin *loadmore.js* peut également laisser le contrôle sur la façon dont est ajouté chaque élément au listing de produit.
<pre lang="javascript">
$('#listing_{serial} ul:first').loadmore({
	api_endpoint : "..",
	api_params   : {..},
	ui_button    : $("a", BUTTON),
	render_item  : function(){..},
	/**
	 * @param item correspond à l'objet JSON de l'élément courant
	 * @param Element correspond à l'élement DOM retourné par la méthode render_item
	 */
	append_item  : function(item, Element) {
</pre>
Il suffit d'implémenter son propre callback et de la passer en paramètre à l'instanciation du plugin. A noter que dans la méthode append_item, `this` correspond à l'objet `$('#listing_{serial} ul:first')` :
<pre lang="javascript">
		this.append(item);
		console.log("un élément à été ajouté")
	})
});
</pre>
#### Méthodes publiques

L'instanciation du plugin *loadmore.js* expose 2 méthodes publiques :

| nom | description |
| --- | --- |
| `getNextPage` | Charge la page suivante et l'ajoute au listing de façon asynchrone et retourne un objet [$.Deferred](http://api.jquery.com/category/deferred-object/) | 
| `hasNextPage` | Vérifie si le listing comporte une page suivante, (nota: la méthode retourne `undefined` si aucune page n'a jamais été chargé par le plugin *loadmore.js*) | 

<pre lang="javascript">
var nav = $('#listing_{serial} ul:first').loadmore({
	api_endpoint : "..",
	api_params   : {..},
	render_item  : function(){..}
});

nav.getNextPage().done(function()
{
	// Une page a été chargée
	
	if(nav.hasNextPage() === false)
	{
		// Tous les éléments ont été chargée
	}
})
</pre>
#### Evénements

Le plugin *loadmore.js* lance 3 types d'événements.

| nom | description | arguments |
| --- | --- | --- |
| `loadmore.append_item` | Cet événement est déclenché immédiatement après qu'un élément ait été ajouté au listing | `item`, `Element` |
| `loadmore.append_page` | Cet événement est déclenché après que le dernier élément de la page en cours ait été ajouté au listing |  |
| `loadmore.complete` | Cet événement est déclenché lorsque tous les éléments du listing ont été chargés et ajoutés. Il n'y a plus d'autre page à afficher ||

Les events-handlers sont ensuite attachés au listing à l'aide de la méthode [jQuery.on()](http://api.jquery.com/on/)
<pre lang="javascript">
$("#listing_{serial} ul:first")
	.on('loadmore.append_item', function(e, product, Element){
		console.info('Le produit %s a été ajouté', product.name);
	})
	.on('loadmore.append_page', function(){
		console.info('Une page a été chargée');
	})
	.on('loadmore.complete', function(){
		console.info('Tous les éléments ont été chargée');
	});
</pre>
## Ajouter du scroll infini sur un listing de produit 


Nous allons utiliser un autre plugin de ce dépôt : *infinite_scroll.js* tout en gardant les même bases. Les produits ne vont plus être chargés par un clic sur un bouton mais en scrollant vers le bas de la page.

Pour y arriver, on utilise ici plusieurs composants :

- le framework jQuery pour les manipulations javascript de base
- le client Javascript API Front-office de Kiubi (qui est un plugin jQuery) pour récupérer les produits
- le plugin jQuery *loadmore.js* qui ajoute la capacité de chargement automatique d'éléments de listing produit, billet de blog, ou encore commentaires produit.
- le plugin jQuery *infinite_scroll.js* qui ajoute la capacité de chargement au scroll de l'internaute.

On va également créer un modèle de widget spécifique pour faciliter sa mise en place.

### Mise en place 

Il n'est nécessaire d'inclure un script supplémentaire dans le `<head>` des templates du thème. Vous trouverez ces templates dans le répertoire `/theme/fr/templates/`

<pre lang="html">&lt;script type="text/javascript" src="{racine}/{theme}/{lg}/templates/infinite_scroll.min.js">&lt;/script></pre>

Créer ensuite un nouveau modèle pour le widget "Liste de produits". 

Pour cela copier le dossier `/theme/fr/widgets/catalogue/liste_produits/infinite_scroll` de ce dépôt au même endroit dans votre thème graphique. 

Aller ensuite dans le Back-office du site et placer le widget "Liste de produit" dans la page de votre choix. Editer la configuration du widget et choisir le modèle "infinite_scroll". Mettre le paramètre "Afficher la navigation" à "Oui" et limiter l'affichage à quelques produits.

La page sur le site affiche désormais une liste de produits. Au fur et à mesure qu'on se rapproche du bas de la page, les produits sont ajoutés au listing.

### Options avancées

Ce plugin supporte les paramètres avancés, les méthodes publiques ainsi que les événements du plugin *loadmore.js* dont il dépend.


#### Paramètre threshold

Le plugin *infinite_scroll.js* permet également de contrôler un seuil, exprimé en pixels, à partir duquel la page suivante est intégrée au listing.

Ce seuil est renseigné à l'instanciation du plugin *infinite_scroll.js* à l'aide du paramètre `threshold`. Il accepte une valeur entière non-signée.

<pre lang="javascript">
$('#listing_{serial} ul:first').loadmore({
	api_endpoint : "..",
	api_params   : {..},
	ui_button    : $("a", BUTTON),
	render_item  : function(){..},
	threshold	 : 100, // 100 pixels avant la fin du listing, on charge les éléments suivants.
});
</pre>

Sa valeur par défaut est de 0. Les éléments sont donc chargés lorsque le bas de la fenêtre correspond au bas du listing.

### Exemple complet

L'exemple suivant s'applique à un listing de produits dans un widget `liste_produits`. Le code HTML décrit ci-dessous est à intégrer dans le template `index.html` du widget `liste_produits`.

```html
<link rel="stylesheet" href="{racine}/{theme}/{lg}/templates/loadmore.css" />
<script type="text/javascript" src="{cdn}/js/kiubi.api.pfo.jquery-1.0.min.js"></script>
<script type="text/javascript" src="{racine}/{theme}/{lg}/templates/loadmore.js"></script>
<script type="text/javascript" src="{racine}/{theme}/{lg}/templates/infinite_scroll.js"></script>
<script type="text/javascript" src="{racine}/{theme}/{lg}/templates/product.tpl.min.js"></script>

<script type="text/javascript">

	var afficher_navigation = parseInt("{widget_afficher_navigation}");
	var current_page        = parseInt('{num_page}') - 1;
	var page_count          = parseInt('{nb_pages}');

	if(afficher_navigation == 1 && page_count > 1 && current_page == 0) {		
		// si la configuration du widget active la navigation, et
		// si le listing actuel comporte plus d'une seule page, et enfin
		// si la page actuelle est la première page du listing, alors
		// on met en place la pagination dynamique
		
		jQuery(function($){
			$("#listing_{serial} .nav").hide();
			$('#listing_{serial} ul:first').infinite_scroll({
				api_endpoint  : '/catalog' + ('{widget_categorie_id}' ? '/categories/{widget_categorie_id}' : '') + '/products.json',
				api_params    : {
					'limit'        : parseInt("{widget_limit}"),
					'sort'         : "{widget_order_api}",
					'available'    : "{widget_dispo}",
					'in_stock'     : "{widget_stock}",
					'extra_fields' : 'price_label,variants,description',
					'tags'         : "{widget_tags}",
					'tags_rule'    : ("{widget_tags_logique}" == "et" ? "and" : "or")
				},
				threshold : 50, // seuil en px par rapport au bas du listing
				render_item : function(item) {
					item.header = (item.header || item.description || "");
					if("{widget_resume}" && item.header.length > parseInt("{widget_resume}")) {
						item.header = item.header.substr(0,parseInt("{widget_resume}")) + "...";
					}
					var ctx = {
						'affichage'  : "{widget_affichage}"
					};
					return render_product(item, ctx);
				}
			});
		});
	}
	
</script>
```