/***
|Name|CoreTweaks|
|Source|http://www.TiddlyTools.com/#CoreTweaks|
|Version||
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.2.0|
|Type|plugin|
|Description|a small collection of overrides to TW core functions|
This tiddler contains small changes to TW core functions that correct or enhance standard features or behaviors.
***/
//{{{
// calculate TW version number - used to determine which tweaks should be applied
var ver=version.major+version.minor/10+version.revision/100;
//}}}
/***
----

***/
// // closed: won't fix //(leave as core tweaks)//
// // {{block{
/***
!!!637 TiddlyLink tooltip - custom formatting
***/
// // {{groupbox small{
/***
http://trac.tiddlywiki.org/ticket/637 - CLOSED: WON'T FIX
This tweak modifies the tooltip format that appears when you mouseover a link to a tiddler.  It adds an option to control the date format, as well as displaying the size of the tiddler (in bytes)

Tiddler link tooltip format:
{{stretch{<<option txtTiddlerLinkTootip>>}}}
^^where: %0=title, %1=username, %2=modification date, %3=size in bytes, %4=description slice, %5=first N characters of tiddler content^^
Tiddler link tooltip date format:
{{stretch{<<option txtTiddlerLinkTooltipDate>>}}}
Tiddler excerpt limit (chars):
{{stretch{<<option txtTiddlerLinkTooltipLimit>>}}}
***/
//{{{
config.messages.tiddlerLinkTooltip='%0 - %1, %2 (%3 bytes) - %4';
config.messages.tiddlerLinkTooltipDate='DDD, MMM DDth YYYY 0hh12:0mm AM';
config.messages.tiddlerLinkTooltipLimit=50;

config.options.txtTiddlerLinkTootip=
	config.options.txtTiddlerLinkTootip||config.messages.tiddlerLinkTooltip;
config.options.txtTiddlerLinkTooltipDate=
	config.options.txtTiddlerLinkTooltipDate||config.messages.tiddlerLinkTooltipDate;
config.options.txtTiddlerLinkTooltipLimit=
	config.options.txtTiddlerLinkTooltipLimit||config.messages.tiddlerLinkTooltipLimit;

Tiddler.prototype.getSubtitle = function() {
	var modifier = this.modifier;
	if(!modifier) modifier = config.messages.subtitleUnknown;
	var modified = this.modified;
	if(modified) modified = modified.formatString(config.options.txtTiddlerLinkTooltipDate);
	else modified = config.messages.subtitleUnknown;
	var descr=store.getTiddlerSlice(this.title,'Description')||'';
	var txt=this.text.substr(0,config.options.txtTiddlerLinkTooltipLimit);
	if (this.text.length>config.options.txtTiddlerLinkTooltipLimit) txt+="...";
	return config.options.txtTiddlerLinkTootip.format([this.title,modifier,modified,this.text.length,descr,txt]);
};
//}}}
// // }}}}}}// // {{block{
/***
!!!607 add HREF link on permaview command
***/
// // {{groupbox small{
/***
http://trac.tiddlywiki.org/ticket/607 - CLOSED: WON'T FIX
This tweak automatically sets the HREF for the 'permaview' sidebar command link so you can use the 'right click' context menu for faster, easier bookmarking.  Note that this does ''not'' automatically set the permaview in the browser's current location URL... it just sets the HREF on the command link.  You still have to click the link to apply the permaview.
***/
//{{{
config.macros.permaview.handler = function(place)
{
	var btn=createTiddlyButton(place,this.label,this.prompt,this.onClick);
	addEvent(btn,'mouseover',this.setHREF);
	addEvent(btn,'focus',this.setHREF);
};
config.macros.permaview.setHREF = function(event){
	var links = [];
	story.forEachTiddler(function(title,element) {
		links.push(String.encodeTiddlyLink(title));
	});
	var newURL=document.location.href;
	var hashPos=newURL.indexOf('#');
	if (hashPos!=-1) newURL=newURL.substr(0,hashPos);
	this.href=newURL+'#'+encodeURIComponent(links.join(' '));
}
//}}}
// // }}}}}}// // {{block{
/***
!!!458 add permalink-like HREFs on internal TiddlyLinks
***/
// // {{groupbox small{
/***
http://trac.tiddlywiki.org/ticket/458 - CLOSED: WON'T FIX
This tweak assigns a permalink-like HREF to internal Tiddler links (which normally do not have any HREF defined).  This permits the link's context menu (right-click) to include 'open link in another window/tab' command.  Based on a request from Dustin Spicuzza.
***/
//{{{
window.coreTweaks_createTiddlyLink=window.createTiddlyLink;
window.createTiddlyLink=function(place,title,includeText,theClass,isStatic,linkedFromTiddler,noToggle)
{
	// create the core button, then add the HREF (to internal links only)
	var link=window.coreTweaks_createTiddlyLink.apply(this,arguments);
	if (!isStatic)
		link.href=document.location.href.split('#')[0]+'#'+encodeURIComponent(String.encodeTiddlyLink(title));
	return link;
}
//}}}
// // }}}}}}
// // to be fixed in 2.6.0:
// // {{block{
/***
!!!1151 adjust popup placement when root element is in scrolled DIV
***/
// // {{groupbox small{
/***
http://trac.tiddlywiki.org/ticket/1151
When a popup link is placed inside a DIV with style "overflow:scroll" or "overflow:auto" and that DIV is then scrolled, the position of the resulting popup appears further down the page that intended, because it is not adjusting for the relative scroll offset of the containing DIV.  This tweak patches the Popup.place() function to calculate and subtract the current scroll offset from the computed popup position, so that it appears in the correct location on the page.

Test case: //(scroll to the bottom of this DIV and click on "test popup")//
{{groupbox{
 <<tiddler ScrollBox with: CoreTweaks##1151test 12em>>}}}/%
!1151test
<<tiddler About>>
<<showPopup tiddler:About label:"test popup" tip:About popupClass:sticky>>
!end
%/
***/
//{{{
window.findScrollOffsetX=function(obj) {
	var x=0;
	while(obj) {
		if (obj.scrollLeft && obj.nodeName!='HTML')
			x+=obj.scrollLeft;
		obj=obj.parentNode;
	}
	return -x;
}

