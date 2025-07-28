/***
|Name|TableOfContentsPlugin|
|Source|http://www.TiddlyTools.com/#TableOfContentsPlugin|
|Documentation|http://www.TiddlyTools.com/#TableOfContentsPluginInfo|
|Version|2.4.3|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|replace the standard tabbed contents list with a scrolling listbox|
When there are many tiddlers in a document, the standard 'tabbed list of tiddlers' in the right-hand sidebar can become very long, occupying a lot of page space and requiring a lot scrolling in order to locate and select a tiddler.  The TableOfContentsPlugin addresses this problem by replacing the standard tabbed list display with a single listbox/droplist control that uses a very small amount of page space, regardless of the number of tiddlers in the document.
!!!!!Documentation
>see [[TableOfContentsPluginInfo]]
!!!!!Configuration
<<option chkTOCShow>> display table of contents listbox
<<option chkTOCIncludeHidden>> include tiddlers tagged with <<tag excludeLists>> in listbox
listbox shows <<option txtTOCListSize>> lines, sorted by <<option txtTOCSortBy>>
!!!!!Revisions
<<<
2008.04.09 [2.4.3] restored config.options.chkTOCShow and onClickTOCMenu() handler
|please see [[TableOfContentsPluginInfo]] for additional revision details|
2005.06.13 [1.0.0] Initial Release (as adaptation - predates TiddlyWiki plugin architecture!!)
<<<
!!!!!Code
***/
//{{{
version.extensions.TableOfContentsPlugin= {major: 2, minor: 4, revision: 3, date: new Date(2008,4,9)};
//}}}

// // 1.2.x compatibility
//{{{
if (!window.story) window.story=window;
if (!store.getTiddler) store.getTiddler=function(title){return store.tiddlers[title]}
if (!store.addTiddler) store.addTiddler=function(tiddler){store.tiddlers[tiddler.title]=tiddler}
if (!store.deleteTiddler) store.deleteTiddler=function(title){delete store.tiddlers[title]}
//}}}

//{{{
// define defaults for cookie-based option values
if (config.options.txtTOCSortBy==undefined)	config.options.txtTOCSortBy="modified";
if (config.options.txtTOCListSize==undefined)	config.options.txtTOCListSize=19;
if (config.options.chkTOCShow==undefined)	config.options.chkTOCShow=true;
if (config.options.chkTOCIncludeHidden==undefined)	config.options.chkTOCIncludeHidden=false;

// define macro "tableOfContents" to render controls
config.macros.tableOfContents = { label: "contents" };
config.macros.tableOfContents.cmdMax=8; // index of maximum command item

config.macros.tableOfContents.css = '\
.TOC { padding:0.5em 1em 0.5em 1em; }\
.TOC a { padding:0em 0.25em 0em 0.25em; color:inherit; }\
.TOCList { width: 100%; font-size:8pt; margin:0em; }\
';

config.macros.tableOfContents.html = '\
<div style="text-align:right">\
	<span style="float:left">\
	<a href="JavaScript:;" id="TOCMenu" style="padding: 0em;"\
		onclick="onClickTOCMenu(this)" title="show/hide table of contents">%label%</a>\
	</span>\
	<a href="JavaScript:;" id="TOCSmaller" style="display:inline"\
		onclick="resizeTOC(this)" title="reduce list size">&#150;</a>\
	<a href="JavaScript:;" id="TOCLarger"style="display:inline"\
		onclick="resizeTOC(this)" title="increase list size">+</a>\
	<a href="JavaScript:;" id="TOCMaximize"style="display:inline"\
		onclick="resizeTOC(this)" title="maximize/restore list size">=</a>\
</div>\
';

