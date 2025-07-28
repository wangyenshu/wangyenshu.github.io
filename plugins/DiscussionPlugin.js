/***
|Name|DiscussionPlugin|
|Source|http://www.TiddlyTools.com/#DiscussionPlugin|
|Documentation|http://www.TiddlyTools.com/#DiscussionPluginInfo|
|Version|1.5.7|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Requires|CommentPlugin|
|Description|display tabbed discussion summary with comment input form|
!!!!!Documentation
>see [[DiscussionPluginInfo]]
!!!!!Configuration
<<<
When installed, [[DiscussionPlugin]] can automatically modify the default shadow [[ViewTemplate]] so that all tiddlers will be rendered with two tabs: "Page", and "Discussion".  The "Page" tab displays the regular tiddler content, while the "Discussion" tab displays the summary list of comments as well as an input form to enter new comments.  You can enable/disable this action by setting/clearing the following checkbox:
><<option chkDiscussionTemplate>> Automatically modify default shadow [[ViewTemplate]]
Note: //''You must reload your document for changes to this option to take effect.''//  In addition, this option is only applied to the shadow [[ViewTemplate]].  If you are using a custom [[ViewTemplate]], you will need to manually alter that template to add the Page and Discussion tab display.

''Please see [[DiscussionPluginInfo]] for additional configuration options and instructions.''
<<<
!!!!!Revisions
<<<
2009.01.04 [1.5.7] in customized ViewTemplate, corrected 'tabs' macro to avoid error when viewing shadow tiddlers
| please see [[DiscussionPluginInfo]] for previous revision details |
2008.04.15 [1.0.0] initial prototype
<<<
!!!!!Code
***/
//{{{
version.extensions.DiscussionPlugin= {major: 1, minor: 5, revision: 7, date: new Date(2009,1,4)};

if (config.options.chkDiscussionTemplate===undefined)
	config.options.chkDiscussionTemplate=false;

config.macros.discussion= {
	reverse: // display order for summary list
		false,
	listfmt: // format for summary list items
		"#<<slider [[]] [[%tiddler%]] [[%subject%]] [[posted by %who% on %when%]]>>\n",
	tags: // tags for comment tiddlers
		"excludeLists",
	slices: // slice format included in comment tiddlers - used to create summary list display
		"/%\n|subject|%subject%|\n|byline|%who%|\n|date|%when%|\n%/",
	titlefmt: // format for dynamically generating comment tiddler title
		"_%UTC%%random%", // default: append UTC timestamp and random number
	commentfmt: // format for individual comment content
		"^^posted by %who% on %when%^^\n<<<\n%message%\n<<<\n",
	datefmt: // date format for comments
		"DDD, MMM DDth, YYYY at hh12:0mm:0ss am",
	handler: function(place,macroName,params,wikifier,paramstring,tiddler) {
		var here=story.findContainingTiddler(place);
		if (here) var tid=here.getAttribute("tiddler");  // containing tiddler title
		var listfmt=(params[0]&&params[0].length)?params[0]:this.listfmt;  // item format
		var reverse=(params[1]&&params[1].toLowerCase()=="reverse"); if (reverse) params.shift();
		var tags=params[1]?params[1]:this.tags;  // target tags
		if (!tags.readBracketedList().contains("comment")) tags+=" comment"; // must be tagged with "comment"
		var commentfmt=(params[2]&&params[2].length)?params[2]:this.commentfmt; // output format
		var datefmt=(params[3]&&params[3].length)?params[3]:this.datefmt; // date format
		var tids=store.getTaggedTiddlers("comment","created");
		if (reverse||this.reverse) tids=tids.reverse();
		var out=""; var count=0;
		for (var t=0; t<tids.length; t++) if (tids[t].title!=tid && tids[t].title.substr(0,tid.length)==tid) {
			count++;
			var title=tids[t].title;
			var subject=store.getTiddlerSlice(title,"subject");
			var byline=store.getTiddlerSlice(title,"byline");
			var when=store.getTiddlerSlice(title,"date");
			out+=listfmt;
			out=out.replace(/%tiddler%/g,title);
			out=out.replace(/%subject%/g,subject);
			out=out.replace(/%who%/g,byline);
			out=out.replace(/%when%/g,when);
		}
		out="!!!There "+(count==1?"is ":"are ")+count+" comment"+(count==1?"":"s")+":\n"+out;
		var next="%tiddler%"+this.titlefmt;
		out+="!!!Add a comment:\n";
		out+="<<comment "+next+" [["+tags+"]] [["+this.slices+commentfmt+"]] [["+datefmt+"]]>>";
		wikify(out,place);
	},
	countComments: function(tid,after) {
		var tids=store.getTaggedTiddlers("comment","created");
		var count=0;
		for (var t=0; t<tids.length; t++)
			if (tids[t].title!=tid && tids[t].title.substr(0,tid.length)==tid)
				if (!after||tid.modified>=after) count++;
		return count;
	}
};
//}}}

// // automatically add shadow tiddlers and templates for displaying page/discussion tabs
//{{{

// macro for rendering current tiddler content
config.macros.currentTiddler= {
	handler: function(place,macroName,params,wikifier,paramstring,tiddler) {
		var here=story.findContainingTiddler(place); if (!here) return;
		var txt=store.getTiddlerText(here.getAttribute("tiddler"),"");
		txt=txt.replace(/\<\<currentTiddler\>\>/g,""); // prevents infinite recursion!
		removeChildren(place); wikify(txt,createTiddlyElement(place,"div",null,"viewer"));
	}
};

// [[CurrentTiddler]] allows tab to show tiddler content
config.shadowTiddlers.CurrentTiddler="<<currentTiddler>>";

// [[DiscussionTiddler]] allows tab to show discussion panel
config.shadowTiddlers.DiscussionTiddler="<<discussion>>";

// [[NoDiscussionViewTemplate]] is an unmodified copy of the shadow [[ViewTemplate]]
config.shadowTiddlers.NoDiscussionViewTemplate=store.getTiddlerText("ViewTemplate");

// [[DiscussionViewTemplate]] is a copy of the current [[ViewTemplate]] where the 
// default viewer content ("view text wikified") is replaced with tabs for Page/Discussion
config.shadowTiddlers.DiscussionViewTemplate=store.getTiddlerText("ViewTemplate").replace(/view text wikified/,
	'tabs txtDiscussionTab Page Page CurrentTiddler {{var c=0; if(place) var h=story.findContainingTiddler(place); if(h) c=config.macros.discussion.countComments(h.getAttribute("tiddler")); "Discussion"+(c?" ("+c+")":"")}} Discussion DiscussionTiddler');

// optionally, automatically apply DiscussionViewTemplate to all tiddlers
if (config.options.chkDiscussionTemplate) config.shadowTiddlers.ViewTemplate="[[DiscussionViewTemplate]]";
//}}}