window.findScrollOffsetY=function(obj) {
	var y=0;
	while(obj) {
		if (obj.scrollTop && obj.nodeName!='HTML')
			y+=obj.scrollTop;
		obj=obj.parentNode;
	}
	return -y;
}

var fn=Popup.place.toString();
if (fn.indexOf('findScrollOffsetX')==-1) { // only once
	fn=fn.replace(/var\s*rootLeft\s*=/,'var rootLeft = window.findScrollOffsetX(root) +');
	fn=fn.replace(/var\s*rootTop\s*=/,'var rootTop = window.findScrollOffsetY(root) +');
	eval('Popup.place='+fn);
}
//}}}
// // }}}}}}// // {{block{
/***
!!!1147 tiddler macro with params does not refresh
***/
// // {{groupbox small{
/***
http://trac.tiddlywiki.org/ticket/1147
when the {{{<<tiddler SomeTiddler>>}}} macro is handled, the resulting span has extra attributes: {{{refresh='content'}}} and {{{tiddler='SomeTiddler'}}}.  If SomeTiddler is changed, {{{store.notify('SomeTiddler')}}} triggers {{{refreshDisplay()}}}, which automatically re-renders transcluded content in any span that has these extra attributes.  However, when additional arguments are passed by using {{{<<tiddler SomeTiddler with: arg arg arg ...>>}}} then the resulting span does NOT get the extra attributes noted above and, as a consequence, the transcluded content is not being refreshed, even though the underlying tiddler has changed

To correct this, in {{{config.macros.tiddler.handler}}}:
*set the 'refresh' and 'tiddler' attributes even when arguments are present in the macro
*store the arguments themselves in an attribute (e.g, 'args'), using as a space-separated, bracketed list
Then, in {{{config.refreshers.content}}}:
*retrieve the stored arguments (if any) and the tiddler source
*substitute arguments into source and re-render the span with the updated content

***/
//{{{
config.refreshers.content=function(e,changeList) {
		var title = e.getAttribute("tiddler");
		var force = e.getAttribute("force");
		var args = e.getAttribute("args"); // ADDED
		if(force != null || changeList == null || changeList.indexOf(title) != -1) {
			removeChildren(e);
//			wikify(store.getTiddlerText(title,""),e,null,store.fetchTiddler(title)); // REMOVED
			config.macros.tiddler.transclude(e,title,args); // ADDED
			return true;
		} else
			return false;
};