config.macros.tableOfContents.handler = function(place,macroName,params) { 
	var parsedParams = new Array();
	parsedParams['label']=this.label;
	parsedParams['inline']=false;
	while (params.length>0) {
		if (params[0]=="label:none") parsedParams['label']="";
		else if (params[0].substr(0,6)=="label:") parsedParams['label']=params[0].substr(6);
		if (params[0].substr(0,7)=="prompt:") parsedParams['prompt']=params[0].substr(7);
		if (params[0].substr(0,8)=="padding:")parsedParams['padding']=params[0].substr(8);
		if (params[0].substr(0,7)=="margin:") parsedParams['margin']=params[0].substr(7);
		if (params[0].substr(0,5)=="sort:")   parsedParams['sortby']=params[0].substr(5);
		if (params[0].substr(0,5)=="date:")   parsedParams['date']=params[0].substr(5);
		if ((params[0]=="size:auto")||(params[0]=="size:0")) parsedParams['autosize']=true;
		else if (params[0] && (params[0].substr(0,5)=="size:")) parsedParams['requestedSize']=params[0].substr(5);
		if (params[0].substr(0,6)=="width:") parsedParams['width']=params[0].substr(6);
		if (params[0]=="hidelist") parsedParams['hidelist']=true;
		if (params[0]=="inline")   parsedParams['inline']=true;
		if (params[0]=="-title")   parsedParams['hide_title']=true;
		if (params[0]=="-date")    parsedParams['hide_date']=true;
		if (params[0]=="-author")  parsedParams['hide_author']=true;
		if (params[0]=="-creator") parsedParams['hide_creator']=true;
		if (params[0]=="-tags")    parsedParams['hide_tags']=true;
		if (params[0]=="-missing") parsedParams['hide_missing']=true;
		if (params[0]=="-orphans") parsedParams['hide_orphans']=true;
		if (params[0]=="-shadows") parsedParams['hide_shadows']=true;
		params.shift(); 
	}
	setStylesheet(config.macros.tableOfContents.css,"tableOfContents");
	var newTOC=createTiddlyElement(place,parsedParams['inline']?"span":"div",null,"TOC",null)
	if (parsedParams['margin'])	{ newTOC.style.margin=parsedParams['margin']; }
	if (parsedParams['padding'])	{ newTOC.style.padding=parsedParams['padding']; }
	if (parsedParams['label']!="") newTOC.innerHTML=config.macros.tableOfContents.html.replace(/%label%/,parsedParams['label']);
	var newTOCList=createTOCList(newTOC,parsedParams)
	refreshTOCList(newTOCList);
	store.addNotification(null,reloadTOCLists);	// reload listbox after every tiddler change
}

// IE needs explicit global scoping for functions/vars called from browser events
window.onChangeTOCList=onChangeTOCList;
window.onClickTOCList=onClickTOCList;
window.onDblClickTOCList=onDblClickTOCList;
window.reloadTOCLists=reloadTOCLists;
window.refreshTOCList=refreshTOCList;
window.onClickTOCMenu=onClickTOCMenu;
window.resizeTOC=resizeTOC;
	
function createTOCList(place,params) {
	var list = createTiddlyElement(place,"select",null,"TOCList",params['prompt'])
	list.params=params;
	list.onchange=onChangeTOCList;
	list.onclick=onClickTOCList;
	list.ondblclick=onDblClickTOCList;
	list.onkeyup=onKeyUpTOCList;
	list.style.display=config.options.chkTOCShow ? "block" : "none" ;
	list.sortBy=config.options.txtTOCSortBy;
	list.dateFormat="DD MMM YYYY";
	list.requestedSize=config.options.txtTOCListSize;
	list.expandall=false;
	list.cmdMax=config.macros.tableOfContents.cmdMax;
	if (params['hide_title'])   list.cmdMax--;
	if (params['hide_date'])    list.cmdMax--;
	if (params['hide_author'])  list.cmdMax--;
	if (params['hide_creator']) list.cmdMax--;
	if (params['hide_tags'])    list.cmdMax--;
	if (params['hide_missing']) list.cmdMax--;
	if (params['hide_orphans']) list.cmdMax--;
	if (params['hide_shadows']) list.cmdMax--;
	if (params['sortby'])       { list.sortBy=params['sortby']; list.noSortCookie=true; }
	if (params['date'])         { list.dateFormat=params['date']; }
	if (params['autosize'])     { list.autosize=true; list.noSizeCookie=true; }
	if (params['requestedSize']){ list.requestedSize=params['requestedSize']; list.noSizeCookie=true; }
	if (params['width'])        { list.style.width=params['width']; }
	if (params['hidelist'])     { list.style.display ="none" ; list.noShowCookie=true; }
	if (params['expandall'])    { list.expandall=true; }
	return list;
}

