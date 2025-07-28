/***
|Name|FramedLinksPlugin|
|Source|http://www.TiddlyTools.com/#FramedLinksPlugin|
|Version|1.1.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|clicking an external link opens an IFRAME following the link instead of opening a new tab/window|
This plugin causes clicks on external links to be rendered as inline frames (~IFRAMEs) instead of opening new browser tabs/windows.
!!!!!Usage
<<<
Use standard TiddlyWiki external link syntax into your tiddler content. If {{{chkFramedLinks}}} is enabled or the tiddler is tagged with 'framedLinks' (see Configuration), then whenever you click the external link an IFRAME will be dynamically added to the content.  Clicking on the link again removes the IFRAME.  Hold down any modifier (shift, control, or alt) while clicking a link ''temporarily'' bypasses the IFRAME handling and use the standard link handling behavior.
<<<
!!!!!Configuration
<<<
<<option chkFramedLinks>> display inline frames for all external links
&nbsp; &nbsp; {{{<<option chkFramedLinks>>}}}
<<option chkFramedLinksTag>> display inline frames for external links in tiddlers tagged with: <<option txtFramedLinksTag>> 
&nbsp; &nbsp; {{{<<option chkFramedLinksTag>> <<option txtFramedLinksTag>>}}}
IFRAME size (CSS units: %, em, px, cm, in) - width: <<option txtFrameWidth>> height: <<option txtFrameHeight>>
&nbsp; &nbsp; {{{<<option txtFrameWidth>> <<option txtFrameHeight>>}}}
<<<
!!!!!Examples
<<<
Try these links:
*http://www.TiddlyWiki.com
*http://www.TiddlyTools.com
*http://groups.google.com/group/TiddlyWiki/topics
<<<
!!!!!Revisions
<<<
2008.11.14 [1.1.1] fixed handling for external links embedded in //shadow// tiddlers
2008.09.13 [1.1.0] added support to selectively enable embedded IFRAMEs if the containing tiddler is tagged with 'framedLinks'
2007.11.29 [1.0.5] added slider animation and improved CSS handling for IFRAME height/width to maximize display area
2007.11.29 [1.0.0] initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.FramedLinksPlugin= {major: 1, minor: 1, revision: 1, date: new Date(2008,11,14)};

var co=config.options; // abbreviation
if (co.chkFramedLinks==undefined) co.chkFramedLinks=false;
if (co.chkFramedLinksTag==undefined) co.chkFramedLinksTag=true;
if (co.txtFramedLinksTag==undefined) co.txtFramedLinksTag="framedLinks";
if (co.txtFrameWidth==undefined) co.txtFrameWidth="100%";
if (co.txtFrameHeight==undefined) co.txtFrameHeight="80%";

window.framedLinks_createExternalLink=createExternalLink;
window.createExternalLink=function(place,url)
{
	var link=this.framedLinks_createExternalLink.apply(this,arguments);
	link.onclick=function(ev) { var e=ev?ev:window.event;
		var co=config.options; // abbreviation
		var here=story.findContainingTiddler(this);
		if (here) var tid=store.getTiddler(here.getAttribute("tiddler"));
		var enabled=co.chkFramedLinks || co.chkFramedLinksTag && tid && tid.isTagged(co.txtFramedLinksTag);
		if (!enabled || e.ctrlKey || e.shiftKey || e.altKey) return; // BYPASS
		var p=this.parentNode; 
		var f=this.nextSibling?this.nextSibling.firstChild:null; // get the IFRAME... maybe...
		var w=co.txtFrameWidth; if (!w || !w.length) w="100%";
		var h=co.txtFrameHeight; if (!h || !h.length) h="80%";
		if (h.indexOf("%")) h=(findWindowHeight()*h.replace(/%/,"")/100)+"px"; // calc height as % of window
		var showing=f && f.nodeName.toUpperCase()=="IFRAME"; // does IFRAME really exist?
		var stretchCell=p.nodeName.toUpperCase()=="TD" && w.indexOf("%")!=-1 && w.replace(/%/,"")>=100;
		if (!showing) { // create an iframe
			link.style.display="block"; // force IFRAME onto line following link
			if (stretchCell) { p.setAttribute("savedWidth",p.style.width); p.style.width="100%"; } // adjust TD so IFRAME stretches
			var wrapper=createTiddlyElement(null,"span"); // wrapper for slider animation
			wrapper.setAttribute("url",this.href); // for async loading of frame after animation completes
			var f=createTiddlyElement(wrapper,"iframe"); // create IFRAME
			f.style.backgroundColor="#fff"; f.style.width=w; f.style.height=h;
			p.insertBefore(wrapper,this.nextSibling);
			function loadURL(wrapper) { var f=wrapper.firstChild; var url=wrapper.getAttribute("url");
				var d=f.contentDocument?f.contentDocument:(f.contentWindow?f.contentWindow.document:f.document);
				d.open(); d.writeln("<html>connecting to "+url+"</html>"); d.close();
				try { f.src=url; } // if the iframe can't handle the href
				catch(e) { alert(e.description?e.description:e.toString()); } // ... then report the error
				window.scrollTo(0,ensureVisible(wrapper));
			}
			if (!co.chkAnimate) loadURL(wrapper);
			else {
				var morph=new Slider(wrapper,true);
				morph.callback=loadURL;
				morph.properties.push({style: 'width', start: 0, end: 100, template: '%0%'});
				anim.startAnimating(morph);
			}
		} else { // remove iframe
			link.style.display="inline"; // restore link style
			if (stretchCell) p.style.width=p.getAttribute("savedWidth"); // restore previous width of TD
			if (!co.chkAnimate) p.removeChild(f.parentNode);
			else {
				var morph=new Slider(f.parentNode,false,false,"all");
				morph.properties.push({style: 'width', start: 100, end: 0, template: '%0%'});
				anim.startAnimating(morph);
			}
		}
		e.cancelBubble=true; if (e.stopPropagation) e.stopPropagation(); return false;
	}
	return link;
}
//}}}