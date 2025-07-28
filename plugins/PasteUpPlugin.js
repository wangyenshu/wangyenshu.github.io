/***
|Name|[[PasteUpPlugin]]|
|Source|http://www.TiddlyTools.com/#PasteUpPlugin|
|Version|1.3.2|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.5|
|Type|plugin|
|~SeeAlso|[[EditSectionPlugin]] [[PasteUpHelperPlugin]]|
|Description|position/size embedded content with edit-in-place popup editor|
!!!Documentation
> see [[PasteUpPluginInfo]]
!!!Example/Test
<<<
{{{<<tiddler PasteUpPlugin##test style:"border:1px solid blue;color:black;background:white;" edit adjust x:115px y:18px w:190px h:75px>>}}}
<<tiddler PasteUpPlugin##test style:"border:1px solid blue;color:black;background:white;" edit adjust x:115px y:18px w:190px h:75px>>/%
!test
test this content
line 2
line 3
line 4
!end
%/
<<<
!!!Configuration
<<<
<<option chkPasteUpConfirmRemove>>ask for confirmation before removing a part from a page
{{{<<option chkPasteUpConfirmRemove>>}}}
<<option chkPasteUpBoundaryWarning>>warn when an element is moved/sized outside it's container
{{{<<option chkPasteUpBoundaryWarning>>}}}
<<option chkPasteUpEditAll>>automatically enable editing for all embedded content (unless ''noedit'' is used)
{{{<<option chkPasteUpEditAll>>}}}

Also see:
*[[PasteUpConfig]] and related shadows:
**[[DefaultPage]], [[DefaultPart]], [[PasteUpStyleSheet]]
*[[EditSectionPlugin]] (optional, recommended) and related shadows:
**[[EditSectionTemplate]]
*[[PasteUpHelperPlugin]] (optional, recommended) and related shadows:
**[[PasteUpHelperTemplate]], [[PasteUpStyleList]], [[PasteUpFontList]], [[PasteUpImageList]]
<<<
!!!Revisions
<<<
2012.01.29 1.3.2 invoke autoSaveChanges() whenver tiddlers are modified.  Also, when moving a part, calls to displayMessage() to show current position now uses 'noLog' flag (see [[MessageLogPlugin]])
2012.01.08 1.3.1 re-factored clickAction()/dblClickAction() for easier customization and fallback handling when EditSectionPlugin is not installed
2011.12.27 1.3.0 in dragSave(), addPart() and removePart(), handle {{{[[partnames with spaces]]}}} when generating/matching embedded part syntax
2011.09.15 1.2.9 in dragSave(), fixed called to story.refreshTiddler(title...)
2011.09.06 1.2.8 in removePart(), added 'force' param (for use by PasteUpHelperPlugin)
2011.09.04 1.2.7 in dragSave(), support setting of non-default z-Index (default index is "1")
2011.09.03 1.2.6 in setCursor() and isStretch(), only resize if inside pasteup element (i.e, not within an overflow child element)
2011.08.05 1.2.5 in addPasteUpPart(), use "window.readOnly" for IE compatibility
2011.08.02 1.2.4 refactored click() handler and added clickAction(). Moved createMenu() and renderMenu() to [[PasteUpHelperPlugin]]
2011.08.02 1.2.3 in click(), check for existing popup and close it instead (i.e., 'toggle popup display')
2011.08.01 1.2.2 refactored form handling (see [[EditSectionPlugin]]) to support type-specific forms by [[PasteUpHelperPlugin]]
2011.07.23 1.2.1 added chkPasteUpNoMenuLink option and misc code cleanup
2011.07.23 1.2.0 Use edge/corner detect for resize.  Added popup menu.  Cleanup cursor handling.  Fix getMX/getMY for Safari/Webkit
2011.06.19 1.1.3 internal CSS shadow renamed to PasteUpPluginStyles
2011.06.13 1.1.2 in mousedown(), use removeAllPanels instead of Popup.remove
2011.06.10 1.1.1 in dragsave(), skip 'outofbounds' check if message text is blank
2011.06.08 1.1.0 added removePart() handler
2011.06.05 1.0.14 added TiddlySpace cloneFields() to save handlers so editing content automatically copies/owns an included tiddler
2011.05.17 1.0.13 in dragsave(), don't check for out of bounds if container is a pasteUp part itself
2011.05.05 1.0.12 in dragsave(), added custom undo messages (requires UndoPlugin)
2011.05.01 1.0.11 in dragsave(), added "out of bounds" confirmation
2011.02.23 1.0.10 mousetracking: in capture(), invoke release() first (fix for Chrome 'sticky drag' problem?)
2011.02.08 1.0.9 when saving new tiddlers, use config.defaultCustomFields for TiddlySpace compatibility
2011.01.30 1.0.8 in addPart(), retain existing tags when adding part to current tiddler
2011.01.12 1.0.7 in handler(), make sure tiddler element was actually rendered
| Please see [[PasteUpPluginInfo]] for previous revision details |
2010.07.21 0.7.5 alpha prototype (for review - do not distribute)
<<<
!!!Code
***/
// // PLUGIN VERSION
//{{{
version.extensions.PasteUpPlugin= {major: 1, minor: 3, revision: 2, date: new Date(2012,1,29)};
//}}}
// // OPTIONS
//{{{
if (config.options.chkPasteUpEditAll===undefined)		config.options.chkPasteUpEditAll=false;
if (config.options.chkPasteUpConfirmRemove===undefined)		config.options.chkPasteUpConfirmRemove=true;
if (config.options.chkPasteUpBoundaryWarning===undefined)	config.options.chkPasteUpBoundaryWarning=false;

