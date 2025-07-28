/***
|Name|TiddlyPodPlugin|
|Source|http://www.TiddlyTools.com/#TiddlyPodPlugin|
|Version|1.4.4|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Requires|TiddlyPodList|
|Description|autoplay music randomly selected from playlist using embedded player|
!!!!!Usage
<<<
{{{
<<tiddlyPod autoplay loop verbose track:... width:... height:... size:... @TiddlerName>>
}}}
where:
* ''autoplay'' / ''noautoplay'' (keyword, default=''autoplay'')<br>the selected item will play immediately, without pressing the PLAY button.
* ''loop'' / ''noloop'' (keyword, default=''noloop'')<br>the current item is repeatedly played until you press the stop button.
* ''verbose'' (keyword, default=//none//)<br>a message will be displayed whenever an item is selected.
* ''track:...'' (number, default=//last played//)<br>the index into the playlist for the initial item to load into the player.  If no item is specified, the last one played is re-loaded (tracked in a browser cookie).  If no cookie exists (i.e., the first time you play after installing, or after clearing cookies, etc.), then the first item in the playlist is used.
* ''width:...'' and ''height:...'' (default=115x15 for QuickTime or, if using Internet Explorer, 90x44 for Windows Media Player)<br>specify a non-default width/height dimensions for the embedded player (using pixels).
* ''size:xxxx'' (default="auto")<br>a fixed height for the playlist popup container itself (using CSS measurement units, e.g., "px", "em", "cm", "in", etc.).  If the items in the list overflow this height, then a scrollbar is automatically added to the popup list.  "auto" shows //all// playlist entries without scrolling, using a variable height popup.
* ''@~TiddlerName'' (default=[[TiddlyPodList]])<br>specifies a tiddler containing the list of items to play.  Entries in the list are separated by "----", and each entry consist of two lines: the first line is the location (or URL) of the media file to be played.  The second line is a title to be displayed when that item is playing.
<<<
!!!!!Examples
<<<
{{{<<tiddlyPod noautoplay loop track:1 @TiddlyPodList>>}}}
<<tiddlyPod noautoplay loop track:1 @TiddlyPodList>>
<<<
!!!!!Revisions
<<<
2008.03.22 [1.4.4] added [[TiddlyPod]] shadow definition.
2008.03.21 [1.4.3] removed {{{pluginspage="http://www.apple.com/quicktime/download/"}}} param from HTML {{{<embed>}}}, so that FireFox (and other browsers) don't //prefer// QuickTime over other installed media players.  ''It is still up to the browser to determine which player to use.''.
2007.11.09 [1.4.2] in handler(), corrected default initialization of chkTiddlyPodAutoPlay and chkTiddlyPodLoopPlay.
2007.06.12 [1.4.1] in play(), don't call removeChildren(), since browser will clean up objects when assignment to innerHTML is made
2007.02.23 [1.4.0] added support for using 'attachment tiddlers' (see AttachFilePlugin) for self-contained playback.  This seems to work well with QuickTime.  Other embedded players may vary in support for the data:// URI.  Note: IE6/7 does NOT support data:// URI.  Attachments should always have local and/or remote fallbacks defined.
2007.02.23 [1.3.1] added support for scrollbar to playlist popup.  Use size:xxx to set the length of the playlist, where 'xxx' is any valid CSS measurement.  Use "auto" to show all playlist items without scrolling.  Also, added popup items for controlling autoplay/loopplay preferences.
2007.02.21 [1.3.0] added playlist popup and rewrote getPod() and play() to use innerHTML instead of wikify().  Eliminates all dependency on InlineJavascriptPlugin when rendering output.
2007.02.20 [1.2.1] added optional 'track:#' parameter to specify initial track, instead of starting with a random track
2007.02.20 [1.2.0] added optional 'loop' parameter to trigger looping playback
2007.02.20 [1.1.0] removed link for "edit playlist" to reduce clutter and provide a 'playback only' interface.  When changing the play list is appropriate, a link to [[TiddlyPodList]] (or any alternative playlist tiddler) can be directly added to surrounding tiddler content as needed.
2007.02.19 [1.0.0] initial release (converted from inline script)
<<<
!!!!!Code
***/
//{{{
version.extensions.TiddlyPodPlugin= {major: 1, minor: 4, revision: 4, date: new Date(2008,3,22)};

config.shadowTiddlers['TiddlyPod']='<<tiddlyPod>>';

