/***
|Name|[[MoveablePanelPlugin]]|
|Source|http://www.TiddlyTools.com/#MoveablePanelPlugin|
|Documentation|http://www.TiddlyTools.com/#MoveablePanelPluginInfo|
|Version|3.0.4|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|move/size any tiddler or page element|
Use the mouse to move/resize any specific tiddler content, page element, or [[floating slider panel|NestedSlidersPlugin]].
!!!!!Documentation
>see [[MoveablePanelPluginInfo]]
!!!!!Configuration
<<<
<<option chkMoveablePanelShowStatus>> show position/size while moving/resizing a panel
<<option chkMoveablePanelShowManager>> automatically add Panel Manager button to undocked panels (see [[PanelManagerPlugin]])
<<<
!!!!!Revisions
<<<
2010.12.24 3.0.4 fixed findMouseX/findMouseY for webkit browsers
|please see [[MoveablePanelPluginInfo]] for additional revision details|
2006.03.04 1.0.0 Initial public release
<<<
!!!!!Code
***/
//{{{
version.extensions.MoveablePanelPlugin= {major: 3, minor: 0, revision: 4, date: new Date(2010,12,24)};
if (config.macros.moveablePanel===undefined) config.macros.moveablePanel={};
//}}}
// // translate
//{{{
// TRANSLATORS: copy this section to MoveablePanelPluginLingoXX (where 'XX' is a language/country code)
if (config.macros.moveablePanel===undefined) config.macros.moveablePanel={};
merge(config.macros.moveablePanel,{

	foldLabel:	'\u2212', // minus
	foldTip:	'FOLD=reduce panel size',
	unfoldLabel:	'+',
	unfoldTip:	'UNFOLD=restore panel size',
	hoverLabel:	'^',
	hoverTip:	'HOVER=keep panel in view when scrolling',
	scrollLabel:	'\u2248', // asymp
	scrollTip:	'SCROLL=allow panel to move with page',
	closeLabel:	'X',
	closeTip:	'CLOSE=hide this panel',
	dockLabel:	'\u221A', // radic
	dockTip:	'DOCK=reset size/position',

	noPid:		'unnamed panel',

	statusMsg:	'%0: pos=(%1,%2)%3 size=(%4,%5) z=%6',
	hoveredMsg:	'[hovering]',
	dockedTip:	'%0: docked',
	scrollMsg:	'%0: pos=(%1,%2)',
	msgDuration:	3000,

	moveTip:	'%0DRAG EDGE=move',
	sizeTip:	'(SHIFT=resize)',
	sizeWidthTip:	'(SHIFT=resize width)',
	sizeHeightTip:	'(SHIFT=resize height)',
	clickTip:	  'CLICK=bring to front, SHIFT-CLICK=send to back',
	dblclickdockTip:  'DOUBLE-CLICK=dock',
	dblclickunfoldTip:'DOUBLE-CLICK=unfold',

	foldParam:	'fold',
	hoverParam:	'hover',
	nocloseParam:	'noclose',
	nodockParam:	'nodock',
	undockedParam:	'undocked',

	jumpParam:	'jump',
	dockParam:	'dock',
	moveParam:	'move',
	labelParam:	'label',
	promptParam:	'prompt',

	allParam:	'all',
	nameParam:	'name',
	topParam:	'top',
	leftParam:	'left',
	widthParam:	'width',
	heightParam:	'height',

	managerParam:	'manager'
});
//}}}
// // global functions (general utilities)
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
//}}}
// // macro
//{{{
merge(config.macros.moveablePanel,{
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {

		// ALTERNATIVE OUTPUT: Panel Manager macro extensions...
		if (this.manager && this.manager.handler(place,macroName,params,wikifier,paramString,tiddler))
			return; // processed by PanelManager

		// UNPACK KEYWORD PARAMS
		var showfold	 =params.contains(this.foldParam);
		var showhover	 =params.contains(this.hoverParam);
		var showclose	 =!params.contains(this.nocloseParam);
		var showdock	 =!params.contains(this.nodockParam);
		var showmanager  =params.contains(this.managerParam);
		var startundocked=params.contains(this.undockedParam);
		var jump	 =params.contains(this.jumpParam);
		var dock	 =params.contains(this.dockParam);
		var move	 =params.contains(this.moveParam);
		var all		 =params.contains(this.allParam);

		// UNPACK VALUE PARAMS
		params=paramString.parseParams('anon',null,true,false,false);
		var label =getParam(params,this.labelParam,null);
		var prompt=getParam(params,this.promptParam,null);
		var name  =getParam(params,this.nameParam,null);
		var top   =getParam(params,this.topParam,null);
		var left  =getParam(params,this.leftParam,null);
		var width =getParam(params,this.widthParam,null);
		var height=getParam(params,this.heightParam,null);

		// COMMANDS: JUMP, MOVE, DOCK
		if (jump||move||dock) {
			if (!label||!label.length) {
				var p=this.findPanel(name);
				if (jump) { if (p) this.scrollToPanel(p,true); else window.scrollTo(left,top); }
				if (move) { this.movePanel(p,left,top,true,true); }
				if (dock) { if (all) this.forAllPanels(this.dockPanel); else if (p) this.dockPanel(p); }
				return;
			}
			var tip=(jump?this.jumpParam:move?this.moveParam:dock?this.dockParam:'')+': '+name;
			var b=createTiddlyButton(place,label,prompt||tip, function(ev) {
				var cmm=config.macros.moveablePanel; var p=cmm.findPanel(this.name);
				if (this.jump) { if (p) cmm.scrollToPanel(p,true); else window.scrollTo(this.left,this.top); }
				if (this.move) { if (p) cmm.movePanel(p,this.left,this.top,true,true); }
				if (this.dock) { if (p) cmm.dockPanel(p); else if (this.all) cmm.forAllPanels(cmm.dockPanel); }
				return cmm.processed(ev)
			},'button');
			b.jump=jump; b.move=move; b.dock=dock;
			b.name=name; b.all=all;   b.left=left; b.top=top;
			return;
		}

		// PANEL SETUP
		var p=this.getPanel(place);
		this.cachePanel(p);
		addClass(p,'moveablePanel');
		p.pid=name;
		p.showmanager=showmanager;
		p.fixedheight=height||undefined;
		p.fixedwidth=width||undefined;
		this.addPanelButtons(p,showfold,showhover,showclose,showdock,showmanager);
		this.addMouseHandlers(p);
		if (startundocked) {
			this.undockPanel(p);
			if (!startingUp) { this.bringPanelToFront(p); this.scrollToPanel(p); }
		}
		if (this.manager) { this.manager.applyMap(p); this.manager.trackMap(p); }
		this.notify(p);
	},
//}}}
// // notifications
//{{{
	quiet: 0, // flag to suspend/resume notifications
	notify: function(p) { // notify others of panel changes
		if (this.quiet) return;
		if (this.manager) this.manager.notify(p); // pass notices to manager (updates viewers)
	},
//}}}
// // general panel utilities
//{{{
	getPanel: function(place) { // find containing panel or floating slider (use current element as fallback)
		var p=place;
		while (p && !(hasClass(p,'moveablePanel')||hasClass(p,'floatingPanel'))) p=p.parentNode;
		return p||place;
	},
	getAllPanels: function(zSort) { // find 'moveablePanel' elements (optionally sort by zIndex)
		var panels=[];
		var sortByZindex=function(a,b){
			var v1=parseInt(a.style.zIndex); if (isNaN(v1)) v1=0;
			var v2=parseInt(b.style.zIndex); if (isNaN(v2)) v2=0;
			return(v1==v2)?0:(v1>v2?1:-1);
		}
		// if native browser fn is defined, use it (*much* more efficient!)
		if (document.getElementsByClassName) { 
			var elems=document.getElementsByClassName('moveablePanel');
			for (var i=0; i<elems.length; i++) panels.push(elems[i]);
			return zSort?panels.sort(sortByZindex):panels;
		}
		// otherwise, find all DIVs and SPANs with the right class
		// NOTE: IE requires use of Enumerator() to iterate over elements, or it FREEZES UP COMPLETELY!!
		var isIE=config.browser.isIE;
		var elems=document.getElementsByTagName('DIV');
		for (var i=isIE?new Enumerator(elems):0; isIE?!i.atEnd():(i<elems.length); isIE?i.moveNext():i++) {
			var panel=isIE?i.item():elems[i];
			if (hasClass(panel,'moveablePanel')) panels.push(panel);
		}
		var elems=document.getElementsByTagName('SPAN');
		for (var i=isIE?new Enumerator(elems):0; isIE?!i.atEnd():(i<elems.length); isIE?i.moveNext():i++) {
			var panel=isIE?i.item():elems[i];
			if (hasClass(panel,'moveablePanel')) panels.push(panel);
		}
		return zSort?panels.sort(sortByZindex):panels;
	},
	findPanel: function(pid) { // find a named panel
		var p=this.getAllPanels();
		for (var i=0; i<p.length; i++) { if (pid && p[i].pid==pid) return p[i]; }
		return undefined;
	},
	forAllPanels: function(callback) { // invoke a function on each panel
		var panels=this.getAllPanels();
		this.quiet++;
		for (var i=0; i<panels.length; i++) callback.apply(this,[panels[i]]);
		this.quiet--;
		this.notify('all');
	},
	cachePanel: function(p) { // save original styles and handlers
		if (!p.saved) p.saved={ 
			x:p.style.left||'', y:p.style.top||'', w:p.style.width||'', h:p.style.height||'',
			z:p.style.zIndex||'', pos:p.style.position||'', title: p.title,
			mouseover:p.onmouseover, mouseout:p.onmouseout,
			mousedown:p.onmousedown, mousemove:p.onmousemove, dblclick:p.ondblclick
		};
	},
	restorePanel: function(p) { // restore original styles
		if (!p.saved) return;
		p.style.left=p.saved.x; p.style.top=p.saved.y; p.style.width=p.saved.w; p.style.height=p.saved.h;
		p.style.zIndex=p.saved.z; p.style.position=p.saved.pos; p.title=p.saved.title;
		removeClass(p,'folded'); removeClass(p,'hover'); removeClass(p,'undocked');
	},
//}}}
// // panel metrics
//{{{
	getPanelOffset: function(p) { // adjustment for child elements inside relative/floatingPanel containers
		var r=new Object(); r.x=0; r.y=0; if (!p) return r;
		var pp=p.parentNode; while (pp && !(pp.style&&pp.style.position=='relative')) pp=pp.parentNode;
		if (pp) { r.x+=findPosX(pp); r.y+=findPosY(pp); }
		var pp=p.parentNode; while (pp && !hasClass(pp,'floatingPanel')) pp=pp.parentNode;
		if (pp) { r.x+=findPosX(pp); r.y+=findPosY(pp); }
		return r;
	},
	// PROBLEM: the offsetWidth/offsetHeight do not seem to account for padding or borders
	// WORKAROUND: subtract padding and border (in px) from width and height
	// ISSUE: I still don't understand why this is needed...
	// TBD: get padding/border values from p.style and convert to px
	// NOTE: 10.6667 seems to be about 1em...
	getPanelEdgeWidth:
	  	function(p) { return 10.6667; },
	getPanelEdgeHeight:
		function(p) { return 10.6667; },
	getPanelHeight:
		function(p) { var pad=10.6667; var border=1; return p.offsetHeight-(pad*2+border*2); },
	getPanelWidth:
		function(p) { var pad=10.6667; var border=1; return p.offsetWidth -(pad*2+border*2); },
//}}}
// // panel stacking (zIndex)
//{{{
	isStackable: function(p) { // zIndex is only effective with absolute or fixed elements
		return (['absolute','fixed'].contains(p.style.position)&&!hasClass(p,'popup'));
	},
	normalizeStack: function(panels) { // set zIndex to correspond to stack order
		for (var i=0; i<panels.length; i++) {var z=panels[i].style.zIndex;
			if (z==0||z=='auto') continue; // if not stacking (e.g., 'auto', '', or null)
			if (z<10000 || z>10000) continue; // use large values for "always in front/back"
			if (z!=i+2) panels[i].style.zIndex=i+2;
			if (this.manager) this.manager.trackMap(panels[i]);
		}
		return panels;
	},
	bringPanelToFront: function(p) { if (!p) return;
		if (!this.isStackable(p)) return; // can't be stacked
		var panels=this.getAllPanels(true);
// WFFL - normalizing every time works, but takes too long
//		if (p.style.zIndex>panels.length+2) return; // stay in front
//		this.normalizeStack(panels);
//		p.style.zIndex=panels.length+2;
// WFFL - for now, just bump up the max (ignore z>10000) and normalize much less often
		if (p.style.zIndex>1000) this.normalizeStack(panels);
		var zMax=0; if (panels.length) {
			var i=panels.length-1; zMax=parseInt(panels[i].style.zIndex);
			while (zMax>10000 && i>0) zMax=parseInt(panels[--i].style.zIndex);
			if (p==panels[i]) return; // already in front
			if (isNaN(zMax)) zMax=0;
		}
		p.style.zIndex=zMax+1;
		this.notify(p);
	},
	sendPanelToBack: function(p) { if (!p) return;
		if (!this.isStackable(p)) return; // can't be stacked
		var panels=this.getAllPanels(true);
// WFFL - normalizing every time works, but takes too long
//		if (p.style.zIndex<2) return; // stay in back
//		this.normalizeStack(panels);
//		p.style.zIndex=1;
// WFFL - for now, just bump down the min (ignore z<10000) and normalize much less often
		if (p.style.zIndex<1000) this.normalizeStack(panels);
		var zMin=0; if (panels.length) {
			var i=0; zMin=parseInt(panels[i].style.zIndex);
			while (zMin<10000 && i<panels.length-1) zMin=parseInt(panels[++i].style.zIndex);
			if (p==panels[i]) return; // already in back
			if (isNaN(zMin)) zMin=0;
		}
		p.style.zIndex=zMin-1;
		this.notify(p);
	},
	returnPanelToStack: function(p) { if (!p) return;
		p.style.zIndex=p.saved?p.saved.zIndex:'';
		this.notify(p);
	},
//}}}
// // panel scrolling 
//{{{
	noScrollX: 0, // flags to disable TW built-in scrolling behavior
	noScrollY: 0, // set by hijacks, cleared by ensurePanelVisible(), below
	// scroll view to show panel along nearest edge of window or centered (optional)
	scrollToPanel: function(p,center) { if (!p) return;
		if (hasClass(p,'popup')) return; // popup=let core scrolling handle it
		if (hasClass(p,'hover')) return; // hover=always in view=don't scroll
		var scrollSize=findWindowWidth()-document.body.offsetWidth; // width of scrollbar
		var sx=findScrollX();	var ww=findWindowWidth()-scrollSize;
		var sy=findScrollY();	var wh=findWindowHeight()-scrollSize;
		var px=findPosX(p);	var pw=p.offsetWidth;
		var py=findPosY(p);	var ph=p.offsetHeight;
		var nx=sx; var ny=sy; // assume no scrolling is needed
		// if BR is not in view, scroll to show BR
		if (px+pw>sx+ww) nx=px+pw-ww;
		if (py+ph>sy+wh) ny=py+ph-wh;
		// if TL not in view or too big... scroll to show TL
		if (px<nx || px>nx+ww || px+pw>nx+ww) nx=px;
		if (py<ny || py>ny+wh || py+ph>ny+wh) ny=py;
		// optionally, center in view (if panel fits)
		if (center && pw<ww) nx-=(ww-pw)/2;
		if (center && ph<wh) ny-=(wh-ph)/2;
		if (nx!=sx||ny!=sy) { // if we need to scroll...
			window.scrollTo(nx,ny);
			if (config.options.chkMoveablePanelShowStatus && !startingUp) {
				var id=hasClass(p,'tiddler')?p.getAttribute('tiddler'):p.pid;
				this.timedMessage(this.scrollMsg.format([id||this.noPid,px,py]),this.msgDuration);
			}
			this.notify(p);
		}
	},
	// bring to front and scroll into view (with optional ASYNC)
	ensurePanelVisible: function(p,delay) { if (!p) return;
		if (delay && !startingUp) { // wait for core animation to complete...
			if (hasClass(p,'tiddler'))
				p=config.macros.moveablePanel.findPanel(p.getAttribute('tiddler'))||p;
			if (!p.id) p.id=new Date().getTime()+Math.random(); // unique ID
			var code='config.macros.moveablePanel.ensurePanelVisible(document.getElementById("%0"));';
			setTimeout(code.format([p.id]),delay);
			return;
		}
		// unblock scrolling and bring the panel into view
		if (this.noScrollX>0) this.noScrollX--; if (this.noScrollY>0) this.noScrollY--;
		if (hasClass(p,'popup')) return; // leave popups alone!
		this.bringPanelToFront(p);
		if (this.noScrollX+this.noScrollY==0 && !startingUp) // no scroll during document startup
			this.scrollToPanel(p);
	},
//}}}
// // panel status
//{{{
	formatPanelStatus: function(p) {
		var s=p.style; var msg=this.statusMsg.format([p.pid||this.noPid,
			s.left,s.top,hasClass(p,'hover')?this.hoveredMsg:'',s.width,s.height,s.zIndex]);
		return msg.replace(/(\.[0-9]+)|px/g,''); // remove decimals and 'px'
	},
	showPanelStatus: function(p,show) { // display panel info in titlebar while moving/sizing
		if (!config.options.chkMoveablePanelShowStatus) return;
		if (show) document.title=this.formatPanelStatus(p)
		else refreshPageTitle();
	},
	timedMessage: function(msg,duration) {
		document.title=msg; setTimeout('refreshPageTitle()',duration);
	},
	getPanelTooltip: function(p) {
		return hasClass(p,'undocked')?this.formatPanelStatus(p):this.dockedTip.format([p.pid||this.noPid]);
	},
//}}}
// // panel actions
//{{{
	undockPanel: function(p,front) { // undocked with default pos/size
		if (hasClass(p,'undocked')) return; // already undocked
		// get size BEFORE undocking
		p.style.width=p.fixedwidth  ||(this.getPanelWidth(p)+'px');
		p.style.height=p.fixedheight||(this.getPanelHeight(p)+'px');
		addClass(p,'undocked');	if (!this.isStackable(p)) p.style.position='absolute'; // UNDOCK it
		// set position AFTER undocking
		var offset=this.getPanelOffset(p);
		p.style.left=findPosX(p)-offset.x+'px'; p.style.top=findPosY(p)-offset.y+'px';
		if (front) this.bringPanelToFront(p);
		this.notify(p);
	},
	dockPanel: function(p) { // reset to docked pos/size
		if (!hasClass(p,'undocked')) return; // already docked
		this.restorePanel(p); // reset panel
		// FOR FLOATING SLIDERS: trigger slider adjustment handler (if any)
		if (hasClass(p,'floatingPanel') && window.adjustSliderPos)
			window.adjustSliderPos(p.parentNode,p.button,p);
		this.quiet++; if (this.manager) this.manager.trackMap(p); this.quiet--;
		this.notify(p)
	},
	closePanel: function(p) { // dock panel, then close (for tiddlers and floating sliders)
		var t=story.findContainingTiddler(p);
		var isTiddler=t&&this.findPanel(t.getAttribute('tiddler'));
		var isFloating=hasClass(p,'floatingPanel');
		if (!isTiddler) // when closing TIDDLERS, leave them undocked (keeps size/pos)
			this.dockPanel(p);
		// FOR FLOATING SLIDERS: set focus and do a fake click on slider button
		if (isFloating) { p.button.focus(); onClickNestedSlider({target:p.button}); }
		// FOR TIDDLERS: call story.closeTiddler()
		if (isTiddler) { story.closeTiddler(t.getAttribute('tiddler')); }
	},
	movePanel: function(p,x,y,show,centered) { if (!p) return;
		this.quiet++;
		this.undockPanel(p);
		// adjust for child elements inside relative/floatingPanel containers
		var offset=this.getPanelOffset(p);
		p.style.left=x-offset.x+'px'; p.style.top=y-offset.y+'px';
		if (show) { this.bringPanelToFront(p); this.scrollToPanel(p,centered); }
		this.quiet--;
		this.showPanelStatus(p,true);
		if (this.manager) this.manager.trackMap(p);
	},
	foldPanel: function(p) { // toggle panel height
		if (hasClass(p,'folded')) removeClass(p,'folded'); else addClass(p,'folded');
		if (this.manager) this.manager.trackMap(p);
		this.notify(p);
	},
	hoverPanel: function(p) { // toggle fixed position
		if (hasClass(p,'hover')) {
			removeClass(p,'hover');
			var offset=this.getPanelOffset(p);
			p.style.left=p.offsetLeft+findScrollX()-offset.x+'px';
			p.style.top=p.offsetTop+findScrollY()-offset.y+'px';
		} else {
			var offset=this.getPanelOffset(p);
			var ww=findWindowWidth(); var wh=findWindowHeight();
			p.style.left=(p.offsetLeft-findScrollX()+offset.x)%ww+'px';
			p.style.top =(p.offsetTop -findScrollY()+offset.y)%wh+'px';
			addClass(p,'hover'); 
		}
		if (this.manager) this.manager.trackMap(p);
		this.notify(p);
	},
	resetPanel: function(p) { // reset to session starting pos/size
		if (this.manager) this.manager.resetPanel(p); else this.dockPanel(p);
	},
//}}}
// // menu buttons
//{{{
	processed: function(ev) { var ev=ev||window.event; // use to end event handling for menus and mouse actions
		if (ev) { ev.cancelBubble=true; if (ev.stopPropagation) ev.stopPropagation(); } return false;
	},
	addPanelButtons: function(p,showfold,showhover,showclose,showdock,showmanager) {
		if (p.menu) return; // only once per panel
		function cmd(menu,label,tip,callback,show,arg) {
			var fn=function(ev){return this.callback.apply(config.macros.moveablePanel,[this,ev,this.arg]);}
			var b=createTiddlyButton(menu,label,tip,fn,'moveablePanelButton');
			b.style.display=show?'inline':'none'; b.callback=callback; b.arg=arg;
			return b;
		}
		var m=createTiddlyElement(p,'div',null,'moveablePanelMenu');
		p.showfold=showfold;
		p.foldbutton= cmd(m,this.foldLabel,this.foldTip,this.foldHandler,showfold);
		p.unfoldbutton= cmd(m,this.unfoldLabel,this.unfoldTip,this.foldHandler,false);
		p.showhover=showhover;
		p.hoverbutton=cmd(m,this.hoverLabel,this.hoverTip,this.hoverHandler,showhover);
		p.scrollbutton=cmd(m,this.scrollLabel,this.scrollTip,this.hoverHandler,false);
		p.showdock=showdock;
		p.dockbutton= cmd(m,this.dockLabel,this.dockTip,this.dockHandler,showdock);
		p.showclose=showclose;
		p.closebutton=cmd(m,this.closeLabel,this.closeTip,this.closeHandler,showclose);
		p.showmanager=showmanager;
		if (this.manager) p.managerbutton=cmd(m,this.manager.buttonLabel,this.manager.buttonTip,
			this.manager.popup,showmanager,p.pid);
		p.menu=m;
	},
	togglePanelButtons: function(p,show) { if (!p||!p.menu) return;
		var undocked=hasClass(p,'undocked');
		var floating=hasClass(p,'floatingPanel');
		var hover=hasClass(p,'hover');
		var folded=hasClass(p,'folded');
		var t=story.findContainingTiddler(p);
		var tiddler=t&&this.findPanel(t.getAttribute('tiddler'));
		var show=show&&(undocked||floating);
		p.menu.style.display=show?'inline':'none';
		if (p.showfold)  p.foldbutton.style.display  =!folded?'inline':'none';
		if (p.showfold)  p.unfoldbutton.style.display= folded?'inline':'none';
		if (p.showhover) p.hoverbutton.style.display =!hover?'inline':'none';
		if (p.showhover) p.scrollbutton.style.display= hover?'inline':'none';
		if (p.showdock)  p.dockbutton.style.display =undocked?'inline':'none';
		if (p.showclose) p.closebutton.style.display=floating||(tiddler&&undocked)?'inline':'none';
		if (p.managerbutton) { // see [[PanelManagerPlugin]]
			var show=p.showmanager||config.options.chkMoveablePanelShowManager;
			p.managerbutton.style.display=show?'inline':'none';
		}
	},
	foldHandler: function(place,ev){ var p=this.getPanel(place);
		this.foldPanel(p); this.togglePanelButtons(p,true); return this.processed(ev); },
	hoverHandler: function(place,ev){ var p=this.getPanel(place);
		this.hoverPanel(p); this.togglePanelButtons(p,true); return this.processed(ev); },
	dockHandler: function(place,ev){ var p=this.getPanel(place);
		this.dockPanel(p); this.togglePanelButtons(p,true); return this.processed(ev); },
	closeHandler: function(place,ev){ var p=this.getPanel(place);
		this.closePanel(p); this.togglePanelButtons(p,true); return this.processed(ev); },
//}}}
// // mouse handlers
//{{{
	addMouseHandlers: function(p) {
		if (p.handlers) return true; // only add handlers ONCE
		p.onmouseover=function(ev) { var ev=ev||window.event;
			var r=config.macros.moveablePanel.mouseover(this,ev);
			return r&&this.saved.mouseover?this.saved.mouseover.apply(this,arguments):true;
		};
		p.onmouseout=function(ev) { var ev=ev||window.event;
			var r=config.macros.moveablePanel.mouseout(this,ev);
			return r&&this.saved.mouseout?this.saved.mouseout.apply(this,arguments):true;
		};
		p.onmousemove=function(ev) { var ev=ev||window.event;
			var r=config.macros.moveablePanel.mousemove(this,ev);
			return r&&this.saved.mousemove?this.saved.mousemove.apply(this,arguments):true;
		};
		p.ondblclick=function(ev) { var ev=ev||window.event;
			var r=config.macros.moveablePanel.dblclick(this,ev);
			return r&&this.saved.dblclick?this.saved.dblclick.apply(this,arguments):r;
		};
		p.onmousedown=function(ev) { var ev=ev||window.event;
			var r=config.macros.moveablePanel.mousedown(this,ev);
			return r&&this.saved.mousedown?this.saved.mousedown.apply(this,arguments):r;
		};
		p.handlers=true;
	},
	isEdge: function(p,ev) { // near 'edge' of panel (or child element)?
		var ev=ev||window.event; var target=resolveTarget(ev);
		if (!p) return false;
		// ignore form input fields
		if (['input','select','option','textarea'].contains(target.nodeName.toLowerCase())) return false;
		var left=findPosX(p); var top=findPosY(p);
		var width=p.offsetWidth; var height=p.offsetHeight;
		var x=findMouseX(ev); var y=findMouseY(ev);
		if (hasClass(p,'hover')) { x-=findScrollX(); y-=findScrollY(); } // window-relative panel
		if (x<left||y<top||x>=left+width||y>=top+height) { // outside of panel
			if (p==target || p!=this.getPanel(target)) return false;
			return this.isEdge(target,ev); // check target child element
		}
		var edgeW=this.getPanelEdgeWidth(p); var edgeH=this.getPanelEdgeHeight(p);
		var isT=(y-top<edgeH); var isL=(x-left<edgeW);
		var isB=(top+height-y<edgeH); var isR=(left+width-x<edgeW);
		return isT||isL||isB||isR;
	},
	// temporary element during move/size keeps document from shrinking 
	addGhost: function(p) {
		var g=document.getElementById('moveablePanelGhost');
		if (!g) g=createTiddlyElement(document.body,'div','moveablePanelGhost','moveablePanelGhost');
		var border=1; // note: must match CSS for 'moveablePanelGhost' WFFL-HACK
		g.style.left=findPosX(p)+'px';
		g.style.top=findPosY(p)+'px';
		g.style.width=((p.offsetWidth-border*2)||0)+'px';
		g.style.height=((p.offsetHeight-border*2)||0)+'px';
	},
	clearGhost: function() {
		var e=document.getElementById('moveablePanelGhost');
		if (e) e.parentNode.removeChild(e);
	},
	// MOUSEOVER=SHOW MENU
	mouseover: function(place,ev) { var ev=ev||window.event;
		var p=this.getPanel(place);
		addClass(p,'selected'); // shows toolbar-classed items
		this.togglePanelButtons(p,true);
		return true;
	},
	// MOUSEOUT=HIDE MENU
	mouseout: function(place,ev) { var ev=ev||window.event;
		var p=this.getPanel(place);
		removeClass(p,'selected'); // hides toolbar-classed items
		this.togglePanelButtons(p,false);
		return true;
	},
	// MOUSEMOVE=SHOW MENU AND SET CURSOR/TIP
	mousemove: function(place,ev) { var ev=ev||window.event;
		var p=this.getPanel(place);
		p.style.cursor='auto'; p.title=p.saved?p.saved.title:'';
		if (!this.isEdge(p,ev)) return true;
		var fw=p.fixedwidth;  if (fw==null) fw=undefined;
		var fh=p.fixedheight; if (fh==null) fh=undefined;

		p.title=this.moveTip.format([p.pid?p.pid+': ':'']);
		if (fw===undefined&&fh===undefined) p.title+=' '+this.sizeTip;
		else if  (fw===undefined) p.title+=' '+this.sizeWidthTip;
		else if  (fh===undefined) p.title+=' '+this.sizeHeightTip;
		if (hasClass(p,'undocked')) {
			p.title+=', '+this.clickTip+', ';
			p.title+=hasClass(p,'folded')?this.dblclickunfoldTip:this.dblclickdockTip;
		}
		p.style.cursor='move';
		if (ev.shiftKey&&!(fw&&fh)) { // set resizing cursor (if not fixed width/height)
			var left=findPosX(p); var top=findPosY(p);
			var width=p.offsetWidth; var height=p.offsetHeight;
			var x=findMouseX(ev); var y=findMouseY(ev);
			if (hasClass(p,'hover')) { x-=findScrollX(); y-=findScrollY(); } // window-relative panel
			var edgeW=this.getPanelEdgeWidth(p); var edgeH=this.getPanelEdgeHeight(p);
			var isT=(y-top<edgeH); var isL=(x-left<edgeW);
			var isB=(top+height-y<edgeH); var isR=(left+width-x<edgeW);
			p.style.cursor=(fh===undefined?(isT?'n':(isB?'s':'')):'')
				+(fw===undefined?(isL?'w':(isR?'e':'')):'')+'-resize';
		}
		return true;
	},
	// DOUBLE-CLICK=DOCK OR UNFOLD
	dblclick: function(place,ev) { var ev=ev||window.event;
		var p=this.getPanel(place);
		if (!this.isEdge(p,ev)) return true;
		// if folded... unfold, otherwise... undock
		if (hasClass(p,'folded')) this.foldPanel(p); else this.dockPanel(p);
		this.togglePanelButtons(p,false);
		return this.processed(ev);
	},
	// MOUSEDOWN=START MOVE/SIZE, CLICK=BRING TO FRONT, SHIFT-CLICK=SEND TO BACK
	mousedown: function(place,ev) { var ev=ev||window.event;
		var p=this.getPanel(place);

		// CLICK ALWAYS BRINGS TO FRONT
		this.quiet++;
		this.bringPanelToFront(p);
		if (this.manager) this.manager.trackMap(p);
		this.quiet--;
		if (!this.isEdge(p,ev)) return true;

		// start capturing mouse events and set mouse/key handlers
		var target=p; // if 'capture' not supported, track in panel only
		if (document.body.setCapture) // IE
			{ document.body.setCapture(); var target=document.body; }
		if (window.captureEvents) // moz
			{ window.captureEvents(Event.MouseMove|Event.MouseUp,true); var target=window; }
 		if (target.onmousemove!=undefined) target.saved_mousemove=target.onmousemove;
		target.onmousemove=this.dragmove;
		if (target.onmouseup!=undefined) target.saved_mouseup=target.onmouseup;
		target.onmouseup=this.dragstop;
 		if (target.onkeydown!=undefined) target.saved_keydown=target.onkeydown;
		target.onkeydown=this.dragkey;

		// calculate and save drag data in target element
		var x=findMouseX(ev); var left=findPosX(p); var width =p.offsetWidth;
		var y=findMouseY(ev); var top =findPosY(p); var height=p.offsetHeight;
		var sizing=ev.shiftKey;
		var edgeW=this.getPanelEdgeWidth(p); var edgeH=this.getPanelEdgeHeight(p);
		var isT=(y-top<edgeH); var isL=(x-left<edgeW);
		var isB=(top+height-y<edgeH); var isR=(left+width-x<edgeW);
		var d=new Object();
		d.panel=p; d.left=left; d.top=top;
		d.width=this.getPanelWidth(p); d.height=this.getPanelHeight(p);
		d.sizing=sizing; d.edgeW=edgeW; d.edgeH=edgeH;
		d.isT=isT; d.isL=isL; d.isB=isB; d.isR=isR; d.offset=this.getPanelOffset(p);
		d.saved={ x:p.style.left, y:p.style.top, w:p.style.width, h:p.style.height,
			z:p.style.zIndex, pos:p.style.position, classname:p.className };
		target.data=d;
		this.addGhost(p); // keep document from shrinking during move/size
		return this.processed(ev);
	},
	// MOUSEMOVE (during drag)=move/size panel
	dragmove: function(ev){ var ev=ev||window.event; var cmm=config.macros.moveablePanel;
		var d=this.data; var p=d.panel;
		if (!p) { this.onmousemove=this.saved_mousemove?this.saved_mousemove:null; return; }

		cmm.quiet++; // save all notifications until the end...

		// ensure panel is undocked and scrolled into view, THEN get starting mouse and scroll positions
		if (!hasClass(p,'undocked'))
			{ cmm.undockPanel(p,true); if (this.manager) this.manager.trackMap(p); }
		if (d.x===undefined) // first move event only
			{ cmm.scrollToPanel(p); d.x=findMouseX(ev); d.y=findMouseY(ev); }

		// get current mouse pos
		var newX=findMouseX(ev); var newY=findMouseY(ev);

		// calculate new TLWH (start with current panel pos/size)
		var startX=d.x; var startY=d.y; var offsetX=d.offset.x; var offsetY=d.offset.y;
		var L=d.left; var T=d.top; var W=d.width; var H=d.height;
		var newL=L; var newT=T; var newW=p.fixedwidth||W; var newH=p.fixedheight||H;
		if (d.sizing) { // resize panel
			var minW=d.edgeW*2; var minH=d.edgeH*2; // stay bigger than edge areas
			if (hasClass(p,'folded')) this.fold(p.foldButton,ev); // un-fold first!
			if (d.isT) newH=H-newY+startY+1;
			if (d.isB) newH=H+newY-startY+1;
			if (d.isL) newW=W-newX+startX+1;
			if (d.isR) newW=W+newX-startX+1;
			if (d.isT) newT=T-offsetY+newY-startY+1; else newT=T-offsetY; 
			if (d.isL) newL=L-offsetX+newX-startX+1; else newL=L-offsetX; 
			if ((d.isL||d.isR)&&!p.fixedwidth)  newW=(newW>minW?newW:minW);
			if ((d.isT||d.isB)&&!p.fixedheight) newH=(newH>minH?newH:minH);
		} else { // move panel
			newL=L-offsetX+newX-startX+1;
			newT=T-offsetY+newY-startY+1;
		}
		if (hasClass(p,'hover')) { // hover=stay on first screen
			var ww=findWindowWidth(); var wh=findWindowHeight();
			newL+=offsetX; newT+=offsetY; // hover=no relative offset (window-relative)
			// WFFL lower right is off... a bit too far (perhaps scrollwidth?)
			if (newL+newW>ww) newL=ww-newW; if (newT+newH>wh) newT=wh-newH; // limit lower right
			if (newL<0) newL=0; if (newT<0) newT=0; // limit upper left
		} else { // normal floating panel=limit upper left (stay on page)
			if (newL+offsetX<0) newL=0-offsetX; if (newT+offsetY<0) newT=0-offsetY;
		}

		// move the panel and scroll into view as needed
		p.style.left=newL.toString()+'px';
		p.style.top=newT.toString()+'px';
		if (d.sizing) p.style.width=newW.toString()+'px';
		if (d.sizing) p.style.height=newH.toString()+'px';
		cmm.scrollToPanel(p);

		// report new position and notify panel manager... done!
		cmm.quiet--; cmm.showPanelStatus(p,true); cmm.notify(p);
		return cmm.processed(ev);
	},
	dragkey: function(ev){ var ev=ev||window.event;
		var d=this.data; var p=d.panel;
		if (ev.keyCode==27) { // ESC=CANCEL... restore panel to previous pos/size
			p.style.left =d.saved.x; p.style.top   =d.saved.y;
			p.style.width=d.saved.w; p.style.height=d.saved.h;
			p.style.zIndex=d.saved.z;
			p.style.position=d.saved.pos;
			p.className=d.saved.classname;
			return this.onmouseup(ev);
		}
		if (this.saved_keydown) return this.saved_keydown(ev);
	},
	// MOUSEUP: END MOVE/SIZE, SHIFT-CLICK=SEND TO BACK
	dragstop: function(ev){ var ev=ev||window.event; var cmm=config.macros.moveablePanel;
		var newX=findMouseX(ev); var newY=findMouseY(ev);
		if (this.releaseCapture) this.releaseCapture(); // IE
		if (this.releaseEvents) this.releaseEvents(Event.MouseMove|Event.MouseUp); // moz
		this.onmousemove=this.saved_mousemove?this.saved_mousemove:null;
		this.onmouseup=this.saved_mouseup?this.saved_mouseup:null;
		this.onkeydown=this.saved_keydown?this.saved_keydown:null;
		var d=this.data; var p=d.panel;
		if (ev.shiftKey && d.x==newX && d.y==newY && cmm.isEdge(p,ev))
			cmm.sendPanelToBack(p); // SHIFT-CLICK *EDGE*
		cmm.togglePanelButtons(p,true);
		cmm.quiet++; if (cmm.manager) cmm.manager.trackMap(p); cmm.quiet--;
		cmm.clearGhost(); // allow document to adjust extents (if needed)
		cmm.showPanelStatus(p,false); cmm.timedMessage(cmm.formatPanelStatus(p),cmm.msgDuration);
		return cmm.processed(ev);
	},
//}}}
// // CSS definitions
//{{{
	css: '/*{{{*/\n'
		+'.moveablePanelMenu\n'
			+'\t{ display:none; position:absolute; right:.5em; top:-1em; }\n'
		+'.undocked .selected.moveablePanelMenu\n'
			+'\t{ display:inline; }\n'
		+'.floatingPanel .selected .moveablePanelMenu\n'
			+'\t{ display:inline; }\n'
		+'.hover\n'
			+'\t{ position:fixed !important; }\n'
		+'.folded\n'
			+'\t{ height:1.5em !important; overflow:hidden !important; }\n'
		+'.tiddler .folded\n'
			+'\t{ height:2em !important; }\n'
		+'.folded  .moveablePanelMenu\n'
			+'\t{ top:.5em; }	/* buttons fit in folded panel */\n'
		+'.tiddler .moveablePanelMenu\n'
			+'\t{ top:.2em; }	/* buttons fit in tiddler title */\n'
		+'.undocked .toolbar\n'
			+'\t{ padding-right:7.5em; }	/* make room for buttons next to toolbar */\n'
		+'.floatingPanel .moveablePanelMenu\n'
			+'\t{ right:1em;top:1em; } /* buttons fit in floating panel */\n'
		+'.moveablePanelButton\n {'
			+'\tbackground:#ccc !important; color:#000 !important;\n'
			+'\tborder:1px solid #666; padding:0 .25em; margin:0px 1px;\n'
			+'}\n'
		+'.moveablePanelButton:hover\n'
			+'\t{ background:#fff !important; color:#000 !important; }\n'
		+'.popup\n'
			+'\t{ z-index:9999999 !important; } /* popups MUST always be on top!  */\n'
		+'.moveablePanelGhost\n'
			+'\t{ position:absolute; border:1px dotted #999; }\n'
		+'/*}}}*/'
});
//}}}
// // load time initialization
//{{{
// defaults for options
if (config.options.txtMoveablePanelMapName===undefined)
	config.options.txtMoveablePanelMapName='DefaultMap';