//}}}
// // MACRO DEFINITION
//{{{
config.macros.pasteUp = {
	editMenuTxt:	'edit part...',
	editMenuTip:	'Edit the content for this part',
	removeMenuTxt:	'remove part...',
	removeMenuTip:	'Remove this part from the current page',
	outofboundsmsg: 'Item is outside the visible area of the layout.  Press OK to allow.',
	confirmremovemsg: 'Are you sure you want to remove part "%0" from page "%1"?',
	edgeDetect:	10,	// PIXELS FOR CORNER/BORDER DETECT
	quiet:		false,	// TRUE = SHOW POS/SIZE DURING DRAG
	debug:		false,	// TRUE = SHOW POS/SIZE AFTER DRAG
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var cmp=config.macros.pasteUp; // abbrev

		// UNPACK PARAMS
		var edit=params.contains('edit')||macroName=='pasteUp'||config.options.chkPasteUpEditAll;
		var noedit=params.contains('noedit');
		var adjust=params.contains('adjust')||macroName=='pasteUp';
		var noadjust=params.contains('noadjust');
		var nopopup=params.contains('nopopup');
		var p=paramString.parseParams('name',null,true,false,true);
		var style=getParam(p,'style');
		var CSSclass=getParam(p,'class');
		var x=getParam(p,'x');
		var y=getParam(p,'y');
		var z=getParam(p,'z');
		var w=getParam(p,'w');
		var h=getParam(p,'h');

		// FIXUP for '##section' references (use current tiddler, if any)
		var sep='##'; var parts=params[0].split(sep);
		var tid=parts[0]; var sec=parts[1];
		var pasteupParams=paramString; // save unmodified params
		if (!tid && sec) {
			var here=story.findContainingTiddler(place)
			var tid=here?here.getAttribute('tiddler'):tiddler?tiddler.title:'';
			arguments[2][0]=tid+sep+sec;
			arguments[4]=paramString.replace(new RegExp(sep+sec),tid+sep+sec);
		}

		// RENDER CONTENT (CORE HANDLER) and GET RESULTING OBJECTS
		cmp.core_handler.apply(config.macros.tiddler,arguments);
		var e=place.lastChild; // rendered tiddler element
		if (!e || !e.getAttribute) return; // element not rendered!
		var t=e.getAttribute('tiddler'); // source title
		if (!t) return; // not a tiddler element!
		var s=e.style; // CSS styles
		e.setAttribute('tid',t); // needed by EditSectionPlugin

		// SET optional CUSTOM CLASS, STYLES, and/or DIRECT POS/SIZE
		if (CSSclass) addClass(e,CSSclass);
		if (style) {
			var parts=style.split(';');
			for (var i=0; i<parts.length; i++) {
				var name=(parts[i].split(':')[0]||'').trim();
				var val =(parts[i].split(':')[1]||'').trim();
				if (name.length && val.length) jQuery(e).css(name,val);
			}
		}
		s.left=x||s.left; s.top=y||s.top; s.zIndex=z||s.zIndex||1;
		s.width=w||s.width; s.height=h||s.height;

		// PASTEUP or NON-DEFAULT POSITION
		function def(e,a) { return (['auto','0px',''].contains(jQuery(e).css(a))); }
		if (macroName=='pasteUp' || !def(e,'left') || !def(e,'top')) {
			e.style.position='absolute'; // ALLOW ELEMENT TO BE POSITIONED
			if (e.parentNode.style.position!='absolute') // FIXUP PARENT FOR RELATIVE OFFSETS
				e.parentNode.style.position='relative';
		}

		// PASTEUP = ALLOW EDIT/ADJUST BY DEFAULT
		if (macroName=='pasteUp') { edit=true; adjust=true; }

		e.editable=edit&&!noedit;
		e.adjustable=adjust&&!noadjust;
		if (readOnly) return; // READONLY = DONE

		// TOOLTIP, CURSOR DEFAULT CONTENT, OUTLINE on hover, add PASTEUP CLASS
		if (e.editable||e.adjustable) {
			e.title=cmp.tooltip(e);				// TOOLTIP = source name
			e.style.cursor='pointer';			// DEFAULT CURSOR = pointer
			if (e.innerHTML=='') wikify('[['+t+']]',e);	// DEFAULT CONTENT = [[source]]
			e.onmouseover=cmp.mouseover;			// SHOW OUTLINE
			e.onmousemove=cmp.mousemove;			// SET CURSOR
			e.onmouseout =cmp.mouseout;			// HIDE OUTLINE
			addClass(e,'pasteUp');
		}

		// EDITABLE = CLICK/DOUBLE-CLICK
		e.helptext='';
		if (e.editable) {
			e.nopopup=nopopup||!config.macros.editSection;
			e.onclick    =cmp.click;
			e.ondblclick =cmp.dblclick;
			if (config.options.chkPasteUpHelper) // PasteUpHelperPlugin
				e.helptext+=', CLICK=menu, SHIFT-CLICK=edit';
			else // EditSectionPlugin (w/o helper) or standard tiddler editor
				e.helptext+=', CLICK=edit';
		}

		// ADJUSTABLE = DRAG/SHIFT-DRAG
		if (e.adjustable) {
			e.pasteupParams=pasteupParams; // used in dragsave() to find matching macro
			e.onmousedown=cmp.mousedown;	// DRAG = MOVE/STRETCH
			e.helptext+=', DRAG=move, LOWER-RIGHT CORNER or SHIFT-DRAG=resize';
		}
		e.title+=e.helptext;
	},
