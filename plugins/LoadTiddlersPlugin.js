/***
|Name|LoadTiddlersPlugin|
|Source|http://www.TiddlyTools.com/#LoadTiddlersPlugin|
|Documentation|http://www.TiddlyTools.com/#LoadTiddlersPluginInfo|
|Version|3.9.0|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|macro for automated updates or one-click installations of tiddlers from remote sources|
!!!!!Documentation
>see [[LoadTiddlersPluginInfo]]
!!!!!Configuration
<<<
<<option chkLoadTiddlersShowReport>>after loading tiddlers, automatically display [[ImportedTiddlers]] (if created)
__password-protected server settings //(optional, if needed)//:__
>username: <<option txtRemoteUsername>> password: <<option txtRemotePassword>>
>{{{usage: <<option txtRemoteUsername>> <<option txtRemotePassword>>}}}
>''note: these settings are also used by [[ExternalTiddlersPlugin]] and [[ImportTiddlersPlugin]]''
<<<
!!!!!Revisions
<<<
2010.08.11 3.9.0 added 'autosave' optional param
|please see [[LoadTiddlersPluginInfo]] for additional revision details|
2005.07.20 1.0.0 Initial Release
<<<
!!!!!Code
***/
//{{{
version.extensions.LoadTiddlersPlugin= {major: 3, minor: 9, revision: 0, date: new Date(2010,8,11)};

if (config.options.chkLoadTiddlersShowReport===undefined)
	config.options.chkLoadTiddlersShowReport=true;

