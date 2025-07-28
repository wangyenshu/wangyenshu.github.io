/***
|Name|ExternalTiddlersPlugin|
|Source|http://www.TiddlyTools.com/#ExternalTiddlersPlugin|
|Documentation|http://www.TiddlyTools.com/#ExternalTiddlersPluginInfo|
|Version|1.3.3|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Requires|TemporaryTiddlersPlugin, SectionLinksPlugin (optional, recommended)|
|Description|retrieve and wikify content from external files or remote URLs|
This plugin extends the {{{<<tiddler>>}}} macro syntax so you can retrieve and wikify content directly from external files or remote URLs.  You can also define alternative "fallback" sources to provide basic "import on demand" handling by automatically creating/importing tiddler content from external sources when the specified ~TiddlerName does not already exist in your document.
!!!!!Documentation
>see [[ExternalTiddlersPluginInfo]]
!!!!!Configuration
<<<
<<option chkExternalTiddlersImport>> automatically create/import tiddlers when using external fallback references
{{{usage: <<option chkExternalTiddlersImport>>}}}
<<option chkExternalTiddlersQuiet>> don't display messages when adding tiddlers ("quiet mode")
{{{usage: <<option chkExternalTiddlersQuiet>>}}}
<<option chkExternalTiddlersTemporary>> tag retrieved tiddlers as 'temporary'(requires [[TemporaryTiddlersPlugin]])
{{{usage: <<option chkExternalTiddlersTemporary>>}}}
tag retrieved tiddlers with: <<option txtExternalTiddlersTags>>
{{{usage: <<option txtExternalTiddlersTags>>}}}

__password-protected server settings //(optional, if needed)//:__
>username: <<option txtRemoteUsername>> password: <<option txtRemotePassword>>
>{{{usage: <<option txtRemoteUsername>> <<option txtRemotePassword>>}}}
>''note: these settings are also used by [[LoadTiddlersPlugin]] and [[ImportTiddlersPlugin]]''
<<<
!!!!!Revisions
<<<
2011.04.27 1.3.3 merge/clone defaultCustomFields for saving in TiddlySpace
|please see [[ExternalTiddlersPluginInfo]] for additional revision details|
2007.11.25 1.0.0 initial release - moved from CoreTweaks
<<<
!!!!!Code
***/
//{{{
version.extensions.ExternalTiddlersPlugin= {major: 1, minor: 3, revision: 3, date: new Date(2011,4,26)};

// optional automatic import/create for missing tiddlers
if (config.options.chkExternalTiddlersImport==undefined) config.options.chkExternalTiddlersImport=true;
if (config.options.chkExternalTiddlersTemporary==undefined) config.options.chkExternalTiddlersTemporary=true;
if (config.options.chkExternalTiddlersQuiet==undefined) config.options.chkExternalTiddlersQuiet=false;
if (config.options.txtExternalTiddlersTags==undefined) config.options.txtExternalTiddlersTags="external";
if (config.options.txtRemoteUsername==undefined) config.options.txtRemoteUsername="";
if (config.options.txtRemotePassword==undefined) config.options.txtRemotePassword="";