//}}}
// // GENERAL UTILITIES
//{{{
	tooltip: function(e) { // tooltip for embedded elements shows source name
		return e.getAttribute('tiddler'); // source title
	},
	getCSS: function(e,px,css) { // CONVERT element px values into CSS units
		var u=css.replace(/[0-9\.-]*/,''); if (u=='auto'||u=='') u='px'; // get CSS units
		var t=createTiddlyElement(e.parentNode,'div');
		t.style.width='1'+u;
		var r=Math.round(px/t.offsetWidth*10)/10; // round to one decimal place
		t.parentNode.removeChild(t);
		return r+u;
	},
	getMX: function(ev) { ev=ev||window.event; // GET MOUSE X
		if (config.browser.isIE)	return ev.clientX+findScrollX();// IE
		if (config.browser.isSafari) 	return ev.pageX+findScrollX(); 	// Webkit
		else				return ev.pageX;		// Firefox/other
	},
	getMY: function(ev) { ev=ev||window.event; // GET MOUSE Y
		if (config.browser.isIE)	return ev.clientY+findScrollY();// IE
		if (config.browser.isSafari) 	return ev.pageY+findScrollY();	// Webkit
		else				return ev.pageY;		// Firefox/other
	},
	ok: function(ev) { ev=ev||window.event; // HANDLE EVENT
		ev.cancelBubble=true; if(ev.stopPropagation) ev.stopPropagation(); return false;
	},
	getTrack: function(here) { // GET DRAG ELEMENT
		var track=here; // if 'capture' not supported, track in element only
		if (document.body.setCapture) var track=document.body; // IE
		if (window.captureEvents) var track=window; // moz
		return track;
	},
	capture: function () { // CAPTURE MOUSE
		this.release(); // make sure we aren't already tracking
		if (document.body.setCapture) document.body.setCapture(); // IE
		if (window.captureEvents) window.captureEvents(Event.MouseMove|Event.MouseUp,true); // moz
	},
	release: function () { // RELEASE MOUSE
		if (document.body.releaseCapture) document.body.releaseCapture(); // IE
		if (window.releaseEvents) window.releaseEvents(Event.MouseMove|Event.MouseUp); // moz
	},
	setCursor: function(here,ev) { ev=ev||window.event; // SET CURSOR FOR ELEMENT
		var x=this.getMX(ev); var y=this.getMY(ev);
		var left=findPosX(here); var top=findPosY(here);
		var width=here.offsetWidth; var height=here.offsetHeight; var size=this.edgeDetect;
		var isB=(top+height-y>0 && top+height-y<size);
		var isR=(left+width-x>0 && left+width-x<size);
		var c=((isB&&isR)||ev.shiftKey)?'se-resize':isB?'s-resize':isR?'e-resize':'pointer';
		here.style.cursor=c;
	},
	isStretch: function(here,ev) { ev=ev||window.event; // LOWER-RIGHT CORNER FOR STRETCH
		var x=this.getMX(ev); var y=this.getMY(ev);
		var left=findPosX(here); var top=findPosY(here);
		var width=here.offsetWidth; var height=here.offsetHeight; var size=this.edgeDetect;
		var isB=(top+height-y>0 && top+height-y<size);
		var isR=(left+width-x>0 && left+width-x<size);
		return isB||isR||ev.shiftKey;
	},
