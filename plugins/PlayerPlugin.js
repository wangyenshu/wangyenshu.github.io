/***
|Name|PlayerPlugin|
|Source|http://www.TiddlyTools.com/#PlayerPlugin|
|Version|1.1.4|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|Embed a media player in a tiddler|
!!!!!Usage
<<<
{{{<<player [id=xxx] [type] [URL] [width] [height] [autoplay|true|false] [showcontrols|true|false] [extras]>>}}}

''id=xxx'' is optional, and specifies a unique identifier for each embedded player.  note: this is required if you intend to display more than one player at the same time.

''type'' is optional, and is one of the following: ''windows'', ''realone'', ''quicktime'', ''flash'', ''image'' or ''iframe''.  If the media type is not specified, the plugin automatically detects Windows, Real, QuickTime, Flash video or JPG/GIF images by matching known file extensions and/or specialized streaming-media transfer protocols (such as RTSP:).  For unrecognized media types, the plugin displays an error message.

''URL'' is the location of the media content

''width'' and ''height'' are the dimensions of the video display area (in pixels)

''autoplay'' or ''true'' or ''false'' is optional, and specifies whether the media content should begin playing as soon as it is loaded, or wait for the user to press the "play" button.  Default is //not// to autoplay.

''showcontrols'' or ''true'' or ''false'' is optional, and specifies whether the embedded media player should display its built-in control panel (e.g., play, pause, stop, rewind, etc), if any.  Default is to display the player controls.

''extras'' are optional //pairs// of parameters that can be passed to the embedded player, using the {{{<param name=xxx value=yyy>}}} HTML syntax.

''If you use [[AttachFilePlugin]] to encode and store a media file within your document, you can play embedded media content by using the title of the //attachment tiddler//'' as a parameter in place of the usual reference to an external URL.  When playing an attached media content, you should always explicitly specify the media type parameter, because the name used for the attachment tiddler may not contain a known file extension from which a default media type can be readily determined.
<<<
!!!!!Configuration
<<<
Default player size:
width: <<option txtPlayerDefaultWidth>> height: <<option txtPlayerDefaultHeight>>
<<<
!!!!!Examples
<<<
+++[Windows Media]...
Times Square Live Webcam
{{{<<player id=1 http://www.earthcam.com/usa/newyork/timessquare/asx/tsq_stream.asx>>}}}
<<player id=1 http://www.earthcam.com/usa/newyork/timessquare/asx/tsq_stream.asx>>
===
+++[RealOne]...
BBC London: Live and Recorded news
{{{<<player id=2 http://www.bbc.co.uk/london/realmedia/news/tvnews.ram>>}}}
<<player id=2 http://www.bbc.co.uk/london/realmedia/news/tvnews.ram>>
===
+++[Quicktime]...
America Free TV: Classic Comedy
{{{<<player id=3 http://www.americafree.tv/unicast_mov/AmericaFreeTVComedy.mov>>}}}
<<player id=3 http://www.americafree.tv/unicast_mov/AmericaFreeTVComedy.mov>>
===
+++[Flash]...
Asteroids arcade game
{{{<<player id=4 http://www.80smusiclyrics.com/games/asteroids/asteroids.swf 400 300>>}}}
<<player id=4 http://www.80smusiclyrics.com/games/asteroids/asteroids.swf 400 300>>
Google Video
{{{<<player id=5 flash http://video.google.com/googleplayer.swf?videoUrl=http%3A%2F%2Fvp.video.google.com%2Fvideodownload%3Fversion%3D0%26secureurl%3DoQAAAIVnUNP6GYRY8YnIRNPe4Uk5-j1q1MVpJIW4uyEFpq5Si0hcSDuig_JZcB9nNpAhbScm9W_8y_vDJQBw1DRdCVbXl-wwm5dyUiiStl_rXt0ATlstVzrUNC4fkgK_j7nmse7kxojRj1M3eo3jXKm2V8pQjWk97GcksMFFwg7BRAXmRSERexR210Amar5LYzlo9_k2AGUWPLyRhMJS4v5KtDSvNK0neL83ZjlHlSECYXyk%26sigh%3Dmpt2EOr86OAUNnPQ3b9Tr0wnDms%26begin%3D0%26len%3D429700%26docid%3D-914679554478687740&thumbnailUrl=http%3A%2F%2Fvideo.google.com%2FThumbnailServer%3Fcontentid%3De7e77162deb04c42%26second%3D5%26itag%3Dw320%26urlcreated%3D1144620753%26sigh%3DC3fqXPPS1tFiUqLzmkX3pdgYc2Y&playerId=-91467955447868774               400 326>>}}}
<<player id=5 flash http://video.google.com/googleplayer.swf?videoUrl=http%3A%2F%2Fvp.video.google.com%2Fvideodownload%3Fversion%3D0%26secureurl%3DoQAAAIVnUNP6GYRY8YnIRNPe4Uk5-j1q1MVpJIW4uyEFpq5Si0hcSDuig_JZcB9nNpAhbScm9W_8y_vDJQBw1DRdCVbXl-wwm5dyUiiStl_rXt0ATlstVzrUNC4fkgK_j7nmse7kxojRj1M3eo3jXKm2V8pQjWk97GcksMFFwg7BRAXmRSERexR210Amar5LYzlo9_k2AGUWPLyRhMJS4v5KtDSvNK0neL83ZjlHlSECYXyk%26sigh%3Dmpt2EOr86OAUNnPQ3b9Tr0wnDms%26begin%3D0%26len%3D429700%26docid%3D-914679554478687740&thumbnailUrl=http%3A%2F%2Fvideo.google.com%2FThumbnailServer%3Fcontentid%3De7e77162deb04c42%26second%3D5%26itag%3Dw320%26urlcreated%3D1144620753%26sigh%3DC3fqXPPS1tFiUqLzmkX3pdgYc2Y&playerId=-91467955447868774               400 326>>
YouTube Video
{{{<<player id=6 flash http://www.youtube.com/v/OdT9z-JjtJk 400 300>>}}}
<<player id=6 flash http://www.youtube.com/v/OdT9z-JjtJk 400 300>>
===
+++[Still Images]...
GIF (best for illustrations, animations, diagrams, etc.)
{{{<<player id=7 image images/meow.gif auto auto>>}}}
<<player id=7 image images/meow.gif auto auto>>
JPG (best for photographs, scanned images, etc.)
{{{<<player id=8 image images/meow2.jpg 200 150>>}}}
<<player id=8 image images/meow2.jpg 200 150>>
===
<<<
!!!!!Revisions
<<<
2008.05.10 [1.1.4] in handlers(), immediately return if no params (prevents error in macro).  Also, refactored auto-detect code to make type mapping configurable.
2007.10.15 [1.1.3] in loadURL(), add recognition for .PNG (still image), fallback to iframe for unrecognized media types
2007.08.31 [1.1.2] added 'click-through' link for JPG/GIF images
2007.06.21 [1.1.1] changed "hidecontrols" param to "showcontrols" and recognize true/false values in addition to 'showcontrols', added "autoplay" param (also recognize true/false values), allow "auto" as value for type param
2007.05.22 [1.1.0] added support for type=="iframe" (displays src URL in an IFRAME)
2006.12.06 [1.0.1] in handler(), corrected check for config.macros.attach (instead of config.macros.attach.getAttachment) so that player plugin will work when AttachFilePlugin is NOT installed.  (Thanks to Phillip Ehses for bug report)
2006.11.30 [1.0.0] support embedded media content using getAttachment() API defined by AttachFilePlugin or AttachFilePluginFormatters.  Also added support for 'image' type to render JPG/GIF still images
2006.02.26 [0.7.0] major re-write.  handles default params better.  create/recreate player objects via loadURL() API for use with interactive forms and scripts.
2006.01.27 [0.6.0] added support for 'extra' macro params to pass through to object parameters
2006.01.19 [0.5.0] Initial ALPHA release
2005.12.23 [0.0.0] Started
<<<
!!!!!Code
***/
//{{{
version.extensions.PlayerPlugin= {major: 1, minor: 1, revision: 4, date: new Date(2008,5,10)};

