/***
|Name|StorySaverPlugin|
|Source|http://www.TiddlyTools.com/#StorySaverPlugin|
|Documentation|http://www.TiddlyTools.com/#StorySaverPluginInfo|
|Version|1.8.3|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Requires|MarkupPostBody|
|Description|save/restore current tiddler view between browser sessions|
Automatically save a list of currently viewed tiddlers (the 'story') in a local cookie, {{{txtSavedStory}}} and then open those tiddlers when the document is reloaded, so you can resume working from the same place you left off!!  Also, use {{{<<saveStory>>}}} and {{{<<openStory>>}}} macros to quickly save/re-display stories stored in tiddlers, using a command link, droplist, or popup display.
!!!!!Documentation
>see [[StorySaverPluginInfo]]
!!!!!Configuration
<<<
<<option chkSaveStory>> use automatic story cookie (reopens tiddlers on startup)
<<option chkStoryAllowAdd>>include 'add a story' command in droplist/popup
<<option chkStoryFold>>fold story tiddlers when opening a story (see [[CollapseTiddlersPlugin]])
<<option chkStoryClose>>close other tiddlers when opening a story
<<option chkStoryTop>>open story tiddlers at top of column
<<option chkStoryBottom>>open story tiddlers at bottom of column
<<<
!!!!!Revisions
<<<
2009.10.20 1.8.3 fix handling for 'add' item in popup menu
|please see [[StorySaverPluginInfo]] for additional revision details|
2007.10.05 1.0.0 initial release. Moved [[SetDefaultTiddlers]] inline script and rewrote as a {{{<<saveStory>>}}} macro.
<<<
!!!!!Code
***/
//{{{
version.extensions.StorySaverPlugin= {major: 1, minor: 8, revision: 3, date: new Date(2009,10,20)};

var defaults={
	chkSaveStory:		false,
	chkStoryFold:		true,
	chkStoryClose:		true,
	chkStoryAllowAdd:	true,
	chkStoryTop:		true,
	chkStoryBottom:		false
};
for (var id in defaults) if (config.options[id]===undefined)
	config.options[id]=defaults[id];

// if removeCookie() function is not defined by TW core, define it here.
if (window.removeCookie===undefined) {
	window.removeCookie=function(name) {
		document.cookie = name+'=; expires=Thu, 01-Jan-1970 00:00:01 UTC; path=/;'; 
	}
}