function onChangeTOCList() {
	var thisTiddler=this.options[this.selectedIndex].value;
	if ((this.size==1)&&(thisTiddler!='')&&(this.selectedIndex>this.cmdMax))
		story.displayTiddler(null,thisTiddler,1);
	refreshTOCList(this);
	return false;
}
function onClickTOCList(e) {
	if (!e) var e = window.event;
	if (this.size==1) return; // don't toggle display for droplist
	if (e.shiftKey) { this.expandall=!this.expandall; refreshTOCList(this);}
	e.cancelBubble = true; if (e.stopPropagation) e.stopPropagation();
	return true;
}
function onDblClickTOCList(e) {
	if (!e) var e = window.event;
	var thisTiddler=this.options[this.selectedIndex].value;
	if ((thisTiddler!='')&&(this.selectedIndex>this.cmdMax))
		story.displayTiddler(null,thisTiddler,1);
	e.cancelBubble = true; if (e.stopPropagation) e.stopPropagation();
	return false;
}
function onKeyUpTOCList(e) {
	if (!e) var e = window.event;
	if (e.keyCode!=13) return true;
	var thisTiddler=this.options[this.selectedIndex].value;
	if ((thisTiddler!='')&&(this.selectedIndex>this.cmdMax))
		story.displayTiddler(null,thisTiddler,1);
	e.cancelBubble = true; if (e.stopPropagation) e.stopPropagation();
	return false;
}
function reloadTOCLists() {
	var all=document.all? document.all.tags("select") : document.getElementsByTagName("select");
	for (var i=0; i<all.length; i++)
		if (all[i].className=="TOCList")
			{ all[i].selectedIndex=-1; refreshTOCList(all[i]); }
}
 