config.macros.tiddler.handler=function(place,macroName,params,wikifier,paramString,tiddler) {
	params = paramString.parseParams("name",null,true,false,true);
	var names = params[0]["name"];
	var tiddlerName = names[0];
	var className = names[1] || null;
	var args = params[0]["with"];
	var wrapper = createTiddlyElement(place,"span",null,className);
//	if(!args) { // REMOVED
		wrapper.setAttribute("refresh","content");
		wrapper.setAttribute("tiddler",tiddlerName);
// 	} // REMOVED
	if(args!==undefined) wrapper.setAttribute("args",'[['+args.join(']] [[')+']]'); // ADDED
	this.transclude(wrapper,tiddlerName,args); // REFACTORED TO ...tiddler.transclude
}

// REFACTORED FROM ...tiddler.handler
config.macros.tiddler.transclude=function(wrapper,tiddlerName,args) {
	var text = store.getTiddlerText(tiddlerName); if (!text) return;
	var stack = config.macros.tiddler.tiddlerStack;
	if(stack.indexOf(tiddlerName) !== -1) return;
	stack.push(tiddlerName);
	try {
		if (typeof args == "string") args=args.readBracketedList(); // ADDED
		var n = args ? Math.min(args.length,9) : 0;
		for(var i=0; i<n; i++) {
			var placeholderRE = new RegExp("\\$" + (i + 1),"mg");
			text = text.replace(placeholderRE,args[i]);
		}
		config.macros.tiddler.renderText(wrapper,text,tiddlerName,null); // REMOVED UNUSED 'params'
	} finally {
		stack.pop();
	}
};
//}}}
// // }}}}}}// // {{block{
/***
!!!1134 allow leading whitespace in section headings / TBD handle shadow tiddler sections
***/
// // {{groupbox small{
/***
http://trac.tiddlywiki.org/ticket/1134
This tweak REPLACES and extends {{{store.getTiddlerText()}}} so it can return sections defined in shadow tiddlers as well as permitting use of leading whitespace in section headings.
***/
//{{{
TiddlyWiki.prototype.getTiddlerText = function(title,defaultText)
{
	if(!title) return defaultText;
	var parts = title.split(config.textPrimitives.sectionSeparator);
	var title = parts[0];
	var section = parts[1];
	var parts = title.split(config.textPrimitives.sliceSeparator);
	var title = parts[0];
	var slice = parts[1]?this.getTiddlerSlice(title,parts[1]):null;
	if(slice) return slice;
	var tiddler = this.fetchTiddler(title);
	var text = defaultText;
	if(this.isShadowTiddler(title))
		text = this.getShadowTiddlerText(title);
	if(tiddler)
		text = tiddler.text;
	if(!section) return text;
	var re = new RegExp("(^!{1,6}[ \t]*" + section.escapeRegExp() + "[ \t]*\n)","mg");
	re.lastIndex = 0;
	var match = re.exec(text);
	if(match) {
		var t = text.substr(match.index+match[1].length);
		var re2 = /^!/mg;
		re2.lastIndex = 0;
		match = re2.exec(t); //# search for the next heading
		if(match)
			t = t.substr(0,match.index-1);//# don't include final \n
		return t;
	}
	return defaultText;
};
//}}}
// // }}}}}}// // {{block{
/***
!!!824 ~WindowTitle - alternative to combined ~SiteTitle/~SiteSubtitle in window titlebar
***/
// // {{groupbox small{
/***
http://trac.tiddlywiki.org/ticket/824 - OPEN
This tweak allows definition of an optional [[WindowTitle]] tiddler that, when present, provides alternative text for display in the browser window's titlebar, instead of using the combined text content from [[SiteTitle]] and [[SiteSubtitle]] (which will still be displayed as usual in the TiddlyWiki document header area).

Note: this ticket replaces http://trac.tiddlywiki.org/ticket/401 (closed), which proposed using a custom [[PageTitle]] tiddler for this purpose.  ''If you were using the previous '401 ~PageTitle' tweak, you will need to rename [[PageTitle]] to [[WindowTitle]] to continue to use your custom window title text''
***/
//{{{
config.shadowTiddlers.WindowTitle='<<tiddler SiteTitle>> - <<tiddler SiteSubtitle>>';
window.getPageTitle=function() { return wikifyPlain('WindowTitle'); }
store.addNotification('WindowTitle',refreshPageTitle); // so title stays in sync with tiddler changes
//}}}
// // }}}}}}// // {{block{
/***
!!!471 'creator' field for new tiddlers
***/
// // {{groupbox small{
/***
http://trac.tiddlywiki.org/ticket/471 - OPEN
This tweak HIJACKS the core's saveTiddler() function to automatically add a 'creator' field to a tiddler when it is FIRST created. You can use """<<view creator>>""" (or """<<view creator wikified>>""" if you prefer) to show this value embedded directly within the tiddler content, or {{{<span macro="view creator"></span>}}} in the ViewTemplate and/or EditTemplate to display the creator value in each tiddler.  
***/
//{{{
// hijack saveTiddler()
TiddlyWiki.prototype.CoreTweaks_creatorSaveTiddler=TiddlyWiki.prototype.saveTiddler;
TiddlyWiki.prototype.saveTiddler=function(title,newTitle,newBody,modifier,modified,tags,fields)
{
	var existing=store.tiddlerExists(title);
	var tiddler=this.CoreTweaks_creatorSaveTiddler.apply(this,arguments);
	if (!existing) store.setValue(title,'creator',config.options.txtUserName);
	return tiddler;
}
//}}}
// // }}}}}}
// // fixed in ~TW2.4.3
// // {{block{
/***
!!!444 'tiddler' and 'place' - global variables for use in computed macro parameters
***/
// // {{groupbox small{
/***
http://trac.tiddlywiki.org/ticket/444 - CLOSED:FIXED - TW2.4.3 - http://trac.tiddlywiki.org/changeset/8367
When invoking a macro, this tweak makes the current containing tiddler object and DOM rendering location available as global variables (window.tiddler and window.place, respectively).  These globals can then be used within //computed macro parameters// to retrieve tiddler-relative and/or DOM-relative values or perform tiddler-specific side-effect functionality.
***/
//{{{
if (ver<2.43) {
window.coreTweaks_invokeMacro = window.invokeMacro;
window.invokeMacro = function(place,macro,params,wikifier,tiddler) {
	var here=story.findContainingTiddler(place);
	window.tiddler=here?store.getTiddler(here.getAttribute('tiddler')):tiddler;
	window.place=place;
	window.coreTweaks_invokeMacro.apply(this,arguments);
}
}
//}}}
// // }}}}}}
// // fixed in ~TW2.4.2:
// // {{block{
/***
!!!823 apply option values via paramifiers (e.g. #chk...and #txt...)
***/
// // {{groupbox small{
/***
http://trac.tiddlywiki.org/ticket/823 - CLOSED:FIXED - TW2.4.2 http://trac.tiddlywiki.org/changeset/7988
This tweak extends and ''//replaces//'' the core {{{invokeParamifier()}}} function to support use of ''option paramifiers'' that set TiddlyWiki option values on-the-fly, directly from a document URL.

If a paramifier begins with 'chk' (checkbox) or 'txt' (text field), it's value will be automatically stored in {{{config.options.*}}}, adding to or overriding any existing 'chk' or 'txt' option values that may have already been loaded from browser cookies and/or assigned by the TW core or plugin initialization functions using hard-coded default values.  Note: option values that have been overriden by paramifiers are only applied during the current document session, and are not //automatically// retained.  However, if you edit an overridden option value during that session, then the modified value is, of course, saved in a browser cookie, as usual.
***/
//{{{
if (ver<2.42) {
function invokeParamifier(params,handler)
{
	if(!params || params.length == undefined || params.length <= 1)
		return;
	for(var t=1; t<params.length; t++) {
		var p = config.paramifiers[params[t].name];
		if(p && p[handler] instanceof Function)
			p[handler](params[t].value);
		else { // not a paramifier with handler()... check for an 'option' prefix
			var h=config.optionHandlers[params[t].name.substr(0,3)];
			if (h && h.set instanceof Function)
				h.set(params[t].name,params[t].value);
		}
	}
}
}
//}}}
// // }}}}}}
// // open tickets:
// // {{block{
/***
!!!608/609/610 toolbars - toggles, separators and transclusion
***/
// // {{groupbox small{
/***
http://trac.tiddlywiki.org/ticket/608 - OPEN (more/less toggle)
http://trac.tiddlywiki.org/ticket/609 - OPEN (separators)
http://trac.tiddlywiki.org/ticket/610 - OPEN (wikify tiddler/slice/section content)

This combination tweak extends the """<<toolbar>>""" macro to add use of '<' to insert a 'less' menu command (the opposite of '>' == 'more'), as well as use of '*' to insert linebreaks and "!" to insert a vertical line separator between toolbar items.  In addition, this tweak add the ability to use references to tiddlernames, slices, or sections and render their content inline within the toolbar, allowing easy creation of new toolbar commands using TW content (such as macros, links, inline scripts, etc.)

To produce a one-line style, with "less" at the end, use
| ViewToolbar| foo bar baz > yabba dabba doo < |
or to use a two-line style with more/less toggle:
| ViewToolbar| foo bar baz > < * yabba dabba doo |
***/
//{{{
merge(config.macros.toolbar,{
	moreLabel: 'more\u25BC',
	morePrompt: 'Show additional commands',
	lessLabel: '\u25C4less',
	lessPrompt: 'Hide additional commands',
	separator: '|'
});
config.macros.toolbar.onClickMore = function(ev) {
	var e = this.nextSibling;
	e.style.display = 'inline'; // show menu
	this.style.display = 'none'; // hide button
	return false;
};
config.macros.toolbar.onClickLess = function(ev) {
	var e = this.parentNode;
	var m = e.previousSibling;
	e.style.display = 'none'; // hide menu
	m.style.display = 'inline'; // show button
	return false;
};
config.macros.toolbar.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	for(var t=0; t<params.length; t++) {
		var c = params[t];
		switch(c) {
			case '!':  // ELS - SEPARATOR (added)
				createTiddlyText(place,this.separator);
				break;
			case '*':  // ELS - LINEBREAK (added)
				createTiddlyElement(place,'BR');
				break;
			case '<': // ELS - LESS COMMAND (added)
				var btn = createTiddlyButton(place,
					this.lessLabel,this.lessPrompt,config.macros.toolbar.onClickLess,'moreCommand');
				break;
			case '>':
				var btn = createTiddlyButton(place,
					this.moreLabel,this.morePrompt,config.macros.toolbar.onClickMore,'moreCommand');
				var e = createTiddlyElement(place,'span',null,'moreCommand');
				e.style.display = 'none';
				place = e;
				break;
			default:
				var theClass = '';
				switch(c.substr(0,1)) {
					case '+':
						theClass = 'defaultCommand';
						c = c.substr(1);
						break;
					case '-':
						theClass = 'cancelCommand';
						c = c.substr(1);
						break;
				}
				if(c in config.commands)

					this.createCommand(place,c,tiddler,theClass);
				else { // ELS - WIKIFY TIDDLER/SLICE/SECTION (added)
					if (c.substr(0,1)=='~') c=c.substr(1); // ignore leading ~
					var txt=store.getTiddlerText(c);
					if (txt) {
						// trim any leading/trailing newlines
						txt=txt.replace(/^\n*/,'').replace(/\n*$/,'');
						// trim PRE format wrapper if any
						txt=txt.replace(/^\{\{\{\n/,'').replace(/\n\}\}\}$/,'');
						// render content into toolbar
						wikify(txt,createTiddlyElement(place,'span'),null,tiddler);
					}
				} // ELS - end WIKIFY CONTENT
				break;
		}
	}
};
//}}}
// // }}}}}}// // {{block{
/***
!!!529 IE fixup - case-sensitive element lookup of tiddler elements
***/
// // {{groupbox small{
/***
http://trac.tiddlywiki.org/ticket/529 - OPEN
This tweak hijacks the standard browser function, document.getElementById(), to work-around the case-INsensitivity error in Internet Explorer (all versions up to and including IE7) //''Note: This tweak is only applied when using IE, and only for lookups of rendered tiddler elements within the containing 'tiddlerDisplay' element.''//
***/
//{{{
if (config.browser.isIE) {
document.coreTweaks_coreGetElementById=document.getElementById;
document.getElementById=function(id) {
	var e=document.coreTweaks_coreGetElementById(id);
	if (!e || !e.parentNode || e.parentNode.id!='tiddlerDisplay') return e;
	for (var i=0; i<e.parentNode.childNodes.length; i++)
		if (id==e.parentNode.childNodes[i].id) return e.parentNode.childNodes[i];
	return null;
};
}
//}}}
// // }}}}}}// // {{block{
/***
!!!890 add conditional test to """<<tiddler>>""" macro
***/
// // {{groupbox small{
/***
http://trac.tiddlywiki.org/ticket/890 - OPEN
This tweak extends the {{{<<tiddler>>}}} macro syntax so you can include a javascript-based //test expression// to determine if the tiddler transclusion should be performed:
{{{
<<tiddler TiddlerName if:{{...}} with: param param etc.>>
}}}
If the test is ''true'', then the tiddler is transcluded as usual.  If the test is ''false'', then the transclusion is skipped and //no output is produced//.
***/
//{{{
config.macros.tiddler.if_handler = config.macros.tiddler.handler;
config.macros.tiddler.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	params = paramString.parseParams('name',null,true,false,true);
	if (!getParam(params,'if',true)) return;
	this.if_handler.apply(this,arguments);
};
//}}}
// // }}}}}}// // {{block{
/***
!!!831 backslash-quoting for embedding newlines in 'line-mode' formats
***/
// // {{groupbox small{
/***
http://trac.tiddlywiki.org/ticket/831 - OPEN
This tweak pre-processes source content to convert 'double-backslash-newline' into {{{<br>}}} before wikify(), so that literal newlines can be embedded in line-mode wiki syntax (e.g., tables, bullets, etc.)
***/
//{{{
window.coreWikify = wikify;
window.wikify = function(source,output,highlightRegExp,tiddler)
{
	if (source) arguments[0]=source.replace(/\\\\\n/mg,'<br>');
	coreWikify.apply(this,arguments);
}
//}}}
// // }}}}}}// // {{block{
/***
!!!683 FireFox3 Import bug: 'browse' button replacement
***/
// // {{groupbox small{
/***
http://trac.tiddlywiki.org/ticket/683 - OPEN
The web standard 'type=file' input control that has been used as a local path/file picker for TiddlyWiki no longer works as expected in FireFox3, which has, for security reasons, limited javascript access to this control so that *no* local filesystem path information can be revealed, even when it is intentional and necessary, as it is with TiddlyWiki.  This tweak provides alternative HTML source that patches the backstage import panel.  It replaces the 'type=file' input control with a text+button combination of controls that invokes a system-native secure 'file-chooser' dialog box to provide TiddlyWiki with access to a complete path+filename so that TW functions properly locate user-selected local files.
>Note: ''This tweak also requires http://trac.tiddlywiki.org/ticket/604 - cross-platform askForFilename()''
***/
//{{{
if (window.Components) {
	var fixhtml='<input name="txtBrowse" style="width:30em"><input type="button" value="..."'
		+' onClick="window.browseForFilename(this.previousSibling,true)">';
	var cmi=config.macros.importTiddlers;
	cmi.step1Html=cmi.step1Html.replace(/<input type='file' size=50 name='txtBrowse'>/,fixhtml);
}

