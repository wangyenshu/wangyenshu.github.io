/***
|Name|SearchOptionsPlugin|
|Source|http://www.TiddlyTools.com/#SearchOptionsPlugin|
|Documentation|http://www.TiddlyTools.com/#SearchOptionsPluginInfo|
|Version|3.0.10|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|extend core search function with additional user-configurable options|
Adds extra options to core search function including selecting which data items to search, enabling/disabling incremental key-by-key searches, and generating a ''list of matching tiddlers'' instead of immediately displaying all matches.  This plugin also adds syntax for rendering 'search links' within tiddler content to embed one-click searches using pre-defined 'hard-coded' search terms.
!!!!!Documentation
>see [[SearchOptionsPluginInfo]]
!!!!!Configuration
<<<
<<tiddler SearchOptions>>
<<option chkSearchResultsOptions>> Include {{{options...}}} slider in "search again" form
<<<
!!!!!Revisions
<<<
2011.04.08 3.0.10 fixed typo in CSS in formatSearchResults_buttons().  Restore missing options in Configuration section.
|please see [[SearchOptionsPluginInfo]] for additional revision details|
2005.10.18 1.0.0 Initial Release
<<<
!!!!!Code
***/
//{{{
version.extensions.SearchOptionsPlugin= {major: 3, minor: 0, revision: 10, date: new Date(2011,3,18)};
//}}}
//{{{
var defaults={
	chkSearchTitles:	true,
	chkSearchText:		true,
	chkSearchTags:		true,
	chkSearchFields:	true,
	chkSearchTitlesFirst:	true,
	chkSearchList:		true,
	chkSearchHighlight:	true,
	chkSearchListTiddler:	false,
	chkSearchByDate:	false,
	chkIncrementalSearch:	true,
	chkSearchShadows:	true,
	chkSearchOpenTiddlers:	false,
	chkSearchResultsOptions:true,
	chkSearchExcludeTags:	true,
	txtSearchExcludeTags:	'excludeSearch',
	txtIncrementalSearchDelay:	500,
	txtIncrementalSearchMin:	3
}; for (var id in defaults) if (config.options[id]===undefined)
	config.options[id]=defaults[id];
if (config.macros.search.reportTitle==undefined)
	config.macros.search.reportTitle="SearchResults"; // note: not a cookie!
