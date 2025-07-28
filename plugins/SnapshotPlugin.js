/***
|Name|SnapshotPlugin|
|Source|http://www.TiddlyTools.com/#SnapshotPlugin|
|Documentation|http://www.TiddlyTools.com/#SnapshotPluginInfo|
|Version|1.4.3|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|save or print HTML+CSS image of rendered document content|
This plugin provides a macro as well as tiddler toolbar commands to create a file or browser window containing the //rendered// CSS-and-HTML that is currently being displayed for selected elements of the current document.
!!!!!Documentation
>see [[SnapshotPluginInfo]]
!!!!!Configuration
<<<
<<option chkSnapshotHTMLOnly>> output HTML only (omit CSS)
<<<
!!!!!Revisions
<<<
2011.02.14 1.4.3 fix OSX error: use picker.file.path
2011.01.03 1.4.2 added snapshotSaveViewer toolbar command
2010.12.15 1.4.1 added 'snapshot' class to wrapper
|please see [[SnapshotPluginInfo]] for additional revision details|
2008.04.21 1.0.0 initial release - derived from [[NewDocumentPlugin]] with many improvements...
<<<
!!!!!Code
***/
//{{{
version.extensions.SnapshotPlugin= {major: 1, minor: 4, revision: 3, date: new Date(2011,2,14)};

if (config.options.chkSnapshotHTMLOnly===undefined)
	config.options.chkSnapshotHTMLOnly=false;

