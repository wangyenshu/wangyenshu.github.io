/***
|Name|SaveTiddlerToFilePlugin|
|Source|http://www.TiddlyTools.com/#SaveTiddlerToFilePlugin|
|Documentation|http://www.TiddlyTools.com/#SaveTiddlerToFilePlugin|
|Version|1.1.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|toolbar command to save tiddler source definition to an external text file|
!!!!!Usage/Example
<<<
Embedded as a macro in tiddler content:
{{{
<<saveTiddlerToFile label:text prompt:text filename:text path:text>>
}}}
or, as a tiddler toolbar command in [[ViewTemplate]]:
{{{
<span class='toolbar' macro='toolbar saveTiddlerToFile'></span>
}}}
where:
* ''label'' //(optional)//<br>specifies the text to display for the command
* ''prompt'' //(optional)//<br>specifies the mouseover 'tooltip' text for the command
* ''filename'' //(optional)//<br>specifies the default filename to create.  You can use "*" within the filename as a 'substitution marker' that will be automatically replaced with the current tiddler's title.    If ''file'' is omitted, a system-specific 'ask for filename' dialog box will be displayed, using 'tiddlername.tid' as the suggested default filename.  //Note: if the tiddler is a plugin (tagged with <<tag systemConfig>>), then the suggested filename will use ".js" instead of ".tid"//
* ''path'' //(optional)//<br>specifies the default folder in which to create the output file.  If the path begins with "./" (or ".\" for Windows) it is treated as a relative path, and the path containing the current document will be prepended to create a full path reference.  Otherwise, the specified path must be a full path reference.  You can use "*" within the path as a 'substitution marker' that will be automatically replaced with the current tiddler's title.  If ''path'' is omitted, the path containing the current document will be used by default.
Examples:
>{{{<<saveTiddlerToFile>>}}}<br>Try it: <<saveTiddlerToFile>>
>{{{<<saveTiddlerToFile label:"save 'txt' file to current folder..." filename:*.txt>>}}}<br>Try it: <<saveTiddlerToFile label:"save 'txt' file to current folder..." filename:*.txt>>
>{{{<<saveTiddlerToFile label:"save 'txt' file to archive..." filename:*.txt path:./archive>>}}}<br>Try it: <<saveTiddlerToFile label:"save 'txt' file to archive..." filename:*.txt path:./archive>>
<<<
!!!!!Configuration
<<<
When {{{<span class='toolbar' macro='toolbar saveTiddlerToFile'></span>}}} is used to create a tiddler toolbar command, the default values for all parameters are applied (e.g., you will be prompted to select/enter a filename with a ".tid" or ".js" extension).  You can override these defaults by writing the following into a tiddler tagged with <<tag systemConfig>>:
{{{
config.commands.saveTiddlerToFile.filename="...";
config.commands.saveTiddlerToFile.path="...";
}}}
<<<
!!!!!Revisions
<<<
2011.02.14 1.1.1 fix OSX error: use picker.file.path
2008.04.22 1.1.0 converted from inline script to tiddler toolbar command
2007.06.26 1.0.0 initial release as inline script
<<<
!!!!!Code
***/
//{{{
version.extensions.SaveTiddlerToFilePlugin= {major: 1, minor: 1, revision: 1, date: new Date(2011,2,14)};

config.macros.saveTiddlerToFile = {
	label: "save this tiddler to a file",
	prompt: "save this tiddler's SOURCE text to a local file",
	askmsg: "select an output filename for this tiddler",
	okmsg: "Tiddler source written to %0",
	failmsg: "An error occurred while creating %0",
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		params = paramString.parseParams("anon",null,true,false,false);
		var label=getParam(params,"label",this.label);
		var prompt=getParam(params,"prompt",this.prompt);
		var filename=getParam(params,"filename","");
		var path=getParam(params,"path","");
		var btn=createTiddlyButton(place,label,prompt,
			function(event){config.macros.saveTiddlerToFile.go(this,event)});
		btn.setAttribute("filename",filename);
		btn.setAttribute("path",path);
	},
	go: function(src,event) {
		var cms=config.macros.saveTiddlerToFile; // abbreviation
		var here=story.findContainingTiddler(src); if (!here) return;
		var tid=here.getAttribute('tiddler');
		var filename=src.getAttribute("filename")||"";
		filename=filename.replace(/\*/g,tid);
		var path=src.getAttribute("path")||"";
		path=path.replace(/\*/g,tid);
		if (!path.length||path.substr(0,2)=="./"||path.substr(0,2)==".\\") {
			var curr=getLocalPath(document.location.href);
			var slashpos=curr.lastIndexOf("/"); if (slashpos==-1) slashpos=curr.lastIndexOf("\\"); 
			if (slashpos!=-1) curr=curr.substr(0,slashpos+1); // remove filename, leave trailing slash
			var trailingslash=curr.indexOf("\\")!=-1?"\\":"/"; // fixup for missing trailing slash
			if (path.length && path.substr(path.length,1)!=trailingslash) path+=trailingslash;
			path=!path.length?curr:curr+path.substr(2); // convert relative path to absolute path
		}
		var deffn=tid+(store.getTiddler(tid).isTagged("systemConfig")?".js":".tid");
		var target=filename.length?path+filename:cms.askForFilename(cms.askmsg,path,deffn); // ask
		if (!target||!target.length) return false; // cancelled by user
		var msg=saveFile(target,store.getTiddlerText(tid))?cms.okmsg:cms.failmsg;
		clearMessage(); displayMessage(msg.format([target]),"file:///"+target.replace(/\\/g,'/'));
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
				picker.defaultExtension='tid';
				picker.defaultString=file;
				picker.appendFilters(nsIFilePicker.filterAll|nsIFilePicker.filterText|nsIFilePicker.filterHTML);
				if (picker.show()!=nsIFilePicker.returnCancel) var result=picker.file.path;
			}
			catch(e) { alert('error during local file access: '+e.toString()) }
		}
		else { // IE
			try { // XP/Vista only
				var s = new ActiveXObject('UserAccounts.CommonDialog');
				s.Filter='All files|*.*|Text files|*.txt;*.tid;*.js|HTML files|*.htm;*.html|';
				s.FilterIndex=2; // default to TEXT files;
				s.InitialDir=path;
				s.FileName=file;
				if (s.showOpen()) var result=s.FileName;
			}
			catch(e) { var result=prompt(msg,path+file); } // fallback for non-XP IE
		}
		return result;
	}
}

// // toolbar definition
config.commands.saveTiddlerToFile= {
	text: "file",
	tooltip: config.macros.saveTiddlerToFile.prompt,
	filename: "",
	path: "",
	handler: function(event,src,title) {
		var ccs=config.commands.saveTiddlerToFile;
		if (ccs.filename.length) src.setAttribute("filename",ccs.filename);
		if (ccs.path.length) src.setAttribute("path",ccs.path);
		config.macros.saveTiddlerToFile.go(src,event);
		return false;
	}
};
//}}}