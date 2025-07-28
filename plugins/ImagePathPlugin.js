/***
|Name|ImagePathPlugin|
|Source|http://www.TiddlyTools.com/#ImagePathPlugin|
|Version|0.7.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin
|Description|Tell TiddlyWiki where to look for image files.  Permits multiple 'fallback' locations|
|Status|ALPHA - initial development/testing only - may be unstable - do not distribute|

!!!!!Usage
<<<
This plugin adds "resolvePath()" fallback processing to the {{{[img[...]]}}} formatter's handler, so that local image file references can be successfully resolved, even if the files cannot be located on the local filesystem.

The plugin tries alternative file "paths" that are listed, one per line, in an optional tiddler, [[ImagePathList]].  Each path in the list is combined with the image filename, which is then checked for existence, until the file is located.  If no alternative is found, or [[ImagePathList]] is not present, then a 'last-ditch' fallback is attempted using the remote system and path specified in [[SiteUrl]] (if present).

If no fallback attempt is successful (i.e., because no [[ImagePathList]] OR [[SiteUrl]] tiddlers have been defined), the plugin simply passes the original image file value along for default handling by the browser without any "path resolution" being applied.(i.e, the current TW core behavior occurs).

| ''Important note: This plugin may cause one or more security alert messages to appear, because it uses browser-specific functions that can require security permission in order to access the local filesystem to check for the existence of a given image file.  If you block local access, the 'last-ditch' fallback using the remote [[SiteUrl]] (if present) will be attempted.'' |

Note: the image formatter code contained here also includes support for AttachFilePlugin extensions (if installed).  AttachFilePlugin includes its own fallback mechanism for handling embedded vs. local file vs. remote URL references to the attached binary file.  Both methods may be used: ImagePathPlugin provides fallback for images contained in tiddler content, while AttachFilePlugin works well for access to non-image binary files (or images used in CSS as backgrounds, textures, etc.)
<<<
!!!!!Examples
<<<
coming soon...
<<<
!!!!!Revisions
<<<
''2007.04.13 [0.7.1]'' in testFile(), convert any file:// references to local native format before checking for existence.
''2007.03.26 [0.7.0]'' for IE, use onError handling to trigger call to resolvePath() so it will only be invoked if the original path/file is not found by the browser-native lookup.  This avoids an unneeded call to fileExists() and the accompanying ActiveX security alert message box (as well as being slightly more efficient...)
''2007.03.25 [0.6.0]'' code cleanup (moved global functions into config.formatterHelpers) plus documentation re-write
''2007.03.24 [0.5.0]'' initial implementation - ALPHA - do not distribute
<<<
!!!!!Code
***/
//{{{
version.extensions.ImagePathPlugin= {major: 0, minor: 7, revision: 1, date: new Date(2007,4,13)};
//}}}
//{{{
// name of path definition tiddler
if (config.options.txtPathTiddler==undefined) config.options.txtPathTiddler="ImagePathList";
//}}}
//{{{
// low-level wrapper for platform-specific tests for local file existence
// returns true/false without visible error display
// Uses Components for FF and ActiveX FSO object for MSIE
// NOTE: this can cause a security warning on some browsers
config.formatterHelpers.fileExists=function(theFile) {
	var found=false;
	// DEBUG: alert('testing fileExists('+theFile+')...');
	if(window.Components) {
		try { netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect"); }
		catch(e) { return false; } // security access denied
		var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		try { file.initWithPath(theFile); }
		catch(e) { return false; } // invalid directory
		found = file.exists();
	}
	else { // use ActiveX FSO object for MSIE 
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		found = fso.FileExists(theFile)
	}
	// DEBUG: alert(theFile+" "+(found?"exists":"not found"));
	return found;
}
//}}}
//{{{
// higher-level logic for checking local file existence.
// with secondary check for finding relative file references
// and automatic OK of http-based references without checking local filesystem
config.formatterHelpers.testFile=function(theFile) {
	if (document.location.protocol!="file:") return true; // viewing remote document, can't test local filesystem... assume OK
	if (theFile.substr(0,5)=="http:") return true; // remote HTTP reference... assume OK
	if (theFile.substr(0,5)=="file:") theFile=getLocalPath(theFile); // convert local FILE reference to native format
	if (this.fileExists(theFile)) return true; // file exists locally... OK to use!
	// file might have been relative, add path from current document and try again
	var docPath=document.location.href;
	var slashpos=docPath.lastIndexOf("/"); if (slashpos==-1) slashpos=docPath.lastIndexOf("\\"); 
	if (slashpos!=-1 && slashpos!=docPath.length-1) docPath=docPath.substr(0,slashpos+1); // trim off filename
	if (this.fileExists(getLocalPath(docPath+theFile)))
		return true; // ah ha!... file exists relative to current document... OK to use!
	return false; // file not found on local system
}
//}}}
//{{{
// given a path/file string, check for existence and
// try alternatives (if any) defined in a tiddler
// with last-ditch using system/path from SiteUrl (if any)
config.formatterHelpers.resolvePath=function(theFile,testoriginal) {
	if (testoriginal && this.testFile(theFile)) return theFile; // FOUND FILE - use specified path/file without modification
	// get the filename portion only
	var slashpos=theFile.lastIndexOf("/"); if (slashpos==-1) slashpos=theFile.lastIndexOf("\\"); 
	var theName=(slashpos==-1)?theFile:theFile.substr(slashpos+1);
	// get list of fallbacks (if any)
	var pathText=store.getTiddlerText(config.options.txtPathTiddler);
	if (pathText && pathText.length) {
		var paths=pathText.split("\n");
		for (p=0; p<paths.length; p++) // combine path+filename until one works...
			if (this.testFile(paths[p]+theName))
				return paths[p]+theName; // FOUND FILE - use alternative path+filename
	}
	// try "last ditch" fallback using SiteURL - assumes that original path/file was relative to document location
	var siteURL=store.getTiddlerText("SiteUrl");
	if (!siteURL||!siteURL.length) return theFile; // NO FALLBACK - use original path/file and hope for the best
	// trim filename (if any) from site URL
	var slashpos=siteURL.lastIndexOf("/"); if (slashpos==-1) slashpos=siteURL.lastIndexOf("\\"); 
	if (slashpos!=-1 && slashpos!=siteURL.length-1) siteURL=siteURL.substr(0,slashpos+1);
	return siteURL+theFile; // LAST DITCH: use system/path from SiteUrl combined with original file/path
}
//}}}
//{{{
// replace standard handler for image formatter
// adds call to resolvePath() to handle fallback processing
// includes support for AttachFilePlugin as well
config.formatters[config.formatters.findByField("name","image")].handler=function(w) {
	if (!this.lookaheadRegExp)  // fixup for TW2.0.x
		this.lookaheadRegExp = new RegExp(this.lookahead,"mg");
	this.lookaheadRegExp.lastIndex = w.matchStart;
	var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
	if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
		// Simple bracketted link
		var e = w.output;
		if(lookaheadMatch[5]) {
			var link = lookaheadMatch[5];
			if (!config.formatterHelpers.isExternalLink) // fixup for TW2.0.x
				var external=!store.tiddlerExists(link)&&!store.isShadowTiddler(link);
			else
				var external=config.formatterHelpers.isExternalLink(link);
			if (external) {
				if (config.macros.attach && config.macros.attach.isAttachment(link)) { // ELS - attachments
					e = createExternalLink(w.output,link);
					e.href=config.macros.attach.getAttachment(link);
					e.title = config.macros.attach.linkTooltip + link;
				} else
					e = createExternalLink(w.output,link);
			} else 
				e = createTiddlyLink(w.output,link,false,null,w.isStatic);
			addClass(e,"imageLink");
		}
		var img = createTiddlyElement(e,"img");
		if(lookaheadMatch[1])
			img.align = "left";
		else if(lookaheadMatch[2])
			img.align = "right";
		if(lookaheadMatch[3])
			img.title = lookaheadMatch[3];
		if (config.macros.attach!=undefined && config.macros.attach.isAttachment(lookaheadMatch[4])) // ELS - attachments
			img.src=config.macros.attach.getAttachment(lookaheadMatch[4]);
		else {
			if (config.browser.isIE || config.browser.isSafari) { // ELS - path processing
				// IE and Safari use browser's onError handling to check the original file...
				// avoids extra security alert messages due to use of Components/ActiveX for filesystem access
				img.onerror=(function(){this.src=config.formatterHelpers.resolvePath(this.src,false);return false;});
				img.src=lookaheadMatch[4]; // ELS - path processing
			} else {
				// if NOT IE or Safari, always check the original path/file before rendering
				img.src=config.formatterHelpers.resolvePath(lookaheadMatch[4],true);
			}
		}
		w.nextMatch = this.lookaheadRegExp.lastIndex;
	}
}
//}}}