config.macros.tiddlyPod= {
	verbose: false, // set to true to display messages
	playlist: "TiddlyPodList", // tiddler containing list of tunes
	size: "auto", // maximum length (using CSS) of playlist to show before adding a scrollbar
	width: config.browser.isIE?90:115, // width of embedded player (IE w/WinMedia vs FireFox w/QuickTime)
	height: config.browser.isIE?44:15, // height of embedded player (IE w/WinMedia vs FireFox w/QuickTime)
	getPlayer: function(src,w,h,auto,loop) {
		var out='';
		out+='<EMBED WIDTH="'+w+'" HEIGHT="'+h+'" ';
		out+='	style="height:'+h+'px;width:'+w+'px;margin:0;padding:0;" ';
		out+='	src="'+src+'" ';
		out+='	autostart="'+(auto?'true':'false')+'" autoplay="'+(auto?'true':'false')+'" ';
		out+='	loop="'+(loop?'true':'false')+'" ';
		out+='	controller="show" volume="100" EnableJavaScript="true" ';
		out+='	showtracker="1" showpositioncontrols="0" showaudiocontrols="0" ';
		out+='	showdisplay="0" showstatusbar="0" showgotobar="0"> ';
		out+='</EMBED>';
		return out;
	},
	getPod: function(playlist,which) {
		var txt=store.getTiddlerText(playlist); if (!txt) return;
		var songs=txt.split("\n----\n");
		var first=0;
		var last=songs.length-1;
		if (which===undefined) which=config.options.txtTiddlyPodNowPlaying;
		if (which<first) which=first; if (which>last) which=last;
		var next=(which-1)+2; if (next>last) next=last;
		var prev=which-1; if (prev<first) prev=first;
		var src=songs[which].split("\n")[0];
		var descr=songs[which].split("\n")[1];

		// if src is a tiddlername, check for attachment
		if (config.macros.attach!=undefined) // if AttachFilePlugin is installed
			if ((tid=store.getTiddler(src))!=null && tid.isTagged("attachment")) // if src is attachment tiddler title
				src=config.macros.attach.getAttachment(src); // replace TiddlerTitle with attachment-expanded src URL

		var out='';
		var tip=config.messages.externalLinkTooltip.format([src]); // use core defined tooltip
		out+='<div><a href="'+src+'" target="_blank" class="button" title="'+tip+'" style="white-space:normal">'+descr+'</a></div>';
		out+=this.getPlayer(src,this.width,this.height,config.options.chkTiddlyPodAutoPlay,config.options.chkTiddlyPodLoopPlay);
		out+='<div class="small">';
		out+='<a href="javascript:;" class="button" title="[first] track '+(first+1)+' - '+songs[first].split("\n")[1]+'" ';
		out+='	onclick="config.macros.tiddlyPod.play(this.parentNode.parentNode,'+first+'); return false;">&lt;&lt;</a>';
		out+='&nbsp;';
		out+='<a href="javascript:;" class="button" title="[previous] track '+(prev+1)+' - '+songs[prev].split("\n")[1]+'" ';
		out+='	onclick="config.macros.tiddlyPod.play(this.parentNode.parentNode,'+prev+'); return false;">&nbsp;&lt;&nbsp;</a>';
		out+='&nbsp;';
		out+='<a href="javascript:;" class="button" title="[playlist]" ';
		out+='	onclick="config.macros.tiddlyPod.showpopup(this,event); return false;">...</a>';
		out+='&nbsp;';
		out+='<a href="javascript:;" class="button" title="[next] track '+(next+1)+' - '+songs[next].split("\n")[1]+'" ';
		out+='	onclick="config.macros.tiddlyPod.play(this.parentNode.parentNode,'+next+'); return false;">&nbsp;&gt;&nbsp;</a>';
		out+='&nbsp;';
		out+='<a href="javascript:;" class="button" title="[last] track '+(last+1)+' - '+songs[last].split("\n")[1]+'" ';
		out+='	onclick="config.macros.tiddlyPod.play(this.parentNode.parentNode,'+last+'); return false;">&gt;&gt;</a>';
		out+='</div>';

		if (this.verbose) displayMessage('now playing... track '+(which+1)+' - "'+descr+'"');
		return out;
	},
	play: function(target,which) {
		if (which==undefined) which=config.options.txtTiddlyPodNowPlaying; // if not specified, use most recently played item
		if (which==undefined) which=0; // default to first item in playlist if no previous item
		target.innerHTML=this.getPod(this.playlist,which);
		config.options.txtTiddlyPodNowPlaying=which;
		saveOptionCookie("txtTiddlyPodNowPlaying");
		return;
	},
	showpopup: function(place,event) {
		var popup=Popup.create(place); if (!popup) return;
		var txt=store.getTiddlerText(this.playlist); if (!txt) return;
		var songs=txt.split("\n----\n");
		config.macros.tiddlyPod.target=place.parentNode.parentNode;
		createTiddlyButton(createTiddlyElement(popup,'li'),
			"play a randomly selected track", "shuffle play",
			function(){
				var t=config.options.chkTiddlyPodAutoPlay;
				config.options.chkTiddlyPodAutoPlay=true; // force autoplay
				config.macros.tiddlyPod.play(config.macros.tiddlyPod.target,Math.floor(Math.random()*songs.length));
				config.options.chkTiddlyPodAutoPlay=t;
				return false;
			});
		createTiddlyElement(popup,"hr");
		createTiddlyButton(createTiddlyElement(popup,'li'),
			(config.options.chkTiddlyPodAutoPlay?"[x]":"[_]")+" auto play",
			"automatically play tune when selected (if off, press PLAY button to start)",
			function(){
				config.options.chkTiddlyPodAutoPlay=!config.options.chkTiddlyPodAutoPlay;
				saveOptionCookie("chkTiddlyPodAutoPlay");
				config.macros.tiddlyPod.play(config.macros.tiddlyPod.target,config.options.txtTiddlyPodNowPlaying);
				return false;
			});
		createTiddlyButton(createTiddlyElement(popup,'li'),
			(config.options.chkTiddlyPodLoopPlay?"[x]":"[_]")+" repeat play",
			"when playback is finished, repeat the current selection again",
			function(){
				config.options.chkTiddlyPodLoopPlay=!config.options.chkTiddlyPodLoopPlay;
				saveOptionCookie("chkTiddlyPodLoopPlay");
				config.macros.tiddlyPod.play(config.macros.tiddlyPod.target,config.options.txtTiddlyPodNowPlaying);
				return false;
			});
		createTiddlyElement(popup,"hr");
		var playlist=createTiddlyElement(popup,"div",null,"fine"); // uses 'fine' CSS class to set font size
		playlist.style.padding="2px"; // room for dotted 'focus' indicator (prevent horizontal scrollbar from appearing)
		playlist.style.height=config.macros.tiddlyPod.size;
		playlist.style.overflow="auto";
		for (var s=0; s<songs.length; s++) {
			var src=songs[s].split("\n")[0];
			var descr=(s+1)+" - "+songs[s].split("\n")[1];
			var a=createTiddlyButton(createTiddlyElement(playlist,'li'), descr, src,
				function(){
					var t=config.options.chkTiddlyPodAutoPlay;
					config.options.chkTiddlyPodAutoPlay=true; // force autoplay
					config.macros.tiddlyPod.play(config.macros.tiddlyPod.target,this.getAttribute("which"));
					config.options.chkTiddlyPodAutoPlay=t;
					return false;
				});
			a.setAttribute("which",s); // song index
			if (s==config.options.txtTiddlyPodNowPlaying) a.style.fontWeight="bold";
		}
		createTiddlyElement(popup,"hr");
		createTiddlyButton(createTiddlyElement(popup,'li'), 'edit playlist...', '',
			function(){story.displayTiddler(null,config.macros.tiddlyPod.playlist,2);return false;});
		Popup.show(popup,false);
		if (!event) var event=window.event;
		if (event) event.cancelBubble = true;
		if (event && event.stopPropagation) event.stopPropagation();
	},
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		if (config.options.chkTiddlyPodAutoPlay==undefined)
			config.options.chkTiddlyPodAutoPlay=true; // default enable auto play
		if (config.options.chkTiddlyPodLoopPlay==undefined)
			config.options.chkTiddlyPodLoopPlay=false; // default disable loop play
		if (config.options.chkTiddlyPodNowPlaying==undefined)
			config.options.chkTiddlyPodNowPlaying=0; // default to first item in playlist
		while (p=params.shift()) {
			if (p=="autoplay")
				config.options.chkTiddlyPodAutoPlay=true; // enable auto play
			if (p=="noautoplay")
				config.options.chkTiddlyPodAutoPlay=false; // disable auto play
			else if (p=="loop")
				config.options.chkTiddlyPodLoopPlay=true; // enable loop play
			else if (p=="noloop")
				config.options.chkTiddlyPodLoopPlay=false; // disable loop play
			else if (p=="verbose")
				this.verbose=true; // enable message display
			else if (p.substr(0,1)=="@")
				this.playlist=p.substr(1); // alternative playlist tiddler 
			else if (p.substr(0,6)=="track:")
				config.options.txtTiddlyPodNowPlaying=p.substr(6)-1; // initial playlist index (0-based, e.g. track #1=index 0)
			else if (p.substr(0,6)=="width:")
				this.width=p.substr(6); // width of embedded player controls
			else if (p.substr(0,7)=="height:")
				this.height=p.substr(7); // height of embedded player controls
			else if (p.substr(0,11)=="size:")
				this.size=p.substr(11); // height of playlist in popup
		}
		this.play(createTiddlyElement(place,"span"),config.options.txtTiddlyPodNowPlaying);
	}
}
//}}}