//}}}
// // MOUSE HANDLERS (click/dblclick,mouseover/mousemove/mouseout)
//{{{
	click: function(ev) { ev=ev||window.event;
		var cmp=config.macros.pasteUp; // abbrev
		cmp.release(); // stop tracking mousemove
		if (Popup.stack.length) { Popup.remove(); return cmp.ok(ev); } // close popup (if any)
		if (!this.changed) cmp.clickAction(this,ev); // ignore click if after move/stretch
		this.changed=false;
		return cmp.ok(ev);
	},
	clickAction: function(here,ev) { // EDIT IN POPUP (use EditSectionPlugin)
		if (here.nopopup || ev.shiftKey) 
			config.macros.pasteUp.dblClickAction(here,ev); // FALLBACK TO NORMAL EDIT
		else
			config.macros.editSection.click.call(here,ev,'all');
	},
	dblclick: function(ev) { ev=ev||window.event;
		var cmp=config.macros.pasteUp; // abbrev
		cmp.dblClickAction(this,ev);
		return cmp.ok(ev);
	},
	dblClickAction: function(here,ev) { // EDIT IN TIDDLER (normal edit)
		var t=here.getAttribute('tiddler').split('##')[0];
		story.displayTiddler(story.findContainingTiddler(this),t,DEFAULT_EDIT_TEMPLATE);
	},
	mouseover: function(ev) { ev=ev||window.event; // SHOW OUTLINE
		addClass(this,'pasteUpBorder');
		return config.macros.pasteUp.ok(ev);
	},
	mousemove: function(ev) { ev=ev||window.event; // SET CURSOR
		config.macros.pasteUp.setCursor(this,ev);
		return true; // NOTE: ALLOW EVENT TO BUBBLE
	},
	mouseout: function(ev) { ev=ev||window.event; // HIDE OUTLINE
		removeClass(this,'pasteUpBorder');
		return config.macros.pasteUp.ok(ev);
	},