config.macros.player = {};
config.macros.player.html = {};
config.macros.player.handler= function(place,macroName,params) {
	if (!params.length) return; // missing parameters - do nothing
	var id=null;
	if (params[0].substr(0,3)=="id=") id=params.shift().substr(3);
	var type="";
	if (!params.length) return; // missing parameters - do nothing
	var p=params[0].toLowerCase();
	if (p=="auto" || p=="windows" || p=="realone" || p=="quicktime" || p=="flash" || p=="image" || p=="iframe")
		type=params.shift().toLowerCase();
	var url=params.shift(); if (!url || !url.trim().length) url="";
	if (url.length && config.macros.attach!=undefined) // if AttachFilePlugin is installed
		if ((tid=store.getTiddler(url))!=null && tid.isTagged("attachment")) // if URL is attachment
			url=config.macros.attach.getAttachment(url); // replace TiddlerTitle with URL
	var width=params.shift();
	var height=params.shift();
	var autoplay=false;
	if (params[0]=='autoplay'||params[0]=='true'||params[0]=='false')
		autoplay=(params.shift()!='false');
	var show=true;
	if (params[0]=='showcontrols'||params[0]=='true'||params[0]=='false')
		show=(params.shift()!='false');
	var extras="";
	while (params[0]!=undefined)
		extras+="<param name='"+params.shift()+"' value='"+params.shift()+"'> ";
	this.loadURL(place,id,type,url,width,height,autoplay,show,extras);
}

