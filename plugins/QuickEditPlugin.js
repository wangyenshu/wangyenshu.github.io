/***
|Name|QuickEditPlugin|
|Source|http://www.TiddlyTools.com/#QuickEditPlugin|
|Documentation|http://www.TiddlyTools.com/#QuickEditPackage|
|Version|2.4.4|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements <br>and [[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Description|Support functions for [[QuickEditPackage]]: utility functions, toolbar commands, stylesheets|
!!!!!Documentation
>see [[QuickEditPackage]] for details
!!!!!Revisions
<<<
2011.02.14 2.4.4 fix OSX error: use picker.file.path
2009.06.11 2.4.3 added keyup() function to abbreviate listbox handling for CR and ESC
2009.05.07 2.4.2 added processed() function to abbreviate event handler code
2008.09.07 2.4.1 added removeCookie() function for compatibility with [[CookieManagerPlugin]]
2008.05.17 2.4.0 copied code from StickyPopupPlugin to remove dependency
2008.05.12 2.3.0 added "toggleQuickEdit" command handler (replaces inline script command)
2008.01.11 2.2.0 converted from inline script
2007.03.29 1.0.0 initial release (as inline script)
<<<
!!!!!Code
***/
//{{{
version.extensions.QuickEditPlugin= {major: 2, minor: 4, revision: 4, date: new Date(2011,2,14)};

// SET STYLESHEET
setStylesheet("\
.quickEdit a { border:2px outset ButtonFace; padding:0px 3px !important; \
	-moz-border-radius:.5em; -webkit-border-radius:.5em; \
	-moz-appearance:button !important; -webkit-appearance:push-button !important; \
	background-color:ButtonFace; color:ButtonText !important;  \
	line-height:200%; font-weight:normal; } \
.quickEdit a:hover { border: 2px inset ButtonFace; background-color:ButtonFace; }\
", "quickEditStyles");

// REMOVE COOKIE
if (window.removeCookie===undefined) {
	window.removeCookie=function(name) {
		document.cookie = name+'=; expires=Thu, 01-Jan-1970 00:00:01 UTC; path=/;'; 
	}
}

// UTILITY FUNCTIONS
config.quickEdit = {
	processed: function(ev) { ev=ev||window.event;
		ev.cancelBubble=true;
		if(ev.stopPropagation) ev.stopPropagation();
		return false;
	},
	keyup: function(ev){ var k=(ev||window.event).keyCode;
		if (k==13) this.onclick();
		if (k==27) Popup.remove();
	},
	getField: function(where) {
		var here=story.findContainingTiddler(where); if (!here) return null;
		var e=story.getTiddlerField(here.getAttribute("tiddler"),"text");
		if (e&&e.getAttribute("edit")=="text") return e;
		return null;
	},
	setSelection: function(where,newtext) {
		var e=this.getField(where); if (!e) return false;
		e.focus(); replaceSelection(e,newtext);
		return false;
	},
	wrapSelection: function(where,before,after) {
		var e=this.getField(where); if (!e) return false;
		e.focus(); replaceSelection(e,before+config.quickEdit.getSelection(e)+after);
		return false;
	},
	getSelection: function(e) {
		var seltext="";
		if (e&&e.setSelectionRange)
			seltext=e.value.substr(e.selectionStart,e.selectionEnd-e.selectionStart);
		else if (document.selection) {
			var range = document.selection.createRange();
			if (range.parentElement()==e) seltext=range.text
		}
		return seltext;
	},
	promptForFilename: function(msg,path,file) {
		if(window.Components) { // moz
			try {
				netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
				var nsIFilePicker = window.Components.interfaces.nsIFilePicker;
				var picker = Components.classes['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);
				picker.init(window, msg, nsIFilePicker.modeOpen);
				var thispath = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
				thispath.initWithPath(path);
				picker.displayDirectory=thispath;
				picker.defaultExtension='jpg';
				picker.defaultString=file;
				picker.appendFilters(nsIFilePicker.filterAll|nsIFilePicker.filterImages);
				if (picker.show()!=nsIFilePicker.returnCancel)
					var result="file:///"+picker.file.path.replace(/\\/g,'/');
			}
			catch(e) { alert('error during local file access: '+e.toString()) }
		}
		else { // IE
			try { // XP only
				var s = new ActiveXObject('UserAccounts.CommonDialog');
				s.Filter='All files|*.*|JPG files|*.jpg|GIF files|*.gif|PNG files|*.png|';
				s.FilterIndex=1; // default to JPG
				s.InitialDir=path;
				s.FileName=file;
				if (s.showOpen()) var result=s.FileName;
			}
			catch(e) { var result=prompt(msg,path+file); } // fallback for non-XP IE
		}
		return result;
	}
}
//}}}

//{{{
if (config.options.chkShowQuickEdit===undefined) config.options.chkShowQuickEdit=false;
config.commands.toggleQuickEdit = {
	hideReadOnly: true,
	getText: function() { return config.options.chkShowQuickEdit?'\u221Aquickedit':'quickedit'; },

	tooltip: 'show QuickEdit toolbar buttons',
	handler: function(event,src,title) {
		var opt='chkShowQuickEdit';
		config.options[opt]=!config.options[opt];
		config.macros.option.propagateOption(opt,"checked", config.options[opt],"input");
		if (config.options[opt]) saveOptionCookie(opt);	else removeCookie(opt);
		src.innerHTML=config.commands.toggleQuickEdit.getText();
		story.forEachTiddler(function(t,e){if (story.isDirty(t)) refreshElements(e);});
		return false;
	}
};
//}}}

// // COPIED FROM [[StickyPopupPlugin]] TO ELIMINATE PLUGIN DEPENDENCY
//{{{
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