//}}}
// // MOUSE DRAG HANDLERS (down,move,up,keyup)
//{{{
	mousedown: function(ev) { ev=ev||window.event; // MOVE/STRETCH
		var cmp=config.macros.pasteUp; // abbrev

		// if popup is showing, close popup and ignore click 
		if (jQuery('.editSectionPanel').length)
			{ config.macros.editSection.removeAllPanels(); return cmp.ok(ev); }

		// ADD DRAG HANDLERS
		var track=cmp.getTrack(this);
		if (!track.save_onmousemove) track.save_onmousemove=track.onmousemove;
		if (!track.save_onkeyup)     track.save_onkeyup    =track.onkeyup;
		if (!track.save_onmouseup)   track.save_onmouseup  =track.onmouseup;
		track.onmousemove=cmp.dragmove;
		track.onkeyup  =cmp.dragkeyup;
		track.onmouseup=cmp.dragup;

		if (this.parentNode.style.position!='absolute') // fixup parent so OFFSETS ARE RELATIVE
			this.parentNode.style.position='relative';

		// INITIAL STATE
		this.changed=false;		// set true when moved/stretched
		track.elem=this;		// tiddler element
		track.stretch=cmp.isStretch(this,ev);
		track.start={
			X: cmp.getMX(ev),	// mouse position
			Y: cmp.getMY(ev),
			T: this.offsetTop,	// element position/size (pixels)
			L: this.offsetLeft,
			W: jQuery(this).width(),
			H: jQuery(this).height(),
			css: {			// original element css values
				T: this.style.top,
				L: this.style.left,
				W: this.style.width,
				H: this.style.height
			}
		}
		return cmp.ok(ev);
	},
	dragmove: function(ev) { ev=ev||window.event; // DRAG: MOVE/STRETCH
		var cmp=config.macros.pasteUp; // abbrev
		cmp.capture(); // capture mouse events during drag
		var e=this.elem; var s=e.style;
		var dX=cmp.getMX(ev)-this.start.X;
		var dY=cmp.getMY(ev)-this.start.Y;
		e.changed=e.changed||(Math.abs(dX)>1)||(Math.abs(dY)>1); // MINIMUM 2px MOVEMENT
		if (!e.changed) return cmp.ok(ev);
		e.style.position='absolute'; // ensure element is MOVEABLE
		if (this.stretch||ev.shiftKey) { // resize
			s.width =cmp.getCSS(e,this.start.W+dX,this.start.css.W);
			s.height=cmp.getCSS(e,this.start.H+dY,this.start.css.H);
		} else { // move
			s.top =cmp.getCSS(e,this.start.T+dY,this.start.css.T);
			s.left=cmp.getCSS(e,this.start.L+dX,this.start.css.L);
		}
		if (!cmp.quiet) {
			var a='auto';
			var msg='[[%0]] x:%1 y:%2 w:%3 h:%4'.format(
				[e.getAttribute('tiddler'),s.left||a,s.top||a,s.width||a,s.height||a]);
			clearMessage(); displayMessage(msg,null,true);
		}
		return cmp.ok(ev);
	},
	dragkeyup: function(ev) { ev=ev||window.event; // DRAG: CANCEL (ESC key)
		var cmp=config.macros.pasteUp; // abbrev
		cmp.setCursor(this.elem,ev);
		if (ev.keyCode==27) {
			cmp.dragcancel(this.elem);
			return this.onmouseup(ev);
		}
		return cmp.ok(ev);
	},
	dragup: function(ev) { ev=ev||window.event; // DRAG: END
		var cmp=config.macros.pasteUp; // abbrev
		cmp.release(); // stop tracking mouse
		this.onmousemove=this.save_onmousemove;
		this.onkeyup    =this.save_onkeyup;
		this.onmouseup  =this.save_onmouseup;
		clearMessage();
		var e=this.elem; var s=e.style;
		cmp.setCursor(e,ev);
		if (e.changed) cmp.dragsave(e,s.left,s.top,s.width,s.height,s.zIndex);
		return cmp.ok(ev);
	},
	dragcancel: function(elem) {
		var orig=config.macros.pasteUp.getTrack(elem).start.css;
		elem.style.top   =orig.T;
		elem.style.left  =orig.L;
		elem.style.width =orig.W;
		elem.style.height=orig.H;
		elem.changed     =false;
		displayMessage('move/size cancelled',null,true);
		cmp.setCursor(e,ev);
	},