function refreshTOCList(list) {
	var selectedIndex = list.selectedIndex;
	if (selectedIndex==-1) selectedIndex=0;
	var sortBy = list.sortBy;
	var showHidden = config.options.chkTOCIncludeHidden && !(config.options.chkHttpReadOnly && readOnly);

	if (selectedIndex==0) sortBy=list.sortBy;	// "nnn tiddlers" heading - use previous sort order
	else if (selectedIndex<=list.cmdMax)sortBy=list.value;
	else { if (list.options[list.selectedIndex].value=='') expandTOC(list); return; }

	list.sortBy = sortBy; // save current sort order
	if (!list.noSortCookie) { config.options.txtTOCSortBy=sortBy; saveOptionCookie("txtTOCSortBy"); }

	// get the list of tiddlers
	var tiddlers = [];
	switch (sortBy) {
		case "missing":	tiddlers=store.getMissingLinks(); break;
		case "tags": tiddlers=store.getTags(); break;
		case "orphans":	tiddlers=store.getOrphans(); break;
		case "shadows": for (var t in config.shadowTiddlers) tiddlers.push(t); tiddlers.sort();	break;
		default: tiddlers=store.getTiddlers(sortBy=='creator'?'modifier':sortBy,showHidden?'':'excludeLists'); break;
	}

	// clear current listbox contents
	while (list.length > 0) { list.options[0] = null; }
	list.saved=null;

	// add heading and control items to list
	var i=0;
	var theHeading=tiddlers.length+' tiddlers:';
	if (sortBy=='missing') theHeading=tiddlers.length+' missing tiddlers:';
	if (sortBy=='orphans') theHeading=tiddlers.length+' orphaned tiddlers:';
	if (sortBy=='tags')    theHeading=tiddlers.length+' tags:';
	if (sortBy=='shadows') theHeading=tiddlers.length+' shadow tiddlers:';
	var indent=String.fromCharCode(160)+String.fromCharCode(160);
	var sel=">";
	list.options[i++]=new Option(theHeading,'');
	function headerOpt(txt,val) { return new Option(((sortBy==val)?sel:indent)+' ['+txt+']',val); }
	if (!list.params['hide_title'])   list.options[i++]=headerOpt('by title','title');
	if (!list.params['hide_date'])    list.options[i++]=headerOpt('by date','modified');
	if (!list.params['hide_author'])  list.options[i++]=headerOpt('by author','modifier');
	if (!list.params['hide_creator']) list.options[i++]=headerOpt('by creator','creator');
	if (!list.params['hide_tags'])    list.options[i++]=headerOpt('by tags','tags');
	if (!list.params['hide_missing']) list.options[i++]=headerOpt('missing','missing');
	if (!list.params['hide_orphans']) list.options[i++]=headerOpt('orphans','orphans');
	if (!list.params['hide_shadows']) list.options[i++]=headerOpt('shadows','shadows');
	// output the tiddler list
	switch(sortBy) {
		case "title":
			for (var t = 0; t < tiddlers.length; t++)
				list.options[i++] = new Option(tiddlers[t].title,tiddlers[t].title);
			break;
		case "modified":
		case "modifier":
		case "creator":
			if (sortBy=="modified") tiddlers.reverse(); // show newest first
			if (sortBy=="creator") { // sort by custom field with fallback value
				tiddlers.sort(function (a,b) {
					var v1=a.fields.creator||a.modifier;
					var v2=b.fields.creator||b.modifier;
					return (v1==v2)?0:(v1>v2?1:-1);
				});
			}
			var lastSection = "";
			for (var t = 0; t < tiddlers.length; t++){
				var tiddler = tiddlers[t];
				var theSection = "";
				var m=tiddler.modified;
				if (sortBy=="modified") theSection=m.getFullYear()+'.'+(m.getMonth()+1)+'.'+m.getDate();
				if (sortBy=="modifier") theSection = tiddler.modifier;
				if (sortBy=="creator") theSection=tiddler.fields['creator']||tiddler.modifier;
				if (theSection != lastSection) {
					lastSection = theSection;
					if (sortBy=="modified") theSection = m.formatString(list.dateFormat);
					list.options[i++] = new Option('+ '+theSection,"");
				}
				list.options[i++] = new Option(indent+indent+tiddler.title,tiddler.title);
			}
			expandTOC(list);
			break;
		case "tags":
			// tagged tiddlers, by tag
			var tagcount=0;
			var lastTag = null;
			for (var t = 0; t < tiddlers.length; t++) {  // actually a list of tags, not tiddlers... 
				var theTag = tiddlers[t][0]; var tid=store.getTiddler(theTag);
				if (tid && tid.isTagged('excludeLists')) continue; // skip excluded tags
				var temp = store.getTaggedTiddlers(theTag);
				var tagged=[]; for (var q=0; q<temp.length; q++) // hide excluded tiddlers
					if (!temp[q].isTagged('excludeLists')) tagged.push(temp[q]); 
				if (tagged.length) { tagcount++;
					list.options[i++]=new Option('+ '+theTag+" ("+tagged.length+")","");
					for(var r=0; r<tagged.length; r++)
						list.options[i++]=
							new Option(indent+indent+tagged[r].title,tagged[r].title);
				}
			}
			// count untagged tiddlers
			var temp = store.getTiddlers("title");
			var c=0; for (var r=0; r<temp.length;r++) if (!temp[r].tags.length) c++;
			// create 'pseudo-tag' listing untagged tiddlers (if any)
			if (c>0) {
				list.options[i++] = new Option("+ untagged ("+c+")","");
				for (var r=0; r<temp.length;r++) if (!temp[r].tags.length)
					list.options[i++] = new
						Option(indent+indent+temp[r].title,temp[r].title);
			}
			list.options[0].text=tagcount+' tags:';
			expandTOC(list);
			break;
		case "missing": case "orphans": case "shadows":
			for (var t = 0; t < tiddlers.length; t++)
				list.options[i++] = new Option(tiddlers[t],tiddlers[t]);
			break;
	}
	list.selectedIndex=selectedIndex; // select current control item
	list.size = (list.autosize)?list.options.length:list.requestedSize;
}

