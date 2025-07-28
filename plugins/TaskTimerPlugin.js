/***
|Name|TaskTimerPlugin|
|Source|http://www.TiddlyTools.com/#TaskTimerPlugin|
|Documentation|http://www.TiddlyTools.com/#TaskTimerPluginInfo|
|Version|1.4.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|'timer' button automatically writes start/end/elapsed time into tiddler content|
Quickly generate 'timed task' logs that can be used for status reports, billing purposes, etc.  
!!!!!Documentation
> see [[TaskTimerPluginInfo]]
!!!!!Configuration
> see [[TaskTimerPluginConfig]]
!!!!!Revisions
<<<
2008.11.10 [1.4.1] in elapsed time calculation, truncate start/stop times to nearest second (avoids 1-second 'round-down' error)
|please see [[TaskTimerPluginInfo]] for additional revision details|
2007.03.14 [0.5.0] converted from inline script
<<<
!!!!!Code
***/
//{{{
version.extensions.TaskTimerPlugin= {major: 1, minor:4, revision: 1, date: new Date(2008,11,10)};

config.macros.taskTimer = {
	label: "start timer",
	title: "press to start the task timer",
	format: "|%4|%0|%1|%2|%3|\\n", // note: double-backslash-en, also date is %4 (for backward compatibility)
	defText: " ", // default description text
	todayKeyword: "today",
	todayFormat: "0MM/0DD/YYYY", // default format - superceded by CalendarPlugin, DatePlugin, or DatePluginConfig
	datestampFormat: "YYYY-0MM-0DD", // date stamp format
	buttonFormat: "%0 - %2",  // timer button formats: %0=current time, %1=start time, %2=elapsed time
	defHeader: "|//Date//|//Description//|//Started//|//Stopped//|//Elapsed//|\n",
	defTarget: "ActivityReport",
	descrMsg: "Enter a short description for this activity.  Press [cancel] to continue timer.",
	askMsg: "Enter the title of a tiddler in which to record this activity.  Press [cancel] to continue timer.",
	errMsg: "'%0' is not a valid tiddler title.  Please try again...\n\n",
	createdMsg: "'%0' has been created",
	updatedMsg: "'%0' has been updated",
	marker: "/%"+"tasktimer"+"%/",
	tag: "task",
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var target=params.shift(); // get optional target tiddler title
		if (!target) target="";
		var format=this.format; if (params[0]) format=params.shift(); // get optional output format
		var descrMsg=this.descrMsg; if (params[0]) descrMsg=params.shift(); // get optional message text
		var defText=this.defText; if (params[0]) defText=params.shift(); // get optional default text
		var onclick="config.macros.taskTimer.toggle(this,'"+target+"','"+format+"','"+descrMsg+"','"+defText+"')";
		createTiddlyElement(place,"span").innerHTML =
			'<input type="button" value="start timer" title="'+this.title+'" onclick="'+onclick+'">';
	},
	toggle: function(here,target,format,msg,defText) {
		if (!target || !target.length || target=="here") {
			var  tid=story.findContainingTiddler(here);
			target=tid?tid.getAttribute("tiddler"):"ask";
		}
		if (!here.running) { // not running... start timer...
			here.startTime=new Date();
			var now=here.startTime.formatString("0hh:0mm:0ss");
			here.title=(here.target||target)+" - started at "+now;
			here.value=this.buttonFormat.format([now,now,"00:00:00"]);
			here.id=new Date().getTime()+Math.random().toString(); // unique ID
			here.ticker=setTimeout("config.macros.taskTimer.tick('"+here.id+"')",500);
			here.running=true;
		} else {
			if (target=="ask") {
				target=prompt(this.askMsg,here.target||this.defTarget);
				while (target && !target.trim().length)
					target=prompt(this.errMsg.format([target])+this.askMsg,here.target||this.defTarget);
				if (!target) return; // user cancelled input...  continue timer
			}
			var txt=prompt(msg,defText); // get description from user
			if (!txt) return; // user cancelled input...  continue timer
			if (target==this.todayKeyword || target.substr(0,this.todayKeyword.length+1)==this.todayKeyword+":")
				target=(new Date()).formatString(this.getJournalFormat(target));
			here=document.getElementById(here.id); // RE-get button element after timer has stopped...
			clearTimeout(here.ticker);
			here.target=target;
			var before=this.defHeader;
			var after=this.marker+"\n";
			var tiddler=store.getTiddler(here.target);
			if (tiddler && tiddler.text.length) {
				var pos=tiddler.text.indexOf(this.marker);
				if (pos==-1) pos=tiddler.text.length; // no marker, append content to end
				var before=tiddler.text.substr(0,pos); // everything up to marker
				if (before.length&&before.substr(before.length-1)!="\n") before+="\n"; // start on a new line
				var after=tiddler.text.substr(pos); // marker+everything else
			}
			var now=new Date(Math.floor(new Date()/1000)*1000);
			var then=new Date(Math.floor(here.startTime/1000)*1000);
			var diff=new Date(now-then);
			var s=diff.getUTCSeconds(); if (s<10) s="0"+s;
			var m=diff.getUTCMinutes(); if (m<10) m="0"+m;
			var h=diff.getUTCHours(); if (h<10) h="0"+h;
			var start=then.formatString("0hh:0mm:0ss");
			var stop=now.formatString("0hh:0mm:0ss");
			var elapsed=h+":"+m+":"+s;
			var dateStamp=now.formatString(config.macros.taskTimer.datestampFormat);
			var newtxt=before+format.format([txt,start,stop,elapsed,dateStamp])+after;
			var newtags=(tiddler?tiddler.tags:['task']); // include 'task' tag when creating new tiddlers
			store.saveTiddler(here.target,here.target,newtxt,config.options.txtUserName,new Date(),newtags,tiddler?tiddler.fields:null);
			if (!tiddler) displayMessage(this.createdMsg.format([here.target]));
			else displayMessage(this.updatedMsg.format([here.target]));
			here.running=false;
			here.value=this.label;
			here.title=this.title;
			var  tid=story.findContainingTiddler(here);
			if (!tid || tid.getAttribute("tiddler")!=target) // display target tiddler, but only when button is not IN the target tiddler
				{ story.displayTiddler(story.findContainingTiddler(here),here.target); story.refreshTiddler(here.target,1,true); }
		}
	},
	tick: function(id) {
		var here=document.getElementById(id); if (!here) return;
		var now=new Date();
		var diff=new Date(now-here.startTime);
		var s=diff.getUTCSeconds(); if (s<10) s="0"+s;
		var m=diff.getUTCMinutes();  if (m<10) m="0"+m;
		var h=diff.getUTCHours();  if (h<10) h="0"+h;
		var elapsed=h+":"+m+":"+s;
		now=now.formatString("0hh:0mm:0ss");
		var start=here.startTime.formatString("0hh:0mm:0ss");
		here.value=this.buttonFormat.format([now,start,elapsed]);
		here.ticker=setTimeout("config.macros.taskTimer.tick('"+id+"')",500);
	},
	getJournalFormat: function(target) {
		var fmt=target.split(":"); fmt.shift(); fmt=fmt.join(":");
		if (!fmt || !fmt.length) { // if date format was not specified
			if (config.macros.date)  // if installed, use default from DatePlugin
				fmt=config.macros.date.linkformat;
			if (config.macros.calendar) { // if installed, use default from CalendarPlugin
				if (!config.macros.date) // hard-coded calendar fallback if no DatePlugin
					fmt=config.macros.calendar.tiddlerformat;
				else // journalDateFmt is set when calendar is rendered with DatePlugin
					fmt=config.macros.calendar.journalDateFmt;
			}
		}
		if (!fmt) { // if not specified and no DatePlugin/CalendarPlugin
			// get format from <<newJournal>> in SideBarOptions
			var text = store.getTiddlerText("SideBarOptions");
			var re=new RegExp("<<(?:newJournal)([^>]*)>>","mg"); var fm=re.exec(text);
			if (fm && fm[1]!=null) { var pa=fm[1].readMacroParams(); if (pa[0]) fmt = pa[0]; }
		}
		if (!fmt) var fmt=this.todayFormat; // no "newJournal"... final fallback.
		return fmt;
	}
}
//}}}