if (config.options.txtPlayerDefaultWidth==undefined) config.options.txtPlayerDefaultWidth="100%";
if (config.options.txtPlayerDefaultHeight==undefined) config.options.txtPlayerDefaultHeight="480"; // can't use "100%"... player height doesn't stretch right :-(

config.macros.player.typeMap={
	windows: ['mms', '.asx', '.wvx', '.wmv', '.mp3'],
	realone: ['rtsp', '.ram', '.rpm', '.rm', '.ra'],
	quicktime: ['.mov', '.qt'],
	flash: ['.swf', '.flv'],
	image: ['.jpg', '.gif', '.png'],
	iframe: ['.htm', '.html', '.shtml', '.php']
};

config.macros.player.loadURL=function(place,id,type,url,width,height,autoplay,show,extras) {

	if (id==undefined) id="tiddlyPlayer";
	if (!width) var width=config.options.txtPlayerDefaultWidth;
	if (!height) var height=config.options.txtPlayerDefaultHeight;
	if (url && (!type || !type.length || type=="auto")) { // determine type from URL
		u=url.toLowerCase();
		var map=config.macros.player.typeMap;
		for (var t in map) for (var i=0; i<map[t].length; i++)
			if (u.indexOf(map[t][i])!=-1) var type=t;
	}
	if (!type || !config.macros.player.html[type]) var type="none";
	if (!url) var url="";
	if (show===undefined) var show=true;
	if (!extras) var extras="";
	if (type=="none" && url.trim().length) type="iframe"; // fallback to iframe for unrecognized media types

	// adjust parameter values for player-specific embedded HTML
	switch (type) {
		case "windows":
			autoplay=autoplay?"1":"0"; // player-specific param value
			show=show?"1":"0"; // player-specific param value
			break;
		case "realone":
			autoplay=autoplay?"true":"false";
			show=show?"block":"none";
			height-=show?60:0; // leave room for controls
			break;
		case "quicktime":
			autoplay=autoplay?"true":"false";
			show=show?"true":"false";
			break;
		case "image":
			show=show?"block":"none";
			break;
		case "iframe":
			show=show?"block":"none";
			break;
	}

	// create containing div for player HTML
	// and add or replace player in TW DOM structure
	var newplayer = document.createElement("div");
	newplayer.playerType=type;
	newplayer.setAttribute("id",id+"_div");
	var existing = document.getElementById(id+"_div");
	if (existing && !place) place=existing.parentNode;
	if (!existing)
		place.appendChild(newplayer);
	else {
		if (place==existing.parentNode) place.replaceChild(newplayer,existing)
		else { existing.parentNode.removeChild(existing); place.appendChild(newplayer); }
	}

	var html=config.macros.player.html[type];
	html=html.replace(/%i%/mg,id);
	html=html.replace(/%w%/mg,width);
	html=html.replace(/%h%/mg,height);
	html=html.replace(/%u%/mg,url);
	html=html.replace(/%a%/mg,autoplay);
	html=html.replace(/%s%/mg,show);
	html=html.replace(/%x%/mg,extras);
	newplayer.innerHTML=html;
}
//}}}

