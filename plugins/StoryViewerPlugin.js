/***
|Name|[[StoryViewerPlugin]]|
|Source|http://www.TiddlyTools.com/#StoryViewerPlugin|
|Documentation|http://www.TiddlyTools.com/#StoryViewerPluginInfo|
|Version|1.4.0|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|view a set of tiddlers using a droplist, "first/previous/next/last" links, or timed slideshow|
The {{{<<storyViewer>>}}} macro allows you to quickly ''display //and// navigate between a set of tiddlers'', using a droplist of titles and/or individual "first/previous/next/last" buttons/text links.  It also provides a "slideshow" feature that permits you to ''present one tiddler at a time with a countdown timer to automatically advance to the next tiddler'' after a specified number of seconds.
!!!!!Documentation
> see [[StoryViewerPluginInfo]]
!!!!!Revisions
<<<
2011.03.11 1.4.0 added 'sort:fieldname' parameter
2011.01.24 1.3.4 in droplist onchange handler, don't clear slideshow 'started' flag (allows slideshow to continue after manual navigation)
|please see [[StoryViewerPluginInfo]] for additional revision details|
2007.10.23 1.0.0 Initial release, split {{{<<storyViewer>>}}} macro definition from [[StorySaverPlugin]] to allow separate installation of story saving vs. story viewing features.
<<<
!!!!!Code
***/
//{{{
version.extensions.StoryViewerPlugin= {major: 1, minor: 4, revision: 0, date: new Date(2011,3,11)};