//}}}
// // DRAGSAVE -  Update embedded {{{<<pasteUp>>}}} or {{{<<tiddler>>}}} macro
//{{{
	cloneFields: function(fields) { // for TIDDLYSPACE compatibility
		var f=merge({},fields); // copy object
		if (f["server.workspace"]!=config.defaultCustomFields["server.workspace"]) {
			f=merge(f,config.defaultCustomFields); // overwrite with defaults
			f["server.permissions"] = "read, write, create, delete";
			delete f["server.page.revision"];
			delete f["server.title"];
			delete f["server.etag"];
		}
		return f;
	},
	dragsave: function(elem,left,top,width,height,zIndex) {
		var cmp=config.macros.pasteUp; // abbrev

		// FIND CONTAINER (the tiddler/section that transcludes this one)
		var c=elem.parentNode;
		while(c && c.getAttribute('tiddler')==undefined) c=c.parentNode;
		if (!c) return;
		var target=c.getAttribute('tiddler');	
		var txt=store.getTiddlerText(target,'');
		var parts=target.split('##');
		var title=parts[0];
		var section=parts[1];

		// CHECK FOR 'OUT OF BOUNDS'
		if (!hasClass(c,'pasteUp') && cmp.outofboundsmsg.length && config.options.chkPasteUpBoundaryWarning) {
			var w=jQuery(c).width(); var h=jQuery(c).height();
			var l=jQuery(elem).position().left; var r=l+jQuery(elem).width();
			var t=jQuery(elem).position().top;  var b=t+jQuery(elem).height();
			if (l<0 || t<0 || r>w || b>h) if (!confirm(cmp.outofboundsmsg)) {
				cmp.dragcancel(elem); elem.changed=true; // ignore following click
				return;
			}
		}
	
		// FIND <<pasteUp>> or <<tiddler>> MACRO and UPDATE PARAMS
		if (cmp.debug) displayMessage('updating '+target);
		var a='auto'; var fmt=' x:%0 y:%1 w:%2 h:%3';
		if (zIndex!==undefined && zIndex!=1) fmt=' x:%0 y:%1 z:%4 w:%2 h:%3';
		var newparams=fmt.format([left||a,top||a,width||a,height||a,zIndex]);
		var newtxt=''; var pos=0; var t=elem.pasteupParams.escapeRegExp();
		var re=new RegExp('<<(pasteUp|tiddler)\\s+'+t+'>>','mg');
		var matches=re.exec(txt);
		if (!matches) { // NO MATCH = POSSIBLE TIDDLER NAME FIXUP (i.e, '##section')
			var here=story.findContainingTiddler(elem);
			var tid=here?here.getAttribute('tiddler'):'';
			var t=elem.pasteupParams.escapeRegExp().replace(new Regexp(tid),''); // REMOVE FIXUP TIDDLER NAME
			var re=new RegExp('<<(pasteUp|tiddler)\\s+'+t+'>>','mg'); // TRY AGAIN
			var matches=re.exec(txt);
		}
		while (matches) { var m=matches[0];
			newtxt+=txt.substr(pos,re.lastIndex-m.length-pos); // before match
			var parts=m.substr(0,m.length-2).split(' with: ');
			parts[0]=parts[0].replace(/\s+[xyzwh]\:[^\s>]*/g,''); // remove old x,y,z,w,h params
			parts[1]=parts[1]?' with: '+parts[1]+'>>':'>>';
			m=parts[0]+newparams+parts[1];
			if (cmp.debug) displayMessage(m);
			newtxt+=m; pos=re.lastIndex; matches=re.exec(txt);
		}
		newtxt+=txt.substr(pos,txt.length); // remainder 

		// SAVE TIDDLER
		var t=store.getTiddler(title); if (!t) {
			t=new Tiddler();
			t.text=store.getTiddlerText(title,'');
			t.fields=config.defaultCustomFields;
		}
		if (section) { // revise section text
			var oldval=store.getTiddlerText(target).escapeRegExp();
			var pattern=new RegExp('(.*!{1,6}'+section+'\\n)'+oldval+'((?:\\n!{1,6}|$).*)');
			newtxt=t.text.replace(pattern,'$1'+newtxt+'$2');
		}
		var who=config.options.txtUserName; var when=new Date();
		if (config.options.chkForceMinorUpdate) { who=t.modifier||who; when=t.modified||when; }
		store.saveTiddler(title,title,newtxt,who,when,t.tags,cmp.cloneFields(t.fields));
		if (config.macros.undo) {
			var partname=elem.pasteupParams.readBracketedList()[0];
			config.macros.undo.setmsg('move/resize '+partname);
		}
		story.refreshTiddler(title,null,true);
		autoSaveChanges();
},
//}}}
// // ADDPART - Add an embedded {{{<<pasteUp>>}}} part to a tiddler
//{{{
	addPart: function(tid,partname) {
		var cmp=config.macros.pasteUp; // abbrev
		// GET PART TiddlerTitle OR TiddlerTitle##sectionname
		var title=partname.split('##')[0]||tid;
		var section=partname.split('##')[1];
		var part=title+(section?'##'+section:'');
		// GET CONTAINING TIDDLER
		var t=store.getTiddler(tid); if (!t) {
			t=new Tiddler();
			t.text=store.getTiddlerText(tid,'');
			t.fields=config.defaultCustomFields;
		}
		// APPEND PART PASTEUP
		var y=store.getTiddlerText('PasteUpConfig::PartTop',   '0px');
		var x=store.getTiddlerText('PasteUpConfig::PartLeft',  '0px');
		var w=store.getTiddlerText('PasteUpConfig::PartWidth', 'auto');
		var h=store.getTiddlerText('PasteUpConfig::PartHeight','auto');
		var fmt='%0<<pasteUp [[%1]] x:%2 y:%3 w:%4 h:%5>>';
		var txt=t.text+fmt.format([t.text.length?'\n':'',part,x,y,w,h]);
		// SAVE CONTAINER
		var who=config.options.txtUserName; var when=new Date();
		if (config.options.chkForceMinorUpdate)
			{ who=t.modifier||who; when=t.modified||when; }
		store.saveTiddler(tid,tid,txt,who,when,t.tags,cmp.cloneFields(t.fields));
		if (config.macros.undo) config.macros.undo.setmsg('remove '+part+' from '+tid);
		story.refreshTiddler(tid,null,true);
		// CREATE PART IF NEEDED
		if (!store.getTiddlerText(part)) {
			var t=store.getTiddler(title); if(!t) {
				t=new Tiddler();
				t.text=store.getTiddlerText(title,'');
				t.fields=config.defaultCustomFields;
			}
			var txt=store.getTiddlerText('DefaultPart',part).replace(/DefaultPart/g,part);
			if (section) txt='{{hidden{\n!'+section+'\n'+txt+'\n!end '+section+'\n}}}';
			if (!section) t.tags.pushUnique('part');
			store.saveTiddler(title,title,t.text+txt,who,when,t.tags,cmp.cloneFields(t.fields));
			story.refreshTiddler(title,null,true);
			displayMessage('created new part: '+part);
		}
		displayMessage(part+' added to '+tid);
		autoSaveChanges();
		return false;
	},
	removePart: function(elem,force) {
		var cmp=config.macros.pasteUp; // abbrev
		// FIND CONTAINER (the tiddler/section that transcludes this one)
		var c=elem.parentNode;
		while(c && c.getAttribute('tiddler')==undefined) c=c.parentNode;
		if (!c) return false; // NOTHING REMOVED
		var target=c.getAttribute('tiddler');	
		var txt=store.getTiddlerText(target,'');
		var parts=target.split('##');
		var title=parts[0];
		var section=parts[1];

		// ASK FOR CONFIRMATION (if not FORCE)
		var msg=cmp.confirmremovemsg.format([elem.getAttribute('tid'),target]);
		if (!force && config.options.chkPasteUpConfirmRemove && !confirm(msg)) return false;

		// FIND <<pasteUp>> or <<tiddler>> MACRO 
		if (cmp.debug) displayMessage('updating '+target);
		var newtxt=''; var pos=0; var t=elem.pasteupParams.escapeRegExp();
		var re=new RegExp('<<(pasteUp|tiddler)\\s+'+t+'>>','mg');
		var matches=re.exec(txt);
		if (!matches) { // NO MATCH = POSSIBLE TIDDLER NAME FIXUP (i.e, '##section')
			var here=story.findContainingTiddler(elem);
			var tid=here?here.getAttribute('tiddler'):'';
			var t=elem.pasteupParams.escapeRegExp().replace(new Regexp(tid),''); // REMOVE FIXUP TIDDLER NAME
			var re=new RegExp('<<(pasteUp|tiddler)\\s+'+t+'>>','mg'); // TRY AGAIN
			var matches=re.exec(txt);
		}

		// REMOVE MACROS
		while (matches) { var m=matches[0];
			newtxt+=txt.substr(pos,re.lastIndex-m.length-pos); // before match
			if (cmp.debug) displayMessage('removing '+m);
			pos=re.lastIndex; matches=re.exec(txt);
		}
		newtxt+=txt.substr(pos,txt.length); // remainder 

		// SAVE TIDDLER
		var t=store.getTiddler(title); if (!t) return;
		if (section) { // revise section text
			var oldval=store.getTiddlerText(target).escapeRegExp();
			var pattern=new RegExp('(.*!{1,6}'+section+'\\n)'+oldval+'((?:\\n!{1,6}|$).*)');
			newtxt=t.text.replace(pattern,'$1'+newtxt+'$2');
		}
		var who=config.options.txtUserName; var when=new Date();
		if (config.options.chkForceMinorUpdate)
			{ who=t.modifier||who; when=t.modified||when; }
		store.saveTiddler(title,title,newtxt,who,when,t.tags,cmp.cloneFields(t.fields));
		if (config.macros.undo) {
			var partname=elem.pasteupParams.readBracketedList()[0];
			config.macros.undo.setmsg('restore part '+partname+' in '+title);
		}
		story.refreshTiddler(title,null,true);
		displayMessage(partname+' removed from '+title);
		autoSaveChanges();
		return true; // PART REMOVED SUCCESSFULLY
	}
}
//}}}
// // HIJACK {{{<<tiddler>>}}} handler
//{{{
config.macros.pasteUp.core_handler=config.macros.tiddler.handler;
config.macros.tiddler.handler=config.macros.pasteUp.handler;
//}}}
// // MACRO: addPasteUpPart
//{{{
config.macros.addPasteUpPart = {
	label: 'add part',
	prompt: 'add a part to this page',
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		if (window.readOnly) return;
		var label=params[0]||this.label;
		var prompt=params[1]||this.prompt;
		createTiddlyButton(place,label,prompt,this.click);
	},
	click: function(ev) {
		var tid=story.findContainingTiddler(this).getAttribute('tiddler');
		var partname=prompt('Please enter a part name:','NewPart');
		if (partname) config.macros.pasteUp.addPart(tid,partname);
		return config.macros.pasteUp.ok(ev);
	}
};
//}}}
// // TOOLBAR COMMAND: addPasteUpPart
//{{{
config.commands.addPasteUpPart = {
	text: 'add part',
	hideReadOnly: true,
	tooltip: 'add a part to this page',
	handler: function(ev,src,title) {
		return config.macros.addPasteUpPart.click(ev);
	}
};
//}}}
// // DELIVER INTERNAL PLUGIN STYLES TO PasteUpPluginStyles SHADOW
//{{{
var tid='PasteUpPluginStyles';
config.shadowTiddlers[tid]='/*{{{*/\n'+store.getTiddlerText(tiddler.title+'##css','')+'\n/*}}}*/';;
config.annotations[tid]='CSS definitions used internally by PasteUpPlugin.  Do not modify unless you are sure you know what you are doing!';
store.addNotification(tid,refreshStyles);
//}}}
/***
{{{
!css
.hidden
	{ display:none; }
.pasteUp
	{ border:1px solid transparent; z-index:1; }
.pasteUpBorder
	{ border:1px dotted black !important; }
div[tags~="pasteup"].tiddler div.viewer,
div[tags~="part"].tiddler div.viewer,
div[tiddler="DefaultPage"] div.viewer,
div[tiddler="DefaultPageHeader"] div.viewer,
div[tiddler="DefaultPageFooter"] div.viewer,
div[tiddler="DefaultPart"] div.viewer {
	width:[[PasteUpConfig::Width]];
	height:[[PasteUpConfig::Height]];
	padding:0em;
	border:1px solid;
}
!end
}}}
***/
// // REFRESH DISPLAY WHEN PasteUpConfig IS CHANGED (applies user settings)
//{{{
store.addNotification('PasteUpConfig', function(title){ refreshAll(); });
//}}}
// // DELIVER SHADOW CONTENT FOR DefaultPage (for use with {{{<<newTiddler>>}}})
//{{{
config.shadowTiddlers['DefaultPage']=store.getTiddlerText(tiddler.title+'##defaultpage','');
config.annotations['DefaultPage']='This content is used to create new pasteup pages';
//}}}
/***
{{{
!defaultpage
<<pasteUp [[DefaultPageHeader]] x:0px y:0%  w:100% h:10%>>
<<pasteUp [[DefaultPageFooter]] x:0px y:90% w:100% h:10%>>
!end
}}}
***/
// // DELIVER SHADOW CONTENT FOR DefaultPart (used by addPasteUpPart)
//{{{
config.shadowTiddlers['DefaultPart']=store.getTiddlerText(tiddler.title+'##defaultpart','');
config.annotations['DefaultPart']='This content is used to create new parts on pasteup pages';
//}}}
/***
{{{
!defaultpart
This is "DefaultPart"
Please click to edit.
!end
}}}
***/
 