// // Player-specific API functions: isReady(id), isPlaying(id), toggleControls(id), showControls(id,flag)

//{{{
// status values:
// Windows: 0=Undefined, 1=Stopped, 2=Paused, 3=Playing, 4=ScanForward, 5=ScanReverse
//          6=Buffering, 7=Waiting, 8=MediaEnded, 9=Transitioning, 10=Ready, 11=Reconnecting
// RealOne: 0=Stopped, 1=Contacting, 2=Buffering, 3=Playing, 4=Paused, 5=Seeking
// QuickTime: 'Waiting', 'Loading', 'Playable', 'Complete', 'Error:###'
// Flash: 0=Loading, 1=Uninitialized, 2=Loaded, 3=Interactive, 4=Complete
config.macros.player.isReady=function(id)
{
	var d=document.getElementById(id+"_div"); if (!d) return false;
	var p=document.getElementById(id); if (!p) return false;
	if (d.playerType=='windows') return !((p.playState==0)||(p.playState==7)||(p.playState==9)||(p.playState==11));
	if (d.playerType=='realone') return (p.GetPlayState()>1);
	if (d.playerType=='quicktime') return !((p.getPluginStatus()=='Waiting')||(p.getPluginStatus()=='Loading'));
	if (d.playerType=='flash') return (p.ReadyState>2);
	return true;
}
config.macros.player.isPlaying=function(id)
{
	var d=document.getElementById(id+"_div"); if (!d) return false;
	var p=document.getElementById(id); if (!p) return false;
	if (d.playerType=='windows') return (p.playState==3);
	if (d.playerType=='realone') return (p.GetPlayState()==3);
	if (d.playerType=='quicktime') return (p.getPluginStatus()=='Complete');
	if (d.playerType=='flash') return (p.ReadyState<4);
	return false;
}
config.macros.player.showControls=function(id,flag) {
	var d=document.getElementById(id+"_div"); if (!d) return false;
	var p=document.getElementById(id); if (!p) return false;
	if (d.playerType=='windows') { p.ShowControls=flag; p.ShowStatusBar=flag; }
	if (d.playerType=='realone') { alert('show/hide controls not available'); }
	if (d.playerType=='quicktime')      // if player not ready, retry in one second
		{ if (this.isReady(id)) p.setControllerVisible(flag); else setTimeout('config.macros.player.showControls("'+id+'",'+flag+')',1000); }
	if (d.playerType=='flash') { alert('show/hide controls not available'); }
}
config.macros.player.toggleControls=function(id) {
	var d=document.getElementById(id+"_div"); if (!d) return false;
	var p=document.getElementById(id); if (!p) return false;
	if (d.playerType=='windows') var flag=!p.ShowControls;
	if (d.playerType=='realone') var flag=true; // TBD
	if (d.playerType=='quicktime') var flag=!p.getControllerVisible();
	if (d.playerType=='flash') var flag=true; // TBD
	this.showControls(id,flag);
}
config.macros.player.fullScreen=function(id) {
	var d=document.getElementById(id+"_div"); if (!d) return false;
	var p=document.getElementById(id); if (!p) return false;
	if (d.playerType=='windows') p.DisplaySize=3;
	if (d.playerType=='realone') p.SetFullScreen();
	if (d.playerType=='quicktime') { alert('full screen not available'); }
	if (d.playerType=='flash') { alert('full screen not available'); }
}
//}}}

