/***
|Name|[[EditSectionPlugin]]|
|Source|http://www.TiddlyTools.com/#EditSectionPlugin|
|Documentation|http://www.TiddlyTools.com/#EditSectionPlugin|
|Version|1.8.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|invoke popup 'section editor' for specified section of a tiddler|
!!!!!Usage
<<<
{{{
<<editSection TiddlerName##sectionname label tooltip>>
}}}
This macro adds a command link that invokes a popup editor for a specific section, where:
*''~TiddlerName##sectionname'' specifies the tiddler and section you want to edit.
**If you omit the "##sectionname" portion (i.e., only enter "~TiddlerName"), the entire content of the indicated tiddler is edited.
**If you omit the "~TiddlerName" portion (i.e., only enter "##sectionname"), the current containing tiddler (if any) is assumed.
**Changing the section name in the popup editor //renames// that section within the tiddler.
**Changing the tiddler title in the popup editor //copies// that section to another tiddler.
**If the indicated tiddler and/or section does not yet exist, it will be created when you press 'save'.
*''label'' and ''tooltip'' (both //optional//) specify the link label and mouseover help text for the 'edit section' command link.
You can also add the following macro, //at the end of a tiddler//, to automatically add an 'edit section' command link for each section shown in the tiddler.
{{{
<<editSections label tooltip>>
}}}
*''label'' and ''tooltip'' (both //optional//) specify the link label and mouseover help text for the 'edit section' command link.
>//Note: when a document is viewed in 'readOnly' mode, both of these macros are bypassed and no output is produced.//
<<<
!!!!!Sample
<<<
This is an example section for you to try
<<<
!!!!!Example
<<<
{{{
<<editSection ##Sample>>
}}}
<<editSection ##Sample>>
<<<
!!!!!Configuration
<<<
To customize and/or translate the HTML form layout used to render the section editor, edit the [[EditSectionTemplate]] shadow tiddler.
<<<
!!!!!Revisions
<<<
2012.01.29 1.8.1 invoke autoSaveChanges() when tiddlers are modified.
2011.12.22 1.8.0 added {{{<<editSections>>}}} macro for automatic adding of 'edit section...' links to headings
2011.12.20 1.7.0 added drag handling for editor panels
2011.10.28 1.6.8 fixed getMX()/getMY() for Chrome scroll offset handling
2011.09.02 1.6.7 more refactoring and cleanup of default form init/save handlers
2011.08.02 1.6.6 major code refactor to allow customization of form handling for type-specific [[PasteUpHelperPlugin]] extensions
2011.07.30 1.6.5 in removePanel(), call Popup.remove() so 'child' popups are closed when panel is closed
2011.07.24 1.6.4 refactored save() to provide updateTiddler() entry point for use with PasteUpHelperPlugin 'quickmenu' commands. Added getMX() and getMY() for cross-browser mouse coordinates
2011.06.05 1.6.3 added TiddlySpace cloneFields() to delete and save handlers so editing sections automatically copies/owns an included tiddler
2011.05.05 1.6.2 renamed delete() to deleteSection() to avoid javascript keyword errors
2011.05.04 1.6.1 in delete(), use removeTiddler() for proper notification handling
2011.05.01 1.6.0 added delete() functionality
2011.01.09 1.5.1 in handler(), don't render command link if document is readOnly
2010.12.24 1.5.0 replace use of core Popups with custom panel handling (bypass core interactions and errors)
2010.11.07 1.4.0 in popup(), render HTML form from EditSectionTemplate, and then applyHtmlMacros() to render wiki-syntax macro-generated form elements (e.g., {{{<<option>>, <<select>>}}}, etc.).  Also, refactored form init/save handling to add customization 'hooks'
2010.10.25 1.3.0 added support for editing complete tiddlers using "~TiddlerName" syntax (omit "##sectionname")
2010.07.15 1.2.0 added confirmation when section rename will overwrite other section
2010.07.13 1.1.1 added 'dirty flag' confirmation to popup handling to avoid discarding unsaved changes
2010.07.11 1.1.0 fixed handling for creating new sections in existing tiddlers. Copied StickyPopupPlugin to eliminate dependency. Added Popup.showHere()
2010.05.24 1.0.2 in save(), escape regexp chars in section titles (e.g. "!SectionNameWith?InIt")
2009.09.07 1.0.1 documentation/code cleanup
2009.09.01 1.0.0 initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.EditSectionPlugin= {major: 1, minor: 8, revision: 1, date: new Date(2012,1,29)};

config.macros.editSection = {
	label: 'edit section...',
	tip: 'edit %0',
	sectionfmt: '{{hidden{\n!%0\n%1\n!end\n}}}',
	sectionerr: 'Invalid tiddler/section name: %0',
	newtiddlertxt: '',
	discardmsg: 'Discard unsaved changes for %0?',
	deletemsg: 'Are you sure you want to delete %0?',
	overwritemsg: '%0##%2 already exists. Choose OK to overwrite it',
	template: 'EditSectionTemplate', // DEFAULT FORM TEMPLATE
//}}}
// // PLUGIN INITIALIZATION
//{{{
	init: function() {
		// SHADOW PAYLOAD FOR DEFAULT EditSectionTemplate FORM DEFINITION
		config.shadowTiddlers[this.template]
			=store.getTiddlerText('EditSectionPlugin##HTML','');

		// CLOSE PANELS IF CLICK on other than POPUP OR EDITOR PANEL
		addEvent(document,'click',function(ev) {
			var p=resolveTarget(ev||window.event);
			while (p) {
				if (hasClass(p,'editSectionPanel')) break;
				if (hasClass(p,'popup')) break;
				p=p.parentNode;
			}
			if (!p) config.macros.editSection.removeAllPanels();
			return true;
		});

		// HIJACK QuickEditPlugin's getField() to support use with editSectionPanel
		if (config.quickEdit) {
			config.quickEdit.getTiddlerField=config.quickEdit.getField;
			config.quickEdit.getField=function(where) {
				var e=where; while(e) {	if (hasClass(e,'editSectionPanel')) break; e=e.parentNode; }
				return e?e.getElementsByTagName('textarea')[0]:this.getTiddlerField(where);
			}

		}
	},
//}}}
// // GENERAL UTILITIES
//{{{
	ok: function(ev) { var ev=ev||window.event;
		ev.cancelBubble=true;
		if(ev.stopPropagation)ev.stopPropagation();
		return false;
	},
	getMX: function(ev) { var ev=ev||window.event; // GET MOUSE X
		if (config.browser.isIE)	return ev.clientX+findScrollX();// IE
		if (config.userAgent.indexOf('chrome')!=-1) return ev.pageX;	// Chrome
		if (config.browser.isSafari) 	return ev.pageX+findScrollX(); 	// Webkit
		else				return ev.pageX;		// Firefox/other
	},
	getMY: function(ev) { var ev=ev||window.event; // GET MOUSE Y
		if (config.browser.isIE)	return ev.clientY+findScrollY();// IE
		if (config.userAgent.indexOf('chrome')!=-1) return ev.pageY;	// Chrome
		if (config.browser.isSafari) 	return ev.pageY+findScrollY();	// Webkit
		else				return ev.pageY;		// Firefox/other
	},
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
//}}}
// // MACRO/CLICK HANDLER
//{{{
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		if (readOnly) return;
		var here=story.findContainingTiddler(place);
		var tid=params[0];
		var label=params[1]||this.label.format([tid]);
		var tip=params[2]||this.tip.format([tid]);
		var btn=createTiddlyButton(place,label,tip,this.click);
		btn.setAttribute('tid',tid);
	},
	click: function(ev,type) { // note: optional 'type' is passed in from PasteUpPluginHelper
		var parts=this.getAttribute('tid').split('##');
		var title=parts[0]; var section=parts[1];
		var here=story.findContainingTiddler(this);
		if (!title&&here) title=here.getAttribute('tiddler');
		if (!title) return false;
		var tid=title; if (section&&section.length) tid=[title,section].join('##');
		return config.macros.editSection.createPanel(this,ev,tid,title,section,type);
	},
//}}}
// // EDITOR PANEL HANDLER
//{{{
	createPanel: function(here,ev,tid,title,section,type) {
		if (!this.removeAllPanels()) return this.ok(ev);
		var p=createTiddlyElement(document.body,"ol",
			"editSectionPanel","popup smallform editSectionPanel");
		p.root=here; 
		p.setAttribute('dirty',null);
		p.setAttribute('message',this.discardmsg.format([tid]));
		p.onmousedown=this.mousedown; p.style.cursor='move'; // for panel dragging
		p.innerHTML=store.getRecursiveTiddlerText(this.getForm(tid,type),'',10);
		applyHtmlMacros(p,store.getTiddler(title));
		var f=p.getElementsByTagName('form')[0];
		f.panel=p;
		f.title.value=title;
		f.section.value=section||'';
		f.init=this.getInitForm(tid,type);
		f.save=this.getSaveForm(tid,type);
		f.init(here,f,title,section,type);
		this.showPanel(p,here,ev);
		return this.ok(ev);
	},
	showPanel: function(p,here,ev) {
		var x=this.getMX(ev); var y=this.getMY(ev);
		var winw=findWindowWidth();
		var scrollw=winw-document.body.offsetWidth;
		if(p.offsetWidth>winw*0.75) p.style.width=winw*0.75 + "px";
		if(x+p.offsetWidth>winw-scrollw-1) x=winw-p.offsetWidth-scrollw-1;
		var s=p.style; s.left=x+'px'; s.top=y+'px'; s.display='block';
		if(config.options.chkAnimate && anim)	anim.startAnimating(new Scroller(p));
		else					window.scrollTo(0,ensureVisible(p));
	},
	removePanel: function(p) {
		Popup.remove(); // child popup (if any) is closed when panel is closed
		if (!p || p.getAttribute('dirty')!='true' || confirm(p.getAttribute('message')))
			{ if (p) removeNode(p); return true; }
		return false;
	},
	removeAllPanels: function() {
		var ok=true;
		jQuery('.editSectionPanel').each(function(index){
			var f=this.getElementsByTagName('form')[0];
			if (f.content) f.content.blur(); // force onchange (sets 'dirty' flag as needed)
			ok=config.macros.editSection.removePanel(this);
			return true;
		});
		return ok; // FALSE if panels remain
	},
//}}}
// // PANEL DRAG HANDLER
//{{{
	mousedown: function(ev) { ev=ev||window.event; // MOVE PANEL
		var cme=config.macros.editSection; // abbrev

		// ignore clickthrough from form fields, links, and images
		var target=resolveTarget(ev);
		if (['TEXTAREA','SELECT','INPUT','A','IMG'].contains(target.nodeName.toUpperCase()))
			return true;

		// GET TRACKING ELEMENT
		var track=this; // if 'capture' not supported, track in element only
		if (document.body.setCapture) var track=document.body; // IE
		if (window.captureEvents) var track=window; // moz
		if (!track.save_onmousemove) track.save_onmousemove=track.onmousemove;
		if (!track.save_onmouseup)   track.save_onmouseup  =track.onmouseup;
		if (!track.save_onkeyup)     track.save_onkeyup    =track.onkeyup;
		track.onmousemove=cme.dragmove;
		track.onmouseup	 =cme.dragup;
		track.onkeyup	 =cme.dragkeyup;
		// SAVE INITIAL POSITION
		track.elem=this;		// panel element
		track.start={
			X: cme.getMX(ev),  Y: cme.getMY(ev),	// mouse position
			T: this.offsetTop, L: this.offsetLeft,	// panel position
		}
		return cme.ok(ev);
	},
	dragmove: function(ev) { ev=ev||window.event; // MOVE PANEL
		var cme=config.macros.editSection; // abbrev
		// CAPTURE MOUSE EVENTS DURING DRAG
		if (document.body.setCapture) document.body.setCapture(); // IE
		if (window.captureEvents) window.captureEvents(Event.MouseMove|Event.MouseUp,true); // moz
		var e=this.elem; var s=e.style;
		var dX=cme.getMX(ev)-this.start.X;
		var dY=cme.getMY(ev)-this.start.Y;
		e.changed=e.changed||(Math.abs(dX)>1)||(Math.abs(dY)>1); // MINIMUM 2px MOVEMENT
		if (!e.changed) return cme.ok(ev);
		s.top =this.start.T+dY+'px';
		s.left=this.start.L+dX+'px';
		return cme.ok(ev);
	},
	dragkeyup: function(ev) { ev=ev||window.event; // STOP DRAG (ESC key)
		if (ev.keyCode==27) {
			var s=this.elem.style;
			s.top=this.start.T+'px';
			s.left=this.start.L+'px';
			return this.onmouseup(ev);
		}
	},
	dragup: function(ev) { ev=ev||window.event; // RELEASE MOUSE
		var cme=config.macros.editSection; // abbrev
		if (document.body.releaseCapture) document.body.releaseCapture(); // IE
		if (window.releaseEvents) window.releaseEvents(Event.MouseMove|Event.MouseUp); // moz
		this.onmousemove=this.save_onmousemove;
		this.onmouseup  =this.save_onmouseup;
		this.onkeyup    =this.save_onkeyup;
		return cme.ok(ev);
	},
//}}}
// // EDITOR FORM HANDLER
//{{{
	getForm:	function(tid,type) { return this.template; }, // see PasteUpHelperPlugin
	getInitForm:	function(tid,type) { return this.initForm; }, // see PasteUpHelperPlugin
	getSaveForm:	function(tid,type) { return this.saveForm; }, // see PasteUpHelperPlugin
	initForm: function(here,form,title,section,type) { // SET FORM CONTENT FROM TIDDLER SECTION
		var tid=title; if (section) tid=[title,section].join('##');
		form.newsection.value=tid; // target for output
		form.content.value=store.getTiddlerText(tid,'');
		if (version.extensions.TextAreaPlugin) new window.TextAreaResizer(form.content);
	},
	saveForm: function(here,ev) { // GET SECTION CONTENT FROM FORM (DEFAULT=TEXT CONTENT ONLY)
		var f=here.form;

		// GET TARGET TITLE/SECTION
		var tid=f.newsection.value;
		var parts=tid.split('##');
		var title=parts[0];
		var section=parts[1];
		var oldsection=f.section.value;
		var where=f.panel.root;
		if (!title) title=story.findContainingTiddler(where).getAttribute('tiddler');
		if (!title) {
			displayMessage(this.sectionerr.format([f.newsection.value]));
			f.newsection.focus(); f.newsection.select(); return false;
		}
		// CHECK FOR TIDDLER OVERWRITE
		if (!section && title!=f.title.value && store.tiddlerExists(title)) {
			if (!confirm(config.messages.overwriteWarning.format([title])))
				{ f.newsection.focus(); f.newsection.select(); return this.ok(ev); }

		}
		// WRITE TIDDLER CONTENT and CLOSE PANEL
		this.updateTiddler(f.content.value,title,section,oldsection);
		f.panel.setAttribute('dirty',null); this.removePanel(f.panel);
		return this.ok(ev);
	},
	changed: function(here,ev) {
		here.form.panel.setAttribute('dirty','true');
		return this.ok(ev);
	},
	cancel: function(here,ev) {
		this.removePanel(here.form.panel);
		return this.ok(ev);
	},
	remove: function(here,ev) {
		var f=here.form;
		var title=f.title.value;
		var section=f.section.value;
		var tid=title; if (section.length) tid=[title,section].join('##');
		var msg=this.deletemsg.format([tid]);
		if (!confirm(msg)) return this.ok(ev);
		this.deleteSection(title,section);
		f.panel.setAttribute('dirty',null);
		this.removePanel(f.panel);
		return this.ok(ev);
	},
//}}}
// // TIDDLER I/O
//{{{
	updateTiddler: function(txt,title,section,oldsection) {
		// GET (or CREATE) TIDDLER
		var t=store.getTiddler(title);
		var who =t&&config.options.chkForceMinorUpdate?t.modifier:config.options.txtUserName;
		var when=t&&config.options.chkForceMinorUpdate?t.modified:new Date();
		if (!t) {
			t=new Tiddler(); t.text=store.getTiddlerText(title,'');
			if (section&&!t.text.length) t.text=this.newtiddlertxt.format([title,section]);
		}
		// ADD/REVISE/RENAME SECTION CONTENT (if any)
		if (section) {
			// GET SECTION VALUES
			if (!oldsection) var oldsection=section;
			var oldval=store.getTiddlerText(title+'##'+oldsection); // previous section value
			var newval=txt; // revised section value
			var existingval=store.getTiddlerText(title+'##'+section); // existing section value
			// REVISE TIDDLER TEXT
			var txt=t.text; // default tiddler text = unchanged
			var pattern=new RegExp('(.*!{1,6})'+oldsection.escapeRegExp()+'\\n'
				+(oldval||'').escapeRegExp()+'((?:\\n!{1,6}|$).*)');
			var altpattern=this.sectionfmt.format([oldsection,oldval||'']);
			if (section!=oldsection && existingval) { // rename overwrites another section...
				if (!confirm(this.overwritemsg.format([title,section])))
					return this.ok(ev);
				txt=txt.replace(altpattern,''); // REMOVE old section (auto-generated)
				txt=txt.replace(pattern,'$2');  // REMOVE old section (generic format)
				// TARGET new section name and value
				pattern=new RegExp('(.*!{1,6})'+section.escapeRegExp()+'\\n'
					+existingval.escapeRegExp()+'((?:\\n!{1,6}|$).*)');
				oldval=existingval;
			}
			if (typeof oldval=="string") // section exists... update/rename it
				txt=txt.replace(pattern,'$1'+section+'\n'+newval+'$2');
			else // otherwise, append a new section to end of tiddler
				txt=txt+this.sectionfmt.format([section,newval]);
		}
		// SAVE TIDDLER
		var fields=this.cloneFields(t.fields);
		store.saveTiddler(title,title,txt,who,when,t.tags,fields);
		story.refreshTiddler(title,null,true);
		autoSaveChanges();
	},
	deleteSection: function(title,section) {
		// GET TIDDLER
		var t=store.getTiddler(title); if (!t) return;
		var who =t&&config.options.chkForceMinorUpdate?t.modifier:config.options.txtUserName;
		var when=t&&config.options.chkForceMinorUpdate?t.modified:new Date();
		if (!section) { // REMOVE TIDDLER
			store.removeTiddler(title);
		} else { // REMOVE SECTION FROM TIDDLER
			var val=store.getTiddlerText(title+'##'+section); // CURRENT SECTION VALUE
			if (typeof val=="string") { // section exists
				var txt=t.text; // default tiddler text = unchanged
				var pattern=new RegExp('(.*!{1,6})'+section.escapeRegExp()+'\\n'
					+(val||'').escapeRegExp()+'((?:\\n!{1,6}|$).*)');
				var altpattern=this.sectionfmt.format([section,val||'']);
				txt=txt.replace(altpattern,''); // REMOVE old section (auto-generated)
				txt=txt.replace(pattern,'$2');  // REMOVE old section (generic format)
				var fields=this.cloneFields(t.fields);
				store.saveTiddler(title,title,txt,who,when,t.tags,fields);
				story.refreshTiddler(title,null,true);
				autoSaveChanges();
			}
		}
	}
}
//}}}
// // EDIT SECTIONS MACRO
//{{{
config.macros.editSections = {
	label: 'edit...',
	tip: 'edit this section',
	command: '~~<<editSection [[##%0]] "%1" "%2">>~~',
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		if (readOnly) return;
		var elems=place.parentNode.getElementsByTagName("*");
		for (var i=0; i<elems.length; i++) { var e=elems[i]; // for each heading element
			if (!['H1','H2','H3','H4','H5'].contains(e.nodeName)) continue;
			var section=e.textContent;
			var label=(params[0]||this.label).format([section]);
			var tip  =(params[1]||this.tip  ).format([section]);
			wikify(this.command.format([section,label,tip]),e);
		}		
	}
}
//}}}
/***
//{{{
!HTML
<!--{{{-->
<!--
|Name|EditSectionTemplate|
|Source||
|Version||
|Author||
|License|http://www.TiddlyTools.com/#LegalStatements|
|Type|template|
|Requires|EditSectionPlugin|
|Description|popup editor form template used by EditSectionPlugin|
-->
<form action='javascript:;' style="white-space:nowrap">
<input type="hidden" name="title" value="">
<input type="hidden" name="section" value="">
<input type="text" name="newsection" value="" autocomplete="off" style="width:61%"
	onchange="return config.macros.editSection.changed(this,event);">
<input type=button value="save" style="width:12%"
	onclick="return config.macros.editSection.saveForm(this,event)">
<input type=button value="cancel" style="width:12%"
	onclick="return config.macros.editSection.cancel(this,event)">
<input type=button value="delete" style="width:12%"
	onclick="return config.macros.editSection.remove(this,event)">
<div macro="tiddler QuickEditToolbar"></div>
<textarea name="content" rows="15" cols="80" autocomplete="off"
	onchange="return config.macros.editSection.changed(this,event)"></textarea>
</form>
<!--}}}-->
!end
//}}}
***/
// //<<editSections "edit">> 