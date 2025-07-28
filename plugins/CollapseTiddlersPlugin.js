/***
|Name|CollapseTiddlersPlugin|
|Source|http://www.TiddlyTools.com/#CollapseTiddlersPlugin|
|Version|2.0.0|
|Author|Eric Shulman|
|OriginalAuthor|Bradley Meck - http://gensoft.revhost.net/Collapse.html|
|License|unknown|
|~CoreVersion|2.1|
|Type|plugin|
|Requires|CollapsedTemplate|
|Description|show/hide content of a tiddler while leaving tiddler title visible|
This plugin provides commands to quickly switch a rendered tiddler between its current ViewTemplate display and a minimal display (title and toolbar) defined by a separate CollapsedTemplate.
!!!Usage
<<<
In [[ToolbarCommands::ViewToolbar|ToolbarCommands]], add:
{{{
collapseTiddler collapseOthers
}}}
you can also embed the following macros in tiddler content:
*{{{<<collapseAll>>}}} - adds 'collapse all' command that applies CollapsedTemplate to each displayed tiddler
*{{{<<expandAll>>}}} - adds 'expand all' command that re-applies ViewTemplate (or equivalent custom template) to each displayed tiddler
*{{{<<foldFirst>>}}} - immediately apply CollapsedTemplate to a given tiddler, as soon as it is displayed.
<<<
!!!Revisions
<<<
2009.05.04 [2.0.0] standardized documentation and added version #
2008.10.05 collapseAll() and expandAll(): added "return false" to button handlers to prevent IE page transition
2008.03.06 refactored all code for size reduction, readability, and I18N/L10N-readiness.  Also added 'folded' flag to tiddler elements (for use by other plugins that need to know if tiddler is folded (e.g., [[SinglePageModePlugin]]
2007.10.11 moved [[FoldFirst]] inline script and converted to {{{<<foldFirst>>}}} macro
2007.12.09 suspend/resume SinglePageMode (SPM/TPM/BPM) when folding/unfolding tiddlers
2007.05.06 add "return false" at the end of each command handler to prevent IE 'page transition' problem.
2007.03.30 add a shadow definition for CollapsedTemplate.  Tweak ViewTemplate shadow so "fold/unfold" and "focus" toolbar items automatically appear when using default templates.  Remove error check for "CollapsedTemplate" existence, since shadow version will now always work as a fallback.
2006.02.24 added fallback to "CollapsedTemplate" if "WebCollapsedTemplate" is not found
2006.02.06 added check for 'readOnly' flag to use alternative "WebCollapsedTemplate"
<<<
!!!Code
***/
//{{{
version.extensions.CollapseTiddlersPlugin= {major: 2, minor: 0, revision: 0, date: new Date(2009,5,4)};

config.shadowTiddlers.CollapsedTemplate=
	"<!--{{{-->\
	<div class='toolbar' macro='toolbar expandTiddler collapseOthers closeTiddler closeOthers +editTiddler permalink references jump'></div>\
	<div class='title' macro='view title'></div>\
	<!--}}}-->";

// automatically tweak shadow ViewTemplate to add "collapseTiddler collapseOthers" commands
config.shadowTiddlers.ViewTemplate=config.shadowTiddlers.ViewTemplate.replace(/closeTiddler/,"collapseTiddler collapseOthers closeTiddler");