// // Player HTML

//{{{
// placeholder (no player)
config.macros.player.html.none=' \
	<table id="%i%" width="%w%" height="%h%" style="background-color:#111;border:0;margin:0;padding:0;"> \
	<tr style="background-color:#111;border:0;margin:0;padding:0;"> \
	<td width="%w%" height="%h%" style="background-color:#111;color:#ccc;border:0;margin:0;padding:0;text-align:center;"> \
	&nbsp; \
	%u% \
	&nbsp; \
	</td></tr></table>';
//}}}

//{{{
// JPG/GIF/PNG still images
config.macros.player.html.image='\
	<a href="%u%" target="_blank"><img width="%w%" height="%h%" style="display:%s%;" src="%u%"></a>';
//}}}

//{{{
// IFRAME web page viewer
config.macros.player.html.iframe='\
	<iframe id="%i%" width="%w%" height="%h%" style="display:%s%;background:#fff;" src="%u%"></iframe>';
//}}}

//{{{
// Windows Media Player
// v7.1 ID: classid=CLSID:6BF52A52-394A-11d3-B153-00C04F79FAA6
// v9	ID: classid=CLSID:22d6f312-b0f6-11d0-94ab-0080c74c7e95
config.macros.player.html.windows=' \
	<object id="%i%" width="%w%" height="%h%" style="margin:0;padding:0;width:%w%;height:%h%px;" \
		classid="CLSID:22d6f312-b0f6-11d0-94ab-0080c74c7e95" \
		codebase="http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,4,5,715" \
		align="baseline" border="0" \
		standby="Loading Microsoft Windows Media Player components..." \
		type="application/x-oleobject"> \
		<param name="FileName" value="%u%"> <param name="ShowControls" value="%s%"> \
		<param name="ShowPositionControls" value="1"> <param name="ShowAudioControls" value="1"> \
		<param name="ShowTracker" value="1"> <param name="ShowDisplay" value="0"> \
		<param name="ShowStatusBar" value="1"> <param name="AutoSize" value="1"> \
		<param name="ShowGotoBar" value="0"> <param name="ShowCaptioning" value="0"> \
		<param name="AutoStart" value="%a%"> <param name="AnimationAtStart" value="1"> \
		<param name="TransparentAtStart" value="0"> <param name="AllowScan" value="1"> \
		<param name="EnableContextMenu" value="1"> <param name="ClickToPlay" value="1"> \
		<param name="InvokeURLs" value="1"> <param name="DefaultFrame" value="datawindow"> \
		%x% \
		<embed src="%u%" style="margin:0;padding:0;width:%w%;height:%h%px;" \
			align="baseline" border="0" width="%w%" height="%h%" \
			type="application/x-mplayer2" \
			pluginspage="http://www.microsoft.com/windows/windowsmedia/download/default.asp" \
			name="%i%" showcontrols="%s%" showpositioncontrols="1" \
			showaudiocontrols="1" showtracker="1" showdisplay="0" \
			showstatusbar="%s%" autosize="1" showgotobar="0" showcaptioning="0" \
			autostart="%a%" autorewind="0" animationatstart="1" transparentatstart="0" \
			allowscan="1" enablecontextmenu="1" clicktoplay="0" invokeurls="1" \
			defaultframe="datawindow"> \
		</embed> \
	</object>';
//}}}

