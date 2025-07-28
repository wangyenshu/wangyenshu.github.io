/***
|Name|TextAreaPlugin|
|Source|http://www.TiddlyTools.com/#TextAreaPlugin|
|Documentation|http://www.TiddlyTools.com/#TextAreaPluginInfo|
|Version|2.3.0|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|Adds Find/Again keyboard search, autosize, and 'stretch bar' resize for textarea controls|
!!!!!Documentation
>see [[TextAreaPluginInfo]]
!!!!!Configuration
<<<
<<option chkTextAreaExtensions>> use control-f (find), control-g (find again) inside text area
<<option chkDisableAutoSelect>> place cursor at start of textarea instead of pre-selecting content
<<option chkResizeEditor>> modify shadow EditTemplate to add resizeable text area (and autosize command)
<<<
!!!!!Revisions
<<<
2011.10.28 2.3.0 added resizeHere macro to add stretch bar to current container (e.g., sidebar panels)
|please see [[TextAreaPluginInfo]] for additional revision details|
2006.01.22 1.0.0 Moved from temporary "System Tweaks" tiddler into 'real' TextAreaPlugin tiddler.
<<<
!!!!!Code
***/
//{{{
version.extensions.TextAreaPlugin= {major: 2, minor: 3, revision: 0, date: new Date(2011,10,28)};

if (config.options.chkTextAreaExtensions===undefined) config.options.chkTextAreaExtensions=true;
if (config.options.chkDisableAutoSelect===undefined) config.options.chkDisableAutoSelect=true;
if (config.options.chkResizeEditor===undefined) config.options.chkResizeEditor=true;

// automatically tweak shadow EditTemplate to add "autosizeEditor" toolbar command
if (config.options.chkResizeEditor)
	config.shadowTiddlers.EditTemplate=config.shadowTiddlers.EditTemplate.replace(/deleteTiddler/,"deleteTiddler autosizeEditor");
// automatically tweak shadow EditTemplate to add "resizeEditor" macro
if (config.options.chkResizeEditor)
	config.shadowTiddlers.EditTemplate+="<span macro='resizeEditor'></span>";

// Put focus in a specified tiddler field
Story.prototype.TextAreaExtensions_focusTiddler=Story.prototype.focusTiddler;
Story.prototype.focusTiddler = function(title,field)
{
	this.TextAreaExtensions_focusTiddler.apply(this,arguments); // first call core
	var e = this.getTiddlerField(title,field);
	if (e && config.options.chkDisableAutoSelect) {
		if (e.setSelectionRange) // FF
			e.setSelectionRange(0,0);
		else if (e.createTextRange) // IE
			{ var r=e.createTextRange(); r.collapse(true); r.select(); }
	}
	if (e && config.options.chkTextAreaExtensions) addKeyDownHandlers(e);
}
//}}}

//{{{
function addKeyDownHandlers(e)
{
	// exit if not textarea or element doesn't allow selections
	if (e.tagName.toLowerCase()!="textarea"||!e.setSelectionRange||e.initialized) return;

	// utility function: exits keydown handler and prevents browser from processing the keystroke
	var processed=function(ev) {
		ev.cancelBubble=true; // IE4+
		try{event.keyCode=0;}catch(e){}; // IE5
		if (window.event) ev.returnValue=false; // IE6
		if (ev.preventDefault) ev.preventDefault(); // moz/opera/konqueror
		if (ev.stopPropagation) ev.stopPropagation(); // all
		return false;
	}
	// capture keydown in edit field
	e.saved_onkeydown=e.onkeydown; // save current keydown handler (if any)
	e.onkeydown=function(ev) { if (!ev) var ev=window.event;
		var key=ev.keyCode;
		if (!key) {
			var char=event.which?event.which:event.charCode;
			if (char==102) key=70;
			if (char==103) key=71;
		}
		// process CTRL-F (find matching text) or CTRL-G (find next match)
		if (ev.ctrlKey && (key==70||key==71)) {

			// prompt for text to find
			var defFind=e.findText?e.findText:e.value.substring(e.selectionStart,e.selectionEnd);
			if (key==70||!e.findText||!e.findText.length) // ctrl-f or no saved search text
				{ var f=prompt("find:", defFind); e.focus(); if (f) e.findText=f; }
			if (!e.findText||!e.findText.length) return processed(ev); //  if no search text, exit

			// do case-insensitive match with 'wraparound'...  if not found, alert and exit 
			var newstart=e.value.toLowerCase().indexOf(e.findText.toLowerCase(),e.selectionStart+1);
			if (newstart==-1) newstart=e.value.toLowerCase().indexOf(e.findText.toLowerCase());
			if (newstart==-1) { alert("'"+e.findText+"' not found"); e.focus(); return processed(ev); }

			// set new selection, scroll it into view, and report line position in status bar
			e.setSelectionRange(newstart,newstart+e.findText.length);
			var linecount=e.value.split('\n').length;
			var thisline=e.value.substr(0,e.selectionStart).split('\n').length;
			e.scrollTop=Math.floor((thisline-1-e.rows/2)*e.scrollHeight/linecount);
			window.status="line: "+thisline+"/"+linecount;
			return processed(ev);
		}
		if (e.saved_onkeydown) // call previous keydown handler (if any)
			e.saved_onkeydown(ev);
	}
	e.initialized=true;
}
//}}}