config.macros.snapshot = {
	snapLabel: "save a snapshot",
	printLabel: "print a snapshot",
	snapPrompt: "save an HTML image",
	printPrompt: "print an HTML image",
	hereID: "here",
	viewerID: "viewer",
	storyID: "story",
	allID: "all",
	askID: "ask",
	askTiddlerID: "askTiddler",
	askDOMID: "askDOM",
	askMsg: "select an element...",
	hereItem: "tiddler: '%0'",
	viewerItem: "tiddler: '%0' (content only)",
	storyItem: "story column (one file)",
	storyFilesItem: "story column (multiple files)",
	allItem: "entire document",
	tiddlerItem: "select a tiddler...",
	IDItem: "select a DOM element by ID...",
	HTMLItem: "[%0] output HTML only (omit CSS)",
	fileMsg: "select or enter a target path/filename",
	defaultFilename: "snapshot.html",
	okmsg: "snapshot written to %0",
	failmsg: "An error occurred while creating %0",
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var printing=params[0]&&params[0]=="print"; if (printing) params.shift();
		params = paramString.parseParams("anon",null,true,false,false);
		var id=getParam(params,"id","here");
		var label=getParam(params,"label",printing?this.printLabel:this.snapLabel);
		var prompt=getParam(params,"prompt",printing?this.printPrompt:this.snapPrompt);
		var btn=createTiddlyButton(place,label,prompt, function(ev){
			this.setAttribute("snapID",this.getAttribute("startID"));
			config.macros.snapshot.go(this,ev)
		});
		btn.setAttribute("startID",id);
		btn.setAttribute("snapID",id);
		btn.setAttribute("printing",printing?"true":"false");
		btn.setAttribute("HTMLOnly",config.options.chkSnapshotHTMLOnly?"true":"false");
	},
	go: function(here,ev) {
		var cms=config.macros.snapshot; // abbreviation
		var id=here.getAttribute("snapID");
		var printing=here.getAttribute("printing")=="true";
		var HTMLOnly=here.getAttribute("HTMLOnly")=="true";

		if (id==cms.askID||id==cms.askTiddlerID||id==cms.askDOMID) {
			cms.askForID(here,ev);
		} else if (id==cms.storyID) {
			story.forEachTiddler(function(t,e) {
				var out=cms.getsnap(e,e.id,printing,HTMLOnly);
				if (printing) cms.printsnap(out);
				else cms.savesnap(out,e.getAttribute('tiddler')+'.html');
			});
		} else {
			if (id==cms.allID) id="contentWrapper";
			var snapElem=document.getElementById(id);
			if (id==cms.hereID || id==cms.viewerID)
				var snapElem=story.findContainingTiddler(here);
			if (snapElem && hasClass(snapElem,"tiddler") && (id==cms.viewerID || HTMLOnly)) {
				// find viewer class element within tiddler element
				var nodes=snapElem.getElementsByTagName("*");
				for (var i=0; i<nodes.length; i++)
					if (hasClass(nodes[i],"viewer")) { snapElem=nodes[i]; break; }
			}
			if (!snapElem) // not in a tiddler or no viewer element or unknown ID
				{ e.cancelBubble=true; if(e.stopPropagation)e.stopPropagation(); return(false); }
			// write or print snapshot
			var out=cms.getsnap(snapElem,id,printing,HTMLOnly);
			if (printing) cms.printsnap(out); else cms.savesnap(out);
		}
		return false;
	},
	askForID: function(here,ev) {
		var ev = ev ? ev : window.event; 
		var cms=config.macros.snapshot; // abbreviation
		var id=here.getAttribute("snapID");
		var indent='\xa0\xa0\xa0\xa0';
		var p=Popup.create(here); if (!p) return false; p.className+=' sticky smallform';
		var s=createTiddlyElement(p,'select'); s.button=here;
		if (id==cms.askID) {
			s.options[s.length]=new Option(cms.askMsg,cms.askID);
			var tid=story.findContainingTiddler(here);
			if(tid) { 
				var title=tid.getAttribute("tiddler");
				if (here.getAttribute("HTMLOnly")!="true")
					s.options[s.length]=new Option(indent+cms.hereItem.format([title]),cms.hereID);
				s.options[s.length]=new Option(indent+cms.viewerItem.format([title]),cms.viewerID);
			}
			s.options[s.length]=new Option(indent+cms.tiddlerItem,cms.askTiddlerID);
			s.options[s.length]=new Option(indent+cms.IDItem,cms.askDOMID);
			s.options[s.length]=new Option(indent+cms.storyItem,"tiddlerDisplay");
			s.options[s.length]=new Option(indent+cms.storyFilesItem,cms.storyID);
			s.options[s.length]=new Option(indent+cms.allItem,"contentWrapper");
		}
		if (id==cms.askDOMID) {
			s.options[s.length]=new Option(cms.IDItem,cms.askDOMID);
			var elems=document.getElementsByTagName("*");
			var ids=[];
			for (var i=0;i<elems.length;i++)
				if (elems[i].id.length && elems[i].className!="animationContainer")
					ids.push(elems[i].id);
			ids.sort();
			for (var i=0;i<ids.length;i++) s.options[s.length]=new Option(indent+ids[i],ids[i]);
		}
		if (id==cms.askTiddlerID) {
			s.options[s.length]=new Option(cms.tiddlerItem,cms.askTiddlerID);
			var elems=document.getElementsByTagName("div");
			var ids=[];
			for (var i=0;i<elems.length;i++) { var id=elems[i].id;
				if (id.length && id.substr(0,story.idPrefix.length)==story.idPrefix && id!="tiddlerDisplay")
					ids.push(id);
			}
			ids.sort();
			for (var i=0;i<ids.length;i++) s.options[s.length]=new Option(indent+ids[i].substr(story.idPrefix.length),ids[i]);
		}
		s.options[s.length]=new Option(cms.HTMLItem.format([here.getAttribute("HTMLOnly")=="true"?"\u221a":"_"]),cms.HTMLItem);
		s.onchange=function(ev){
			var ev = ev ? ev : window.event; 
			var cms=config.macros.snapshot; // abbreviation
			var here=this.button;
			if (this.value==cms.HTMLItem) {
				config.options.chkSnapshotHTMLOnly=!config.options.chkSnapshotHTMLOnly;
				here.setAttribute("HTMLOnly",config.options.chkSnapshotHTMLOnly?"true":"false");
				config.macros.option.propagateOption("chkSnapshotHTMLOnly","checked",
					config.options.chkSnapshotHTMLOnly,"input");
			} else
				here.setAttribute("snapID",this.value);
			config.macros.snapshot.go(here,ev);
			return false;
		};
		Popup.show();
		ev.cancelBubble=true;
		if(ev.stopPropagation)ev.stopPropagation();
		return false;
	},
	getpath: function() {
		// get current path
		var path=getLocalPath(window.location.href);
		var slashpos=path.lastIndexOf("/");
		if (slashpos==-1) slashpos=path.lastIndexOf("\\"); 
		if (slashpos!=-1) path=path.substr(0,slashpos+1); // trim filename
		return path;
	},
	getsnap: function(snapElem,id,printing,HTMLOnly) {
		var cms=config.macros.snapshot; // abbreviation
		var out='<head><meta http-equiv="Content-Type" content="text/html;charset=utf-8" />';
		if (printing)
			out+='<base href="file:///'+cms.getpath().replace(/\\/g,'/')+'"></base>\n';
		if (!HTMLOnly) {
			var styles=document.getElementsByTagName('style');
			var fmt='<style>\n/* stylesheet=%0 */\n%1\n\n</style>\n';
			for(var i=0; i < styles.length; i++)
				out+=fmt.format([styles[i].getAttribute('id'),styles[i].innerHTML]);
		}
		out+='</head>\n';

		var elems=snapElem.getElementsByTagName('input');
		for (var i=0; i<elems.length; i++) { var e=elems[i];
			if (e.type=='text')		e.defaultValue=e.value;
			if (e.type=='checkbox')	 	e.defaultChecked=e.checked;
			if (e.type=='radiobutton')	e.defaultChecked=e.checked;
		}
		var elems=snapElem.getElementsByTagName('textarea');
		for (var i=0; i<elems.length; i++)	elems[i].defaultValue=elems[i].value;

		var fmt='<body>\n\n<div class="snapshot %0">%1</div>\n\n</body>\n';
		out+=fmt.format([(id==cms.viewerID?'tiddler viewer':''),snapElem.innerHTML]);

		return '<html>\n'+out+'</html>';
	},
	printsnap: function(out) {
		var win=window.open("","_blank","");
		win.document.open();
		win.document.writeln(out);
		win.document.close();
		win.focus(); // bring to front
		win.print(); // trigger print dialog
	},
	savesnap: function(out,target) {
		var cms=config.macros.snapshot; // abbreviation
		// make sure we are local
		if (window.location.protocol!="file:")
			{ alert(config.messages.notFileUrlError); return; }
		var target=target||cms.askForFilename(cms.fileMsg,cms.getpath(),cms.defaultFilename);
		if (!target) return; // cancelled by user
		// if specified file does not include a path, assemble fully qualified path and filename
		var slashpos=target.lastIndexOf("/"); if (slashpos==-1) slashpos=target.lastIndexOf("\\");
		if (slashpos==-1) {
			var h=document.location.href;
			var cwd=getLocalPath(decodeURIComponent(h.substr(0,h.lastIndexOf('/')+1)));
			target=cwd+target;
		}
		var link="file:///"+target.replace(/\\/g,'/'); // link for message text
		var ok=saveFile(target,convertUnicodeToUTF8(out));
		var msg=ok?cms.okmsg.format([target]):cms.failmsg.format([target]);
		displayMessage(msg,link);
	},
	askForFilename: function(msg,path,file) {
		if(window.Components) { // moz
			try {
				netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
				var nsIFilePicker = window.Components.interfaces.nsIFilePicker;
				var picker = Components.classes['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);
				picker.init(window, msg, nsIFilePicker.modeSave);
				var thispath = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
				thispath.initWithPath(path);
				picker.displayDirectory=thispath;
				picker.defaultExtension='html';
				picker.defaultString=file;
				picker.appendFilters(nsIFilePicker.filterAll|nsIFilePicker.filterText|nsIFilePicker.filterHTML);
				if (picker.show()!=nsIFilePicker.returnCancel) var result=picker.file.path;
			}
			catch(e) { alert('error during local file access: '+e.toString()) }
		}
		else { // IE
			try { // XP/Vista only
				var s = new ActiveXObject('UserAccounts.CommonDialog');
				s.Filter='All files|*.*|Text files|*.txt|HTML files|*.htm;*.html|';
				s.FilterIndex=3; // default to HTML files;
				s.InitialDir=path;
				s.FileName=file;
				if (s.showOpen()) var result=s.FileName;
			}
			catch(e) { var result=prompt(msg,path+file); } // fallback for non-XP IE
		}
		return result;
	}
};
//}}}