if (config.options.chkMoveablePanelShowStatus===undefined)
	config.options.chkMoveablePanelShowStatus=true;
if (config.options.chkMoveablePanelShowManager===undefined)
	config.options.chkMoveablePanelShowManager=true;

// set up shadow stylesheet, then load styles (might be customized)
config.shadowTiddlers.MoveablePanelStyles=config.macros.moveablePanel.css;
var css=store.getRecursiveTiddlerText('MoveablePanelStyles',config.macros.moveablePanel.css,10);
setStylesheet(css,'moveablePanelStyles');
//}}}
// // hijacks
//{{{
// adjust popup placement to account for the current horizontal scrollbar
// offset (if any), so that popups will appear in the correct location, even
// when their 'root' element is scrolled far from the page origin.
var fn=Popup.place; fn=fn.toString(); if (fn.indexOf('findScrollX')==-1) { // only once
	fn=fn.replace(/winWidth\s*-\s*scrollWidth\s*-\s*1/,
		'findScrollX() + winWidth - scrollWidth - 1');
	fn=fn.replace(/winWidth\s*-\s*popupWidth\s*-\s*scrollWidth\s*-\s*1/,
		'findScrollX() + winWidth - popupWidth - scrollWidth - 1');
	eval('Popup.place='+fn);
}
//}}}
//{{{
// window.scrollTo() is used throughout the core (and plugins) to scroll to a *vertical*
// position as computed by ensureVisible(), in order to bring a tiddler into view.
// Unfortunately, the *horizontal* scroll position is almost always hard-coded to 0
// (i.e. a return to the left edge of the page).  Normally, this is not a problem,
// since a page is rarely scrolled horizontally.  However, when there are moveable
// panels, they can appear far from the left edge, so always scrolling to the left
// edge is very disruptive.  In addition, unwanted scrolling can occur as a side
// effect when displaying or refreshing a tiddler (e.g., switching between
// view/edit templates).  These hijacks adds control flags ('noScrollX' and 'noscrollY')
// that can be used to temporarily disable scrolling within the document.
if (window.scrollTo_moveablePanel==undefined) { // only once
window.scrollTo_moveablePanel=window.scrollTo;
	window.scrollTo=function(x,y) {
		var cmm=config.macros.moveablePanel;
		if (cmm.noScrollX&&cmm.noScrollY) return;
		x=cmm.noScrollX?findScrollX():x;
		y=cmm.noScrollY?findScrollY():y;
		window.scrollTo_moveablePanel(x,y);
	}
}
// ensureVisible() is used to calculate the y-offset of a tiddler, just before scrolling
// This tweak sets up an ASYNC timer to invoke the 'bring to front/scroll into view'
// function for 'tiddler' and 'popup' classes.  This allows the function
// to be triggered *after* core scrolling occurs, so the fixups are not
// stomped on by the core's normal scroll handling
if (window.ensureVisible_moveablePanel==undefined) { // only once
	window.ensureVisible_moveablePanel=window.ensureVisible;
	window.ensureVisible=function(e) {
		var ny=ensureVisible_moveablePanel.apply(this,arguments); // get core value

		// fixup height to account for horizontal scrollbar (if present)
		var atBottom=findPosY(e)+e.offsetHeight>=findScrollY()+findWindowHeight();
		var hasHScroll=document.documentElement.scrollWidth>findWindowWidth();
		var hScrollSize=findWindowWidth()-document.body.offsetWidth;
		if (atBottom && hasHScroll) ny+=hScrollSize;

		// defer scrolling for tiddlers and popups (except during startup)
		if (!startingUp && (hasClass(e,'tiddler')||hasClass(e,'popup'))) {
			var cmm=config.macros.moveablePanel;
			cmm.noScrollX++; if (hasClass(e,'tiddler')) cmm.noScrollY++;
			var delay=config.options.chkAnimate?config.animDuration+50:50;
			cmm.ensurePanelVisible(e,delay); // ASYNC SCROLL
		}
		return ny;
	}
}