merge(config.messages,{selectFile:'Please enter or select a file'}); // ready for I18N translation

window.browseForFilename=function(target,mustExist) { // note: both params are optional
	var msg=config.messages.selectFile;
	if (target && target.title) msg=target.title; // use target field tooltip (if any) as dialog prompt text
	// get local path for current document
	var path=getLocalPath(document.location.href);
	var p=path.lastIndexOf('/'); if (p==-1) p=path.lastIndexOf('\\'); // Unix or Windows
	if (p!=-1) path=path.substr(0,p+1); // remove filename, leave trailing slash
	var file=''
	var result=window.askForFilename(msg,path,file,mustExist); // requires #604
	if (target && result.length) // set target field and trigger handling
		{ target.value=result; target.onchange(); }
	return result; 
}
//}}}
// // }}}}}}// // {{block{
/***
!!!604 cross-platform askForFilename()
***/
// // {{groupbox small{
/***
http://trac.tiddlywiki.org/ticket/604 - OPEN
invokes a system-native secure 'file-chooser' dialog box to provide TiddlyWiki with access to a complete path+filename so that TW functions properly locate user-selected local files.
***/
//{{{
window.askForFilename=function(msg,path,file,mustExist) {
	var r = window.mozAskForFilename(msg,path,file,mustExist);
	if(r===null || r===false)
		r = window.ieAskForFilename(msg,path,file,mustExist);
	if(r===null || r===false)
		r = window.javaAskForFilename(msg,path,file,mustExist);
	if(r===null || r===false)
		r = prompt(msg,path+file);
	return r||'';
}

