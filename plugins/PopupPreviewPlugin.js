/***
|Name|PopupPreviewPlugin|
|Source|http://www.TiddlyTools.com/#PopupPreviewPlugin|
|Version|1.2.0|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Requires|StickyPopupPlugin (optional, recommended)|
|Description|popup a formatted preview of a linked tiddler's content|
This plugin adds a custom 'shift-click' or mouseover handler to all tiddler links (or images with tiddler links) to display a popup with a fully-formatted preview of the linked tiddler's content.
!!!!!Usage
<<<
SHIFT-click to display a popup containing the fully-formatted content of the linked tiddler, in a fixed size, scrolling area.  Click anywhere to dismiss the popup.  Clicking on the link will open the tiddler in the normal manner.  If the linked tiddler contains a section named "preview", the popup displays that section content rather than the entire tiddler.  You can hide the "preview" section by enclosing it within comment markers ({{{/%...%/}}}) or a CSS wrapper ({{{@@display:none;...@@}}} or <html><nowiki><code>{{hidden{...}}}</code></html>) so that you can display alternative "summary" content in the popup preview while still showing the entire content when viewing the tiddler directly.
<<<
!!!!!Configuration
<<<
<<option chkPopupPreviews>> enable popup previews (shift-click)
{{{usage: <<option chkPopupPreviews>>}}}
<<option chkPopupPreviewMouseover>> show previews on mouseover (no click needed)
{{{usage: <<option chkPopupPreviewMouseover>>}}}
width of popup: <<option txtPopupPreviewWidth>> height of popup: <<option txtPopupPreviewHeight>>
//(width and height may be specified using any valid CSS units, e.g., "px", "em", "in", "cm", "%")//
{{{usage: <<option txtPopupPreviewWidth>> <<option txtPopupPreviewHeight>>}}}
preview section name: <<option txtPopupPreviewSection>>
{{{usage: <<option txtPopupPreviewSection>>}}}
<<<
!!!!!Preview
<<<
The contents of this section are displayed when SHIFT-clicking on a link to [[PopupPreviewPlugin]].  This section can be hidden using comment markers or a CSS wrapper so that alternative, "summary" content can be displayed in the popup.
<<<
!!!!!Revisions
<<<
2012.05.23 1.2.0 added chkPopupPreviewSection (for showing summary content in popup)
2011.09.22 1.1.1 fixed default setting for chkPopupPreviewMouseover
2009.09.22 1.1.0 added chkPopupPreviewMouseover option
2007.11.19 1.0.0 fixed handling for imageLinks ('tiddlylink' attrib is on the *parentNode* of target image element)
2007.11.10 0.5.0 alpha development - use with care
<<<
!!!!!Code
***/
//{{{
version.extensions.PopupPreviewPlugin= {major: 1, minor: 2, revision: 0, date: new Date(2012,5,23)};

var co=config.options; // abbrev
if (co.chkPopupPreviews===undefined) co.chkPopupPreviews=true;
if (co.txtPopupPreviewWidth==undefined) co.txtPopupPreviewWidth="50%";
if (co.txtPopupPreviewHeight==undefined) co.txtPopupPreviewHeight="10em";
if (co.chkPopupPreviewMouseover===undefined) co.chkPopupPreviewMouseover=false;
if (co.txtPopupPreviewSection===undefined) co.txtPopupPreviewSection="Preview";


if (window.popupPreview_createTiddlyLink===undefined) { // only once
window.popupPreview_createTiddlyLink=window.createTiddlyLink;
window.createTiddlyLink=function()
{
	var btn=this.popupPreview_createTiddlyLink.apply(this,arguments);
	var handler=config.options.chkPopupPreviewMouseover?'onmouseover':'onclick';
	btn.savedHandler=btn[handler];
	btn[handler]=function(e) {
		var co=config.options; // abbrev
		if (!e) var e=window.event; var theTarget=resolveTarget(e);
		if (!e.shiftKey&&!co.chkPopupPreviewMouseover || !co.chkPopupPreviews) 
			return this.savedHandler?this.savedHandler.apply(this,arguments):false;
		else { // show tiddler preview if enabled and SHIFT is pressed
			var tid=theTarget.getAttribute("tiddlylink");
			if (!tid) tid=theTarget.parentNode.getAttribute("tiddlylink"); // for "imageLink"
			var text=store.getTiddlerText(tid+"##"+co.txtPopupPreviewSection,store.getTiddlerText(tid));
			if (text && text.length) {
				var popup = Popup.create(this,null,"sticky popup");
				popup.style.width=co.txtPopupPreviewWidth;
				popup.style.padding=".5em";
				var msg="%0 %1".format([tid,config.views.wikified.shadowModifier]);
				var tiddler=store.getTiddler(tid); if (tiddler) msg=tiddler.getSubtitle();
				wikify("@@display:block;font-size:80%;line-height:110%;"+msg+"@@",popup);
				var div=createTiddlyElement(popup,"DIV",null,"popupPreview viewer");
				div.style.overflow="auto"; 
				div.style.whiteSpace="normal";
				div.style[config.browser.isIE?'height':'maxHeight']=co.txtPopupPreviewHeight;
				wikify(text,div);
				Popup.show('bottom','left');
			}
			e.cancelBubble=true; if (e.stopPropagation) e.stopPropagation(); return false;
		}
	}
	return btn;
}
}
//}}}