// story.refreshTiddler()
if (Story.prototype.refreshTiddler_moveablePanel==undefined) { // only once
	Story.prototype.refreshTiddler_moveablePanel=Story.prototype.refreshTiddler;
	Story.prototype.refreshTiddler=function() {
		var cmm=config.macros.moveablePanel;
		cmm.noScrollX++; cmm.noScrollY++; // DON'T SCROLL AT ALL
		var r=this.refreshTiddler_moveablePanel.apply(this,arguments);
		cmm.noScrollX--; cmm.noScrollY--;
		return r;

	}
}
// story.displayTiddler()
if (Story.prototype.displayTiddler_moveablePanel==undefined) { // only once
	Story.prototype.displayTiddler_moveablePanel=Story.prototype.displayTiddler;
	Story.prototype.displayTiddler=function(srcElement,tiddler) {
		var cmm=config.macros.moveablePanel;
//WFFL		cmm.noScrollX++; cmm.noScrollY++;
		var r=this.displayTiddler_moveablePanel.apply(this,arguments);
		var title=(tiddler instanceof Tiddler)?tiddler.title:tiddler;
		var panel=cmm.findPanel(title); // if moveable... unfold panel (but not during startup)
		if (panel&&hasClass(panel,'folded')&&!startingUp) cmm.foldPanel(panel);
		var delay=config.options.chkAnimate?config.animDuration+50:50;
		cmm.ensurePanelVisible(this.getTiddler(title),delay); // ASYNC SCROLL
		return r;

	}
}
//}}}
//{{{
// Zoomer() displays an animated bounding box when showing a tiddler.  But this box 'zooms' to the tiddler's 'anchor point', not the current panel position, which can cause a 'scroll blink'.  This hijack redirects the zoomer's target directly to the undocked panel (if any)
if (window.Zoomer_moveablePanel==undefined) { // only once
	window.Zoomer_moveablePanel=window.Zoomer;
	window.Zoomer=function(text,startElement,targetElement,unused) {
		if (hasClass(targetElement,'tiddler')) {
			var tid=targetElement.getAttribute('tiddler');
			arguments[2]=config.macros.moveablePanel.findPanel(tid)||targetElement;			
		}
		return window.Zoomer_moveablePanel.apply(this,arguments);
	}
}
//}}}