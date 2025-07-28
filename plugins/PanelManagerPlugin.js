/***
|Name|[[PanelManagerPlugin]]|
|Source|http://www.TiddlyTools.com/#PanelManagerPlugin|
|Documentation|http://www.TiddlyTools.com/#PanelManagerPlugin|
|Version|1.0.2|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Requires|MoveablePanelPlugin|
|Description|Add-on for [[MoveablePanelPlugin]]: Panel Manager Menu, Control Panel, and Map Viewer |
Track position/size of moveable panels using named //panel maps//.  Interactive graphical map viewer provides "bird's eye" view of entire document for quick navigation between panels and management of panel layouts.
!!!!!Documentation
<<<
see [[PanelManagerPluginInfo]] (pending)
{{{
<<moveablePanel menu label:... prompt:...>>
<<moveablePanel menu label:... prompt:... name:...>>
<<moveablePanel maps label:... prompt:...>>
<<moveablePanel load label:... prompt:... name:...>>
<<moveablePanel viewer size:... >>
<<moveablePanel table>>
<<moveablePanel commands>>
}}}
*''menu''<br>instead of adding the mouse handling to the containing panel, the macro will render just the Panel Manager menu button.  This allows you to embed the button anywhere in your document (e.g., in the main menu or sidebar) to provide a fixed location for always accessing the current panel layout.  When ''menu'' is specified, you can use ''label:...'' and ''prompt:...'' to override the default button text (&#x2261;) and tooltip to suit your purposes.  If you provide a ''name:...'' parameter along with ''menu'', then only the section of the Panel Manager menu that applies to that named panel will be included in the resulting menu (to control a single, specific panel).
*''maps''<br>embeds a popup list of all panel maps stored in the document, permitting you to quickly switch between panel maps just by selecting a map from the popup list.
*''load''<br>embeds a command link that loads the panel map specified by the ''name:...'' parameter.
*''viewer''<br>embeds a graphical, interactive panel map viewer and page navigator in your tiddler content.  You can specify the maximum width and height of the embedded viewer using the ''size:...'' parameter with CSS units of measure (e.g., px, em, cm, in, %).  If the size is not specified, the default is for the viewer to fit the element in which it rendered (i.e., using the 'auto' or '100%' CSS value).  The ''viewer'' display is updated //live// as panels are docked/undocked, moved, size, folded, etc.
*''table''<br>embeds a panel map data table viewer in your tiddler content.  This table shows the x, y, w, h, and z, values associated with each panel stored in the current map.  As with the ''viewer'', the ''table'' data is automatically updated when panels are changed.
*''commands''<br>embeds the panel map management commands (i.e., ''new'', ''load'', ''edit'', ''save'', and ''view table...'').

// more documentation pending... //
<<<
!!!!!Open issues
<<<
Known problems:
* IE: Popups appear as a vertical line when X > window width (i.e., the core assumes left side of page)... maybe a CSS clipping issue?
* IE: 'zoomed in' mapsize calculation is way off.  These equations need to be re-examined for all browsers.
Additional features (for later):
* Track hover/docked states (in addition to x,y,w,h,z,folded)
* Drag outline in map to scroll page
* Option to normalize z-range when saving maps
<<<
!!!!!Configuration
<<<
<<option chkPanelManagerUseCookies>> remember panel maps between sessions (enables cookies)
<<option chkMoveablePanelShowStatus>> show position/size while moving/resizing a panel
<<option chkMoveablePanelShowManager>> add Panel Manager button to all undocked panels
<<option chkPanelManagerAutoMap>> automatically show map viewer as soon as popup menu is opened
<<option chkPanelManagerMapFullPage>> show full page (zoom out) in map viewer (no scrollbars)
Popup map viewer display size (maximum width and height): {{fourchar{<<option txtPanelManagerPopupMapSize>>}}}
^^//(use CSS dimensions, leave blank or use 'auto' to fit to container)//^^
<<<
!!!!!Examples
<<<
popup menu:
>{{{<<moveablePanel menu label:panels>>}}}
><<moveablePanel menu label:panels>>
map viewer control panel
>{{{<<moveablePanel commands>>}}}
><<moveablePanel commands>>
map viewer display
>{{{<<moveablePanel viewer size:400px>>}}}
>{{groupbox floatleft center{<<moveablePanel viewer size:400px>>}}}{{clear block{}}}
<<<
!!!!!Revisions
<<<
2010.12.24 1.0.2 fixed findMouseX/findMouseY for webkit browsers
2008.12.15 1.0.1 handling for 'hovered' elements: adjust for fixed vs. absolute (no relative offsets, no scroll offsets), translate movements to top-left screen, restrict movements within screen bounds
2008.11.26 1.0.0 initial release - use with [[MoveablePanelPlugin]] v3.0.0 or above
|please see [[MoveablePanelPluginInfo]] for additional information|
<<<
!!!!!Code
***/
//{{{
version.extensions.PanelManagerPlugin= {major: 1, minor: 0, revision: 2, date: new Date(2010,12,24)};
//}}}
// // defaults for options
//{{{
if (config.options.txtMoveablePanelMapName===undefined)
	config.options.txtMoveablePanelMapName='DefaultMap';
if (config.options.chkMoveablePanelShowStatus===undefined)
	config.options.chkMoveablePanelShowStatus=true;
if (config.options.chkMoveablePanelShowManager===undefined)
	config.options.chkMoveablePanelShowManager=true;
if (config.options.chkPanelManagerAutoMap===undefined)
	config.options.chkPanelManagerAutoMap=true;
if (config.options.chkPanelManagerMapFullPage===undefined)
	config.options.chkPanelManagerMapFullPage=true;
if (config.options.txtPanelManagerPopupMapSize===undefined)
	config.options.txtPanelManagerPopupMapSize='auto';
if (config.options.chkPanelManagerUseCookies===undefined)
	config.options.chkPanelManagerUseCookies=true;