config.macros.loadTiddlers = {
	label: '',
	tip: "add/update tiddlers from '%0'",
	lockedTag: 'noReload',	// if existing tiddler has this tag value, don't overwrite it, even if inbound tiddler is newer
	askMsg: 'Please enter a local path/filename or a remote URL',
	openMsg: 'Opening %0',
	openErrMsg: 'Could not open %0 - error=%1',
	readMsg: 'Read %0 bytes from %1',
	foundMsg: 'Found %0 tiddlers in %1',
	nochangeMsg: "'%0' is up-to-date... skipped.",
	lockedMsg: "'%0' is tagged '%1'... skipped.",
	skippedMsg: 'skipped (cancelled by user)',
	loadedMsg: 'Loaded %0 of %1 tiddlers from %2',
	reportTitle: 'ImportedTiddlers',
	warning: "Warning!!  Processing '%0' as a systemConfig (plugin) tiddler may produce unexpected results! Press OK to proceed.",
	autosaveMsg: 'Save current document?  Press OK to proceed.',
	handler: function(place,macroName,params) {
		var label=(params[0] && params[0].substr(0,6)=='label:')?params.shift().substr(6):this.label;
		var tip=(params[0] && params[0].substr(0,7)=='prompt:')?params.shift().substr(7):this.tip;
		var filter='updates';
		if (params[0] && (params[0]=='all' || params[0]=='new' || params[0]=='changes' || params[0]=='updates'
			|| params[0].substr(0,8)=='tiddler:' || params[0].substr(0,4)=='tag:'))
			filter=params.shift();
		var src=params.shift(); if (!src || !src.length) return; // filename is required
		var quiet=(params[0]=='quiet'); if (quiet) params.shift();
		var ask=(params[0]=='confirm'); if (ask) params.shift();
		var force=(params[0]=='force'); if (force) params.shift();
		var init=(params[0]=='init'); if (init) params.shift();
		var nodirty=(params[0]=='nodirty'); if (nodirty) params.shift();
		var norefresh=(params[0]=='norefresh'); if (norefresh) params.shift();
		var noreport=(params[0]=='noreport'); if (noreport) params.shift();
		var autosave=(params[0]=='autosave'); if (autosave) params.shift();
		this.newTags=[]; if (params[0]) this.newTags=params; // any remaining params are used as 'autotags'
		var flags={quiet:quiet, ask:ask, filter:filter, force:force, init:init,
			nodirty:nodirty, norefresh:norefresh, noreport:noreport, autosave:autosave};
		if (label.trim().length) { // CLICKABLE LINK
			createTiddlyButton(place,
				label.format([src.replace(/%20/g,' ')]),
				tip.format([src.replace(/%20/g,' ')]),
				function() {
					var cml=config.macros.loadTiddlers;
					cml.loadFile(src,cml.doImport,flags);
					return false;
				})
		}
		else // IMMEDIATE IMPORT
			this.loadFile(src,this.doImport,flags);
	},
	loadFile: function(src,callback,params) {
		var quiet=params.quiet;
		if (src=='ask') src=prompt(this.askMsg);
		if (src==undefined || !src.length) return null; // filename is required
		if (!quiet) clearMessage();
		if (!quiet) displayMessage(this.openMsg.format([src.replace(/%20/g,' ')]));
		// if working locally and src is not a URL, read from local filesystem
		if (document.location.protocol=='file:' && src.substr(0,5)!='http:' && src.substr(0,5)!='file:') {
			var txt=loadFile(src);
			if (!txt) { // file didn't load, might be relative path.. try fixup
				var pathPrefix=document.location.href;  // get current document path and trim off filename
				var slashpos=pathPrefix.lastIndexOf('/'); if (slashpos==-1) slashpos=pathPrefix.lastIndexOf('\\'); 
				if (slashpos!=-1 && slashpos!=pathPrefix.length-1) pathPrefix=pathPrefix.substr(0,slashpos+1);
				src=pathPrefix+src;
				if (pathPrefix.substr(0,5)!='http:') src=getLocalPath(src);
				var txt=loadFile(src);
			}
			if (!txt) { // file still didn't load, report error
				if (!quiet) displayMessage(this.openErrMsg.format([src.replace(/%20/g,' '),'(unknown)']));
			} else {
				if (!quiet) displayMessage(this.readMsg.format([txt.length,src.replace(/%20/g,' ')]));
				if (version.major+version.minor*.1+version.revision*.01!=2.52)
					txt=convertUTF8ToUnicode(txt);
				if (callback) callback(true,params,txt,src,null);
			}
		} else { // use XMLHttpRequest
			doHttp('GET',src,null,null,config.options.txtRemoteUsername,config.options.txtRemotePassword,callback,params,null);
		}
	},
	readTiddlersFromHTML: function(html) {
		// for TW2.2+
		if (TiddlyWiki.prototype.importTiddlyWiki!=undefined) {
			var remoteStore=new TiddlyWiki();
			remoteStore.importTiddlyWiki(html);
			return remoteStore.getTiddlers('title');	
		}
	},
	readTiddlersFromCSV: function(CSV) {
		var remoteStore=new TiddlyWiki();
		// GET NAMES
		var lines=CSV.replace(/\r/g,'').split('\n');
		var names=lines.shift().replace(/"/g,'').split(',');
		CSV=lines.join('\n');
		// ENCODE commas and newlines within quoted values
		var comma='!~comma~!'; var commaRE=new RegExp(comma,'g');
		var newline='!~newline~!'; var newlineRE=new RegExp(newline,'g');
		CSV=CSV.replace(/"([^"]*?)"/g,
			function(x){ return x.replace(/\,/g,comma).replace(/\n/g,newline); });
		// PARSE lines
		var lines=CSV.split('\n');
		for (var i=0; i<lines.length; i++) { if (!lines[i].length) continue;
			var values=lines[i].split(',');
			// DECODE commas, newlines, and doubled-quotes, and remove enclosing quotes (if any)
			for (var v=0; v<values.length; v++)
				values[v]=values[v].replace(commaRE,',').replace(newlineRE,'\n')
					.replace(/^"|"$/g,'').replace(/""/g,'"');
			// EXTRACT tiddler values
			var title=''; var text=''; var tags=[]; var fields={};
			var created=null; var when=new Date(); var who=config.options.txtUserName;
			for (var v=0; v<values.length; v++) { var val=values[v];
				if (names[v]) switch(names[v].toLowerCase()) {
					case 'title':	title=val.replace(/\[\]\|/g,'_'); break;
					case 'created': created=new Date(val); break;
					case 'modified':when=new Date(val); break;
					case 'modifier':who=val; break;
					case 'text':	text=val; break;
					case 'tags':	tags=val.readBracketedList(); break;
					default:	fields[names[v].toLowerCase()]=val; break;
				}
			}
			// CREATE tiddler in temporary store
			if (title.length)
				remoteStore.saveTiddler(title,title,text,who,when,tags,fields,true,created||when);
		}
		return remoteStore.getTiddlers('title');	
	},
	createTiddlerFromFile: function(src,txt) {
		var t=new Tiddler();
		var pos=src.lastIndexOf("/"); if (pos==-1) pos=src.lastIndexOf("\\");
		t.title=pos==-1?src:src.substr(pos+1);
		t.text=txt; 
		t.created=t.modified=new Date();
		t.modifier=config.options.txtUserName;
		if (src.substr(src.length-3,3)=='.js') t.tags=['systemConfig'];
		return [t];
	},
	doImport: function(status,params,html,src,xhr) {
		var cml=config.macros.loadTiddlers; // abbrev
		src=src.split('?')[0]; // strip off "?nocache=..."
		if (!status) {
			displayMessage(cml.openErrMsg.format([src.replace(/%20/g,' '),xhr.status]));
			return false;
		}
		var quiet=params.quiet;
		var ask=params.ask;
		var filter=params.filter;
		var force=params.force;
		var init=params.init;
		var nodirty=params.nodirty;
		var norefresh=params.norefresh;
		var noreport=params.noreport;
		var autosave=params.autosave;
		var tiddlers = cml.readTiddlersFromHTML(html);
		if (!tiddlers||!tiddlers.length) tiddlers=cml.readTiddlersFromCSV(html);
		if (!tiddlers||!tiddlers.length) tiddlers=cml.createTiddlerFromFile(src,html);
		var count=tiddlers?tiddlers.length:0;
		if (!quiet) displayMessage(cml.foundMsg.format([count,src.replace(/%20/g,' ')]));
		var wasDirty=store.isDirty();
		store.suspendNotifications();
		var count=0;
		if (tiddlers) for (var t=0;t<tiddlers.length;t++) {
			var inbound = tiddlers[t];
			var theExisting = store.getTiddler(inbound.title);
			if (inbound.title==cml.reportTitle)
				continue; // skip 'ImportedTiddlers' history from the other document...
			if (theExisting && theExisting.tags.contains(cml.lockedTag)) {
				if (!quiet) displayMessage(cml.lockedMsg.format([theExisting.title,cml.lockedTag]));
				continue; // skip existing tiddler if tagged with 'noReload'
			}
			// apply the all/new/changes/updates filter (if any)
			if (filter && filter!='all') {
				if ((filter=='new') && theExisting) // skip existing tiddlers
					continue;
				if ((filter=='changes') && !theExisting) // skip new tiddlers
					continue;
				if ((filter.substr(0,4)=='tag:') && inbound.tags.indexOf(filter.substr(4))==-1) // must match specific tag value
					continue;
				if ((filter.substr(0,8)=='tiddler:') && inbound.title!=filter.substr(8)) // must match specific tiddler name
					continue;
				if (!force && store.tiddlerExists(inbound.title) && ((theExisting.modified.getTime()-inbound.modified.getTime())>=0)) {
					var msg=cml.nochangeMsg;
					if (!quiet&&msg.length) displayMessage(msg.format([inbound.title]));
					continue;
				}
			}
			// get confirmation if required
			var msg=(theExisting?'Update':'Add')+" tiddler '"+inbound.title+"'\n"
				+'from '+src.replace(/%20/g,' ')+'\n\nOK to proceed?';
			if (ask && !confirm(msg))
				{ tiddlers[t].status=cml.skippedMsg; continue; }
			// DO IT!
			var tags=new Array().concat(inbound.tags,cml.newTags);
	                store.saveTiddler(inbound.title, inbound.title, inbound.text, inbound.modifier,
				inbound.modified, tags, inbound.fields, true, inbound.created);
			// force creation date to imported value - needed for TW2.1.3 or earlier
	                store.fetchTiddler(inbound.title).created = inbound.created;
			tiddlers[t].status=theExisting?'updated':'added'
			if (init && tags.contains('systemConfig') && !tags.contains('systemConfigDisable')) {
				var ok=true;
				if (ask||!quiet) ok=confirm(cml.warning.format([inbound.title]))
				if (ok) { // run the plugin
					try { window.eval(inbound.text); tiddlers[t].status+=' (plugin initialized)'; }
					catch(ex) { displayMessage(config.messages.pluginError.format([exceptionText(ex)])); }
				}
			}
			count++;
		}
		store.resumeNotifications();
		if (count) {
			// set/clear 'unsaved changes' flag, refresh page display, and generate a report
			store.setDirty(wasDirty||!nodirty);
			if (!norefresh) {
				story.forEachTiddler(function(t,e){
					if(!story.isDirty(t))story.refreshTiddler(t,null,true)
				});
				store.notifyAll();
			}
			if (!noreport) cml.report(src,tiddlers,count,quiet);
		}
		if (!quiet||count) // force msg if tiddlers were loaded
			displayMessage(cml.loadedMsg.format([count,tiddlers.length,src.replace(/%20/g,' ')]));
		if (count && autosave && (!ask||confirm(cml.autosaveMsg))) saveChanges();
	},
	showReport: true,
	report: function(src,tiddlers,count,quiet) {
		var cml=config.macros.loadTiddlers; // abbrev
		// format the new report content
		var newText = 'On '+(new Date()).toLocaleString()+', ';
		newText += config.options.txtUserName+' loaded '+count+' tiddlers ';
		newText += 'from\n[['+src+'|'+src+']]:\n';
		newText += '<<<\n';
		for (var t=0; t<tiddlers.length; t++)
			if (tiddlers[t].status)
				newText += '#[['+tiddlers[t].title+']] - '+tiddlers[t].status+'\n';
		newText += '<<<\n';
		var title=cml.reportTitle;
		var currText='';
		var t=store.getTiddler(title);
		if (t) currText=(t.text.length?'\n----\n':'')+t.text;
		store.saveTiddler(title, title, newText+currText,
			config.options.txtUserName, new Date(),	t?t.tags:null, t?t.fields:null);
		if (!quiet) {
			if (config.options.chkLoadTiddlersShowReport)
				story.displayTiddler(null,title);
			story.refreshTiddler(title,null,true);
		}
	}
}
//}}}