// // 'autosize' toolbar command
//{{{
config.commands.autosizeEditor = {
	text: 'autosize',
	tooltip: 'automatically adjust the editor height to fit the contents',
	text_alt: '\u221Aautosize',
	hideReadOnly: false,
	handler: function(event,src,title) {
		var here=story.findContainingTiddler(src); if (!here) return;
		var ta=here.getElementsByTagName('textarea'); if (!ta) return;
		for (i=0;i<ta.length;i++) {
			// only autosize textareas actually used to edit tiddler fields
			if (ta[i].getAttribute("edit")==undefined) continue;
			ta[i].button=src;
			if (!ta[i].maxed)
				config.commands.autosizeEditor.on(ta[i]);
			else
				config.commands.autosizeEditor.off(ta[i],true);
		}
		return false;
	},
	on: function(e) {
		if (e.maxed) return; // already autosizing!
		if (e.savedheight==undefined)
			e.savedheight=e.style.height;
		if (e.savedkeyup==undefined) {
			e.savedkeyup=e.onkeyup;
			e.onkeyup=function(ev) {
				if (!ev) var ev=window.event; var e=resolveTarget(ev);
				e.style.height=e.scrollHeight+'px';
				if (e.savedkeyup) e.savedkeyup();
			}
		}
		// IE reports error: "not implemented" for onkeypress
		if (!config.browser.isIE && e.savedkeypress==undefined) {
			e.savedkeypress=e.onkeypress;
			e.onkeypress=function(ev) {
				if (!ev) var ev=window.event; var e=resolveTarget(ev);
				if (ev.keyCode==33) { // PGUP
					if (window.scrollByPages) window.scrollByPages(-1);
					return false;
				}
				if (ev.keyCode==34) { // PGDN
					if (window.scrollByPages) window.scrollByPages(1);
					return false;
				}
				if (e.savedkeypress) e.savedkeypress();
			}
		}
		e.style.height=e.scrollHeight+'px';
		if (e.button) e.button.innerHTML=config.commands.autosizeEditor.text_alt;
		e.maxed=true;
	},
	off: function(e,resetHeight) {
		if (resetHeight) e.style.height=e.savedheight;
		e.onkeyup=e.savedkeyup;
		// IE reports error: "not implemented" for onkeypress
		if (!config.browser.isIE) e.onkeypress=e.savedkeypress;
		if (e.button) e.button.innerHTML=config.commands.autosizeEditor.text;
		e.maxed=false;
	}
};

config.macros.autosizeEditor={
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var here=story.findContainingTiddler(place); if (!here) return;
		var ta=here.getElementsByTagName('textarea'); if (!ta) return;
		for (i=0;i<ta.length;i++) {
			// only autosize textareas actually used to edit tiddler fields
			if (ta[i].getAttribute("edit")==undefined) continue;
			config.commands.autosizeEditor.on(ta[i]);
		}
		return false;
	}
}
//}}}

