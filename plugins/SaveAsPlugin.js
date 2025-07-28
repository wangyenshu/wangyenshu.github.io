/***
|Name|SaveAsPlugin|
|Source|http://www.TiddlyTools.com/#SaveAsPlugin|
|Documentation|http://www.TiddlyTools.com/#SaveAsPluginInfo|
|Version|2.7.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|Save current document to another path/filename|
!!!!!Documentation
<<<
see [[SaveAsPluginInfo]]
<<<
!!!!!Revisions
<<<
2011.02.14 2.7.1 fix OSX error: use picker.file.path
2009.10.13 2.7.0 added 'here' param (saves current tiddler)
2009.08.16 2.6.2 fixed handling for backstage
| Please see [[SaveAsPluginInfo]] for additional revision details |
2006.02.03 1.0.0 Created
<<<
!!!!!Code
***/
//{{{
version.extensions.SaveAsPlugin= {major: 2, minor: 7, revision: 1, date: new Date(2011,2,14)};

config.macros.saveAs = {
	label: 'save as...',
	labelparam: 'label:',
	prompt: 'Save current document to a different path/file',
	promptparam: 'prompt:',
	filePrompt: 'Please select or enter a target path/filename',
	targetparam: 'target:',
	defaultFilename: 'new.html',
	filenameparam: 'filename:',
	currfilekeyword: 'here',
	typeparam: 'type:',
	type_TW: 'tw', type_PS: 'ps', type_TX: 'tx', type_CS: 'cs', type_NF: 'nf', // file type tokens
	type_map: {
		tiddlywiki:'tw', tw:'tw', wiki: 'tw',
		purestore: 'ps', ps:'ps', store:'ps',
		plaintext: 'tx', tx:'tx', text: 'tx',
		comma:     'cs', cs:'cs', csv:  'cs',
		newsfeed:  'nf', nf:'nf', xml:  'nf', rss:'nf'
	},
	limitparam: 'limit:',
	replaceparam: 'replace',
	mergeparam: 'merge',
	quietparam: 'quiet',
	openparam: 'open',
	askParam: 'ask',
	hereParam: 'here',
	askMsg: "Enter a tag filter (use * for all tiddlers, 'none' for blank document)",
	hereMsg: 'Enter a tiddler title',
	emptyParam: 'none',
	confirmmsg: "Found %0 tiddlers matching\n\n'%1'\n\nPress OK to proceed",
	mergeprompt: '%0\nalready contains tiddler definitions.\n'
		+'\nPress OK to add new/revised tiddlers to current file contents.'
		+'\nPress Cancel to completely replace file contents',
	mergestatus: 'Merged %0 new/revised tiddlers and %1 existing tiddlers',
	okmsg: '%0 tiddlers written to %1',
	failmsg: 'An error occurred while creating %1',
	filter: '',
	handler: function(place,macroName,params) {
		if ((params[0]||'').startsWith(this.labelparam))
			var label=params.shift().substr(this.labelparam.length);
		if ((params[0]||'').startsWith(this.promptparam))
			var prompt=params.shift().substr(this.promptparam.length);
		if ((params[0]||'').startsWith(this.targetparam))
			var target=params.shift().substr(this.targetparam.length);
		if ((params[0]||'').startsWith(this.filenameparam))
			var filename=params.shift().substr(this.filenameparam.length);
		if ((params[0]||'').startsWith(this.typeparam))
			var filetype=this.type_map[params.shift().substr(this.typeparam.length).toLowerCase()];
		if ((params[0]||'').startsWith(this.limitparam))
			var limit=params.shift().substr(this.limitparam.length);
		var q=((params[0]||'')==this.quietparam);   if (q) params.shift();
		var o=((params[0]||'')==this.replaceparam); if (o) params.shift();
		var m=((params[0]||'')==this.mergeparam);   if (m) params.shift();
		var a=((params[0]||'')==this.openparam);    if (a) params.shift();
		var btn=createTiddlyButton(place,label||this.label,prompt||this.prompt,
			function(){ config.macros.saveAs.go( this.getAttribute('target'),
				this.getAttribute('filename'), this.getAttribute('filetype'),
				this.getAttribute('filter'), this.getAttribute('limit'),
				this.getAttribute('quiet')=='true',
				this.getAttribute('overwrite')=='true',
				this.getAttribute('merge')=='true',
				this.getAttribute('autoopen')=='true',
				this);
				return false;
			});
		if (target) btn.setAttribute('target',target);
		if (filename) btn.setAttribute('filename',filename);
		btn.setAttribute('filetype',filetype||this.type_TW);
		btn.setAttribute('filter',params.join(' '));
		btn.setAttribute('limit',limit||0);
		btn.setAttribute('quiet',q?'true':'false');
		btn.setAttribute('overwrite',o?'true':'false');
		btn.setAttribute('merge',m?'true':'false');
		btn.setAttribute('autoopen',a?'true':'false');
	},
	go: function(target,filename,filetype,filter,limit,quiet,overwrite,merge,autoopen,here) {
		var cm=config.messages; // abbreviation
		var cms=config.macros.saveAs; // abbreviation
		if (window.location.protocol!='file:') // make sure we are local
			{ displayMessage(cm.notFileUrlError); return; }

		// get tidders, confirm filtered results
		var tids=cms.selectTiddlers(filter,here);
		if (tids===false) return; // cancelled by user
		if (cms.filter!=cms.emptyParam && cms.filter.length && !quiet)
			if (!confirm(cms.confirmmsg.format([tids.length,cms.filter]))) return;

		// get target path/filename
		if (!filetype) filetype=this.type_TW;
		target=target||cms.getTarget(filename,filetype==this.type_TX?'txt':filetype==this.type_CS?'csv':'html');
		if (!target) return; // cancelled by user

		var link='file:///'+target.replace(/\\/g,'/');
		var samefile=link==decodeURIComponent(window.location.href);
		var p=getLocalPath(document.location.href);
		if (samefile) {
			if (config.options.chkSaveBackups)
				{ var t=loadOriginal(p);if(t)saveBackup(p,t); }
			if (config.options.chkGenerateAnRssFeed && saveRss instanceof Function)
				saveRss(p);
		}
		var notes='';
		var total={val:0};
		var out=this.assembleFile(target,filetype,tids,limit||0,notes,quiet,overwrite,merge,total);
		var ok=saveFile(target,out);
		if (ok && autoopen) {
			if (!samefile) window.open(link).focus();
			else { store.setDirty(false); window.location.reload(); }
		}
		if (!quiet || !(ok && autoopen))
			displayMessage((ok?this.okmsg:this.failmsg).format([total.val,target]),link);
	},
	selectTiddlers: function(filter,here) {
		var cms=config.macros.saveAs; // abbreviation
		var tids=[]; cms.filter=filter||'';
		if (filter==cms.emptyParam)
			return tids;
		if (filter==config.macros.saveAs.hereParam) {
			var here=story.findContainingTiddler(here);
			if (here) var tid=here.getAttribute('tiddler');
			else var tid=prompt(config.macros.saveAs.hereMsg,'');
			while (tid && !store.tiddlerExists(tid)) {
				var err='"'+tid+'" not found.\nPlease try again.\n\n';
				var tid=prompt(err+config.macros.saveAs.hereMsg,tid);
			}
			if (!tid) return false;  // cancelled by user
			return [store.getTiddler(tid)];
		}
		if (filter==config.macros.saveAs.askParam) {
			filter=prompt(config.macros.saveAs.askMsg,'');
			if (!filter) return false;  // cancelled by user
			cms.filter=filter=='*'?'':filter;
		}
		if (!filter||!filter.length||filter=='*') tids=store.getTiddlers('title');
		else tids=store.filterTiddlers('[tag['+filter+']]');
		return tids;
	},
	getTarget: function(defName,defExt) {
		var cms=config.macros.saveAs; // abbreviation
		// get new target path/filename
		var newPath=getLocalPath(window.location.href);
		var slashpos=newPath.lastIndexOf('/'); if (slashpos==-1) slashpos=newPath.lastIndexOf('\\'); 
		if (slashpos!=-1) newPath=newPath.substr(0,slashpos+1); // trim filename
		if (!defName||!defName.length) { // use current filename as default
			var p=getLocalPath(window.location.href);
			var s=p.lastIndexOf('/'); if (s==-1) s=p.lastIndexOf('\\'); 
			if (s!=-1) defName=p.substr(s+1);
		}
		var defFilename=(defName||cms.defaultFilename).replace(/.html$/,'.'+defExt);
		var target=cms.askForFilename(cms.filePrompt,newPath,defFilename,defExt);
		if (!target) return; // cancelled by user
		// if specified file does not include a path, assemble fully qualified path and filename
		var slashpos=target.lastIndexOf('/'); if (slashpos==-1) slashpos=target.lastIndexOf('\\');
		if (slashpos==-1) target=target+(defName||cms.defaultFilename).replace(/.html$/,'.'+defExt);
		return target;
	},
	askForFilename: function(msg,path,file,defExt) {
		if(window.Components) { // moz
			try {
				netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
				var nsIFilePicker = window.Components.interfaces.nsIFilePicker;
				var picker = Components.classes['@mozilla.org/filepicker;1'].createInstance(nsIFilePicker);
				picker.init(window, msg, nsIFilePicker.modeSave);
				var thispath = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
				thispath.initWithPath(path);
				picker.displayDirectory=thispath;
				picker.defaultExtension=defExt||'html';
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
				s.FilterIndex=(defExt=='txt')?2:3; // default to HTML files;
				s.InitialDir=path;
				s.FileName=file;
				if (s.showOpen()) var result=s.FileName;
			}
			catch(e) { var result=prompt(msg,path+file); } // fallback for non-XP IE
		}
		return result;
	},
	plainTextHeader:
		 'Source:\n\t%0\n'
		+'Title:\n\t%1\n'
		+'Subtitle:\n\t%2\n'
		+'Created:\n\t%3 by %4\n'
		+'Application:\n\tTiddlyWiki %5 / %6 %7\n\n',
	plainTextTiddler:
		'- - - - - - - - - - - - - - -\n'
		+'|     title: %0\n'
		+'|   created: %1\n'
		+'|  modified: %2\n'
		+'| edited by: %3\n'
		+'|      tags: %4\n'
		+'- - - - - - - - - - - - - - -\n'
		+'%5\n',
	plainTextFooter:
		'',
	newsFeedHeader:
		 '<'+'?xml version="1.0"?'+'>\n'
		+'<rss version="2.0">\n'
		+'<channel>\n'
		+'<title>%1</title>\n'
		+'<link>%0</link>\n'
		+'<description>%2</description>\n'
		+'<language>en-us</language>\n'
		+'<copyright>Copyright '+(new Date().getFullYear())+' %4</copyright>\n'
		+'<pubDate>%3</pubDate>\n'
		+'<lastBuildDate>%3</lastBuildDate>\n'
		+'<docs>http://blogs.law.harvard.edu/tech/rss</docs>\n'
		+'<generator>TiddlyWiki %5 / %6 %7</generator>\n',
	newsFeedTiddler:
		'\n%0\n',
	newsFeedFooter:
		'</channel></rss>',
	pureStoreHeader:
		 '<html><body>'
		+'<style type="text/css">'
		+'	#storeArea {display:block;margin:1em;}'
		+'	#storeArea div {padding:0.5em;margin:1em;border:2px solid black;height:10em;overflow:auto;}'
		+'	#pureStoreHeading {width:100%;text-align:left;background-color:#eeeeee;padding:1em;}'
		+'</style>'
		+'<div id="pureStoreHeading">'
		+'	TiddlyWiki "PureStore" export file<br>'
		+'	Source'+': <b>%0</b><br>'
		+'	Title: <b>%1</b><br>'
		+'	Subtitle: <b>%2</b><br>'
		+'	Created: <b>%3</b> by <b>%4</b><br>'
		+'	TiddlyWiki %5 / %6 %7<br>'
		+'	Notes:<hr><pre>%8</pre>'
		+'</div>'
		+'<div id="storeArea">',
	pureStoreTiddler:
		'%0\n%1',
	pureStoreFooter:
		'</div><!--POST-BODY-START-->\n<!--POST-BODY-END--></body></html>',
	assembleFile: function(target,filetype,tids,limit,notes,quiet,overwrite,merge,total) {
		var revised='';
		var now = new Date().toLocaleString();
		var src=convertUnicodeToUTF8(document.location.href);
		var title = convertUnicodeToUTF8(wikifyPlain('SiteTitle').htmlEncode());
		var subtitle = convertUnicodeToUTF8(wikifyPlain('SiteSubtitle').htmlEncode());
		var user = convertUnicodeToUTF8(config.options.txtUserName.htmlEncode());
		var twver = version.major+'.'+version.minor+'.'+version.revision;
		var v=version.extensions.SaveAsPlugin; var pver = v.major+'.'+v.minor+'.'+v.revision;
		var headerargs=[src,title,subtitle,now,user,twver,'SaveAsPlugin',pver,notes];
		switch (filetype) {
			case this.type_TX: // plain text
				var header=this.plainTextHeader.format(headerargs);
				var footer=this.plainTextFooter;
				break;
			case this.type_CS: // comma-separated
				var fields={};
				for (var i=0; i<tids.length; i++) for (var f in tids[i].fields) fields[f]=f;
				var names=['title','created','modified','modifier','tags','text'];
				for (var f in fields) names.push(f);
				var header=names.join(',')+'\n';
				var footer='';
				break;
			case this.type_NF: // news feed (XML)
				headerargs[0]=store.getTiddlerText('SiteUrl','');
				var header=this.newsFeedHeader.format(headerargs);
				var footer=this.newsFeedFooter;
				tids=store.sortTiddlers(tids,'-modified');
				break;
			case this.type_PS: // PureStore (no code)
				var header=this.pureStoreHeader.format(headerargs);
				var footer=this.pureStoreFooter;
				break;
			case this.type_TW: // full TiddlyWiki
			default:
				var currPath=getLocalPath(window.location.href);
				var original=loadFile(currPath);
				if (!original) { alert(config.messages.cantSaveError); return; }
				var posDiv = locateStoreArea(original);
				if (!posDiv) { alert(config.messages.invalidFileError.format([currPath])); return; }
				var header = original.substr(0,posDiv[0]+startSaveArea.length)+'\n';
				var footer = '\n'+original.substr(posDiv[1]);
				break;
		}
		if (parseInt(limit)!=0) tids=tids.slice(0,limit);
		var out=this.getData(target,filetype,tids,quiet,overwrite,merge,fields);
		var revised = header+convertUnicodeToUTF8(out.join('\n'))+footer;
		// if full TW, insert page title and language attr, and reset MARKUP blocks as needed...
		if (filetype==this.type_TW) {
			var newSiteTitle=convertUnicodeToUTF8(getPageTitle()).htmlEncode();
			revised=revised.replaceChunk('<title'+'>','</title'+'>',' ' + newSiteTitle + ' ');
			revised=updateLanguageAttribute(revised);
			var titles=[]; for (var i=0; i<tids.length; i++) titles.push(tids[i].title);
			revised=updateMarkupBlock(revised,'PRE-HEAD',
				titles.contains('MarkupPreHead')? 'MarkupPreHead' :null);
			revised=updateMarkupBlock(revised,'POST-HEAD',
				titles.contains('MarkupPostHead')?'MarkupPostHead':null);
			revised=updateMarkupBlock(revised,'PRE-BODY',
				titles.contains('MarkupPreBody')? 'MarkupPreBody' :null);
			revised=updateMarkupBlock(revised,'POST-SCRIPT',
				titles.contains('MarkupPostBody')?'MarkupPostBody':null);
		}
		total.val=out.length;
		return revised;
	},
	getData: function(target,filetype,tids,quiet,overwrite,merge,fields) {
		// output selected tiddlers and gather list of titles (for use with merge)
		var out=[]; var titles=[];
		var url=store.getTiddlerText('SiteUrl','');
		for (var i=0; i<tids.length; i++) {
			out.push(this.formatItem(store,filetype,tids[i],url,fields));
			titles.push(tids[i].title);
		}
		// if TW or PureStore format, ask to merge with existing tiddlers (if any)
		if (filetype==this.type_TW || filetype==this.type_PS) {
			if (overwrite) return out; // skip merge... forced overwrite
			var txt=loadFile(target);
			if (txt && txt.length) {
				var remoteStore=new TiddlyWiki();
				if (version.major+version.minor*.1+version.revision*.01<2.52) txt=convertUTF8ToUnicode(txt);
				if (remoteStore.importTiddlyWiki(txt) && (merge||confirm(this.mergeprompt.format([target])))) {
					var existing=remoteStore.getTiddlers('title');
					for (var i=0; i<existing.length; i++)
						if (!titles.contains(existing[i].title))
							out.push(this.formatItem(remoteStore,filetype,existing[i],url));
					if (!quiet) displayMessage(this.mergestatus.format([tids.length,out.length-tids.length]));
				}
			}
		}
		return out;
	},
	formatItem: function(s,f,t,u,fields) {
		if (f==this.type_TW)
			var r=s.getSaver().externalizeTiddler(s,t);
		if (f==this.type_PS)
			var r=this.pureStoreTiddler.format([t.title,s.getSaver().externalizeTiddler(s,t)]);
		if (f==this.type_NF)
			var r=this.newsFeedTiddler.format([t.saveToRss(u)]);
		if (f==this.type_TX)
			var r=this.plainTextTiddler.format([t.title, t.created.toLocaleString(), t.modified.toLocaleString(),
				t.modifier, String.encodeTiddlyLinkList(t.tags), t.text]);
		if (f==this.type_CS) {
			function toCSV(t) { return '"'+t.replace(/"/g,'""')+'"'; } // always encode CSV
			var out=[ toCSV(t.title), toCSV(t.created.toLocaleString()), toCSV(t.modified.toLocaleString()),
				toCSV(t.modifier), toCSV(String.encodeTiddlyLinkList(t.tags)), toCSV(t.text) ];
			for (var f in fields) out.push(toCSV(t.fields[f]||''));
			var r=out.join(',');
		}
		return r||'';
	}
};
//}}}
//{{{
// automatically add saveAs to backstage
config.tasks.saveAs = {
	text: 'saveAs',
	tooltip: config.macros.saveAs.prompt,
	action: function(){ clearMessage(); config.macros.saveAs.go(); }
}
config.backstageTasks.splice(config.backstageTasks.indexOf('save')+1,0,'saveAs');
//}}}