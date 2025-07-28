/***
|Name|RelatedTiddlersPlugin|
|Source|http://www.TiddlyTools.com/#RelatedTiddlersPlugin|
|Version|1.1.8|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Requires|InlineJavascriptPlugin, NestedSlidersPlugin, StyleSheetShortcuts|
|Description|starting from a selected tiddler, display a list and/or tree of linked or transcluded tiddlers|
!!!!!Usage
<<<
Starting from a specified tiddler (default=current tiddler), {{{<<relatedTiddlers>>}}} recursively follows the internal links[] data to find all other tiddlers that are related to it by linking (e.g., {{{[[TiddlerName]]}}}) or used as macro parameter (e.g., {{{<<tiddler TiddlerName>>}}}).

The results can be displayed as a simple flat list of related tiddler titles, or as an indented tree diagram that shows the specific connections between the related tiddlers, and can be helpful for identifying clusters of interdependent tiddlers or simply generating an on-the-fly site map for quick discovery and navigation through complex or unfamiliar document content. 
//{{{
<<relatedTiddlers TiddlerName hideform "exclude list">>
//}}}
*''TiddlerName'' (optional)<br>specifies the starting tiddler (and hides the 'select a tiddler' form controls).  Use keyword ''here'' to specify the current tiddler.
*''hideform'' (optional)<br>when present, suppress display of 'select tiddler' droplist and buttons.
*''"exclude list"'' (optional)<br>space-separated list of tiddlers whose links should not be followed.  Use quotes or double-square brackets to ensure list is processed as a single parameter.
The plugin also defines two functions that can be called externally (from other plugins or scripts) to generate and retrieve either a list of links or a formatted "tree view":
>{{{var list=config.macros.relatedTiddlers.getList(start,exclude,callback);}}}
>{{{var tree=config.macros.relatedTiddlers.getTree(start,exclude,callback);}}}
where ''start'' and ''exclude'' are the same as the macro parameters described above, plus an optional reference to a callback function that allows you to generate an alternative list/tree, based on application-specific data (such tiddler references contained in tags or custom fields), rather than using the default "links" list, like this:
>{{block{
{{{
window.myCallback=function(tiddler) {
	var list=[];
	// ... fill the list based on the specified tiddler ...
	return list;
}
}}}
}}}
The function takes a tiddler object as input, and returns a list of tiddler titles that are //directly// linked (or otherwise related) to that specific tiddler.  {{{getList()}}} and {{{getTree()}}} then use this information to find all the //indirect// connections between tiddlers to produce the list or tree output.
<<<
!!!!!Configuration
<<<
<<option chkRelatedTiddlersShowList>> show list display
<<option chkRelatedTiddlersShowTree>> show tree display
<<option chkRelatedTiddlersZoom>> enable autosizing of tree display //(aka, "zoom" or "shrink-and-grow")//
don't follow links contained in these tiddlers: <<option txtRelatedTiddlersExclude>>
<<<
!!!!!Examples
<<<
{{smallform{<<relatedTiddlers>>}}}

Using getList()/getTree() public API from other scripts/plugins:
><script show>
	var start="About";
	var exclude=config.options.txtRelatedTiddlersExclude.readBracketedList();
	var callback=null;
	var list=config.macros.relatedTiddlers.getList(start,exclude,callback);
	var tree=config.macros.relatedTiddlers.getTree(start,exclude,callback);
	return "There are "+list.length+" tiddlers related to [["+start+"]]...\n"+tree;
</script>
<<<
!!!!!Revisions
<<<
2009.09.29 [1.1.8] in findRelatedTiddlers(), fixed recursion when using non-null callback
2007.11.11 [1.1.7] in findRelatedTiddlers(), refactored into separate getlinks(),<br>and added param for optional callback function that can be used to return an alternative set of links.<br>Also added API functions, getTree() and getList() for use by other scripts
2007.07.13 [1.1.6] performance optimizations, more code cleanup
2007.07.10 [1.1.5] extensive code cleanup
2007.07.08 [1.1.0] converted from inline script
2007.06.29 [1.0.0] started (as inline script)
<<<
!!!!!Code
***/
//{{{
version.extensions.RelatedTiddlersPlugin={major: 1, minor: 1, revision: 8, date: new Date(2009,9,29)};