// // grab-and-stretch handle
//{{{
config.macros.resizeEditor = { // add stretch bar to editor textarea
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var here=story.findContainingTiddler(place); if (!here) return;
		var ta=here.getElementsByTagName('textarea');
		if (ta) for (i=0;i<ta.length;i++) {
			// only resize tiddler editor textareas
			if (ta[i].getAttribute("edit")==undefined) continue;
			new window.TextAreaResizer(ta[i]);
		}
	}
}

config.macros.resizeTiddler = { // add stretch bar to tiddler viewer element
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var here=story.findContainingTiddler(place); if (!here) return;
		var elems=here.getElementsByTagName('div');
		if (elems) for (i=0;i<elems.length;i++) if (hasClass(elems[i],'viewer')) break;
		if (i<elems.length) new window.TextAreaResizer(elems[i]);
	}
}

config.macros.resizeFrame = { // add stretch bar to iframes
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var here=story.findContainingTiddler(place); if (!here) return;
		var fr=here.getElementsByTagName('iframe');
		if (fr) for (i=0;i<fr.length;i++) new window.TextAreaResizer(fr[i]);
	}
}

config.macros.resizeListbox = { // add stretch bar to listbox controls
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var here=story.findContainingTiddler(place); if (!here) here=place;
		var fr=here.getElementsByTagName('select');
		if (fr) for (i=0;i<fr.length;i++) new window.TextAreaResizer(fr[i]);
	}
}

config.macros.resizeHere = { // add stretch bar to containing element
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		new window.TextAreaResizer(place);
	}
}

// TextAreaResizer script by Jason Johnston (jj@lojjic.net)
// Created August 2003.  Use freely, but give me credit.
// adds a handle below textareas that the user can drag with the mouse to resize the textarea.
// MODIFIED by ELS for use with TW

window.TextAreaResizer = function(elt) {
	this.element = elt;
	this.create();
}
window.TextAreaResizer.prototype = {
	create : function() {
		var elt = this.element;
		var thisRef = this;
		var h = this.handle = document.createElement("div");
		h.style.height = "3px"; // was 4px... looked too fat!
		h.style.overflow = "hidden"; // ELS: force IE to trim height to < 1em
		var adjust=elt.nodeName=='textarea'?4:0;  // 4 pixels for textarea border edge
//		h.style.width=(elt.offsetWidth-adjust)+"px";
		h.style.width="auto";
		h.style.backgroundColor = "#999"; // ELS: standard mid-tone (dark) gray
		h.style.cursor = "s-resize";
		h.title = "Drag to resize text box";
		h.onmousedown=function(evt){thisRef.dragStart(evt)};
		elt.parentNode.insertBefore(h, elt.nextSibling);
	},
	dragStart : function(evt) {
		if (!evt) var evt=window.event;
		this.dragStop(evt); // ELS: stop any current drag processing first
		var thisRef = this;
		this.dragStartY = evt.clientY;
		this.dragStartH = this.element.offsetHeight;
		document.savedmousemove=document.onmousemove;
		document.onmousemove=this.dragMoveHdlr=function(evt){thisRef.dragMove(evt)};
		document.savedmouseup=document.onmouseup;
		document.onmouseup=this.dragStopHdlr=function(evt){thisRef.dragStop(evt)};
	},
	dragMove : function(evt) {
		if (!evt) var evt=window.event;
		// ELS: make sure height is at least 10px
		var h=this.dragStartH+evt.clientY-this.dragStartY;
		if (h<10) h=10; this.element.style.height=h+"px";
		// ELS: match handle to textarea width (which may have changed due to document scrollbars)
//		var adjust=this.element.nodeName.toLowerCase()=='textarea'?4:0; // 4 pixels for textarea
//		this.handle.style.width=(this.element.offsetWidth-adjust)+"px";
		// ELS: when manually resizing, disable autoresizing (without restoring saved height)
		if (this.element.maxed!=undefined && this.element.maxed)
			config.commands.autosizeEditor.off(this.element,false);
	},
	dragStop : function(evt) {
		if (!evt) var evt=window.event;
		document.onmousemove=(document.savedmousemove!=undefined)?document.savedmousemove:null;
		document.onmousemove=(document.savedmouseup!=undefined)?document.savedmouseup:null;
	},
	destroy : function() {
		var elt = this.element;
		elt.parentNode.removeChild(this.handle);
		elt.style.height = "";
	}
};
//}}}