config.macros.storyViewer = {
	tag:			"story",
	storynotfoundmsg:	"'%0' is an empty/unrecognized story",
	firstcmd:		"first",
	firstbutton:		"<<",
	firstmsg:		"first: '%0'",
	nextcmd:		"next",
	nextbutton:		">",
	nextmsg:		"next: '%0'",
	previouscmd:		"previous",
	previousbutton:		"<",
	prevmsg:		"previous: '%0'",
	lastcmd:		"last",
	lastbutton:		">>",
	lastmsg:		"last: '%0'",
	refreshmsg:		"redisplay '%0'",
	refreshmsg:		"",
	autostart:		false,
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {

		var parsed=paramString.parseParams('anon',null,true,false,false);
		var here=story.findContainingTiddler(place);
		if (here) var tid=here.getAttribute("tiddler");
		var storyname="";
		var p=params.shift();
		var keywords=['first','previous','here','next','last','list','links','timer','sort'];
		if (!p || keywords.indexOf(p.split(':')[0])!=-1) {
			// find story from current tiddler name
			if (!tid) return; // not in a tiddler... do nothing!
			var stories=store.getTaggedTiddlers(this.tag);
			if (!stories) return;
			for (var s=0; s<stories.length; s++) {
				if (!stories[s].linksUpdated) stories[s].changed();
				var tids=stories[s].links.slice(0);
				if (tids.contains(tid)) { storyname=stories[s].title; break; }
			}
			if (!storyname.length) return; // current tiddler is not part of a saved story
		}
		else { storyname=p; p=params.shift(); } // user-specified story name

		var sortby=getParam(parsed,'sort','title');
		var tids=this.getStory(storyname,sortby); // get tiddler list

		var target=null;
		switch (p?p.split(':')[0]:'') {
			case 'first':
				target=tids[0];
				break;
			case 'previous':
				var i=tids.indexOf(tid);
				if (i!=-1) var target=tids[Math.max(i-1,0)];
				break;
			case 'here':
				if (tid) target=tid;
				break;
			case 'next':
				var i=tids.indexOf(tid);
				if (i!=-1) var target=tids[Math.min(i+1,tids.length-1)];
				break;
			case 'last':
				target=tids[tids.length-1];
				break;
			case 'links':
				this.renderAllLinks(place,storyname);
				break;
			case 'timer':
				var delay=parseInt(getParam(parsed,'timer',15))*1000; // msecs between slides
				var autostart=params[0]=='autostart'; if (autostart) params.shift();
				var action=params[0]; // null/close/fold
				this.renderTimer(place,tids,tid,delay,autostart,action);
				break;
			case 'list':
			default:
				var prompt=getParam(parsed,'prompt',storyname+'...');
				var nobuttons=params.contains("nobuttons");
				var allbuttons=params.contains("allbuttons");
				var onlybuttons=params.contains("onlybuttons");
				this.renderList(place,tids,tid,storyname,prompt,nobuttons,allbuttons,onlybuttons);
				break;
		}
		var label=getParam(parsed,'label',params[0]||target);
		if (target) this.renderLink(place,tid,target,label);
	},
	getStory: function(storyname,sortby) { // READ TIDDLER LIST
		var tids=[];
		var fn=store.getMatchingTiddlers||store.getTaggedTiddlers;
		var tagged=store.sortTiddlers(fn.apply(store,[storyname]),sortby||'title');
		if (tagged.length) // if storyname is a tag, get tagged tiddlers rather than links
			for (var t=0; t<tagged.length; t++) tids.push(tagged[t].title);
		else {
			var t=store.getTiddler(storyname);
			if (t && !t.linksUpdated) t.changed();
			var tids=t?t.links.slice(0):[];
		}
		return tids;
	},
	renderLink: function(place,tid,target,label) {
		// override default labelling with specified text (if any)
		if (tid==target) { // self-referential links turn into 'refresh links'
			var btn=createTiddlyButton(place,null,this.refreshmsg.format([tid]), function() {
				var here=story.findContainingTiddler(place).getAttribute("tiddler");
				story.refreshTiddler(here,null,true);
			});
			wikify(label,btn); 
		}
		else // create link
			wikify(label,createTiddlyLink(place,target,false));
	},
	renderAllLinks: function(place,storyname) {
		var out="{{floatleft{";
		out+="<<storyViewer [["+storyname+"]] first first>> &nbsp;";
		out+="<<storyViewer [["+storyname+"]] previous previous>> &nbsp;";
		out+="}}}";
		out+="{{floatright{";
		out+="&nbsp; <<storyViewer [["+storyname+"]] next next>>";
		out+="&nbsp; <<storyViewer [["+storyname+"]] last last>>";
		out+="}}}";
		out+="{{center{<<storyViewer [["+storyname+"]] here>>}}}";
		wikify(out,place);
	},
	renderList: function(place,tids,tid,storyname,prompt,nobuttons,allbuttons,onlybuttons) {
		var h="";
		h+='<form style="display:inline">';
		if ((!nobuttons||onlybuttons) && allbuttons) {
			h+='<input type="button" value="'+this.firstbutton+'" ';
			h+='	style="padding:0" title="'+(tids[0]?this.firstmsg.format([tids[0]]):'')+'"';
			h+=' onclick="if (this.form.list.length<2) return; ';
			h+='	this.form.list.selectedIndex=1; this.form.list.onchange();">';
		}
		if (!nobuttons||onlybuttons) {
			h+='<input type="button" value="'+this.previousbutton+'" style="padding:0 0.3em"';
			h+=' onclick="if (this.form.list.length<2) return; ';
			h+=' 	var i=this.form.list.selectedIndex-1; if (i<1) i=1; ';
			h+='	this.form.list.selectedIndex=i; this.form.list.onchange();"';
			h+=' onmouseover="if (this.form.list.length<2) return; ';
			h+=' 	var i=this.form.list.selectedIndex-1; if (i<1) i=1; ';
			h+='	var v=this.form.list.options[i].value; if (!v.length) return; ';
			h+='	this.title=config.macros.storyViewer.prevmsg.format([v]);">';
		}
		h+='<select size="1" name="list"';
		if (onlybuttons) h+=' style="display:none;"';
		h+=' onchange="if (this.value) story.displayTiddler(this,this.value);">';
		h+='<option value="">'+prompt+'</option>';
		for (i=0; i<tids.length; i++) {
			h+='<option '+
				(tids[i]==tid?'selected ':'')+
				'value="'+tids[i]+'">\xa0\xa0'+tids[i]+'</option>';
		}
		h+='</select>';
		if (!nobuttons||onlybuttons) {
			h+='<input type="button" value="'+this.nextbutton+'" style="padding:0 0.3em"';
			h+=' onclick="var i=this.form.list.selectedIndex+1; ';
			h+='	if (i>this.form.list.options.length-1) i=this.form.list.options.length-1; ';
			h+='	this.form.list.selectedIndex=i; this.form.list.onchange();"';
			h+=' onmouseover="var i=this.form.list.selectedIndex+1; ';
			h+='	if (i>this.form.list.options.length-1) i=this.form.list.options.length-1; ';
			h+='	var v=this.form.list.options[i].value; if (!v.length) return;';
			h+='	this.title=config.macros.storyViewer.nextmsg.format([v]);">';
		}
		if ((!nobuttons||onlybuttons) && allbuttons) {
			h+='<input type="button" value="'+this.lastbutton+'" ';
			h+='	style="padding:0" title="'+(tids[tids.length-1]?this.lastmsg.format([tids[tids.length-1]]):'')+'"';
			h+=' onclick="this.form.list.selectedIndex=this.form.list.options.length-1; this.form.list.onchange();">';
		}
		h+='</form>';
		createTiddlyElement(place,"span").innerHTML=h;
	},
	renderTimer: function(place,tids,tid,delay,autostart,action) {
		var now=new Date().getTime(); // msec
		var target=createTiddlyElement(null,'input',now+Math.random()); // unique ID
		target.setAttribute('type','button'); target.style.padding='0';
		place.appendChild(target);
		target.tid		=tids[Math.min(tids.indexOf(tid)+1,tids.length-1)]||''; // next tiddler
		target.action		=action;
		target.formatTimer	=this.formatTimer;
		target.start		=this.startTimer;
		target.stop		=this.stopTimer;
		target.onmouseover	=this.pauseTimer;
		target.onmouseout	=this.resumeTimer;
		target.tick		=this.timerTick;
		target.onclick		=this.timerClick;
		target.next		=this.timerNext;
		target.start(delay,autostart);
	},
	formatTimer: function(t) {
		return '0:'+String.zeroPad(Math.floor(t/1000),2);
	},
	startTimer: function(delay,start) {
		var co=config.options; // abbrev
		start=config.macros.storyViewer.started=start||config.macros.storyViewer.started;
		var now=new Date().getTime(); // msec
		this.started=start;
		this.delay=delay;
		this.paused=start?0:delay;
		this.stopTime=now+delay; // msec
		this.title='CLICK='+(start?'reset':'start')+" slideshow timer... next: '"+this.tid+"'";
		this.style.cursor='pointer';
		this.value=this.formatTimer(delay);
		if (start) {
			var code="var e=document.getElementById('"+this.id+"'); if(e)e.tick()";
			this.timer=setTimeout(code,500);
		}
		return false;
	},
	stopTimer: function() {
		this.timer=clearTimeout(this.timer);
		this.started=config.macros.storyViewer.started=false;
		this.paused=0;
		this.title="CLICK=start slideshow timer... next: '"+this.tid+"'";
		this.value=this.formatTimer(this.delay);
		return false;
	},
	pauseTimer: function() {
		if (!this.started) return;
		var now=new Date().getTime(); // msec
		this.paused=Math.max(this.stopTime-now,0);
		this.stopTime=now+this.paused;
		return false;
	},
	resumeTimer: function() {
		if (!this.started || !this.paused) return;
		var now=new Date().getTime(); // msec
		this.stopTime=now+this.paused;
		this.paused=0;
		return false;
	},
	timerTick: function() {
		var now=new Date().getTime(); // msec
		if (!this.started)
			this.stopTime=now+this.delay;
		else if (this.paused) {
			this.stopTime=now+this.paused;
			this.title="[PAUSED] MOUSEOUT=resume, CLICK=reset... next: '"+this.tid+"'";
		}
		var remaining=this.stopTime-now;
		if (remaining>0) {
			if (this.started && !this.paused) this.value=this.formatTimer(remaining);
			var code="var e=document.getElementById('"+this.id+"'); if(e)e.tick()";
			this.timer=setTimeout(code,500);
		} else {
			this.stop();
			this.next();
		}
		return false;
	},
	timerClick: function() {
		return this.started?this.stop():this.start(this.delay,true);
	},
	timerNext: function() { // OPEN NEXT TIDDLER
		var here=story.findContainingTiddler(this);
		config.macros.storyViewer.started=true; // next slide autostarts to continue slideshow
		if (this.tid) story.displayTiddler(here,this.tid);
		config.macros.storyViewer.started=false;
		if (!here) return false;
		var t=here.getAttribute('tiddler');
		if (this.action=='close') story.closeTiddler(t);
		if (this.action=='fold' && config.commands.collapseTiddler) // see CollapseTiddlerPlugin
			config.commands.collapseTiddler.handler(null,here,t);
		return false;
	}
}
//}}}
//{{{
config.paramifiers.story = {
	onstart: function(v) {
		var t=store.getTiddler(v); if (t) t.changed();
		var list=t?t.links:store.getTiddlerText(v,"").parseParams("open",null,false);
		story.displayTiddlers(null,list);
	}
};
//}}}