// initialize 'autozoom' and 'exclude' tree options (defaults are not to zoom, and to follow all links)
if (config.options.chkRelatedTiddlersZoom===undefined)
	config.options.chkRelatedTiddlersZoom=false;
if (config.options.txtRelatedTiddlersExclude===undefined)
	config.options.txtRelatedTiddlersExclude='GettingStarted DefaultTiddlers';
if (config.options.chkRelatedTiddlersShowList===undefined)
	config.options.chkRelatedTiddlersShowList=true;
if (config.options.chkRelatedTiddlersShowTree===undefined)
	config.options.chkRelatedTiddlersShowTree=false;

config.macros.relatedTiddlers={
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {

		// create form with unique DOM element ID (using current timestamp)... permits multiple form instances
		var now=new Date().getTime();
		var span=createTiddlyElement(place,"span");
		span.innerHTML=this.form.format(["relatedTiddlers_form"+now]);
		var form=span.getElementsByTagName("form")[0]; // find form that we just created
		var target=createTiddlyElement(span,"div"); // create target block in which generated output will be placed

		// initialize droplist contents (all tiddlers except hidden ones)
		var tids=store.getTiddlers('title','excludeLists');
		for (i=0; i<tids.length; i++) form.list.options[form.list.options.length]=new Option(tids[i].title,tids[i].title,false,false);

		// initialize exclude field (space-separated list)
		if (config.options.txtRelatedTiddlersExclude) form.exclude.value=config.options.txtRelatedTiddlersExclude;

		// set starting tiddler, form display, and/or exclude list from macro params (if present) and then show the results!
		var root="";
		var hide=false;
		var exclude=config.options.txtRelatedTiddlersExclude;
		if (params[0]) root=params[0]; // TiddlerName
		if (params[1]) hide=(params[1].toLowerCase()=="hideform"); // keyword: "hideform" or "showform" (default)
		if (params[2]) exclude=params[2]; // list of tiddlers whose links should not be followed
		if (root=="here") { var tid=story.findContainingTiddler(place); if (tid) root=tid.getAttribute("tiddler"); }
		if (store.tiddlerExists(root)) {
			// NOTE:  don't hide form when running IE, where putting initial focus on hidden form creates an error
			if (!config.browser.isIE) form.style.display=hide?"none":"block"; // show/hide the controls
			form.list.value=root; // set the root
			form.exclude.value=exclude; // set 'exclude' field
			form.get.click(); // DISPLAY INITIAL RESULTS (if tiddler is selected)
		}
	},
	form:
		"<form id='%0' action='javascript:;' style='display:inline;margin:0;padding:0;' onsubmit='return false'><!-- \
		--><span class='fine' style='float:left;vertical-align:bottom;width:39.5%;'><i>find all tiddlers related to:</i></span><!-- \
		--><span class='fine' style='float:left;vertical-align:bottom;'><i>exclude links contained in:</i></span><!-- \
		--><div style='clear:both'><!-- \
		--><select name=list size=1 style='width:39.5%' onchange='this.form.get.click()'><!-- \
		--><option value=''>select a tiddler...</option><!-- \
		--></select><!-- \
		--><input type='text' option='txtRelatedTiddlersExclude' name='exclude' value='' style='width:40%' \
			title='enter the names of tiddlers whose links should NOT be followed' \
			onkeyup='if (event.keyCode==13) { this.blur(); this.form.get.click(); }'  \
			onchange='config.options[this.getAttribute(\"option\")]=this.value;saveOptionCookie(this.getAttribute(\"option\"));'><!-- \
		--><input type=button name=get value='get related' style='width:10%'  \
			onclick='config.macros.relatedTiddlers.show(this.form,this.form.nextSibling);'><!-- \
		--><input type=button name=done value='done' disabled style='width:10%'  \
			onclick='this.form.list.selectedIndex=0; this.form.get.click();'><!-- \
		--></div><!-- \
		--></form>",
	styles:
		".relatedTiddlers blockquote \
			{ border-left:1px dotted #999; margin:0 25px; padding-left:.5em; font-size:%0%; line-height:115%; } \
		.relatedTiddlers .borderleft \
			{ margin:0; padding:0; margin-left:1em; border-left:1px dotted #999; padding-left:.5em; } \
		.relatedTiddlers .fourcolumns \
			{ display:block; -moz-column-count:4; -moz-column-gap:1em; -moz-column-width:25%} \
		.relatedTiddlers a \
			{ font-weight:normal; } \
		.relatedTiddlers .bold, .relatedTiddlers .bold a \
			{ font-weight:bold; } \
		.relatedTiddlers .floatright \
			{ float:right; } \
		.relatedTiddlers .clear \
			{ clear:both; }	",
	toggleform:
		"{{floatright{<html><a href='javascript:;' class='button' title='show/hide tiddler selection droplist and buttons' \
		onclick='var here=story.findContainingTiddler(this); var tid=here?here.getAttribute(\"tiddler\"):\"\"; \
			var f=document.getElementById(\"%0\"); var hide=(f.style.display!=\"none\"); \
			f.style.display=hide?\"none\":\"inline\"; this.innerHTML=hide?\"show form\":\"hide form\"; return false;'>%1</a></html>}}}",
	treecheck:
		"{{floatright{@@display:none;<<option chkRelatedTiddlersShowTree>>@@<html><a href='javascript:;' class='button' onclick='this.parentNode.previousSibling.firstChild.click(); return false;'>tree view</a></html>}}}",
	tree:
		"{{clear{\n----\n}}} \
		{{floatright small{<<option chkRelatedTiddlersZoom>>autosize tree display}}} \
		{{fine{\n''tiddlers linked from or included by'' [[%0]]\n}}}%1",
	listcheck:
		"{{floatright{@@display:none;<<option chkRelatedTiddlersShowList>>@@<html><a href='javascript:;' class='button' onclick='this.parentNode.previousSibling.firstChild.click(); return false;'>list view</a></html>}}}",
	list:
		"{{clear{\n----\n}}} \
		{{fine{\n''tiddlers containing links to'' [[%0]]\n}}} \
		{{small fourcolumns borderleft{\n%1}}} \
		{{fine{\n''tiddlers linked from or included by'' [[%0]]\n}}} \
		{{borderleft{\n \
			{{fine{\n''bold''=//direct links//, plain=//indirect links//, ''...''=//links not followed//}}} \
			{{small fourcolumns{\n%2}}} \
		}}}",
	skipped:
		"<html><span title='links from %0 have NOT been followed'>...</span></html>",
	mouseover: function(ev) {
		this.saveSize=this.style.fontSize;
		this.style.fontSize='100%';
		this.style.borderLeftStyle='solid';
	},
	mouseout: function(ev) {
		this.style.fontSize=this.saveSize;
		this.style.borderLeftStyle='dotted';
	},
	findRelatedTiddlers: function(tid,tids,treeout,level,exclude,callback) { 
		// recursively build list of related tids (links and includes FROM the root tiddler) and generate treeview output
		var t=store.getTiddler(tid);
		if (!t || tids.contains(tid)) return tids; // tiddler already in results (or missing tiddler)... just return current results
		tids.push(t.title); // add tiddler to results
		var skip=exclude && exclude.contains(tid);
		treeout.text+=level+"[["+tid+"]]"+(skip?this.skipped.format([tid]):"")+"\n";
		if (skip) return tids; // branch is pruned... don't follow links
		var links=callback?callback(t):this.getLinks(t);
		for (var i=0; i<links.length; i++) tids=this.findRelatedTiddlers(links[i],tids,treeout,level+">",exclude,callback);
		return tids;
	},
	getLinks: function(tiddler) {
		if (!tiddler.linksUpdated) tiddler.changed();
		return tiddler.links;
	},
	getTree: function(start,exclude,callback) {
		// get related tiddlers and generate blockquote-indented tree output
		var list=[]; var tree={text:""}; var level="";
		list=this.findRelatedTiddlers(start,list,tree,level,exclude,callback);
		return tree.text;
	},
	getList: function(start,exclude,callback) {
		// get related tiddlers and generate blockquote-indented tree output
		var list=[]; var tree={text:""}; var level="";
		list=this.findRelatedTiddlers(start,list,tree,level,exclude,callback);
		return list;
	},
	show: function(form,target) {
		removeChildren(target); form.done.disabled=true; // clear any existing output and disable 'done' button
		var start=form.list.value; if (!start.length) return; // get selected starting tiddler.  If blank value (heading), do nothing

		// get related tiddlers and generate blockquote-indented tree output
		var rels=[]; var treeview={text:""}; var level="";
		var exclude=config.options.txtRelatedTiddlersExclude.readBracketedList();
		var rels=this.findRelatedTiddlers(start,rels,treeview,level,exclude);
		rels.shift(); // remove self from list
		rels.sort(); // sort titles alphabetically

		// generate list output
		var tid=store.getTiddler(start);
		var relsview=""; for (t=0; t<rels.length; t++) {
			relsview+=tid.links.contains(rels[t])?("{{bold{[["+rels[t]+"]]}}}"):("[["+rels[t]+"]]");
			if (exclude && exclude.contains(rels[t])) relsview+=this.skipped.format([rels[t]]);
			relsview+="\n";
		}
	
		// get references TO the root tiddler, add to related tiddlers and generate refsview output
		var refs=[]; var referers=store.getReferringTiddlers(start);
		for(var r=0; r<referers.length; r++)
			if(referers[r].title!=start && !referers[r].tags.contains("excludeLists")) refs.push(referers[r].title);
		var refcount=refs.length; var relcount=rels.length; // remember individual counts
		for (var r=0; r<refs.length; r++) rels.pushUnique(refs[r]); // combine lists without duplicates
		var total=rels.length; // get combined total
		var refsview="[["+refs.sort().join("]]\n[[")+"]]\n";
	
		// set custom blockquote styles for treeview
		setStylesheet(this.styles.format([config.options.chkRelatedTiddlersZoom?80:100]),'relatedTiddlers_styles');

		// assemble and render output
		var summary=(total?(total+" tiddler"+(total==1?" is":"s are")):"There are no tiddlers")+" related to: [["+start+"]]";
		var list=this.list.format([start,refsview.length?refsview:"//none//",relsview.length?relsview:"//none//"]);
		var tree=this.tree.format([start,treeview.text]);
		var toggle=this.toggleform.format([form.id,(form.style.display=='none'?'show form':'hide form')]);
		var sep="{{floatright{ | }}}";
		var showList=total && config.options.chkRelatedTiddlersShowList;
		var showTree=relcount && config.options.chkRelatedTiddlersShowTree;
		var out="{{relatedTiddlers{"+toggle+(relcount?sep+this.treecheck:"")+(total?sep+this.listcheck:"")+summary+(showList?list:"")+(showTree?tree:"")+"}}}";
		wikify(out,target);
		form.done.disabled=false; // enable 'done' button

		// add mouseover/mouseout handling to blockquotes (for autosizing)
		var blocks=target.getElementsByTagName("blockquote");
		for (var b=0; b<blocks.length; b++)
			{ blocks[b].onmouseover=this.mouseover; blocks[b].onmouseout=this.mouseout; }

		// add side-effect to checkboxes so that display is refreshed when a checkbox state is changed
		var checks=target.getElementsByTagName("input");
		for (var c=0; c<checks.length; c++) {
			if (checks[c].type.toLowerCase()!="checkbox") continue;
			checks[c].coreClick=checks[c].onclick; // save standard click handler
			checks[c].formID=form.id; // link checkbox with correponding form
			checks[c].onclick=function() { this.coreClick.apply(this,arguments); document.getElementById(this.formID).get.click(); }
		}
	}
}
//}}}