config.commands.collapseTiddler = {
	text: "fold",
	tooltip: "Collapse this tiddler",
	collapsedTemplate: "CollapsedTemplate",
	webCollapsedTemplate: "WebCollapsedTemplate",
	handler: function(event,src,title) {
		var e = story.findContainingTiddler(src); if (!e) return false;
		// don't fold tiddlers that are being edited!
		if(story.isDirty(e.getAttribute("tiddler"))) return false;
		var t=config.commands.collapseTiddler.getCollapsedTemplate();
		config.commands.collapseTiddler.saveTemplate(e);
		config.commands.collapseTiddler.display(title,t);
		e.setAttribute("folded","true");
		return false;
	},
	getCollapsedTemplate: function() {
		if (readOnly&&store.tiddlerExists(this.webCollapsedTemplate))
			return this.webCollapsedTemplate;
		else
			return this.collapsedTemplate
	},
	saveTemplate: function(e) {
		if (e.getAttribute("savedTemplate")==undefined)
			e.setAttribute("savedTemplate",e.getAttribute("template"));

	},
	// fold/unfold tiddler with suspend/resume of single/top/bottom-of-page mode
	display: function(title,t) {
		var opt=config.options;
		var saveSPM=opt.chkSinglePageMode; opt.chkSinglePageMode=false;
		var saveTPM=opt.chkTopOfPageMode; opt.chkTopOfPageMode=false;
		var saveBPM=opt.chkBottomOfPageMode; opt.chkBottomOfPageMode=false;
		story.displayTiddler(null,title,t);
		opt.chkBottomOfPageMode=saveBPM;
		opt.chkTopOfPageMode=saveTPM;
		opt.chkSinglePageMode=saveSPM;
	}
}

config.commands.expandTiddler = {
	text: "unfold",
	tooltip: "Expand this tiddler",
	handler: function(event,src,title) {
		var e = story.findContainingTiddler(src); if (!e) return false;
		var t = e.getAttribute("savedTemplate");
		config.commands.collapseTiddler.display(title,t);
		e.setAttribute("folded","false");
		return false;
	}
}

config.macros.collapseAll = {
	text: "collapse all",
	tooltip: "Collapse all tiddlers",
	handler: function(place,macroName,params,wikifier,paramString,tiddler){
		createTiddlyButton(place,this.text,this.tooltip,function(){
			story.forEachTiddler(function(title,tiddler){
				if(story.isDirty(title)) return;
				var t=config.commands.collapseTiddler.getCollapsedTemplate();


				config.commands.collapseTiddler.saveTemplate(tiddler);
				config.commands.collapseTiddler.display(title,t);
				tiddler.folded=true;
			});
			return false;
		})
	}
}

config.macros.expandAll = {
	text: "expand all",
	tooltip: "Expand all tiddlers",
	handler: function(place,macroName,params,wikifier,paramString,tiddler){
		createTiddlyButton(place,this.text,this.tooltip,function(){
			story.forEachTiddler(function(title,tiddler){
				var t=config.commands.collapseTiddler.getCollapsedTemplate();
				if(tiddler.getAttribute("template")!=t) return; // re-display only if collapsed
				var t=tiddler.getAttribute("savedTemplate");
				config.commands.collapseTiddler.display(title,t);
				tiddler.folded=false;
			});
			return false;
		})
	}
}

config.commands.collapseOthers = {
	text: "focus",
	tooltip: "Expand this tiddler and collapse all others",
	handler: function(event,src,title) {
		var e = story.findContainingTiddler(src); if (!e) return false;
		story.forEachTiddler(function(title,tiddler) {
			if(story.isDirty(title)) return;
			var t=config.commands.collapseTiddler.getCollapsedTemplate();
			if (e==tiddler) t=e.getAttribute("savedTemplate");
			config.commands.collapseTiddler.saveTemplate(tiddler);
			config.commands.collapseTiddler.display(title,t);
			tiddler.folded=(e!=tiddler);
		})
		return false;
	}
}

// {{{<<foldFirst>>}}} macro forces tiddler to be folded when *initially* displayed.
// Subsequent re-render does NOT re-fold tiddler, but closing/re-opening tiddler DOES cause it to fold first again.
config.macros.foldFirst = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler){
		var e=story.findContainingTiddler(place);
		if (e.getAttribute("foldedFirst")=="true") return; // already been folded once
		var title=e.getAttribute("tiddler")
		var t=config.commands.collapseTiddler.getCollapsedTemplate();
		config.commands.collapseTiddler.saveTemplate(e);
		config.commands.collapseTiddler.display(title,t);
		e.setAttribute("folded","true");
		e.setAttribute("foldedFirst","true"); // only when tiddler is first rendered
		return false;
	}
}
//}}}