window.mozAskForFilename=function(msg,path,file,mustExist) {
	if(!window.Components) return false;
	try {
		netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
		var nsIFilePicker = window.Components.interfaces.nsIFilePicker;
		var picker = Components.classes['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);
		picker.init(window, msg, mustExist?nsIFilePicker.modeOpen:nsIFilePicker.modeSave);
		var thispath = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
		thispath.initWithPath(path);
		picker.displayDirectory=thispath;
		picker.defaultExtension='html';
		picker.defaultString=file;
		picker.appendFilters(nsIFilePicker.filterAll|nsIFilePicker.filterText|nsIFilePicker.filterHTML);
		if (picker.show()!=nsIFilePicker.returnCancel)
			var result=picker.file.path;
	}
	catch(ex) { displayMessage(ex.toString()); }
	return result;
}

window.ieAskForFilename=function(msg,path,file,mustExist) {
	if(!config.browser.isIE) return false;
	try {
		var s = new ActiveXObject('UserAccounts.CommonDialog');
		s.Filter='All files|*.*|Text files|*.txt|HTML files|*.htm;*.html|';
		s.FilterIndex=3; // default to HTML files;
		s.InitialDir=path;
		s.FileName=file;
		return s.showOpen()?s.FileName:'';
	}
	catch(ex) { displayMessage(ex.toString()); }
	return result;
}

window.javaAskForFilename=function(msg,path,file,mustExist) {
	if(!document.applets['TiddlySaver']) return false;
	// TBD: implement java-based askFile(...) function
	try { return document.applets['TiddlySaver'].askFile(msg,path,file,mustExist); } 
	catch(ex) { displayMessage(ex.toString()); }
}
//}}}
// // }}}}}}// // {{block{
/***
!!!657 wrap tabs onto multiple lines
***/
// // {{groupbox small{
/***
http://trac.tiddlywiki.org/ticket/657 - OPEN
This tweak inserts an extra space element following each tab, allowing them to wrap onto multiple lines if needed.
***/
//{{{
config.macros.tabs.handler = function(place,macroName,params)
{
	var cookie = params[0];
	var numTabs = (params.length-1)/3;
	var wrapper = createTiddlyElement(null,'div',null,'tabsetWrapper ' + cookie);
	var tabset = createTiddlyElement(wrapper,'div',null,'tabset');
	tabset.setAttribute('cookie',cookie);
	var validTab = false;
	for(var t=0; t<numTabs; t++) {
		var label = params[t*3+1];
		var prompt = params[t*3+2];
		var content = params[t*3+3];
		var tab = createTiddlyButton(tabset,label,prompt,this.onClickTab,'tab tabUnselected');
		createTiddlyElement(tab,'span',null,null,' ',{style:'font-size:0pt;line-height:0px'}); // ELS
		tab.setAttribute('tab',label);
		tab.setAttribute('content',content);
		tab.title = prompt;
		if(config.options[cookie] == label)
			validTab = true;
	}
	if(!validTab)
		config.options[cookie] = params[1];
	place.appendChild(wrapper);
	this.switchTab(tabset,config.options[cookie]);
};
//}}}
// // }}}}}}// // {{block{
/***
!!!628 hide 'no such macro' errors
***/
// // {{groupbox small{
/***
http://trac.tiddlywiki.org/ticket/628 - OPEN
When invoking a macro that is not defined, this tweak prevents the display of the 'error in macro... no such macro' message.  This is useful when rendering tiddler content or templates that reference macros that are defined by //optional// plugins that have not been installed in the current document.

<<option chkHideMissingMacros>> hide 'no such macro' error messages
***/
//{{{
if (config.options.chkHideMissingMacros===undefined)
	config.options.chkHideMissingMacros=false;

window.coreTweaks_missingMacro_invokeMacro = window.invokeMacro;
window.invokeMacro = function(place,macro,params,wikifier,tiddler) {
	if (!config.macros[macro] || !config.macros[macro].handler)
		if (config.options.chkHideMissingMacros) return;
	window.coreTweaks_missingMacro_invokeMacro.apply(this,arguments);
}
//}}}
// // }}}}}}
// // <<foldHeadings>>