// show/hide branch of TOCList based on current selection
function expandTOC(list) {
	var selectedIndex = list.selectedIndex;
	if (selectedIndex==-1) selectedIndex=0;
	var sortBy = list.sortBy;

	// don't collapse/expand list for alpha-sorted "flatlist" TOC contents
	// or list control items
	if ((sortBy=="title")||(sortBy=="missing")||(sortBy=="orphans")||(sortBy=="shadows")) return;
	if ((selectedIndex>0)&&(selectedIndex<=list.cmdMax)) return;

	// get current selected text/value and cache the 
	// complete list.  Then clear the current list contents
	var theText = list.options[selectedIndex].text;
	var theValue = list.options[selectedIndex].value;
	if (!list.saved) {
		list.saved=new Array();
		for (var i=0;i<list.length;i++) list.saved[i]=list.options[i];
	}
	while (list.length > 0) { list.options[0] = null; }

	// put back heading items until item text matches current selected heading
	var i=0;
	for (var t=0; t<list.saved.length; t++) {
		var opt=list.saved[t];
		if (list.expandall||(opt.value=='')||(i<=list.cmdMax)) list.options[i++] = opt;
		if (opt.text==theText) break;
	}
	selectedIndex=i-1;	// this is the NEW index of the current selected heading
	// put back items with value!='' until value==''
	for ( t++; t<list.saved.length; t++) {
		var opt=list.saved[t];
		if (list.expandall||opt.value!='') list.options[i++] = opt;
		if (opt.value=='') break;
	}
	// put back remaining items with value==''
	for ( ; t<list.saved.length; t++) {
		var opt=list.saved[t];
		if (list.expandall||opt.value=='') list.options[i++] = opt;
	}
	list.selectedIndex = selectedIndex;
	list.size = (list.autosize)?list.options.length:list.requestedSize;
}

// these functions process clicks on the 'control links' that are displayed above the listbox
function getTOCListFromButton(which) {
	var list = null;
	switch (which.id) {
		case 'TOCMenu':
			var theSiblings = which.parentNode.parentNode.parentNode.childNodes;
			var thePlace=which.parentNode.parentNode.parentNode.parentNode.parentNode.id;
			break;
		case 'TOCSmaller': case 'TOCLarger': case 'TOCMaximize':
			var theSiblings = which.parentNode.parentNode.childNodes;
			var thePlace=which.parentNode.parentNode.parentNode.parentNode.id;
			break;
	}
	for (var k=0; k<theSiblings.length; k++)
		if (theSiblings[k].className=="TOCList") { list=theSiblings[k]; break; }
	return list;
}
function onClickTOCMenu(which) {
	var list=getTOCListFromButton(which); if (!list) return;
	var opening = list.style.display=="none";
	if(config.options.chkAnimate) anim.startAnimating(new Slider(list,opening,false,"none"));
	else list.style.display = opening ? "block" : "none" ;
	if (!list.noShowCookie) { config.options.chkTOCShow = opening; saveOptionCookie("chkTOCShow"); }
	return(false);
}
function resizeTOC(which) {
	var list=getTOCListFromButton(which); if (!list) return;
	var size = list.size;
	if (list.style.display=="none")	// make sure list is visible
		if(config.options.chkAnimate) anim.startAnimating(new Slider(list,true,false,"none"));
		else list.style.display = "block" ;
	switch (which.id) {
		case 'TOCSmaller':	// decrease current listbox size
			if (list.autosize) { list.autosize=false; size=config.options.txtTOCListSize; }
			if (size==1)	break;
			size -= 1;	// shrink by one line
			list.requestedSize = list.size = size;
			break;
		case 'TOCLarger':	// increase current listbox size
			if (list.autosize) { list.autosize=false; size=config.options.txtTOCListSize; }
			if (size>=list.options.length)	break;
			size += 1;	// grow by one line
			list.requestedSize = list.size = size;
			break;
		case 'TOCMaximize':	// toggle autosize
			list.autosize  = (list.size!=list.options.length);
			list.size = (list.autosize)?list.options.length:list.requestedSize;
			break;
	}
	if (!list.noSizeCookie && !list.autosize)
		{ config.options.txtTOCListSize=size; saveOptionCookie("txtTOCListSize"); }
}
//}}}
