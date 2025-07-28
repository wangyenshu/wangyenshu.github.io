/***
|Name|BreadcrumbsPlugin|
|Author|Eric Shulman|
|Source|http://www.TiddlyTools.com/#BreadcrumbsPlugin|
|Documentation|http://www.TiddlyTools.com/#BreadcrumbsPluginInfo|
|Version|2.1.5|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|list/jump to tiddlers viewed during this session plus "back" button/macro|
This plugin provides a list of links to all tiddlers opened during the session, creating a "trail of breadcrumbs" from one tiddler to the next, allowing you to quickly navigate to any previously viewed tiddler, or select 'home' to reset the display to the initial set of tiddlers that were open at the start of the session (i.e., when the document was loaded into the browser).
!!!!!Documentation
<<<
see [[BreadcrumbsPluginInfo]]
<<<
!!!!!Configuration
<<<
<<option chkCreateDefaultBreadcrumbs>> automatically create breadcrumbs display (if needed)
<<option chkShowBreadcrumbs>> show/hide breadcrumbs display
<<option chkReorderBreadcrumbs>> re-order breadcrumbs when visiting a previously viewed tiddler
<<option chkBreadcrumbsHideHomeLink>> omit 'Home' link from breadcrumbs display
<<option chkBreadcrumbsSave>> prompt to save breadcrumbs when 'Home' link is pressed
<<option chkShowStartupBreadcrumbs>> show breadcrumbs for 'startup' tiddlers
<<option chkBreadcrumbsReverse>> show breadcrumbs in reverse order (most recent first)
<<option chkBreadcrumbsLimit>> limit breadcrumbs display to {{twochar{<<option txtBreadcrumbsLimit>>}}} items
<<option chkBreadcrumbsLimitOpenTiddlers>> limit open tiddlers to {{twochar{<<option txtBreadcrumbsLimitOpenTiddlers>>}}} items

<<<
!!!!!Revisions
<<<
2012.06.10 2.1.5 refactored default options to eliminate global variable and use init() handling
| Please see [[BreadcrumbsPluginInfo]] for previous revision details |
2006.02.01 1.0.0 initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.BreadcrumbsPlugin = { major: 2, minor: 1, revision: 5, date: new Date(2012,6,10) };
config.macros.breadcrumbs = {
	crumbs: [], // the list of current breadcrumbs
	askMsg: "Save current breadcrumbs before clearing?\n"
		+"Press OK to save, or CANCEL to continue without saving.",
	saveMsg: 'Enter the name of a tiddler in which to save the current breadcrumbs',
	saveTitle: 'SavedBreadcrumbs',
	options: {
		chkShowBreadcrumbs:		false,
		chkReorderBreadcrumbs:		true,
		chkCreateDefaultBreadcrumbs:	true,
		chkShowStartupBreadcrumbs:	false,
		chkBreadcrumbsReverse:		false,
		chkBreadcrumbsLimit:		false,
		txtBreadcrumbsLimit:		5,
		chkBreadcrumbsLimitOpenTiddlers:false,
		txtBreadcrumbsLimitOpenTiddlers:5,
		chkBreadcrumbsHideHomeLink:	false,
		chkBreadcrumbsSave:		false,
		txtBreadcrumbsHomeSeparator:	' | ',
		txtBreadcrumbsCrumbSeparator:	' > '
	},
	init: function() {
		merge(config.options,this.options,true);
	},
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var area=createTiddlyElement(place,"span",null,"breadCrumbs",null);
		area.setAttribute("homeSep",params[0]||config.options.txtBreadcrumbsHomeSeparator);
		area.setAttribute("crumbSep",params[1]||config.options.txtBreadcrumbsCrumbSeparator);
		this.render(area);
	},
	add: function (title) {
		var thisCrumb = title;
		var ind = this.crumbs.indexOf(thisCrumb);
		if(ind === -1)
			this.crumbs.push(thisCrumb);
		else if (config.options.chkReorderBreadcrumbs)
			this.crumbs.push(this.crumbs.splice(ind,1)[0]); // reorder crumbs
		else
			this.crumbs=this.crumbs.slice(0,ind+1); // trim crumbs
		if (config.options.chkBreadcrumbsLimitOpenTiddlers)
			this.limitOpenTiddlers();
		this.refresh();
		return false;
	},
	getAreas: function() {
		var crumbAreas=[];
		// find all DIVs with classname=="breadCrumbs"
		var all=document.getElementsByTagName("*");
		for (var i=0; i<all.length; i++)
			try{ if (hasClass(all[i],"breadCrumbs")) crumbAreas.push(all[i]); } catch(e) {;}
		// or, find single DIV w/fixed ID (backward compatibility)
		var byID=document.getElementById("breadCrumbs")
		if (byID && !hasClass(byID,"breadCrumbs")) crumbAreas.push(byID);
		if (!crumbAreas.length && config.options.chkCreateDefaultBreadcrumbs) {
			// no crumbs display... create one
			var defaultArea = createTiddlyElement(null,"span",null,"breadCrumbs",null);
		 	defaultArea.style.display= "none";
			var targetArea= document.getElementById("tiddlerDisplay");
		 	targetArea.parentNode.insertBefore(defaultArea,targetArea);
			crumbAreas.push(defaultArea);
		}
		return crumbAreas;
	},
	refresh: function() {
		var crumbAreas=this.getAreas();
		for (var i=0; i<crumbAreas.length; i++) {
			crumbAreas[i].style.display = config.options.chkShowBreadcrumbs?"inline":"none";
			removeChildren(crumbAreas[i]);
			this.render(crumbAreas[i]);
		}
	},
	render: function(here) {
		var co=config.options; var out=""
		if (!co.chkBreadcrumbsHideHomeLink) {
			createTiddlyButton(here,"Home",null,this.home,"tiddlyLink tiddlyLinkExisting");
			out+=here.getAttribute("homeSep")||config.options.txtBreadcrumbsHomeSeparator;
		}
		for (c=0; c<this.crumbs.length; c++) // remove non-existing tiddlers from crumbs
			if (!store.tiddlerExists(this.crumbs[c]) && !store.isShadowTiddler(this.crumbs[c]))
				this.crumbs.splice(c,1);
		var count=this.crumbs.length;
		if (co.chkBreadcrumbsLimit && co.txtBreadcrumbsLimit<count) count=co.txtBreadcrumbsLimit;
		var list=[];
		for (c=this.crumbs.length-count; c<this.crumbs.length; c++) list.push('[['+this.crumbs[c]+']]');
		if (co.chkBreadcrumbsReverse) list.reverse();
		out+=list.join(here.getAttribute("crumbSep")||config.options.txtBreadcrumbsCrumbSeparator);
		wikify(out,here);
	},
	home: function() {
		var cmb=config.macros.breadcrumbs;
		if (config.options.chkBreadcrumbsSave && confirm(cmb.askMsg)) cmb.saveCrumbs();
		story.closeAllTiddlers(); restart();
		cmb.crumbs = []; var crumbAreas=cmb.getAreas();
		for (var i=0; i<crumbAreas.length; i++) crumbAreas[i].style.display = "none";
		return false;
	},
	saveCrumbs: function() {
		var tid=prompt(this.saveMsg,this.saveTitle); if (!tid||!tid.length) return; // cancelled by user
		var t=store.getTiddler(tid);
		if(t && !confirm(config.messages.overwriteWarning.format([tid]))) return;
		var who=config.options.txtUserName;
		var when=new Date();
		var text='[['+this.crumbs.join(']]\n[[')+']]';
		var tags=t?t.tags:[]; tags.pushUnique('story');
		var fields=t?t.fields:{};
		store.saveTiddler(tid,tid,text,who,when,tags,fields);
		story.displayTiddler(null,tid);
		story.refreshTiddler(tid,null,true);
		displayMessage(tid+' has been '+(t?'updated':'created'));
	},
	limitOpenTiddlers: function() {
		var limit=config.options.txtBreadcrumbsLimitOpenTiddlers; if (limit<1) limit=1;
		for (c=this.crumbs.length-1; c>=0; c--) {
			var tid=this.crumbs[c];
			var elem=story.getTiddler(tid);
			if (elem) { // tiddler is displayed
				if (limit <=0) { // display limit has been reached
					if (elem.getAttribute("dirty")=="true") { // tiddler is being edited
						var msg= "'"+tid+"' is currently being edited.\n\n"
							+"Press OK to save and close this tiddler\n"
							+"or press Cancel to leave it opened";
						if (confirm(msg)) {
							story.saveTiddler(tid);
							story.closeTiddler(tid);
						}
					}
					else story.closeTiddler(this.crumbs[c]);
				}
				limit--;
			}
		}
	}
};
//}}}
// // PreviousTiddler ('back') command and macro
//{{{
config.commands.previousTiddler = {
	text: 'back',
	tooltip: 'view the previous tiddler',
	handler: function(event,src,title) {
		var crumbs=config.macros.breadcrumbs.crumbs;
		if (crumbs.length<2) config.macros.breadcrumbs.home();
		else story.displayTiddler(story.findContainingTiddler(src),crumbs[crumbs.length-2]);
		return false;
	}
};
config.macros.previousTiddler= {
	label: 'back',
	prompt: 'view the previous tiddler',
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var label=params.shift(); if (!label) label=this.label;
		var prompt=params.shift(); if (!prompt) prompt=this.prompt;
		createTiddlyButton(place,label,prompt,function(ev){
			return config.commands.previousTiddler.handler(ev,this)
		});
	}
}
//}}}
// // HIJACKS
//{{{
// update crumbs when a tiddler is displayed
if (Story.prototype.breadCrumbs_coreDisplayTiddler==undefined)
	Story.prototype.breadCrumbs_coreDisplayTiddler=Story.prototype.displayTiddler;
Story.prototype.displayTiddler = function(srcElement,tiddler) {
	var title=(tiddler instanceof Tiddler)?tiddler.title:tiddler;
	this.breadCrumbs_coreDisplayTiddler.apply(this,arguments);
	if (!startingUp || config.options.chkShowStartupBreadcrumbs)
		config.macros.breadcrumbs.add(title);
}

// update crumbs when a tiddler is deleted
if (TiddlyWiki.prototype.breadCrumbs_coreRemoveTiddler==undefined)
	TiddlyWiki.prototype.breadCrumbs_coreRemoveTiddler=TiddlyWiki.prototype.removeTiddler;
TiddlyWiki.prototype.removeTiddler= function() {
	this.breadCrumbs_coreRemoveTiddler.apply(this,arguments);
	config.macros.breadcrumbs.refresh();
}
//}}}