//{{{
// RealNetworks' RealOne Player
config.macros.player.html.realone=' \
	<table width="%w%" style="border:0;margin:0;padding:0;"><tr style="border:0;margin:0;padding:0;"><td style="border:0;margin:0;padding:0;"> \
	<object id="%i%" width="%w%" height="%h%" style="margin:0;padding:0;" \
		CLASSID="clsid:CFCDAA03-8BE4-11cf-B84B-0020AFBBCCFA"> \
		<PARAM NAME="CONSOLE" VALUE="player"> \
		<PARAM NAME="CONTROLS" VALUE="ImageWindow"> \
		<PARAM NAME="AUTOSTART" Value="%a%"> \
		<PARAM NAME="MAINTAINASPECT" Value="true"> \
		<PARAM NAME="NOLOGO" Value="true"> \
		<PARAM name="BACKGROUNDCOLOR" VALUE="#333333"> \
		<PARAM NAME="SRC" VALUE="%u%"> \
		%x% \
		<EMBED width="%w%" height="%h%" controls="ImageWindow" type="audio/x-pn-realaudio-plugin" style="margin:0;padding:0;" \
			name="%i%" \
			src="%u%" \
			console=player \
			maintainaspect=true \
			nologo=true \
			backgroundcolor=#333333 \
			autostart=%a%> \
		</OBJECT> \
	</td></tr><tr style="border:0;margin:0;padding:0;"><td style="border:0;margin:0;padding:0;"> \
	<object id="%i%_controls" width="%w%" height="60" style="margin:0;padding:0;display:%s%" \
		CLASSID="clsid:CFCDAA03-8BE4-11cf-B84B-0020AFBBCCFA"> \
		<PARAM NAME="CONSOLE" VALUE="player"> \
		<PARAM NAME="CONTROLS" VALUE="All"> \
		<PARAM NAME="NOJAVA" Value="true"> \
		<PARAM NAME="MAINTAINASPECT" Value="true"> \
		<PARAM NAME="NOLOGO" Value="true"> \
		<PARAM name="BACKGROUNDCOLOR" VALUE="#333333"> \
		<PARAM NAME="SRC" VALUE="%u%"> \
		%x% \
		<EMBED WIDTH="%w%" HEIGHT="60" NOJAVA="true" type="audio/x-pn-realaudio-plugin" style="margin:0;padding:0;display:%s%" \
			controls="All" \
			name="%i%_controls" \
			src="%u%" \
			console=player \
			maintainaspect=true \
			nologo=true \
			backgroundcolor=#333333> \
		</OBJECT> \
	</td></tr></table>';
//}}}

//{{{
// QuickTime Player
config.macros.player.html.quicktime=' \
	<OBJECT ID="%i%" WIDTH="%w%" HEIGHT="%h%" style="margin:0;padding:0;" \
		CLASSID="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" \
		CODEBASE="http://www.apple.com/qtactivex/qtplugin.cab"> \
		<PARAM name="SRC" VALUE="%u%"> \
		<PARAM name="AUTOPLAY" VALUE="%a%"> \
		<PARAM name="CONTROLLER" VALUE="%s%"> \
		<PARAM name="BGCOLOR" VALUE="#333333"> \
		<PARAM name="SCALE" VALUE="aspect"> \
		<PARAM name="SAVEEMBEDTAGS" VALUE="true"> \
		%x% \
		<EMBED name="%i%" WIDTH="%w%" HEIGHT="%h%" style="margin:0;padding:0;" \
			SRC="%u%" \
			AUTOPLAY="%a%" \
			SCALE="aspect" \
			CONTROLLER="%s%" \
			BGCOLOR="#333333" \
			EnableJavaSript="true" \
			PLUGINSPAGE="http://www.apple.com/quicktime/download/"> \
		</EMBED> \
	</OBJECT>';
//}}}

//{{{
// Flash Player
config.macros.player.html.flash='\
	<object id="%i%" width="%w%" height="%h%" style="margin:0;padding:0;" \
		classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" \
		codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,29,0"> \
		<param name="movie" value="%u%"> \
		<param name="quality" value="high"> \
		<param name="SCALE" value="exactfit"> \
		<param name="bgcolor" value="333333"> \
		%x% \
		<embed name="%i%" src="%u%" style="margin:0;padding:0;" \
			height="%h%" width="%w%" quality="high" \
			pluginspage="http://www.macromedia.com/go/getflashplayer" \
			type="application/x-shockwave-flash" scale="exactfit"> \
		</embed> \
	</object>';
//}}}