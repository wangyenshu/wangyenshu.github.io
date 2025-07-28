/***
|Name|[[ShowPopupPlugin]]|
|Source|http://www.TiddlyTools.com/#ShowPopupPlugin|
|Version|2.1.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|display tiddler content in a TiddlyWiki popup panel|
!!!!!Documenatation
>see [[ShowPopupPluginInfo]]
!!!!!Revisions
<<<
2011.03.13 2.1.1 in click(), removed check for popup already shown (prevents nested popups!)
| Please see [[ShowPopupPluginInfo]] for previous revision details |
2006.09.09 1.0.0 initial release (transclusion)
<<<
!!!!!Code
***/
//{{{
version.extensions.ShowPopupPlugin=
	{ major:2, minor:1, revision:1, date:new Date(2011,3,13) };
config.macros.showPopup = {
	tip: 'display "%0" in a popup',
	init: function() {
		config.shadowTiddlers.ShowPopup =
			'<<showPopup tiddler:[[$1]] label:"$2" tip:"$3" buttonClass:"button $4" width:"$5" popupClass:"$6" "$7">>';
		config.annotations.ShowPopup =
			'created by ShowPopupPlugin';
	},
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var p=paramString.parseParams('name',null,true,false,true);
		var tid=getParam(p,'tiddler','TiddlerName');
		var label=getParam(p,'label',tid);
		var tip=getParam(p,'tip',this.tip.format([tid]));
		var buttonClass=getParam(p,'buttonClass','');
		var width=getParam(p,'width','auto');
		var popupClass=getParam(p,'popupClass','');
		var above=params.contains('above');
		var mouseover=params.contains('mouseover');
		var b=createTiddlyButton(place, label, tip, this.click, buttonClass, null, null,
			{ tid:tid, popupClass:popupClass, width:width, above:above });
		b.innerHTML=label; // render HTML for entities, images, etc
		if (mouseover) b.onmouseover=b.onclick;  // option: mouseover triggers click
	},
	click: function(ev) { var ev=ev||window.event;
		// DISABLED if (Popup.find(this)!=-1)return false; // popup already shown!
		var p=Popup.create(this); if(!p)return false; // popup not created!
		addClass(p,this.getAttribute('popupClass'));
		var d=createTiddlyElement(p,'div');
		var s=d.style; s.whiteSpace='normal'; s.width=this.getAttribute('width'); s.padding='2px';
		wikify(store.getTiddlerText(this.getAttribute('tid'),''),d);
		if (this.getAttribute('above')!='true') Popup.show();
		else Popup.show('top','left',{x:0,y:-jQuery(d).outerHeight()});
		ev.cancelBubble=true; if(ev.stopPropagation)ev.stopPropagation(); return false;
	}
}
//}}}