config.macros.tiddler.externalTiddlers_handler = config.macros.tiddler.handler;
config.macros.tiddler.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	params = paramString.parseParams("name",null,true,false,true);
	var names = params[0]["name"];
	var list = names[0];
	var items = list.split("|"); 
	var className = names[1] ? names[1] : null;
	var args = params[0]["with"];

	// UTILITY FUNCTIONS
	function extract(text,tids) { // get tiddler source content from plain text or TW doc
		if (!text || !tids || !tids.length) return text; // no text or no tiddler list... return text as-is
		var remoteStore=new TiddlyWiki();
		if (!remoteStore.importTiddlyWiki(text)) return text; // not a TW document... return text as-is
		var out=[]; for (var t=0;t<tids.length;t++)
			{ var txt=remoteStore.getTiddlerText(tids[t]); if (txt) out.push(txt); }
		return out.join("\n");
	}
	function substitute(text,args) { // replace "substitution markers" ($1-$9) with macro param values (if any)
		if (!text || !args || !args.length) return text;
		var n=args.length; if (n>9) n=9;
		for(var i=0; i<n; i++) { var re=new RegExp("\\$" + (i + 1),"mg"); text=text.replace(re,args[i]); }
		return text;
	}
	function addTiddler(src,text,tids) { // extract tiddler(s) from text and create local copy
		if (!config.options.chkExternalTiddlersImport) return; // not enabled... do nothing
		if (!text || !tids || !tids.length) return; // no text or no tiddler list... do nothing
		var remoteStore=new TiddlyWiki();
		if (!remoteStore.importTiddlyWiki(text)) // not a TW document... create a single tiddler from text
			makeTiddler(src,text,tids[0]);
		else // TW document with "permaview-like" suffix... copy tiddler(s) from remote store
			for (var t=0;t<tids.length;t++)
				insertTiddler(src,remoteStore.getTiddler(tids[t]));
		return;
	}
	function makeTiddler(src,text,title) { // create a new tiddler object from text
		var who=config.options.txtUserName; var when=new Date();
		var msg="/%\n\nThis tiddler was automatically created using ExternalTiddlersPlugin\n";
		msg+="by %0 on %1\nsource: %2\n\n%/";
		var tags=config.options.txtExternalTiddlersTags.readBracketedList();
		if (config.options.chkExternalTiddlersTemporary) tags.pushUnique(config.options.txtTemporaryTag);
		var fields=merge({},config.defaultCustomFields,true)
		store.saveTiddler(null,title,msg.format([who,when,src])+text,who,when,tags,fields);
		if (!config.options.chkExternalTiddlersQuiet) displayMessage("Created new tiddler '"+title+"' from text file "+src);
	}
	function insertTiddler(src,t) { // import a single tiddler object into the current document store
		if (!t) return;
		var who=config.options.txtUserName; var when=new Date();
		var msg="/%\n\nThis tiddler was automatically imported using ExternalTiddlersPlugin\n";
		msg+="by %0 on %1\nsource: %2\n\n%/";
		var newtags=new Array().concat(t.tags,config.options.txtExternalTiddlersTags.readBracketedList());
		if (config.options.chkExternalTiddlersTemporary) newtags.push(config.options.txtTemporaryTag);
		var fields=merge(t.fields,config.defaultCustomFields,true)
		store.saveTiddler(null,t.title,msg.format([who,when,src])+t.text,t.modifier,t.modified,newtags,fields);
		if (!config.options.chkExternalTiddlersQuiet) displayMessage("Imported tiddler '"+t.title+"' from "+src);
	}
	function getGUID()  // create a Globally Unique ID (for async reference to DOM elements)
		 { return new Date().getTime()+Math.random().toString(); }

	// loop through "|"-separated list of alternative tiddler/file/URL references until successful
	var fallback="";
	for (var i=0; i<items.length; i++) { var src=items[i];
		// if tiddler (or shadow) exists, replace reference list with current source name and apply core handler
		if (store.getTiddlerText(src)) {
			arguments[2][0]=src; // params[] array
			var p=arguments[4].split(list); arguments[4]=p[0]+src+p[1]; // paramString
			this.externalTiddlers_handler.apply(this,arguments);
			break; // stop processing alternatives
		}

		// tiddler doesn't exist, and not an external file/URL reference... skip it
		if (!config.formatterHelpers.isExternalLink(src)) {
			if (!fallback.length) fallback=src; // title to use when importing external tiddler
			continue;
		}
		// separate 'permaview' list of tiddlers (if any) from file/URL (i.e., '#name name name..." suffix)
		var p=src.split("#"); src=p.shift(); var tids=p.join('#').readBracketedList(false);
		// if reference is to a remotely hosted document or the current document is remotely hosted...
		if (src.substr(0,4)=="http" || document.location.protocol.substr(0,4)=="http") {
			if (src.substr(0,4)!="http") // fixup URL for relative remote references
				{ var h=document.location.href; src=h.substr(0,h.lastIndexOf("/")+1)+src; }
			var wrapper = createTiddlyElement(place,"span",getGUID(),className); // create placeholder for async rendering
			var callback=function(success,params,text,src,xhr) { // ASYNC CALLBACK
				if (!success) { displayMessage(xhr.status); return; } // couldn't read remote file... report the error 
				if (params.fallback.length)
					addTiddler(params.url,text,params.tids.length?params.tids:[params.fallback]); // import tiddler
				var wrapper=document.getElementById(params.id); if (!wrapper) return; 
				wikify(substitute(extract(text,params.tids),params.args),wrapper); // ASYNC RENDER
			};
			var callbackparams={ url:src, id:wrapper.id, args:args, tids:tids, fallback:fallback }  // ASYNC PARAMS
			var name=config.options.txtRemoteUsername; // optional value
			var pass=config.options.txtRemotePassword; // optional value
			var x=doHttp("GET",src,null,null,name,pass,callback,callbackparams,null)
			if (typeof(x)=="string") // couldn't start XMLHttpRequest... report error
				{ displayMessage("error: cannot access "+src); displayMessage(x); }
			break; // can't tell if async read will succeed.... stop processing alternatives anyway.
		}
		else { // read file from local filesystem
			var text=loadFile(getLocalPath(src));
			if (!text) { // couldn't load file... fixup path for relative reference and retry...
				var h=document.location.href;
				var text=loadFile(getLocalPath(decodeURIComponent(h.substr(0,h.lastIndexOf("/")+1)))+src);
			}
			if (text) { // test it again... if file was loaded OK, render it in a class wrapper
				if (fallback.length) // create new tiddler using primary source name (if any)
					addTiddler(src,text,tids.length?tids:[fallback]);
				var wrapper=createTiddlyElement(place,"span",null,className);
				wikify(substitute(extract(text,tids),args),wrapper); // render
				break; // stop processing alternatives
			}
		}
	}
};
//}}}