//}}}
// // shadow tiddlers (for displaying interfaces inside sliders, tabs, etc)
//{{{
config.shadowTiddlers.PanelViewer='<<moveablePanel viewer>>';
config.shadowTiddlers.PanelTable='<<moveablePanel table>>';
config.shadowTiddlers.PanelCommands='<<moveablePanel commands>>';
//}}}
// // translate
//{{{
// TRANSLATORS: copy this section to PanelManagerPluginLingoXX
if (config.macros.moveablePanel===undefined) config.macros.moveablePanel={};
if (config.macros.moveablePanel.manager===undefined) config.macros.moveablePanel.manager={};
merge(config.macros.moveablePanel.manager,{

	buttonLabel:	'\u2261', // equiv
	buttonTip:	'Panel Manager',

	panelCmd:	"panel: '%0'\xa0",
	jumpToPanelCmd:	'jump to panel',
	jumpToPanelTip:	"bring '%0' into view",
	frontCmd:	'bring to front',
	frontTip:	"bring '%0' to front of stack",
	backCmd:	'send to back',
	backTip:	"send '%0' to back of stack",
	stackCmd:	'return to stack',
	stackTip:	"return '%0' to it's default stack order (zIndex)",
	moveCmd:	'move panel',
	moveTip:	"move '%0' to another location on the page",
	foldCmd:	'fold panel',
	foldTip:	"reduce the height of '%0'",
	unfoldCmd:	'unfold panel',
	unfoldTip:	"restore the height of '%0'",
	hoverCmd:	'hover panel',
	hoverTip:	"keep '%0' in view when scrolling",
	scrollCmd:	'scroll panel',
	scrollTip:	"allow '%0' to move with page",
	dockCmd:	'dock panel',
	dockTip:	"attach '%0' to it's default anchor point",
	undockCmd:	'undock panel',
	undockTip:	"detach '%0' from it's default anchor point",
	closeCmd:	'close panel',
	closeTip:	"hide/close '%0'",
	openCmd:	'open panel',
	openTip:	"show/open '%0'",
	resetCmd:	'reset panel',
	resetTip:	"return '%0' to it's starting size/position for this session",

	tiddlerCmd:	"tiddler: '%0'",
	tiddlerDirtyMsg:"'%0' is currently being edited. Unsaved changes will be discarded.",

	selectPanelCmd:	'panels...',
	selectPanelTip:	'select and navigate to other panels',
	selectPanelMsg:	'select a panel:',

	selectMapCmd:	'maps...',
	selectMapTip:	'Select a stored panel layout',
	selectMapMsg:	'select a map:',

	viewMapCmd:	"map: '%0'\xa0",
	viewMapTip:	'view, load, edit and save panel layouts',
	viewMapHeader:	"__//current map:// %0 %1__\n",
	viewMapEmpty:	'| there are currently no //undocked// panels |>|>|>|>|>|',
	viewMapUnsaved:	'(unsaved)',
	newMapCmd:	'new',
	newMapTip:	"Dock all panels and start a new map",
	newMapPrompt:	'Create a new panel map:',
	newMapName:	'NewMap',
	newMapErr:	"A panel map named '%0' already exists.  Unsaved changes in '%0' will be discarded.",
	loadMapCmd:	'load',
	loadThisMapTip:	"Apply the panel layout from '%0'",
	switchMapMsg:	"Now using panel map: '%0'",
	editMapCmd:	"edit",
	editMapTip:	'Edit the stored panel layout',
	saveMapCmd:	'save',
	saveMapTip:	'Save the current panel layout',
	saveMapPrompt:	'Save the current panel map to a tiddler:',
	saveMapMsg:	"Panel layout saved to '%0'",
	unsavedMapErr:	"Unsaved changes to the current panel map, '%0', will be discarded.",

	optionsCmd:	'options...',
	optionsTip:	'set MoveablePanel options',
	useCookiesCmd:	'remember panel maps between sessions\xa0',
	useCookiesTip:	'remember panel maps between sessions (uses cookies)',
	showManagerCmd:	'add PanelManager button to all panels\xa0',
	showManagerTip:	'add PanelManager button to all panels',
	autoMapCmd:	'show map viewer when popup menu is opened\xa0',
	autoMapTip:	'show map viewer when popup menu is opened',
	showStatusCmd:	'show panel info while moving/sizing\xa0',
	showStatusTip:	'show panel info while moving/sizing',
	mapFullPageCmd:	'zoom out (fullpage)',
	mapFullPageTip:	'view the entire panel map scaled to fit\xa0',
	mapScrollPageCmd:'zoom in (scroll)',
	mapScrollPageTip:'view a portion of the panel map with scrolling',
	mapSizeCmd:	'viewer size:\xa0',
	mapSizeTip:	'set the map viewer display (use CSS measurements: px, em, in, cm, %)',

	dockAllCmd:	'dock all panels',
	dockAllTip:	'Return all panels to their default anchor points',
	resetAllCmd:	'reset all panels',
	resetAllTip:	'Reset all panels to their starting size/position for this session',

	noPid:		'unnamed panel',
	noPanels:	'\xa0no active panels\xa0',
	notAPanel:	"\xa0has not been displayed yet\xa0",
	noMaps:		'\xa0no saved maps\xa0',
	thisPanel:	'this panel',
	notMoveableMsg:	"'%0' is not a moveable panel",
	viewerMapStatsMsg:
		 "| document size:&nbsp;|''%0 x %1'' |\n"
		+"| window size:&nbsp;|''%2 x %3'' |\n"
		+"| window view:&nbsp;|''(%4-%5) x (%6-%7)'' |\n",
	viewerTableCmd:	'show table...',
	viewerTableTip:	'show/hide current map data table',
	viewerBackgroundTip:'click for display options...',
	refreshMapCmd:	'refresh viewer',
	refreshMapTip:	'redraw map viewer display image',

	viewerMapTip:	'click to scroll...',
	XYJumpCmd:	'scroll window to:',
	XYJumpTip:	'scroll to %0(%1,%2)',
	XYMoveCmd:	"move '%0' to:",
	XYMoveTip:	'move panel to %0(%1,%2)',
	jumpHereCmd:	'scroll here (%0,%1)\xa0',
	moveHereCmd:	'move here (%0,%1)\xa0',
	compassJumpCmd:	'or, scroll to:',
	compassMoveCmd:	'or, move to:',
	centerJumpCmd:	'center on panel',
	centerJumpTip:	'view panel in center of window ',
	centerMoveCmd:	'center in view',
	centerMoveTip:	'center of current window view ',
	compassTL:	'\u25E4', compassT: '\u25B2', compassTR: '\u25E5',
	compassL:	'\u25C4', compassC: '\u25CA', compassR:  '\u25BA',
	compassBL:	'\u25E3', compassB: '\u25BC', compassBR: '\u25E2',
	compassTLTip:	'top left corner of page ',
   	compassTTip:	'top edge of page ',
	compassTRTip:	'top right corner of page ',
	compassLTip:	'left edge of page ',
	compassCTip:	'center of page ',
	compassRTip:	'right edge of page ',
	compassBLTip:	'bottom left corner of page ',
	compassBTip:	'bottom edge of page ',
	compassBRTip:	'bottom right corner of page ',

	mapTags:	['panelmap'], // default tags - 1st tag used to find panelmaps - can be customized
	mapTag:		'panelmap', // fallback default - DO NOT CHANGE
	mapHeader:	'| %0!panelname|   !x |   !y |   !w |   !h |   !z | !fold | !hover |h', // CHANGE HEADINGS ONLY
	mapFormat:	'| %0| %1| %2| %3| %4| %5|   %6   |    %7   |', // DO NOT CHANGE
	checkmark:	'\u221A', // DO NOT CHANGE

	// DO NOT TRANSLATE PARAMETERS (BREAKS PORTABILITY OF CONTENT ACROSS DOCUMENTS)
	nameParam:	'name',
	menuParam:	'menu',
	mapsParam:	'maps',
	labelParam:	'label',
	promptParam:	'prompt',
	commandsParam:	'commands',
	viewerParam:	'viewer',
	tableParam:	'table',
	sizeParam:	'size',
	loadParam:	'load'
});
//}}}
// // general utilities (global)
//{{{
// if removeCookie() function is not defined by TW core, define it here (for <TW2.5)
if (window.removeCookie===undefined) {
	window.removeCookie=function(name) {
		document.cookie = name+'=; expires=Thu, 01-Jan-1970 00:00:01 UTC; path=/;'; 
	}
}
if (window.copyObject===undefined) {
	window.copyObject=function(src)	{
		for (var i in src) this[i]=typeof src[i]!='object'?src[i]:new copyObject(src[i]);
	}
}
if (window.compareObjects===undefined) {
	window.compareObjects=function(a,b) {
		if (a===b) return true;
		if (a==undefined||b==undefined) return false;
		for (var i in a) if (typeof a[i]!='object'?a[i]!==b[i]:!compareObjects(a[i],b[i])) return false;
		return true;
	}
}
if (window.isEmptyObject===undefined) {
	window.isEmptyObject=function(src) { for (var i in src) return false; return true; }
}

// cross-browser metrics
window.findMouseX=function(ev) { if (!ev) return 0; var x=0;
	if (config.browser.isIE)	return ev.clientX+findScrollX();// IE
	if (config.browser.isSafari) 	return ev.pageX+findScrollX(); 	// Webkit
	else				return ev.pageX;		// Firefox/other
}
window.findMouseY=function(ev){ if (!ev) return 0; var y=0;
	if (config.browser.isIE)	return ev.clientY+findScrollY();// IE
	if (config.browser.isSafari) 	return ev.pageY+findScrollY();	// Webkit
	else				return ev.pageY;		// Firefox/other
}
// NOTE: WEBKIT uses document.width/height, MOZ uses the 'documentElement.scrollWidth/Height'
window.findDocumentWidth=function()
	{ var dw=document.documentElement.scrollWidth; if (document.width>dw) dw=document.width; return dw; }
window.findDocumentHeight=function()
	{ var dh=document.documentElement.scrollHeight; if (document.height>dh) dh=document.height; return dh; }

// abbreviations for adding menu elements
window.addLI=function(place)
	{return createTiddlyElement(place,'li');};
window.addBR=function(place)
	{return createTiddlyElement(place,'br');};
window.addHR=function(place)
	{return createTiddlyElement(createTiddlyElement(place,'li',null,'listBreak'),'div');};
window.addSEP=function(place)
	{return createTiddlyText(place,'\xa0|\xa0');};
window.addTXT=function(place,txt)
	{return createTiddlyText(addLI(place),txt)};
window.addBTN=function(place,label,tip,fn)
	{return createTiddlyButton(place,label,tip,fn,'button')};
window.addCMD=function(place,label,tip,fn)
	{return createTiddlyButton(addLI(place),label,tip,fn,'button')};
window.addPOP=function(place,className)
	{return Popup.create(place,null,'popup '+className)};
window.addCHK=function(place,label,tip,opt,hidechk) { // option checkbox AND text toggle config.options[chk...]
	if (!hidechk) config.macros.option.genericCreate(place,'chk',opt,null,'no');
	var b=addBTN(place,label,tip,function(ev){
		var ev=ev||window.event; var cmm=config.macros.moveablePanel;
		config.options[this.opt]=!config.options[this.opt];
		config.macros.option.propagateOption(this.opt,'checked',config.options[this.opt],'input');
		saveOptionCookie(this.opt); cmm.manager.notify('option:'+this.opt);
		Popup.remove(Popup.find(this)); return cmm.processed(ev);
	}); b.opt=opt; b.innerHTML=label;
};