// save or clear story cookie on exit
if (window.coreTweaks_confirmExit==undefined) {
	window.coreTweaks_confirmExit=window.confirmExit;
	window.confirmExit=function() {
		if (config.options.chkSaveStory) { // save cookie
			var links=[];
			story.forEachTiddler(function(title,element){links.push('[['+title+']]');});
			config.options.txtSavedStory=links.join(' ');
			saveOptionCookie('txtSavedStory');
		} else removeCookie('txtSavedStory');
		return window.coreTweaks_confirmExit.apply(this,arguments);
	}
}
//}}}
/***
''apply saved story on startup:'' //important note: the following code is actually located in [[MarkupPostBody]].  This is because it needs to supercede the core's getParameters() function, which is called BEFORE plugins are loaded, preventing the normal plugin-based hijack method from working, while code loaded into [[MarkupPostBody]] will be processed as soon as the document is read, even before the TW main() function is invoked.//
<<tiddler MarkupPostBody>>
***/
//{{{
config.macros.saveStory = {
	label: 'set default tiddlers',
	defaultTiddler: 'DefaultTiddlers',
	prompt: 'store a list of currently displayed tiddlers in another tiddler',
	askMsg: 'Enter the name of a tiddler in which to save the current story:',
	tag: 'story',
	excludeTag: 'excludeStory',
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var tid=params.shift()||'DefaultTiddlers';
		var label=params.shift()||this.label;
		var tip=params.shift()||this.prompt;
		var btn=createTiddlyButton(place,label,tip,this.setTiddler,'button');
		btn.setAttribute('tid',tid);
		btn.setAttribute('extratags','[['+params.join(']] [[')+']]');
	},
	setTiddler: function() {
		var cms=config.macros.saveStory; // abbrev
		// get list of current open tiddlers
		var tids=[];
		story.forEachTiddler(function(title,element){
			var t=store.getTiddler(title);
			if (!t || !t.isTagged(cms.excludeTag)) tids.push('[['+title+']]');
		});
		// get target tiddler
		var tid=this.getAttribute('tid');
		if (!tid || tid=='ask') {
			tid=prompt(cms.askMsg,cms.defaultTiddler);
			if (!tid || !tid.length) return false; // cancelled by user
		}
		if(store.tiddlerExists(tid) && !confirm(config.messages.overwriteWarning.format([tid])))
			return false;
		tids=tids.join('\n');
		var t=store.getTiddler(tid); var tags=t?t.tags:[];
		var extratags=(this.getAttribute('extratags')||'').readBracketedList();
		for (var i=0; i<extratags.length; i++) tags.pushUnique(extratags[i]);
		tags.pushUnique(cms.tag);
		store.saveTiddler(tid,tid,tids,config.options.txtUserName,new Date(),tags,t?t.fields:null);
		story.displayTiddler(null,tid);
		story.refreshTiddler(tid,null,true);
		displayMessage(tid+' has been '+(t?'updated':'created'));
		return false;
	}
}
//}}}
//{{{
config.macros.openStory = {
	label: 'open story: %0',
	prompt: 'open the set of tiddlers listed in: %0',
	popuplabel: 'stories',
	popupprompt: 'view a set of tiddlers',
	tag: 'story',
	selectprompt: 'select a story...',
	optionsprompt: 'viewing options...',
	foldcmd: '[%0] fold story',
	foldprompt: 'fold story tiddlers when opening a story',
	closecmd: '[%0] close others',
	closeprompt: 'close other tiddlers when opening a story',
	topcmd: '[%0] open at top',
	topprompt: 'open story tiddlers at top of column',
	bottomcmd: '[%0] open at bottom',
	bottomprompt: 'open story tiddlers at bottom of column',
	addcmd: 'add a story...',
	addprompt: 'create a new story',
	excludeTag: 'excludeStory',
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		if (params[0].toLowerCase()=='list') return this.createList(place,params);
		else if (params[0].toLowerCase()=='popup') return this.createPopup(place,params);
		else this.createButton(place,params);
	},
	showStory: function(tid,fold) {
		var co=config.options; // abbrev
		var tids=[];
		var t=store.getTiddler(tid);
		var tagged=store.getTaggedTiddlers(tid,'title');
		if (tagged.length) // if tiddler IS a tag, use tagged tiddlers as story
			for (var i=0; i<tagged.length; i++) tids.push(tagged[i].title);
		else if (t) { // get tiddler list from content
			if (!t.linksUpdated) t.changed();
			for (var i=0; i<t.links.length; i++) {
				var tid=store.getTiddler(t.links[i]);
				if (tid && !tid.isTagged(this.excludeTag))
					tids.push(t.links[i]);
			}
		}
		var template=null;
		if (fold||co.chkStoryFold) template='CollapsedTemplate'; // see [[CollapseTiddlersPlugin]]
		if (!store.tiddlerExists('CollapsedTemplate')) template=null;
		if (co.chkStoryClose) story.closeAllTiddlers();
		var pos='top'; var first=tids[0];
		if (!story.isEmpty() && co.chkStoryBottom) { pos='bottom'; tids=tids.reverse(); }
		story.displayTiddlers(pos,tids,template);
		var cmd='var t=story.getTiddler("'+first+'");if(t)window.scrollTo(0,t.offsetTop);';
		var delay=config.options.chkAnimate?config.animDuration+100:0;
		setTimeout(cmd,delay);
	},
	createButton: function(place,params) {
		var tid=params[0]||'';
		var label=params[1]||this.label; label=label.format([tid]);
		var tip=params[2]||this.prompt; tip=tip.format([tid]);
		var fold=(params[3]&&(params[3].toLowerCase()=='fold'))||config.options.chkStoryFold;
		var fn=function(){config.macros.openStory.showStory(this.getAttribute('tid'),this.getAttribute('fold')); return false; };
		var btn=createTiddlyButton(place,label,tip,fn,'button');
		btn.setAttribute('tid',tid);
		if (fold) btn.setAttribute('fold',fold);
	},
	createPopup: function(place,params) {
		params.shift(); // discard 'popup' keyword
		var label=params.shift()||this.popuplabel;
		var tip=params.shift()||this.popupprompt;
		var btn=createTiddlyButton(place,label,tip,this.showPopup,'button');
		btn.setAttribute('filter',params.shift()||config.macros.openStory.tag);
	},
	showPopup: function(ev) { var e=ev||window.event;
		var co=config.options; // abbrev
		var cmo=config.macros.openStory; // abbrev
		var indent='\xa0\xa0';
		var p=Popup.create(this); if (!p) return false;
		createTiddlyText(createTiddlyElement(p,'li'),cmo.selectprompt);
		var stories=store.filterTiddlers('[tag['+this.getAttribute('filter')+']]');
		for (var s=0; s<stories.length; s++) {
			var label=indent+stories[s].title;
			var tip=cmo.prompt.format([stories[s].title]);
			var fn=function(){config.macros.openStory.showStory(this.getAttribute('tid'));return false;};
			var btn=createTiddlyButton(createTiddlyElement(p,'li'),label,tip,fn,'button');
			btn.setAttribute('tid',stories[s].title);
		}
		createTiddlyText(createTiddlyElement(p,'li'),cmo.optionsprompt);
		if (store.tiddlerExists('CollapsedTemplate')) {
			var label=indent+cmo.foldcmd.format([co.chkStoryFold?'x':'\xa0\xa0']);
			var tip=cmo.foldprompt;
			var fn=function(){ config.macros.option.propagateOption(
				'chkStoryFold','checked',!config.options.chkStoryFold,'input'); return false; };
			var btn=createTiddlyButton(createTiddlyElement(p,'li'),label,tip,fn,'button');
		}
		var label=indent+cmo.closecmd.format([co.chkStoryClose?'x':'\xa0\xa0']);
		var tip=indent+cmo.closeprompt;
		var fn=function(){ config.macros.option.propagateOption(
			'chkStoryClose','checked',!config.options.chkStoryClose,'input'); return false; };
		var btn=createTiddlyButton(createTiddlyElement(p,'li'),label,tip,fn,'button');
		if (!co.chkStoryClose) {
			var label=indent+cmo.topcmd.format([co.chkStoryTop?'x':'\xa0\xa0']);
			var tip=indent+cmo.topprompt;
			var fn=function(){
				config.macros.option.propagateOption(
					'chkStoryTop','checked',!config.options.chkStoryTop,'input');
				config.macros.option.propagateOption(
					'chkStoryBottom','checked',!config.options.chkStoryTop,'input');
				return false;
			};
			var btn=createTiddlyButton(createTiddlyElement(p,'li'),label,tip,fn,'button');
			var label=indent+cmo.bottomcmd.format([co.chkStoryBottom?'x':'\xa0\xa0']);
			var tip=indent+cmo.botprompt;
			var fn=function(){
				config.macros.option.propagateOption(
					'chkStoryBottom','checked',!config.options.chkStoryBottom,'input');
				config.macros.option.propagateOption(
					'chkStoryTop','checked',!config.options.chkStoryBottom,'input');
				return false;
			};
			var btn=createTiddlyButton(createTiddlyElement(p,'li'),label,tip,fn,'button');
		}
		if (!readOnly && co.chkStoryAllowAdd) {
			var label=cmo.addcmd;
			var tip=cmo.addprompt;
			var fn=config.macros.saveStory.setTiddler;
			createTiddlyElement(createTiddlyElement(p,'li'),'hr');
			var btn=createTiddlyButton(createTiddlyElement(p,'li'),label,tip,fn,'button');
		}
		Popup.show();
		e.cancelBubble=true;if(e.stopPropagation)e.stopPropagation();
		return false;
	},
	createList: function(place,params) {
		var cmo=config.macros.openStory; // abbrev
		var s=createTiddlyElement(place,'select',null,'storyListbox');
		s.size=1;
		s.onchange=function() {
			if (this.value=='_fold') {
				config.macros.option.propagateOption('chkStoryFold','checked',
					!config.options.chkStoryFold,'input');
				cmo.refreshList();
			} else if (this.value=='_close') {
				config.macros.option.propagateOption('chkStoryClose','checked',
					!config.options.chkStoryClose,'input');
				cmo.refreshList();
			} else if (this.value=='_top') {
				config.macros.option.propagateOption('chkStoryTop','checked',
					!config.options.chkStoryTop,'input');
				cmo.refreshList();
			} else if (this.value=='_bottom') {
				config.macros.option.propagateOption('chkStoryBottom','checked',
					!config.options.chkStoryBottom,'input');
				cmo.refreshList();
			} else if (this.value=='_add')
				config.macros.saveStory.setTiddler.apply(this,arguments);
			else cmo.showStory(this.value);
		}
		params.shift(); // discard 'list' keyword
		s.setAttribute('filter',params.shift()||cmo.tag);
		setStylesheet('.storyListbox { width:100%; }', 'StorySaverStyles');
		store.addNotification(null,this.refreshList); this.refreshList();
		return;
	},
	refreshList: function() {
		var cmo=config.macros.openStory; // abbrev
		var indent='\xa0\xa0\xa0\xa0';
		var lists=document.getElementsByTagName('select');
		for (var i=0; i<lists.length; i++) { if (lists[i].className!='storyListbox') continue;
			var here=lists[i];
			var stories=store.filterTiddlers('[tag['+here.getAttribute('filter')+']]');
			while (here.length) here.options[0]=null; // remove current list items
			here.options[here.length]=new Option(cmo.selectprompt,'',true,true);
			for (var s=0; s<stories.length; s++)
				here.options[here.length]=new Option(indent+stories[s].title,stories[s].title);
			if (!readOnly && config.options.chkStoryAllowAdd)
				here.options[here.length]=new Option(cmo.addcmd,'_add');
			here.options[here.length]=new Option(cmo.optionsprompt,'');
			if (store.tiddlerExists('CollapsedTemplate')) {
				var msg=cmo.foldcmd.format([config.options.chkStoryFold?'x':'\xa0\xa0']);
				here.options[here.length]=new Option(indent+msg,'_fold');
			}
			var msg=cmo.closecmd.format([config.options.chkStoryClose?'x':'\xa0\xa0']);
			here.options[here.length]=new Option(indent+msg,'_close',false,false);
			if (!config.options.chkStoryClose) {
				var msg=cmo.topcmd.format([config.options.chkStoryTop?'x':'\xa0\xa0']);
				here.options[here.length]=new Option(indent+msg,'_top',false,false);
				var msg=cmo.bottomcmd.format([config.options.chkStoryBottom?'x':'\xa0\xa0']);
				here.options[here.length]=new Option(indent+msg,'_bottom',false,false);
			}
		}
	}
}
//}}}