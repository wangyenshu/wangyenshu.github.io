/***
|Name|StickyPopupPlugin|
|Source|http://www.TiddlyTools.com/#StickyPopupPlugin|
|Version|1.0.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|allow mouse interactions inside popups without automatically closing them|
Usually, when a TW popup is displayed, it is automatically closed whenever a click occurs //anywhere// in the document, either //inside// or //outside// the popup itself.  This plugin makes popups persistent (a.k.a, "sticky"), allowing you to perform multiple mouse interactions on content //inside// the popup (e.g., entering form fields, opening links, selecting text, etc.), remaining visible until you click //outside// the popup or perform an action that opens another popup (only one popup can be displayed at any given time).
!!!!!Configuration
<<<
You can cause popups to behave in a persistent ("sticky") manner simply by selecting the option checkbox below.  The selected popup display behavior will be applied to ALL popups in the document automatically.
><<option chkStickyPopups>> make all popups "sticky"
>{{{usage: <<option chkStickyPopups>>}}}
<<<
!!!!!Usage
<<<
If you are developing your own plugins or inline scripts that create popups programmatically using the core function:
{{{
Popup.create(this)
}}}
you can provide additional parameters that specify the desired CSS classname(s) to assign to the popup DOM element.  The default class when none is specified is simply "popup".  To create a //sticky// popup, simply enter a custom class combination like this:
{{{
Popup.create(this,null,"sticky popup")
}}}
<<<
!!!!!Revisions
<<<
2008.05.16 [1.0.1] added try..catch around addEvent/removeEvent calls to avoid error in Opera
2007.11.25 [1.0.0] initial release - moved from [[CoreTweaks]]
<<<
!!!!!Code
***/
//{{{
version.extensions.StickyPopupPlugin= {major: 1, minor: 0, revision: 1, date: new Date(2008,5,16)};

if (config.options.chkStickyPopups==undefined) config.options.chkStickyPopups=false;

Popup.stickyPopup_onDocumentClick = function(ev)
{
	// if click is in a sticky popup, ignore it so popup will remain visible
	var e = ev ? ev : window.event; var target = resolveTarget(e);
	var p=target; while (p) {
		if (hasClass(p,"popup") && (hasClass(p,"sticky")||config.options.chkStickyPopups)) break;
		else p=p.parentNode;
	}
	if (!p) // not in sticky popup (or sticky popups disabled)... use normal click handling
		Popup.onDocumentClick(ev);
	return true;
};
try{removeEvent(document,"click",Popup.onDocumentClick);}catch(e){};
try{addEvent(document,"click",Popup.stickyPopup_onDocumentClick);}catch(e){};
//}}}