// // TOOLBAR DEFINITIONS
//{{{
config.commands.snapshotSave = {
	text: "snap",
	tooltip: config.macros.snapshot.snapPrompt,
	handler: function(ev,src,title) {
		src.setAttribute("snapID","ask");
		src.setAttribute("printing","false");
		src.setAttribute("HTMLOnly",config.options.chkSnapshotHTMLOnly?"true":"false");
		config.macros.snapshot.go(src,ev);
		return false;
	}
};
config.commands.snapshotSaveViewer = {
	text: "snap",
	tooltip: config.macros.snapshot.snapPrompt,
	handler: function(ev,src,title) {
		src.setAttribute("snapID","viewer");
		src.setAttribute("printing","false");
		src.setAttribute("HTMLOnly",config.options.chkSnapshotHTMLOnly?"true":"false");
		config.macros.snapshot.go(src,ev);
		return false;
	}
};
config.commands.snapshotPrint = {
	text: "print",
	tooltip: config.macros.snapshot.printPrompt,
	handler: function(ev,src,title) {
		src.setAttribute("snapID","ask");
		src.setAttribute("printing","true");
		src.setAttribute("HTMLOnly",config.options.chkSnapshotHTMLOnly?"true":"false");
		config.macros.snapshot.go(src,ev);
		return false;
	}
};
config.commands.snapshotPrintViewer = {
	text: "print",
	tooltip: config.macros.snapshot.printPrompt,
	handler: function(ev,src,title) {
		src.setAttribute("snapID","viewer");
		src.setAttribute("printing","true");
		src.setAttribute("HTMLOnly",config.options.chkSnapshotHTMLOnly?"true":"false");
		config.macros.snapshot.go(src,ev);
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