// open popup at current mouse position
Popup.showHere=function(place,ev) {
	var x=findMouseX(ev)-findPosX(place);
	var y=findMouseY(ev)-findPosY(place);
	Popup.show('top','left',{x:x,y:y});
}
//}}}
// // macro
//{{{
if (config.macros.moveablePanel===undefined) config.macros.moveablePanel={};
if (config.macros.moveablePanel.manager===undefined) config.macros.moveablePanel.manager={};
merge(config.macros.moveablePanel.manager,{
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {

		var showmenu	=params.contains(this.menuParam);
		var showcommands=params.contains(this.commandsParam);
		var showtable	=params.contains(this.tableParam);
		var showviewer	=params.contains(this.viewerParam);
		var showmaps	=params.contains(this.mapsParam);

		params=paramString.parseParams('anon',null,true,false,false);
		var load	=getParam(params,this.loadParam,null);
		var name	=getParam(params,this.nameParam,null);
		var label	=getParam(params,this.labelParam,null);
		var prompt	=getParam(params,this.promptParam,null);
		var size	=getParam(params,this.sizeParam,null);

		if (load) addBTN(place,label||load,prompt||this.loadThisMapTip.format([load]),function(ev){
			config.macros.moveablePanel.manager.loadMap(this.map,ev)}).map=load;
		if (showmenu) 	  this.menu(place,name,label||this.buttonLabel,prompt||this.buttonTip);
		if (showcommands) this.viewer_commands(createTiddlyElement(place,'div'));
		if (showtable)	  this.viewer_table(createTiddlyElement(place,'div'));
		if (showviewer)	  this.viewer_map(createTiddlyElement(place,'div'),false,size);
		if (showmaps)	  this.menu_loadMap(place,label||this.selectMapCmd,prompt||this.selectMapTip,'bottom','left');

		return load||showmenu||showcommands||showtable||showviewer||showmaps; // handled==TRUE
	},
//}}}
// // notifications
//{{{
	notify: function(p) { // p=panel that was changed (or a text message if refresh/reload event)
		if (config.macros.moveablePanel.quiet) return;
		// for now, just a general refresh of all currently display viewers
		this.refreshAllViewers(p);
	},
//}}}
// // panel maps
//{{{
	map: undefined,
	startingMap: undefined,
	trackMap: function(p) {
		if (!p||!p.pid||!p.pid.length) return;
		this.readMap(config.options.txtMoveablePanelMapName);
		var re=/(\.[0-9]*px)|px/g; // removes decimals and 'px' from CSS
		if (!hasClass(p,'undocked'))
			delete this.map[p.pid];
		else this.map[p.pid]={ pid:p.pid, 
			x:p.style.left.replace(re,''),  y:p.style.top.replace(re,''),
			w:p.style.width.replace(re,''),	h:p.style.height.replace(re,''),
			z:p.style.zIndex, folded:hasClass(p,'folded'), hover:hasClass(p,'hover')  };
		this.setMapCookie(config.options.txtMoveablePanelMapName);
		this.notify(p);
	},
	applyMap: function(p) {
		var cmm=config.macros.moveablePanel;
		if (!p||!p.pid||!p.pid.length) return;
		this.readMap(config.options.txtMoveablePanelMapName);
		var d=this.map[p.pid]; if (!d) return; // panel is not mapped... do nothing
		if (!cmm.isStackable(p)) p.style.position='absolute';
		addClass(p,'undocked');
		if (d.folded) addClass(p,'folded'); else removeClass(p,'folded');
		if (d.hover)  addClass(p,'hover');  else removeClass(p,'hover');
		function addPX(v) { return v&&v.length?v+(!isNaN(v)?'px':''):''; }
		p.style.left  =addPX(d.x); p.style.top   =addPX(d.y);
		p.style.width =addPX(d.w); p.style.height=addPX(d.h);
		p.style.zIndex=d.z&&d.z.length?d.z:'';
		this.notify(p);
	},
	formatMap: function(includeHeading) {
		var cmm=config.macros.moveablePanel;
		function pad(t,maxlen) {
			var spaces='                                                  '; // 50 spaces
			return t.toString().length>=maxlen?'':spaces.substr(0,maxlen-t.toString().length);
		}
		var panels=cmm.getAllPanels(true); // sorted by zIndex
		var maxlen=0; for (var i=0; i<panels.length; i++)
			if (panels[i].pid && panels[i].pid.length>maxlen) maxlen=panels[i].pid.length;
		var panelHeader=this.mapHeader.split('|')[1].trim().format(['']);
		if (maxlen<panelHeader.length) maxlen=panelHeader.length;
		var out=[]; 
		if (includeHeading) out.push(this.mapHeader.format([pad(panelHeader,maxlen)]));
		for (var i=0; i<panels.length; i++) {
			var pid=panels[i].pid; var d=this.map[pid]; if (!d) continue;
			out.push(this.mapFormat.format([pad(pid,maxlen)+pid,
				pad(d.x,5)+d.x, pad(d.y,5)+d.y,	pad(d.w,5)+d.w, pad(d.h,5)+d.h,
				pad(d.z,5)+d.z, d.folded?this.checkmark:' ', d.hover?this.checkmark:' ' ]));
		}
		return out.join('\n');
	},
	setMapCookie: function(map) {
		if (!config.options.chkPanelManagerUseCookies) return;
		var opt='txt'+map;
		config.options[opt]=this.formatMap();
		if (config.options[opt].length) saveOptionCookie(opt); else removeCookie(opt);
	},
	readMap: function(map,force) { // get map from tiddler+cookie (cookie takes precedence)
		if (this.map && !force) return; // CACHED or LOAD ON DEMAND
		delete this.map; this.map=new Object();
		var t=store.getTiddlerText(map);
		if (config.options.chkPanelManagerUseCookies) var c=config.options['txt'+map];
		var m=(t||'')+(t&&c?'\n':'')+(c||'');
		if (!m||!m.length) return false; // NO MAP
		var items=m.split('\n');
		for (var i=0; i<items.length; i++) {
			// skip non-data table rows (|h, |c, or |k syntax)
			if (items[i].substr(items[i].length-1,1)!='|') continue;
			var d=items[i].split('|');
			for (var j=0;j<d.length;j++) d[j]=d[j]?d[j].trim():'';
			if (d[1]&&d[1].length) { 
				var m=this.map[d[1]]=new Object();
				m.pid=d[1]; m.x=d[2]; m.y=d[3]; m.w=d[4]; m.h=d[5]; m.z=d[6];
				m.folded=(d[7]&&d[7].length>0); m.hover=(d[8]&&d[8].length>0);
			}
		}
		if (!force) this.startingMap=new copyObject(this.map); // DEEP COPY TO CACHE
	},
	writeMap: function(map) {
		this.readMap(map);
		var t=store.getTiddler(map);
		var who=t&&config.options.chkForceMinorUpdate?t.modifier:config.options.txtUserName;
		var when=t&&config.options.chkForceMinorUpdate?t.modified:new Date();
		var tags=t?t.tags:this.mapTags; tags.pushUnique(this.mapTags[0]||this.mapTag);
		var fields=t?t.fields:{};
		store.saveTiddler(map,map,this.formatMap(true),who,when,tags,fields);
		story.refreshTiddler(map,null,true);
	},
	newMap: function(ev) { // clear map and docked all panels
		var cmm=config.macros.moveablePanel;
		var map=config.options.txtMoveablePanelMapName;
		var newname=prompt(this.newMapPrompt,this.newMapName);
		while (newname && newname.trim().length && newname!=map && newname!=this.newMapName
			&& (config.options['txt'+newname]||store.tiddlerExists(newname)) ) {
			if (confirm(this.newMapErr.format([newname]))) break;  // CANCELLED
			newname=prompt(this.newMapPrompt,newname);
		}
		if (!newname || !newname.trim().length) return true; // CANCELLED
		if (this.isMapChanged(map)&&!confirm(this.unsavedMapErr.format([map]))) return true;
		delete this.map; this.map=new Object();
		config.options['txt'+newname]=''; removeCookie('txt'+newname); // flush new map cookie (if any)
		var panels=cmm.getAllPanels();
		cmm.quiet++; for (var i=0; i<panels.length; i++) cmm.restorePanel(panels[i]); cmm.quiet--;
		config.options.txtMoveablePanelMapName=newname;
		saveOptionCookie('txtMoveablePanelMapName');
		this.notify('new map');
		return cmm.processed(ev);
	},
	loadMap: function(map,ev) { // *adds* entries to existing map data
		var cmm=config.macros.moveablePanel;
		var currmap=config.options.txtMoveablePanelMapName;
		if (this.isMapChanged(currmap)&&!confirm(this.unsavedMapErr.format([currmap]))) return true;
		config.options['txt'+map]=''; removeCookie('txt'+map);
		this.readMap(map,true);	// FORCE RELOAD
		cmm.quiet++;
		var panels=cmm.getAllPanels();
		for (var i=0; i<panels.length; i++) {
			if (hasClass(panels[i],'undocked')) cmm.restorePanel(panels[i]);
			this.applyMap(panels[i]);
		}
		cmm.quiet--;
		config.options.txtMoveablePanelMapName=map;
		saveOptionCookie('txtMoveablePanelMapName')
		this.setMapCookie(map);
		this.notify('load map');
		return cmm.processed(ev);
	},
	saveMap: function(map,ev) {
		var cmm=config.macros.moveablePanel;
		var map=prompt(this.saveMapPrompt,map);
		while (map && map.trim().length && store.tiddlerExists(map)) {
			var msg=story.isDirty(map)?this.tiddlerDirtyMsg:config.messages.overwriteWarning;
			if (confirm(msg.format([map]))) break;  // CANCELLED
			map=prompt(this.saveMapPrompt,map);
		}
		if (!map || !map.trim().length) return true; // CANCELLED
		if (story.isDirty(map)) { story.closeTiddler(map); story.displayTiddler(null,map); }
		this.writeMap(map);
		displayMessage(this.saveMapMsg.format([map]));
		config.options.txtMoveablePanelMapName=map; saveOptionCookie('txtMoveablePanelMapName');
		return cmm.processed(ev);
	},
	isPanelMapped: function(pid) { // is panel ID in the map?
		return this.map && this.map[pid];
	},
	isPanelChanged: function(p) { // compare current and starting map values
		var now=this.map?this.map[p.pid]:undefined;
		var then=this.startingMap?this.startingMap[p.pid]:undefined;
		if (!now&&!then) return false;
		if (!now&&then || now&&!then) return true;
		return (now.x!=then.x || now.y!=then.y || now.w!=then.w || now.h!=then.h || now.z!=then.z);
	},
	resetPanel: function(p) { // restore panel from starting map (if any)
		var cmm=config.macros.moveablePanel;
		if (!this.startingMap || !this.startingMap[p.pid]) { cmm.dockPanel(p); return; }
		cmm.quiet++;
		if (hasClass(p,'folded')) cmm.foldPanel(p);  // un-fold
		if (hasClass(p,'hover')) cmm.hoverPanel(p);  // un-hover
		this.map[p.pid]=new copyObject(this.startingMap[p.pid]);
		this.setMapCookie(config.options.txtMoveablePanelMapName);
		cmm.quiet--;
		this.applyMap(p);
	},
	isMapChanged: function(map) { // compare with saved map or starting map
		var currMap=this.formatMap(true);
		var savedMap=store.getTiddlerText(map);
		if (isEmptyObject(this.map)&&(!savedMap||(map==this.newMapName))) return false;
		return savedMap?currMap!=savedMap:!compareObjects(this.map,this.startingMap);
	},
//}}}
// // menu button and popup
//{{{
	menu: function(place,name,label,prompt) {
		if (name) { // show only the submenu for the named panel
			var b=addBTN(place,label,prompt,function(ev){
				var ev=ev||window.event; var cmm=config.macros.moveablePanel;
				var popup=addPOP(this,'panelManagerPopup'); if (!popup) return false;
				var docX=findMouseX(ev)+findScrollX(); var docY=findMouseY(ev)+findScrollY();
				cmm.manager.menu_panel(popup,cmm.findPanel(this.pid),this.pid,Popup.find(this)+1,docX,docY);
				Popup.show(); return cmm.processed(ev);
			}); b.innerHTML=label; b.pid=name;
		} else { // show entire manager menu
			var b=addBTN(place,label,prompt,function(ev){
				return config.macros.moveablePanel.manager.popup(this,ev,null,true);
			}); b.innerHTML=label;
		}
	},
	popup: function(place,ev,pid,nopanel) {
		var ev=ev||window.event; var cmm=config.macros.moveablePanel; var mgr=cmm.manager;
		var popup=addPOP(place,'sticky panelManagerPopup'); if (!popup) return cmm.processed(ev);
		popup.onclick=function(ev) { var ev=ev||window.event; var cmm=config.macros.moveablePanel;
			var lvl=Popup.find(this); if (lvl<Popup.stack.length-1) // toggle child popups
				{ Popup.remove(lvl+1); return cmm.processed(ev); }
		}
		var panel=cmm.findPanel(pid)||cmm.getPanel(place);
		var showPanelMenu=hasClass(panel,'moveablePanel')&&!nopanel;
		mgr.menu_map(popup,config.options.chkPanelManagerAutoMap);
		if (showPanelMenu) { // FOR THIS PANEL
			var b=addCMD(popup,mgr.panelCmd.format([pid]),cmm.getPanelTooltip(panel),function(ev){
				var ev=ev||window.event; var cmm=config.macros.moveablePanel;
				var popup=addPOP(this,'panelManagerPopup'); if (!popup) return false;
				var docX=findMouseX(ev)+findScrollX(); var docY=findMouseY(ev)+findScrollY();
				cmm.manager.menu_panel(popup,panel,this.panel.pid,Popup.find(this)+1,docX,docY);
				Popup.show('top','right'); return cmm.processed(ev);
			}); b.panel=panel;
		}
		addHR(popup);
		mgr.menu_forAll(popup);
		addHR(popup);
		mgr.menu_selectMap(popup);
		mgr.menu_selectPanel(popup);
		mgr.menu_options(popup);
		addHR(popup);
		addTXT(popup,mgr.XYJumpCmd);
		mgr.menu_compass(popup,showPanelMenu?panel:null,findMouseX(ev),findMouseY(ev)); // scroll
		Popup.showHere(place,ev)
		return cmm.processed(ev);
	},
//}}}
// // manager menu
//{{{
	menu_panel: function(place,p,pid,remove,x,y) {
		var cmm=config.macros.moveablePanel;
		// commands FOR ONE PANEL
		// p=panel, pid=requested panel ID, remove=popup level to close afterwards
		if (!p){addTXT(place,this.panelCmd.format([pid]));addTXT(place,this.notAPanel.format([pid]));return;}
		function cmd(place,label,tip,callback,p,arg) { // buttons invoke 'callback(p,arg)'
			var b=addCMD(place,label,tip,function(ev){
				var ev=ev||window.event; var cmm=config.macros.moveablePanel;
				this.callback.apply(cmm,[this.panel,this.arg]);
				cmm.manager.trackMap(this.panel);
				cmm.manager.refreshAllViewers();
				Popup.remove(this.remove);
				return cmm.processed(ev);
			}); b.panel=p; b.callback=callback; b.arg=arg; b.remove=remove;
		}
		var pid=p.pid||this.thisPanel;
		var u=hasClass(p,'undocked');
		var f=hasClass(p,'floatingPanel');
		var folded=hasClass(p,'folded');
		var hover=hasClass(p,'hover');
		var v=p.style.display!='none'; 
		var here=story.findContainingTiddler(p);
		var t=here&&cmm.findPanel(here.getAttribute('tiddler'));
		cmd(place,this.jumpToPanelCmd,this.jumpToPanelTip.format([pid]),cmm.ensurePanelVisible, p);
		if (u) cmd(place,this.frontCmd,this.frontTip.format([pid]),cmm.bringPanelToFront, p);
		if (u) cmd(place,this.backCmd, this.backTip.format( [pid]),cmm.sendPanelToBack,   p);
		if (u) cmd(place,this.stackCmd,this.stackTip.format([pid]),cmm.returnPanelToStack,p);
		if (p.showfold && (u||f)) {
			if (!folded) cmd(place,this.foldCmd,  this.foldTip.format(  [pid]),cmm.foldPanel, p);
			if ( folded) cmd(place,this.unfoldCmd,this.unfoldTip.format([pid]),cmm.foldPanel, p);
		}
		if (p.showhover && (u||f)) {
			if (!hover) cmd(place,this.hoverCmd, this.hoverTip.format( [pid]),cmm.hoverPanel,p);
			if ( hover) cmd(place,this.scrollCmd,this.scrollTip.format([pid]),cmm.hoverPanel,p);
		}
		if (cmm.manager.isPanelChanged(p))
			cmd(place,this.resetCmd,this.resetTip.format([pid]),cmm.resetPanel,p);
		if (t)		cmd(place,this.closeCmd,this.closeTip.format([pid]),cmm.closePanel,p);
		if (f&&v)	cmd(place,this.closeCmd,this.closeTip.format([pid]),cmm.closePanel,p);
		if (f&&!v)	cmd(place,this.openCmd, this.openTip.format( [pid]),cmm.closePanel,p);
		if (u)  cmd(place,this.dockCmd,  this.dockTip.format(  [pid]),cmm.dockPanel,  p);
		if (!u) cmd(place,this.undockCmd,this.undockTip.format([pid]),cmm.undockPanel,p,true);
		if (u||f) { // move panel
			addHR(place); addTXT(place,this.XYMoveCmd.format([pid]));
			this.menu_compass(place,p,x,y,true); // move
		}
	},
	menu_compass: function(place,p,x,y,move) { // scroll page or move panel using 'compass' buttons
		function cmd(place,label,tip,isTD,p,x,y,move) {
			var b=createTiddlyButton(isTD?createTiddlyElement(place,'TD'):addLI(place),label,tip,function(ev){
				var ev=ev||window.event; var cmm=config.macros.moveablePanel;
				if (this.move && this.p) cmm.movePanel(this.p,this.x,this.y,true,true);
				else window.scrollTo(this.x,this.y);
				cmm.manager.refreshAllViewers(); Popup.remove(Popup.find(this)); return cmm.processed(ev);
			},isTD?'panelManagerPopupCompassButton':'button'); b.p=p; b.x=x; b.y=y; b.move=move;
		}
		var ww=findWindowWidth();  var dw=findDocumentWidth();  var sx=findScrollX();
		var wh=findWindowHeight(); var dh=findDocumentHeight(); var sy=findScrollY();
		var cx=Math.floor(dw/2); var cy=Math.floor(dh/2);
		var nx=sx; var ny=sy; // assume scrolling
		move=move&&p; // only if a valid panel
		var tip=move?this.XYMoveTip:this.XYJumpTip;
		if (p) { // if panel, calc window center position for center on panel / center in view
			var px=p.offsetLeft; var py=p.offsetTop; var pw=p.offsetWidth; var ph=p.offsetHeight;
			if (move) { // adjust document width/centering to account for panel width/height
				dw-=pw+2; cx-=pw/2; var nx=px;
				dh-=ph+2; cy-=ph/2; var ny=py;
				var wcx=Math.floor(sx+ww/2-pw/2);
				var wcy=Math.floor(sy+wh/2-ph/2);
			} else {
				var offset=config.macros.moveablePanel.getPanelOffset(p); // adjust for relative elements
				var wcx=Math.max(Math.floor(px+offset.x-ww/2+pw/2),0);
				var wcy=Math.max(Math.floor(py+offset.y-wh/2+ph/2),0);
			}
		}
		var indent='\xa0\xa0';
		// PANEL
		if (p) {
			var label=move?this.centerMoveCmd:this.centerJumpCmd;
			var prompt=tip.format([move?this.centerMoveTip:this.centerJumpTip,wcx,wcy]);
			cmd(place,indent+label,prompt,false,p,wcx,wcy,move);
		}
		// HERE
		var label=move?this.moveHereCmd:this.jumpHereCmd;
		cmd(place,indent+label.format([x,y]),tip.format(['',x,y]),false,p,x,y,move);
		addTXT(place,indent+(move?this.compassMoveCmd:this.compassJumpCmd));
		// COMPASS
		var tbl=createTiddlyElement(place,'table',null,'panelManagerPopupCompass');
		var tbody=createTiddlyElement(tbl,'tbody');
		var tr=createTiddlyElement(tbody,'tr');
		cmd(tr,this.compassTL,tip.format([this.compassTLTip, 0,0]),true,p, 0,0,move);
		cmd(tr,this.compassT, tip.format([this.compassTTip ,nx,0]),true,p,nx,0,move);
		cmd(tr,this.compassTR,tip.format([this.compassTRTip,dw,0]),true,p,dw,0,move);
		var tr=createTiddlyElement(tbody,'tr');
		cmd(tr,this.compassL, tip.format([this.compassLTip, 0,ny]),true,p, 0,ny,move);
		cmd(tr,this.compassC, tip.format([this.compassCTip,cx,cy]),true,p,cx,cy,move);
		cmd(tr,this.compassR, tip.format([this.compassRTip,dw,ny]),true,p,dw,ny,move);
		var tr=createTiddlyElement(tbody,'tr');
		cmd(tr,this.compassBL,tip.format([this.compassBLTip, 0,dh]),true,p, 0,dh,move);
		cmd(tr,this.compassB, tip.format([this.compassBTip ,nx,dh]),true,p,nx,dh,move);
		cmd(tr,this.compassBR,tip.format([this.compassBRTip,dw,dh]),true,p,dw,dh,move);
	},
	menu_map: function(place,autoclick) {
		var map=config.options.txtMoveablePanelMapName;
		var b=addCMD(place,this.viewMapCmd.format([map]),this.viewMapTip,function(ev){
			var ev=ev||window.event; var cmm=config.macros.moveablePanel;
			var popup=addPOP(this,'sticky panelManagerMapPopup'); if (!popup) return false;
			cmm.manager.viewer_commands(popup);
			addHR(popup);
			cmm.manager.viewer_map(popup);
			popup.onclick=function(ev) {
				var ev=ev||window.event; var cmm=config.macros.moveablePanel;
				var lvl=Popup.find(this); if (lvl<Popup.stack.length-1) // toggle child popup
					{ Popup.remove(lvl+1); return cmm.processed(ev); }
				var popup=addPOP(this,'sticky panelManagerPopup'); if(!popup)return false;
				cmm.manager.menu_mapBackground(popup);
				Popup.showHere(this,ev); return cmm.processed(ev);
			}
			popup.title=cmm.manager.viewerBackgroundTip;
			Popup.show('top','right');
			return cmm.processed(ev);
		});
		// autoclick on initial mouseover
		if (autoclick) b.onmouseover=function(ev) { this.onmouseover=null; return this.onclick.apply(this,arguments); };
	},
	menu_forAll: function(place) {
		var cmm=config.macros.moveablePanel;
		// commands FOR ALL PANELS
		function cmd(label,tip,callback) {
			var b=addCMD(place,label,tip,function(ev){
				var ev=ev||window.event; var cmm=config.macros.moveablePanel;
				if (!confirm(this.title+'?')) return false;
				var panels=cmm.forAllPanels(this.callback);
				cmm.manager.refreshAllViewers();
				Popup.remove(Popup.find(this)); return cmm.processed(ev);
			}); b.callback=callback;
		};
		cmd(this.resetAllCmd,this.resetAllTip,cmm.resetPanel);
		cmd(this.dockAllCmd,this.dockAllTip,cmm.dockPanel);
	},
	menu_selectPanel: function(place){
		// LIST OF PANELS with PANEL SUBMENUS
		addCMD(place,this.selectPanelCmd,this.selectPanelTip,function(ev){
			var ev=ev||window.event; var cmm=config.macros.moveablePanel;
			var popup=addPOP(this,'panelManagerPopup'); if (!popup) return false;
			var panels=cmm.getAllPanels();
			addTXT(popup,panels.length?cmm.manager.selectPanelMsg:cmm.manager.noPanels);
			for (var i=0; i<panels.length; i++) { var p=panels[i];
				var b=addCMD(popup,p.pid||cmm.manager.noPid,cmm.getPanelTooltip(p),function(ev){
					var ev=ev||window.event; var cmm=config.macros.moveablePanel;
					var popup=addPOP(this,'panelManagerPopup');
					if(!popup)return false;
					var docX=findMouseX(ev)+findScrollX(); var docY=findMouseY(ev)+findScrollY();
					cmm.manager.menu_panel(popup,this.p,
						this.p.pid||cmm.manager.thisPanel,Popup.find(this)+1,docX,docY);
					Popup.show('top','right'); return cmm.processed(ev);
				}); b.p=p; b.onmouseover=b.onclick; // ALWAYS autoclick on mouseover
			}
			Popup.show('top','right'); return cmm.processed(ev);
		});
	},
	menu_selectMap: function(place){
		// same as LOAD COMMAND IN VIEWER (with different label/tip and popup alignment)
		this.menu_loadMap(addLI(place),this.selectMapCmd,this.selectMapTip,'top','right');
	},
	menu_options: function(place) {
		var on='<input type="checkbox" checked>'; var off='<input type="checkbox">';
		addCMD(place,this.optionsCmd,this.optionsTip,function(ev){
			var ev=ev||window.event; var cmm=config.macros.moveablePanel; var mgr=cmm.manager;
			var popup=addPOP(this,'sticky panelManagerPopup'); if (!popup) return false;
			addCHK(popup,mgr.useCookiesCmd,mgr.useCookiesTip,'chkPanelManagerUseCookies');
			addBR(popup);
			addCHK(popup,mgr.showManagerCmd,mgr.showManagerTip,'chkMoveablePanelShowManager');
			addBR(popup);
			addCHK(popup,mgr.autoMapCmd,mgr.autoMapTip,'chkPanelManagerAutoMap');
			addBR(popup);
			addCHK(popup,mgr.showStatusCmd,mgr.showStatusTip,'chkMoveablePanelShowStatus');
			Popup.show('top','right'); return cmm.processed(ev);
		});
	},
//}}}
// // panel map viewers
//{{{
	// MAP MANAGEMENT COMMANDS
	viewer_commands: function(place,refresh) {
		if (refresh) removeChildren(place);
		else place=createTiddlyElement(place,'div',null,'panelManagerMapCommands');
		var map=config.options.txtMoveablePanelMapName;
		var unsaved=this.isMapChanged(map)?this.viewMapUnsaved:'';
		wikify(this.viewMapHeader.format([map,unsaved]),place);
				this.command_newMap(place);
		addSEP(place); 	this.menu_loadMap(place,this.loadMapCmd,this.selectMapTip);
		addSEP(place); 	this.command_editMap(place);
		addSEP(place); 	this.command_saveMap(place);
		addSEP(place); 	this.command_viewerTable(place);
	},
//}}}
//{{{
	// TABLE VIEW - ALL MAP ENTRIES
	viewer_table: function(place,refresh) {
		var cmm=config.macros.moveablePanel;
		if (refresh) removeChildren(place);
		else place=createTiddlyElement(place,"div",null,"panelManagerMapTable");
		place.onclick=function(ev){ var cmm=config.macros.moveablePanel;
			var lvl=Popup.find(this); if (lvl!=-1) Popup.remove(lvl+1);
			cmm.manager.refreshAllViewers(); return cmm.processed(ev); }
		var link='[[%0]]'; var cmd='<<moveablePanel %2 %3:[[%0]] %4:[[%0]] %5:[[%1]]>>';
		cmd=cmd.format(['%0','%1',this.menuParam,this.nameParam,this.labelParam,this.promptParam]);
		var sortByZ=function(a,b){ var v1=parseInt(a.z); var v2=parseInt(b.z); return(v1==v2)?0:(v1>v2?1:-1); }
		var map=[]; for (var pid in this.map) map.push(this.map[pid]); map=map.sort(sortByZ);
		var rows=[]; for (var i=0; i<map.length; i++) { var m=map[i];
			var isPanel=cmm.findPanel(m.pid);
			var isTiddler=store.tiddlerExists(m.pid)||store.isShadowTiddler(m.pid);
			var fmt=isPanel?cmd:(isTiddler?link:cmd);
			var lbl=fmt.format([m.pid,this.panelCmd.format([m.pid])]);
			rows.push(this.mapFormat.format([lbl,m.x,m.y,m.w,m.h,m.z,
				m.folded?this.checkmark:' ', m.hover?this.checkmark:' ']));
		}
		var table=this.mapHeader.format([''])+'\n'+rows.join('\n')+(!rows.length?this.viewMapEmpty:'');
		wikify(table,place);
	},
//}}}
//{{{
	// GRAPHICAL VIEWER - ACTIVE PANELS AND TIDDLERS
	mapXtoDocX: function(e,ev,scale,scroller) { // convert mouse click in map panel to equivalent document location
		var mouseX=findMouseX(ev);
		var mapX=findPosX(e.parentNode)-scroller.scrollLeft;
		var docX=Math.floor((mouseX-mapX)/scale)-Math.floor((mouseX-mapX)*scale);
		return docX;
	},
	mapYtoDocY: function(e,ev,scale,scroller) { // convert mouse click in map panel to equivalent document location
		var mouseY=findMouseY(ev);
		var mapY=findPosY(e.parentNode)-scroller.scrollTop;
		var docY=Math.floor((mouseY-mapY)/scale)-Math.floor((mouseY-mapY)*scale);
		return docY;
	},
	viewer_map: function(place,refresh,mapSize){
		var cmm=config.macros.moveablePanel;
		if (!refresh) {
			place=createTiddlyElement(place,'div',null,'panelManagerMapViewer');
			place.mapSize=mapSize; // save for use with refresh
		} else {
			var mapSize=place.mapSize; // refresh... use saved map size
			removeChildren(place); // NOTE: ASSUMES CONTAINER HAS NO OTHER CONTENT
		}

		// METRICS
		var dw=findDocumentWidth();  var ww=findWindowWidth();  if (dw<ww) dw=ww; var sx=findScrollX();
		var dh=findDocumentHeight(); var wh=findWindowHeight(); if (dh<wh) dh=wh; var sy=findScrollY();

		// SET MAP MAXSIZE
		var wrapper=createTiddlyElement(place,'div');
		if (Popup.find(place)!=-1) mapSize=config.options.txtPanelManagerPopupMapSize; // IF POPUP
		wrapper.style.width=mapSize||''; mapSize=wrapper.offsetWidth; // APPLY CSS THEN GET PIXELS

		// SET SCROLLING/SCALING
		var scroll=!config.options.chkPanelManagerMapFullPage;
		// default to fit entire page in viewer
		if (dw>dh) { var w=mapSize; var h=dh/dw*mapSize; var scale=w/dw; }
		else 	   { var h=mapSize; var w=dw/dh*mapSize; var scale=h/dh; }
		if (scroll) { // set smaller dimension to fixed value, scroll the other
			wrapper.style.width=mapSize+'px'; wrapper.style.height=wh/ww*mapSize+'px';  
			wrapper.style.overflow='auto'; // make it's contents scrollable
			var scrollsize=findWindowWidth()-document.body.offsetWidth+2;
			if (dw<=ww&&dh<=wh) { // smaller than window... enlarge to fit width
				w=mapSize; h=dh/dw*w; scale=w/dw;
				wrapper.style.overflow='visible'; // no scrollbars
			} else if (dw>dh) { // wide... add hScroll
				h=wh/ww*mapSize; w=dw/dh*h; scale=h/dh;
				wrapper.style.height=h+scrollsize+'px';  
			} else { // tall... add vScroll
				w=mapSize-scrollsize; h=dh/dw*w; scale=w/dw;
			}
		}

		// CREATE DOCUMENT BACKGROUND
		var doc=createTiddlyElement(wrapper,'div',null,'map');
		doc.style.width=w+'px'; doc.style.height=h+'px';
		doc.onclick=function(ev){ // BACKGROUND POPUP: SCROLL+OPTIONS
			var ev=ev||window.event; var cmm=config.macros.moveablePanel;
			var lvl=Popup.find(this); if (lvl<Popup.stack.length-1) // toggle child popup
				{ Popup.remove(lvl+1); return cmm.processed(ev); }
			var popup=addPOP(this,'sticky panelManagerPopup'); if(!popup)return false;
			var dx=cmm.manager.mapXtoDocX(this,ev,scale,this.parentNode);
			var dy=cmm.manager.mapYtoDocY(this,ev,scale,this.parentNode);
			addTXT(popup,cmm.manager.XYJumpCmd); cmm.manager.menu_compass(popup,null,dx,dy);
			addHR(popup); cmm.manager.menu_mapBackground(popup);
			Popup.showHere(this,ev); return cmm.processed(ev);
		};
		doc.scale=scale; doc.title=this.viewerMapTip; doc.style.cursor='crosshair';

		// SHOW VIEWPORT (CURRENT WINDOW POS)
		var currview=createTiddlyElement(doc,'div');
		var s=currview.style; s.border='1px dotted'; s.position='absolute';
		s.left=sx*scale+'px'; s.top=sy*scale+'px'; s.width=(ww-2)*scale+'px'; s.height=(wh-2)*scale+'px';

		// GET ALL PANELS AND FIND BASELINE Z FOR RENDERING MAP ON TOP OF POPUPS/PANELS
		var panels=cmm.getAllPanels(); var allPids=[]; var minZ=0; var viewerZ=0;
		for (var i=0; i<panels.length; i++) { var p=panels[i]; allPids.push(p.pid); 
			if (p.style.zIndex<minZ) minZ=p.style.zIndex;
		}
		if (Popup.find(place)!=-1) viewerZ=Popup.stack[Popup.find(place)].popup.style.zIndex;
		else if (cmm.getPanel(place)) viewerZ=cmm.getPanel(place).style.zIndex;
		var baseZ=viewerZ-minZ+1;

		// DRAW PANEL BOXES
		for (var i=0; i<panels.length; i++) {
			var p=panels[i];
			var d=cmm.manager.viewer_mapbox_draw(doc,p,scale,baseZ);
			d.title=cmm.getPanelTooltip(p);
		}

		// DRAW TIDDLER BOXES
		story.forEachTiddler(function(t,e){
			if (allPids.contains(t)) return; // TIDDLER IS ALSO MOVEABLE PANEL... SKIP IT
			var d=cmm.manager.viewer_mapbox_draw(doc,e,scale,baseZ);
			d.tid=t; var tiddler=store.getTiddler(t);
 			d.title=tiddler?tiddler.getSubtitle():config.macros.moveablePanel.manager.tiddlerCmd.format([t]);
		});

		// SHOW DOC/WINDOW SIZE/VIEWPORT
		var span=createTiddlyElement(place,'span',null,'panelManagerMapStats');
		var msg=this.viewerMapStatsMsg.format([dw,dh,ww,wh,sx,sx+ww,sy,sy+wh]);
		wikify(msg,span);

		// SET MAP SCROLLPOS TO MATCH PAGE SCROLLPOS
		// NOTE: must be done *after* all content has been rendered or scrollbar will jump to zero
		if (scroll) { wrapper.scrollTop=sy*scale; wrapper.scrollLeft=sx*scale; }

	},
	// draw one map box with borders, mouseover shading and drag handling for moving
	viewer_mapbox_draw: function(doc,p,scale,baseZ) {
		var x=findPosX(p); var w=p.offsetWidth; var y=findPosY(p); var h=p.offsetHeight;
		if (hasClass(p,'hover')) { x+=findScrollX(); y+=findScrollY(); } // hover=always in view
		var db=createTiddlyElement(doc,'div',null,'panelManagerViewerMapBox');
		db.panel=p; 		db.scale=scale; 	var s=db.style;
		s.border="1px solid";	s.position='absolute';	s.cursor='crosshair';	s.zIndex=baseZ+p.style.zIndex;
		s.top=y*scale+'px';	s.left=x*scale+'px'; 	s.width=w*scale+'px';	s.height=h*scale+'px';
		s.background='#eee';	s.opacity='0.6';	s.filter='alpha(opacity:60)';
		db.onmouseover=function(ev)
			{ var s=this.style; s.background='#999';s.opacity='1';s.filter='alpha(opacity:100)'; }
		db.onmouseout=function(ev)
			{ var s=this.style; s.background='#eee';s.opacity='0.5';s.filter='alpha(opacity:50)'; }
		db.onmousedown=this.viewer_mapbox_dragstart;
		db.onclick=this.viewer_mapbox_popup;
		return db;
	},
	viewer_mapbox_dragstart: function(ev) { var ev=ev||window.event; var cmm=config.macros.moveablePanel;
		// capture mouse events and set drag handlers on target (body, window, or this panel)
		var target=this; // fallback to this panel if 'capture' not supported
		if (document.body.setCapture) // IE
			{ document.body.setCapture(); var target=document.body; }
		if (window.captureEvents) // moz
			{ window.captureEvents(Event.MouseMove|Event.MouseUp,true); var target=window; }
		// save drag data in target element
		if (!target.dragData) target.dragData=new Object();
		var d=target.dragData;
		d.box=this; d.scale=this.scale;	d.map=this.parentNode; d.scroller=this.parentNode.parentNode;
		d.startX=findMouseX(ev); d.startScrollX=d.scroller.scrollLeft; d.grabX=findMouseX(ev)-findPosX(this);
		d.startY=findMouseY(ev); d.startScrollY=d.scroller.scrollTop;  d.grabY=findMouseY(ev)-findPosY(this);
		d.offset=cmm.getPanelOffset(d.box.panel);
		d.dragging=true; this.style.cursor='move';
		d.savedonmousemove=target.onmousemove;
		target.onmousemove=cmm.manager.viewer_mapbox_dragmove;
		d.savedonmouseup=target.onmouseup;
		target.onmouseup=cmm.manager.viewer_mapbox_dragstop;
		cmm.addGhost(d.box.panel); // keep document from shrinking during move/size
		cmm.noScrollX++; cmm.noScrollY++; // prevent document from scrolling during move/size
		return cmm.processed(ev);
	},
	viewer_mapbox_dragmove: function(ev) { var ev=ev||window.event; var cmm=config.macros.moveablePanel;
		var d=this.dragData; if (!d || !d.dragging) return; // NOT DRAGGING
		if (!hasClass(d.box.panel,'moveablePanel')) { // NOT MOVEABLE
			clearMessage();
			displayMessage(cmm.manager.notMoveableMsg.format([d.box.panel.pid||d.box.tid]));
			return this.onmouseup(ev);
		}
		cmm.quiet++; cmm.undockPanel(d.box.panel,true); cmm.quiet--; // GET READY TO MOVE
		var mouseX=!config.browser.isIE?ev.pageX:ev.clientX;
		var mouseY=!config.browser.isIE?ev.pageY:ev.clientY;
		var mapX=findPosX(d.map)+d.startScrollX; var mapW=d.map.offsetWidth;
		var mapY=findPosY(d.map)+d.startScrollY; var mapH=d.map.offsetHeight;
		var scrollX=d.scroller.scrollLeft;	 var scrollW=d.scroller.offsetWidth;
		var scrollY=d.scroller.scrollTop;	 var scrollH=d.scroller.offsetHeight;
		var boxW=d.box.offsetWidth;		 var boxH=d.box.offsetHeight;
		var boxX=findMouseX(ev)-mapX-d.grabX+scrollX;
		var boxY=findMouseY(ev)-mapY-d.grabY+scrollY;
		if (boxX<0) boxX=0; if (boxY<0) boxY=0; // limit upper left=stay on page
		if (hasClass(d.box.panel,'hover')) { // hover=limit bottom right (stay in screen)
			if (boxX+boxW>scrollW) boxX=scrollW-boxW; if (boxY+boxH>scrollH) boxY=scrollH-boxH;
			if (boxX<scrollX) boxX=scrollX; if (boxY<scrollY) boxY=scrollY;
		}
		var docX=Math.floor(boxX/d.scale)-d.offset.x;
		var docY=Math.floor(boxY/d.scale)-d.offset.y;
		if (hasClass(d.box.panel,'hover')) { // window-relative placement
			var ww=findWindowWidth();  var sx=findScrollX();
			var wh=findWindowHeight(); var sy=findScrollY();
			docX-=sx-d.offset.x; docY-=sy-d.offset.y;
			if (docX+d.box.panel.offsetWidth >ww) docX=ww-d.box.panel.offsetWidth;
			if (docY+d.box.panel.offsetHeight>wh) docY=wh-d.box.panel.offsetHeight;
			if (docX<0) docX=0; if (docY<0) docY=0;
		}
		// update box AND panel positions
		d.box.style.left=boxX+'px';	d.box.panel.style.left=docX+'px';
		d.box.style.top =boxY+'px';	d.box.panel.style.top =docY+'px';
		// resize map/scroll viewer as needed
		if (boxX<scrollX) d.scroller.scrollLeft=boxX;
		if (boxX+boxW>scrollX+scrollW || boxX+boxW>d.map.offsetWidth) {
			d.map.style.width=Math.max(boxX+boxW,mapW)+'px';
			d.scroller.scrollLeft=boxX+boxW-scrollW;
		}
		if (boxY<scrollY) d.scroller.scrollTop=boxY;
		if (boxY+boxH>scrollY+scrollH || boxY+boxH>d.map.offsetHeight) {
			d.map.style.height=Math.max(boxY+boxH,mapH)+'px';
			d.scroller.scrollTop=boxY+boxH-scrollH;
		}
		cmm.showPanelStatus(d.box.panel,true);
		return cmm.processed(ev);
	},
	viewer_mapbox_dragstop: function(ev) { var ev=ev||window.event; var cmm=config.macros.moveablePanel;
		var d=this.dragData; if (!d || !d.dragging) return; // NOT DRAGGING
		if (this.releaseCapture) this.releaseCapture(); // IE
		if (this.releaseEvents) this.releaseEvents(Event.MouseMove|Event.MouseUp); // moz
		this.onmousemove=d.savedonmousemove; this.onmouseup=d.savedonmouseup;
		cmm.noScrollX--; cmm.noScrollY--; // allow document to scroll
		cmm.clearGhost(); // allow document to adjust extents (if needed)
		var moved=findMouseX(ev)!=d.startX || findMouseY(ev)!=d.startY;
		if (moved) { cmm.manager.trackMap(d.box.panel); cmm.manager.refreshAllViewers(); }
		d.dragging=false; d.box.style.cursor='pointer';
		cmm.showPanelStatus(d.box.panel,false);
		cmm.timedMessage(cmm.formatPanelStatus(d.box.panel),cmm.msgDuration);
		// HACK: ignore next click to prevent webkit from closing popup after dragging
		d.box.ignoreClick=moved&&config.browser.isSafari;
		return cmm.processed(ev);
	},
	viewer_mapbox_popup: function(ev) {
		var ev=ev||window.event; var cmm=config.macros.moveablePanel; var mgr=cmm.manager;
		if (this.ignoreClick) { this.ignoreClick=false; return cmm.processed(ev); } // HACK
		var lvl=Popup.find(this); if (lvl<Popup.stack.length-1) // toggle child popup
			{ Popup.remove(lvl+1); return cmm.processed(ev); }
		var popup=addPOP(this,'sticky panelManagerPopup'); if (!popup) return false;
		var dx=cmm.manager.mapXtoDocX(this,ev,this.scale,this.parentNode.parentNode);
		var dy=cmm.manager.mapYtoDocY(this,ev,this.scale,this.parentNode.parentNode);
		if (this.tid)	cmm.manager.menu_mapTiddler(popup,this.tid,this.panel,dx,dy);
		else		cmm.manager.menu_mapPanel(popup,this.panel,dx,dy);
		Popup.showHere(this,ev); return cmm.processed(ev);
	},

//}}}
//{{{
	refreshAllViewers: function(){
		var elems=document.getElementsByTagName("DIV");
		for (var i=0; i<elems.length; i++) {
			if (hasClass(elems[i],'panelManagerMapViewer'))   this.viewer_map(elems[i],true);
			if (hasClass(elems[i],'panelManagerMapTable'))	  this.viewer_table(elems[i],true);
			if (hasClass(elems[i],'panelManagerMapCommands')) this.viewer_commands(elems[i],true);
		}
	},
//}}}
// // map viewer commands
//{{{
	menu_mapBackground: function(place) {
		var centered=createTiddlyElement(place,'div'); centered.style.textAlign='center';
		if (Popup.find(place)>0) { // POPUP VIEWER PERMITS RESIZING
			addBTN(centered,'\xa0'+this.mapSizeCmd,this.refreshMapTip,function(ev){
				var ev=ev||window.event; var cmm=config.macros.moveablePanel;
				cmm.manager.refreshAllViewers();
				Popup.remove(Popup.find(this));	return cmm.processed(ev);
			});
			wikify('{{panelManagerMapPopupEdit{<<option txtPanelManagerPopupMapSize>>}}}\xa0',centered);
		}
		var opt='chkPanelManagerMapFullPage'; // toggle label...
		var label=config.options[opt]?this.mapScrollPageCmd:this.mapFullPageCmd;
		var tip=config.options[opt]?this.mapScrollPageTip:this.mapFullPageTip;
		addCHK(addLI(centered),label,tip,opt,true);
		addHR(centered); addCMD(centered,this.refreshMapCmd,this.refreshMapTip,function(ev){
			var ev=ev||window.event; var cmm=config.macros.moveablePanel;
			cmm.manager.refreshAllViewers();
			Popup.remove(Popup.find(this));	return cmm.processed(ev);
		});
	},
	menu_mapPanel: function(place,panel,docX,docY) {
		var cmm=config.macros.moveablePanel;
		var b=addCMD(place,this.panelCmd.format([panel.pid]),cmm.getPanelTooltip(panel),function(ev){
			var ev=ev||window.event; var cmm=config.macros.moveablePanel;
			var popup=addPOP(this,'panelManagerPopup'); if (!popup) return false;
			cmm.manager.menu_panel(popup,panel,this.panel.pid||this.thisPanel,Popup.find(this)+1,docX,docY);
			Popup.show('top','right'); return cmm.processed(ev);
		}); b.panel=panel;
		// autoclick on initial mouseover
		b.onmouseover=function(ev) { this.onmouseover=null; return this.onclick.apply(this,arguments); };
		addHR(place); addTXT(place,this.XYJumpCmd); this.menu_compass(place,panel,docX,docY);
		addHR(place); this.menu_mapBackground(place);
	},
	menu_mapTiddler: function(place,tid,tiddlerElem,docX,docY) {
		var cmm=config.macros.moveablePanel;
		var b=addCMD(place,this.tiddlerCmd.format([tid]),'',function(ev){
			var ev=ev||window.event; var cmm=config.macros.moveablePanel; var mgr=cmm.manager;
			var popup=addPOP(this,'panelManagerPopup'); if (!popup) return false;
			var b=addCMD(popup,mgr.jumpToPanelCmd,mgr.jumpToPanelTip.format([tid]),function(ev){
				var ev=ev||window.event; var cmm=config.macros.moveablePanel;
				cmm.scrollToPanel(this.tiddlerElem,true); cmm.manager.refreshAllViewers();
				Popup.remove(Popup.find(this)); return cmm.processed(ev);
			}); b.tid=this.tid; b.tiddlerElem=this.tiddlerElem;
			var b=addCMD(popup,mgr.closeCmd,mgr.closeTip.format([tid]),function(ev){
				var ev=ev||window.event; var cmm=config.macros.moveablePanel;
				var OK=!story.isDirty(this.tid)||confirm(cmm.manager.tiddlerDirtyMsg.format([this.tid]));
				if (OK) { story.closeTiddler(this.tid); cmm.manager.refreshAllViewers(); }
				Popup.remove(Popup.find(this)); return cmm.processed(ev);
			}); b.tid=this.tid;
			Popup.show('top','right'); return cmm.processed(ev);
		}); b.tid=tid; b.tiddlerElem=tiddlerElem;
		// autoclick on initial mouseover
		b.onmouseover=function(ev) { this.onmouseover=null; return this.onclick.apply(this,arguments); };
		addHR(place); addTXT(place,this.XYJumpCmd); this.menu_compass(place,tiddlerElem,docX,docY);
		addHR(place); this.menu_mapBackground(place);
	},
	command_newMap: function(place){
		addBTN(place,this.newMapCmd,this.newMapTip,function(ev){
			var ev=ev||window.event; var cmm=config.macros.moveablePanel;
			if (!cmm.manager.newMap(ev)) cmm.manager.refreshAllViewers();
			return cmm.processed(ev);
		});
	},
	menu_loadMap: function(place,label,tip,valign,halign){
		addBTN(place,label,tip,function(ev){
			var ev=ev||window.event; var cmm=config.macros.moveablePanel;
			var popup=addPOP(this,'panelManagerPopup'); if (!popup) return false;
			var tids=store.getTaggedTiddlers(cmm.manager.mapTags[0]||cmm.manager.mapTag);
			addTXT(popup,tids.length?cmm.manager.selectMapMsg:cmm.manager.noMaps);
			for (var t=0;t<tids.length;t++) { var title=tids[t].title;
				var b=addCMD(popup,title,cmm.manager.loadThisMapTip.format([title]),function(ev){
					var ev=ev||window.event; var cmm=config.macros.moveablePanel;
					if (!cmm.manager.loadMap(this.map,ev)) { 
						cmm.manager.refreshAllViewers();
						displayMessage(cmm.manager.switchMapMsg.format([this.map]));
					}
					Popup.remove(Popup.find(this)); return cmm.processed(ev);
				}); b.map=title;
			}
			if (valign||halign) Popup.show(valign,halign); else Popup.showHere(this,ev);
			return cmm.processed(ev);
		});
	},
	command_editMap: function(place){
		var map=config.options.txtMoveablePanelMapName;
		addBTN(place,this.editMapCmd.format([map]),this.editMapTip,function(ev){
			var ev=ev||window.event; var cmm=config.macros.moveablePanel;
			if (!store.tiddlerExists(this.map)&&cmm.manager.saveMap(this.map,ev)) return cmm.processed(ev);
			cmm.manager.refreshAllViewers();
			story.displayTiddler(null,this.map,DEFAULT_EDIT_TEMPLATE);
			return cmm.processed(ev);
		}).map=map;
	},
	command_saveMap: function(place){
		addBTN(place,this.saveMapCmd,this.saveMapTip,function(ev){
			var ev=ev||window.event; var cmm=config.macros.moveablePanel;
			if (!cmm.manager.saveMap(this.map,ev)) cmm.manager.refreshAllViewers();
			return cmm.processed(ev);
		}).map=config.options.txtMoveablePanelMapName;
	},
	command_viewerTable: function(place){
		addBTN(place,this.viewerTableCmd,this.viewerTableTip,function(ev){
			var ev=ev||window.event; var cmm=config.macros.moveablePanel;
			var popup=addPOP(this.parentNode,'panelManagerPopup'); if (!popup) return false;
			cmm.manager.viewer_table(popup);
			Popup.showHere(place,ev); return cmm.processed(ev);
		});
	},
//}}}
// // CSS definitions
//{{{
	css: '/*{{{*/\n'
		+'.panelManagerPopup\n'
			+'\t{ white-space:nowrap; }\n'
		+'.panelManagerPopup input\n'
			+'\t{ text-align:center; font-size:90%; }\n'
		+'.panelManagerPopupCompass {\n'
			+'\tbackground:#999; margin:1em;\n'
			+'\t-moz-border-radius:.5em; -webkit-border-radius:.5em;\n'
			+'}\n'
		+'.panelManagerPopupCompass td {\n'
			+'\tfont-size:2em; width:1.5em; height:1.5em; text-align:center; vertical-align;center;\n'
			+'\tbackground:#eee !important; color:#000 !important;\n'
			+'\tborder:1px solid #666; padding:0; margin:0;\n'
			+'\t-moz-border-radius:2px; -webkit-border-radius:2px;\n'
			+'}\n'
		+'.panelManagerPopupCompass td:hover\n'
			+'\t{ background:#fff !important; color:#000 !important; }\n'
		+'.panelManagerPopupCompassButton:hover\n'
			+'\t{ background:transparent !important; color:#000; }\n'
		+'.panelManagerMapPopup\n'
			+'\t{ text-align:center; white-space:nowrap; }\n'
		+'.panelManagerMapPopupEdit input\n'
			+'\t{ width:5em; margin-top:.2em; }\n'
		+'.panelManagerMapViewer .map {\n'
			+'\tposition:relative; overflow:hidden;\n'
			+'\tcolor:#000; background-color:#fff;\n'
			+'\tmargin:0; border:1px solid;\n'
			+'\t-moz-border-radius:3px; -webkit-border-radius:3px;\n'
			+'}\n'
		+'.panelManagerViewerMapBox\n'
			+'\t{ border:1px solid; -moz-border-radius:2px; -webkit-border-radius:2px; }\n'
		+'.panelManagerMapStats\n'
			+'\t{ font-size:80%; }\n'
		+'.panelManagerMapStats .twtable, .panelManagerMapStats .twtable tr, .panelManagerMapStats .twtable td\n'
			+'\t{ padding:0; margin:0; border:0; }\n'
		+'.panelManagerMapStats .twtable\n'
			+'\t{ width:100%; }\n'
		+'.panelManagerMapStats .twtable td\n'
			+'\t{ width:50%; }\n'
		+'/*}}}*/'
});
//}}}
// // CSS initialization (during startup)
//{{{
// set up shadow stylesheet, then load styles so customized CSS (if any) will be applied
config.shadowTiddlers.PanelManagerStyles=config.macros.moveablePanel.manager.css;
var css=store.getRecursiveTiddlerText('PanelManagerStyles',config.macros.moveablePanel.manager.css,10);
setStylesheet(css,'panelManagerStyles');
//}}}
// // hijack: sticky popups (allows interaction inside popup)
// // COPIED FROM [[StickyPopupPlugin]] TO ELIMINATE PLUGIN DEPENDENCY
//{{{
if (config.options.chkStickyPopups==undefined) config.options.chkStickyPopups=false;
try{removeEvent(document,"click",Popup.onDocumentClick);}catch(e){};
try{removeEvent(document,"click",Popup.stickyPopup_onDocumentClick);}catch(e){};
Popup.stickyPopup_onDocumentClick = function(ev)
{
	// if click is in a sticky popup, ignore it so popup will remain visible
	var e = ev ? ev : window.event; var target = resolveTarget(e);
	var p=target; while (p) {
		if (hasClass(p,"popup") && (hasClass(p,"sticky")||config.options.chkStickyPopups)) break;
		else p=p.parentNode;
	}
	// if not a sticky popup... use normal handling
	if (!p) {
		// HACK: if flag is set, ignore this click (and clear the flag)
		if (Popup.ignoreClick) Popup.ignoreClick=false; 
		else Popup.onDocumentClick(ev);
	}
	return true;
};
try{addEvent(document,"click",Popup.stickyPopup_onDocumentClick);}catch(e){};
//}}}
// // hijack: page background popup menu (ALT-CLICK)
//{{{
if (!document.getElementById('panelManagerPopupRoot')) { // only once
	var root=createTiddlyElement(document.body,'span','panelManagerPopupRoot');
	var s=root.style; s.width=0; s.height=0; s.top=0; s.left=0;
	s.display='inline'; s.overflow='visible'; s.position='absolute'; 
	document.onmousedown_panelmanager=document.onmousedown;
	document.onmousedown=function(ev) {
		var ev=ev||window.event; var target=resolveTarget(ev); var cmm=config.macros.moveablePanel;
		if (!ev||!ev.altKey) { // if not ALT-CLICK... handle event normally
			if (document.onmousedown_panelmanager==undefined) return;
			return document.onmousedown_panelmanager.apply(target,arguments);
		}
		var root=document.getElementById('panelManagerPopupRoot');
		var mX=findMouseX(ev); var mY=findMouseY(ev);
		root.style.left=mX+'px'; root.style.top =mY+'px';
		var p=cmm.getPanel(target); var t=story.findContainingTiddler(target);
		var id=p?p.pid:(t?t.getAttribute('tiddler'):'')
		// HACK: ignore next click on doc background (prevents IE from closing popup)
		Popup.ignoreClick=config.browser.isIE;
		cmm.manager.popup(root,ev,id);
		return cmm.processed(ev);
	}
}
//}}}
// // hijack: refresh map viewers when window is scrolled
//{{{
if (window.onscroll_panelManager_init===undefined) { // only once
	window.onscroll_panelManager_init=true;
	window.onscroll_panelManager=window.onscroll;
	window.onscroll=function() {
		config.macros.moveablePanel.manager.notify('refresh');
		if (window.onscroll_panelManager)
			return window.onscroll_panelManager.apply(this,arguments);
	}
}
//}}}
// // hijacks: refresh map viewers when tiddlers or nested sliders are opened/closed
//{{{
if (Story.prototype.displayTiddler_panelManager===undefined) { // only once
	Story.prototype.displayTiddler_panelManager=Story.prototype.displayTiddler;
	Story.prototype.displayTiddler=function() {
		var r=this.displayTiddler_panelManager.apply(this,arguments);
		config.macros.moveablePanel.manager.notify('refresh');
		return r;
	}
	Story.prototype.closeTiddler_panelManager=Story.prototype.closeTiddler;
	Story.prototype.closeTiddler=function() {
		var r=this.closeTiddler_panelManager.apply(this,arguments);
		// NOTE: ASYNC wait for core animation to finish, then update viewers
		var delay=config.options.chkAnimate?config.animDuration+100:0;
		setTimeout("config.macros.moveablePanel.manager.notify('refresh')",delay);
		return r;
	}
}
if (window.onClickNestedSlider && (window.onClickNestedSlider_panelManager===undefined)) { // only once
	window.onClickNestedSlider_panelManager=window.onClickNestedSlider;
	window.onClickNestedSlider=function() {
		var r=window.onClickNestedSlider_panelManager.apply(window,arguments);
		// NOTE: ASYNC wait for core animation to finish, then update viewers
		var delay=config.options.chkAnimate?config.animDuration+100:0;
		setTimeout("config.macros.moveablePanel.manager.notify('refresh')",delay);
		return r;
	}
}
//}}}