config.macros.search.label+="\xa0"; // a little bit of space just because it looks better
//}}}
// // searchLink: {{{[search[text to find]] OR [search[text to display|text to find]]}}}
//{{{
config.formatters.push( {
	name: "searchLink",
	match: "\\[search\\[",
	lookaheadRegExp: /\[search\[(.*?)(?:\|(.*?))?\]\]/mg,
	prompt: "search for: '%0'",
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var label=lookaheadMatch[1];
			var text=lookaheadMatch[2]||label;
			var prompt=this.prompt.format([text]);
			var btn=createTiddlyButton(w.output,label,prompt,
				function(){story.search(this.getAttribute("searchText"))},"searchLink");
			btn.setAttribute("searchText",text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
});
//}}}
// // incremental search uses option settings instead of hard-coded delay and minimum input values
//{{{
var fn=config.macros.search.onKeyPress;
fn=fn.toString().replace(/500/g, "config.options.txtIncrementalSearchDelay||500");
fn=fn.toString().replace(/> 2/g, ">=(config.options.txtIncrementalSearchMin||3)");
eval("config.macros.search.onKeyPress="+fn);
//}}}
// // REPLACE story.search() for option to "show search results in a list"
//{{{
Story.prototype.search = function(text,useCaseSensitive,useRegExp)
{
	var co=config.options; // abbrev
	var re=new RegExp(useRegExp ? text : text.escapeRegExp(),useCaseSensitive ? "mg" : "img");
	if (config.options.chkSearchHighlight) highlightHack=re;
	var matches = store.search(re,co.chkSearchByDate?"modified":"title","");
	if (co.chkSearchByDate) matches=matches.reverse(); // most recent first
	var q = useRegExp ? "/" : "'";
	clearMessage();
	if (!matches.length) {
		if (co.chkSearchListTiddler) discardSearchResults();
		displayMessage(config.macros.search.failureMsg.format([q+text+q]));
	} else {
		if (co.chkSearchList||co.chkSearchListTiddler) 
			reportSearchResults(text,matches);
		else {
			var titles = []; for(var t=0; t<matches.length; t++) titles.push(matches[t].title);
			this.closeAllTiddlers(); story.displayTiddlers(null,titles);
			displayMessage(config.macros.search.successMsg.format([matches.length, q+text+q]));
		}
	}
	highlightHack = null;
}
//}}}
// // REPLACE store.search() for enhanced searching/sorting options
//{{{
TiddlyWiki.prototype.search = function(searchRegExp,sortField,excludeTag,match)
{
	var co=config.options; // abbrev
	var tids = this.reverseLookup("tags",excludeTag,!!match,sortField);
	var opened=[]; story.forEachTiddler(function(tid,elem){opened.push(tid);});

	// eliminate tiddlers tagged with excluded tags
	if (co.chkSearchExcludeTags&&co.txtSearchExcludeTags.length) {
		var ex=co.txtSearchExcludeTags.readBracketedList();
		var temp=[]; for(var t=tids.length-1; t>=0; t--)
			if (!tids[t].tags.containsAny(ex)) temp.push(tids[t]);
		tids=temp;
	}

	// scan for matching titles first...
	var results = [];
	if (co.chkSearchTitles) {
		for(var t=0; t<tids.length; t++) {
			if (co.chkSearchOpenTiddlers && !opened.contains(tids[t].title)) continue; 
			if(tids[t].title.search(searchRegExp)!=-1) results.push(tids[t]);
		}
		if (co.chkSearchShadows)
			for (var t in config.shadowTiddlers) {
				if (co.chkSearchOpenTiddlers && !opened.contains(t)) continue; 
				if ((t.search(searchRegExp)!=-1) && !store.tiddlerExists(t))
					results.push((new Tiddler()).assign(t,config.shadowTiddlers[t]));
			}
	}
	// then scan for matching text, tags, or field data
	for(var t=0; t<tids.length; t++) {
		if (co.chkSearchOpenTiddlers && !opened.contains(tids[t].title)) continue; 
		if (co.chkSearchText && tids[t].text.search(searchRegExp)!=-1)
			results.pushUnique(tids[t]);
		if (co.chkSearchTags && tids[t].tags.join(" ").search(searchRegExp)!=-1)
			results.pushUnique(tids[t]);
		if (co.chkSearchFields && store.forEachField!=undefined)
			store.forEachField(tids[t],
				function(tid,field,val) {
					if (val.search(searchRegExp)!=-1) results.pushUnique(tids[t]);
				},
				true); // extended fields only
	}
	// then check for matching text in shadows
	if (co.chkSearchShadows)
		for (var t in config.shadowTiddlers) {
			if (co.chkSearchOpenTiddlers && !opened.contains(t)) continue; 
			if ((config.shadowTiddlers[t].search(searchRegExp)!=-1) && !store.tiddlerExists(t))
				results.pushUnique((new Tiddler()).assign(t,config.shadowTiddlers[t]));
		}

	// if not 'titles first', or sorting by modification date,
	// re-sort results to so titles, text, tag and field matches are mixed together
	if(!sortField) sortField = "title";
	var bySortField=function(a,b){
		if(a[sortField]==b[sortField])return(0);else return(a[sortField]<b[sortField])?-1:+1;
	}
	if (!co.chkSearchTitlesFirst || co.chkSearchByDate) results.sort(bySortField);

	return results;
}
//}}}
// // HIJACK core {{{<<search>>}}} macro to add "report" and "simple inline" output
//{{{
config.macros.search.SOP_handler=config.macros.search.handler;
config.macros.search.handler = function(place,macroName,params)
{
	// if "report", use SearchOptionsPlugin report generator for inline output
	if (params[1]&&params[1].substr(0,6)=="report") {
		var keyword=params[0];
		var options=params[1].split("=")[1]; // split "report=option+option+..."
		var heading=params[2]?params[2].unescapeLineBreaks():"";
		var matches=store.search(new RegExp(keyword.escapeRegExp(),"img"),"title","excludeSearch");
		if (matches.length) wikify(heading+window.formatSearchResults(keyword,matches,options),place);
	} else if (params[1]) {
		var keyword=params[0];
		var heading=params[1]?params[1].unescapeLineBreaks():"";
		var seperator=params[2]?params[2].unescapeLineBreaks():", ";
		var matches=store.search(new RegExp(keyword.escapeRegExp(),"img"),"title","excludeSearch");
		if (matches.length) {
			var out=[];
			for (var m=0; m<matches.length; m++) out.push("[["+matches[m].title+"]]");
			wikify(heading+out.join(seperator),place);
		}
	} else
		config.macros.search.SOP_handler.apply(this,arguments);
};
//}}}
// // SearchResults panel handling
//{{{
setStylesheet(".searchResults { padding:1em 1em 0 1em; }","searchResults"); // matches std tiddler padding

config.macros.search.createPanel=function(text,matches,body) {

	function getByClass(e,c) { var d=e.getElementsByTagName("div");
		for (var i=0;i<d.length;i++) if (hasClass(d[i],c)) return d[i]; }
	var panel=createTiddlyElement(null,"div","searchPanel","searchPanel");
	this.renderPanel(panel,text,matches,body);
	var oldpanel=document.getElementById("searchPanel");
	if (!oldpanel) { // insert new panel just above tiddlers
		var da=document.getElementById("displayArea");
		da.insertBefore(panel,da.firstChild);
	} else { // if panel exists
		var oldwrap=getByClass(oldpanel,"searchResults");
		var newwrap=getByClass(panel,"searchResults");
		// if no prior content, just insert new content
		if (!oldwrap) oldpanel.insertBefore(newwrap,null);
		else {	// swap search results content but leave containing panel intact
			oldwrap.style.display='block'; // unfold wrapper if needed
			var i=oldwrap.getElementsByTagName("input")[0]; // get input field
			if (i) { var pos=this.getCursorPos(i); i.onblur=null; } // get cursor pos, ignore blur
			oldpanel.replaceChild(newwrap,oldwrap);
			panel=oldpanel; // use existing panel
		} 
	}
	this.showPanel(true,pos);
	return panel;
}

config.macros.search.renderPanel=function(panel,text,matches,body) {

	var wrap=createTiddlyElement(panel,"div",null,"searchResults");
	wrap.onmouseover = function(e){ addClass(this,"selected"); }
	wrap.onmouseout = function(e){ removeClass(this,"selected"); }
	// create toolbar: "open all", "fold/unfold", "close"
	var tb=createTiddlyElement(wrap,"div",null,"toolbar");
	var b=createTiddlyButton(tb, "open all", "open all matching tiddlers", function() {
		story.displayTiddlers(null,this.getAttribute("list").readBracketedList()); return false; },"button");
	var list=""; for(var t=0;t<matches.length;t++) list+='[['+matches[t].title+']] ';
	b.setAttribute("list",list);
	var b=createTiddlyButton(tb, "fold", "toggle display of search results", function() {
		config.macros.search.foldPanel(this); return false; },"button");
	var b=createTiddlyButton(tb, "close", "dismiss search results",	function() {
		config.macros.search.showPanel(false); return false; },"button");
	createTiddlyText(createTiddlyElement(wrap,"div",null,"title"),"Search for: "+text); // title
	wikify(body,createTiddlyElement(wrap,"div",null,"viewer")); // report
	return panel;
}

config.macros.search.showPanel=function(show,pos) {
	var panel=document.getElementById("searchPanel");
	var i=panel.getElementsByTagName("input")[0];
	i.onfocus=show?function(){config.macros.search.stayFocused(true);}:null;
	i.onblur=show?function(){config.macros.search.stayFocused(false);}:null;
	if (show && panel.style.display=="block") { // if shown, grab focus, restore cursor
		if (i&&this.stayFocused()) { i.focus(); this.setCursorPos(i,pos); }
		return;
	}
	if(!config.options.chkAnimate) {
		panel.style.display=show?"block":"none";
		if (!show) { removeChildren(panel); config.macros.search.stayFocused(false); }
	} else {
		var s=new Slider(panel,show,false,show?"none":"children");
		s.callback=function(e,p){e.style.overflow="visible";}
		anim.startAnimating(s);
	}
	return panel;
}

config.macros.search.foldPanel=function(button) {
	var d=document.getElementById("searchPanel").getElementsByTagName("div");
	for (var i=0;i<d.length;i++) if (hasClass(d[i],"viewer")) var v=d[i]; if (!v) return;
	var show=v.style.display=="none";
	if(!config.options.chkAnimate)
		v.style.display=show?"block":"none";
	else {
		var s=new Slider(v,show,false,"none");
		s.callback=function(e,p){e.style.overflow="visible";}
		anim.startAnimating(s);
	}
	button.innerHTML=show?"fold":"unfold";
	return false;
}

config.macros.search.stayFocused=function(keep) { // TRUE/FALSE=set value, no args=get value
	if (keep===undefined) return this.keepReportInFocus;
	this.keepReportInFocus=keep;
	return keep
}	

config.macros.search.getCursorPos=function(i) {
	var s=0; var e=0; if (!i) return { start:s, end:e };
	try {
		if (i.setSelectionRange) // FF
			{ s=i.selectionStart; e=i.selectionEnd; }
		if (document.selection && document.selection.createRange) { // IE
			var r=document.selection.createRange().duplicate();
			var len=r.text.length; s=0-r.moveStart('character',-100000); e=s+len;
		}
	}catch(e){};
	return { start:s, end:e };
}
config.macros.search.setCursorPos=function(i,pos) {
	if (!i||!pos) return; var s=pos.start; var e=pos.end;
	if (i.setSelectionRange) //FF
		i.setSelectionRange(s,e);
	if (i.createTextRange) // IE
		{ var r=i.createTextRange(); r.collapse(true); r.moveStart("character",s); r.select(); }
}
//}}}
// // SearchResults report generation
// note: these functions are defined globally, so they can be more easily redefined to customize report formats//
//{{{
if (!window.reportSearchResults) window.reportSearchResults=function(text,matches)
{
	var cms=config.macros.search; // abbrev
	var body=window.formatSearchResults(text,matches);
	if (!config.options.chkSearchListTiddler) // show #searchResults panel
		window.scrollTo(0,ensureVisible(cms.createPanel(text,matches,body)));
	else { // write [[SearchResults]] tiddler
		var title=cms.reportTitle;
		var who=config.options.txtUserName;
		var when=new Date();
		var tags="excludeLists excludeSearch temporary";
		var tid=store.getTiddler(title); if (!tid) tid=new Tiddler();
		tid.set(title,body,who,when,tags);
		store.addTiddler(tid);
		story.closeTiddler(title);
		story.displayTiddler(null,title);
	}
}

if (!window.formatSearchResults) window.formatSearchResults=function(text,matches,opt)
{
	var body='';
	var title=config.macros.search.reportTitle
	var q = config.options.chkRegExpSearch ? "/" : "'";
	if (!opt) var opt="all";
	var parts=opt.split("+");
	for (var i=0; i<parts.length; i++) { var p=parts[i].toLowerCase();
		if (p=="again"||p=="all")   body+=window.formatSearchResults_again(text,matches);
		if (p=="summary"||p=="all") body+=window.formatSearchResults_summary(text,matches);
		if (p=="list"||p=="all")    body+=window.formatSearchResults_list(text,matches);
		if (p=="buttons"||p=="all") body+=window.formatSearchResults_buttons(text,matches);
	}
	return body;
}

if (!window.formatSearchResults_again) window.formatSearchResults_again=function(text,matches)
{
	var title=config.macros.search.reportTitle
	var body='';
	// search again
	body+='{{span{<<search "'+text.replace(/"/g,'&#x22;')+'">> /%\n';
	body+='%/<html><input type="button" value="search again"';
	body+=' onclick="var t=this.parentNode.parentNode.getElementsByTagName(\'input\')[0];';
	body+=' config.macros.search.doSearch(t); return false;">';
	if (!config.options.chkSearchResultsOptions) // omit "options..."
		body+='</html>';
	else {
		body+=' <a href="javascript:;" onclick="';
		body+=' var e=this.parentNode.nextSibling;';
		body+=' var show=e.style.display!=\'block\';';
		body+=' if(!config.options.chkAnimate) e.style.display=show?\'block\':\'none\';';
		body+=' else anim.startAnimating(new Slider(e,show,false,\'none\'));';
		body+=' return false;">options...</a>';
		body+='</html>@@display:none;border-left:1px dotted;margin-left:1em;padding:0;padding-left:.5em;font-size:90%;/%\n';
		body+='	%/<<tiddler SearchOptions>>@@';
	};
	body+='}}}\n\n';
	return body;
}

if (!window.formatSearchResults_summary) window.formatSearchResults_summary=function(text,matches)
{
	// summary: nn tiddlers found matching '...', options used
	var body='';
	var co=config.options; // abbrev
	var title=config.macros.search.reportTitle
	var q = co.chkRegExpSearch ? "/" : "'";
	body+="''"+config.macros.search.successMsg.format([matches.length,q+"{{{"+text+"}}}"+q])+"''\n";
	var opts=[];
	if (co.chkSearchTitles) opts.push("titles");
	if (co.chkSearchText) opts.push("text");
	if (co.chkSearchTags) opts.push("tags");
	if (co.chkSearchFields) opts.push("fields");
	if (co.chkSearchShadows) opts.push("shadows");
	if (co.chkSearchOpenTiddlers) body+="^^//search limited to displayed tiddlers only//^^\n";
	body+="~~&nbsp; searched in "+opts.join(" + ")+"~~\n";
	body+=(co.chkCaseSensitiveSearch||co.chkRegExpSearch?"^^&nbsp; using ":"")
		+(co.chkCaseSensitiveSearch?"case-sensitive ":"")
		+(co.chkRegExpSearch?"pattern ":"")
		+(co.chkCaseSensitiveSearch||co.chkRegExpSearch?"matching^^\n":"");
	return body;
}

if (!window.formatSearchResults_list) window.formatSearchResults_list=function(text,matches)
{
	// bullet list of links to matching tiddlers
	var body='';
	var co=config.options; // abbrev
	var pattern=co.chkRegExpSearch?text:text.escapeRegExp();
	var sensitive=co.chkCaseSensitiveSearch?"mg":"img";
	var link='{{tiddlyLinkExisting{<html><nowiki><a href="javascript:;" onclick="'
		+'if(config.options.chkSearchHighlight)'
		+'	highlightHack=new RegExp(\x27'+pattern+'\x27.escapeRegExp(),\x27'+sensitive+'\x27);'
		+'story.displayTiddler(null,\x27%0\x27);'
		+'highlightHack = null; return false;'
		+'" title="%2">%1</a></html>}}}';
	for(var t=0;t<matches.length;t++) {
		body+="* ";
		if (co.chkSearchByDate)
			body+=matches[t].modified.formatString('YYYY.0MM.0DD 0hh:0mm')+" ";
		var title=matches[t].title;
		var fixup=title.replace(/'/g,"\\x27").replace(/"/g,"\\x22");
		var tid=store.getTiddler(title);
		var tip=tid?tid.getSubtitle():''; tip=tip.replace(/"/g,"&quot;");
		body+=link.format([fixup,title,tip])+'\n';
	}
	return body;
}

if (!window.formatSearchResults_buttons) window.formatSearchResults_buttons=function(text,matches)
{
	// embed buttons only if writing SearchResults to tiddler
	if (!config.options.chkSearchListTiddler) return "";
	// "open all" button
	var title=config.macros.search.reportTitle;
	var body="";
	body+="@@display:block;<html><input type=\"button\" href=\"javascript:;\" "
		+"onclick=\"story.displayTiddlers(null,[";
	for(var t=0;t<matches.length;t++)
		body+="'"+matches[t].title.replace(/\'/mg,"\\'")+"'"+((t<matches.length-1)?", ":"");
	body+="],1);\" accesskey=\"O\" value=\"open all matching tiddlers\"></html> ";
	// "discard SearchResults" button
	body+="<html><input type=\"button\" href=\"javascript:;\" "
		+"onclick=\"discardSearchResults()\" value=\"discard "+title+"\"></html>";
	body+="@@\n";
	return body;
}

if (!window.discardSearchResults) window.discardSearchResults=function()
{
	// remove the tiddler
	story.closeTiddler(config.macros.search.reportTitle);
	store.deleteTiddler(config.macros.search.reportTitle);
	store.notify(config.macros.search.reportTitle,true);
}
//}}}
// // DELIVER [[SearchOptions]] shadow payload
//{{{
config.shadowTiddlers.SearchOptions = store.getTiddlerText('SearchOptionsPlugin##panel','');
config.annotations.SearchOptions    = 'created by SearchOptionsPlugin';
//}}}
/***
//{{{
!panel
search in:
  {{nowrap{<<option chkSearchTitles>>titles <<option chkSearchText>>text <<option chkSearchTags>>tags}}} /%
%/{{nowrap{<<option chkSearchFields>>fields <<option chkSearchShadows>>shadows}}}
----
  {{nowrap{<<option chkCaseSensitiveSearch>>case-sensitive}}} /%
%/{{nowrap{<<option chkRegExpSearch>>match text patterns}}}
  {{nowrap{<<option chkIncrementalSearch>>key-by-key search:}}} /%
	%/{{threechar smallform nowrap{<<option txtIncrementalSearchMin>> or more characters}}} /%
	%/{{threechar smallform nowrap{<<option txtIncrementalSearchDelay>> msec delay}}}<hr>
  {{nowrap{<<option chkSearchList>>show results in a list &nbsp; &nbsp;}}} /%
%/{{nowrap{<<option chkSearchListTiddler>>save list in ''[[SearchResults]]''}}}
  {{nowrap{<<option chkSearchTitlesFirst>>show title matches first}}} /%
%/{{nowrap{<<option chkSearchByDate>>sort results by date}}} /%
%/{{nowrap{<<option chkSearchHighlight>>highlight matching text}}}
----
{{nowrap{<<option chkSearchOpenTiddlers>>search open tiddlers only}}}
{{nowrap{<<option chkSearchExcludeTags>>exclude tiddlers tagged with:}}}
{{editor{<<option txtSearchExcludeTags>>}}}
!end
//}}}
***/
 