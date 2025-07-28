/***
|Name|SetIconPlugin|
|Source|http://www.TiddlyTools.com/#SetIconPlugin|
|Documentation|http://www.TiddlyTools.com/#SetIconPluginInfo|
|Version|1.9.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.3|
|Type|plugin|
|Description|add an image to a toolbar, macro, or slider link|
!!!!!Documentation
>see [[SetIconPluginInfo]]
!!!!!Configuration
<<<
<<option chkIconsShowImage>> show images on links
<<option chkIconsShowText>> include link text with images
default image style: {{stretch{<<option txtIconsCSS>>}}}
<<<
!!!!!Revisions
<<<
2011.10.02 1.9.1 use plain text instead of innerHTML for link tooltips
2011.10.02 1.9.0 added 'find:...' macro param (for use with tabsets)
| see [[SetIconPluginInfo]] for additional revision details |
2008.05.09 1.0.0 initial release (as inline script)
<<<
!!!!!Code
***/
//{{{
version.extensions.SetIconPlugin= {major: 1, minor: 9, revision: 1, date: new Date(2011,10,2)};

if (config.options.chkIconsShowImage===undefined)
	config.options.chkIconsShowImage=true;
if (config.options.chkIconsShowText===undefined)
	config.options.chkIconsShowText=true;
if (config.options.txtIconsCSS===undefined)
	config.options.txtIconsCSS="vertical-align:middle;width:auto;height:auto";

config.macros.setIcon = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		if (!config.options.chkIconsShowImage) return; // text-only - do nothing
		var src=params[0]; if (!src) return;  // no image src specified - do nothing
		var p=paramString.parseParams('name',null,true,false,true);
		var label=getParam(p,'find'); if (label) params.shift(); // optional find:"..."
		var css=params[1]; if (!css||!css.length) css=config.options.txtIconsCSS;
		var after=params[2]&&params[2].toUpperCase()=="RIGHT";
		var notext=params[2]&&params[2].toUpperCase()=="NOTEXT";

		// find nearest link element
		var btn=place.lastChild; // look for sibling link
		while (btn && (btn.nodeName!="A" || label&&!btn.innerHTML.startsWith(label)))
			btn=btn.previousSibling;
		if (!btn) { // look for child link
			var links=place.getElementsByTagName("A");
			for (var i=links.length-1; i>=0; i--)
				if (!label || links[i].innerHTML.startsWith(label)) { btn=links[i]; break; }
		}
		if (!btn) { // look for parent link
			var btn=place.parentNode.lastChild;
			while (btn && (btn.nodeName!="A" || label&&!btn.innerHTML.startsWith(label)))
				btn=btn.previousSibling;
		}
		if (!btn) { // look for cousin link (e.g. TABS in TABSETS)
			var links=place.parentNode.getElementsByTagName("A");
			for (var i=links.length-1; i>=0; i--)
				if (!label || links[i].innerHTML.startsWith(label)) { btn=links[i]; alert('found'); break; }
		}
		if (!btn) return; // can't find a link - do nothing

		// set icon and command text/tip
		var txt=btn.innerHTML; var tip=getPlainText(btn);
		if (config.macros.attach && config.macros.attach.isAttachment(src))
			src=config.macros.attach.getAttachment(src); // retrieve attachment (if any)
		btn.innerHTML="<img src='"+src+"' style='"+css+"'>";
		if (config.options.chkIconsShowText && !notext)
			btn.innerHTML=after?txt+btn.innerHTML:btn.innerHTML+txt;
		else
			btn.title=tip+" - "+btn.title; // add text to tooltip

		// adjust nested slider button text/tip
		if (btn.getAttribute("closedtext")!=null) {
			btn.setAttribute("closedtext",btn.innerHTML);
			btn.setAttribute("openedtext",btn.innerHTML);
			if (!config.options.chkIconsShowText || notext) {
				btn.setAttribute("closedtip",txt.toUpperCase()+": "+btn.getAttribute("closedtip"));
				btn.setAttribute("openedtip",txt.toUpperCase()+": "+btn.getAttribute("openedtip"));
			}
		}
	}
};
//}}}