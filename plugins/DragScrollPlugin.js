/***
|Name|[[DragScrollPlugin]]|
|Source|http://www.TiddlyTools.com/#DragScrollPlugin|
|Documentation|http://www.TiddlyTools.com/#DragScrollPlugin|
|Version|1.0.0|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|use SHIFT-DRAG to scroll the browser window|
DragScrollPlugin allows you to use your mouse to scroll the browser window by grabbing anywhere on the background of the document while holding the SHIFT key.
!!!!!Documentation
<<<
Whenever your page contains extra-wide content that does not 'wrap' onto extra lines, in can result in both horizontal and vertical scrollbars.  Unfortunately, using each scrollbar separately to navigate across the page can become very tedious and makes it more difficult to interact with your content in a flexible and effective manner.

''Drag-scrolling allows you to move in both the horizontal and vertical direction at the same time, simply by holding SHIFT while clicking and dragging the mouse across the page.''
<<<
!!!!!Configuration
<<<
<<option chkDragScroll>> enable //drag-scrolling//
<<<
!!!!!Revisions
<<<
2008.12.01 [1.0.0] Initial public release
<<<
!!!!!Code
***/
//{{{
version.extensions.DragScrollPlugin= {major: 1, minor: 0, revision: 0, date: new Date(2008,12,01)};

if (!config.dragscroll) { // only once
	config.dragscroll={
		// use to end event handling for processed events
		processed: function(ev) {
			var ev=ev||window.event;
			if (ev) { ev.cancelBubble=true; if (ev.stopPropagation) ev.stopPropagation(); }
			return false;
		},
		// MOUSE DOWN - SET CURSOR, SAVE SCROLL DATA
		savedMouseDown: document.onmousedown,
		mousedown: function(ev) {
			var ev=ev||window.event; var target=resolveTarget(ev); var d=config.dragscroll;
			var scroll=ev.shiftKey&&config.options.chkDragScroll;
			var skip=['input','option','textarea'].contains(target.nodeName.toLowerCase());
			if (!scroll||skip) { // handle event normally
				if (d.savedMouseDown!=undefined) return d.savedMouseDown.apply(target,arguments);
				else return;
			}
			d.mX=!config.browser.isIE?ev.pageX:ev.clientX; d.sX=findScrollX();
			d.mY=!config.browser.isIE?ev.pageY:ev.clientY; d.sY=findScrollY();
			d.scrolling=true; document.body.style.cursor='move';
			return config.dragscroll.processed(ev);
		},
		// MOUSE MOVE - UPDATE SCROLL DATA AND SCROLL THE WINDOW 
		savedMouseMove: document.onmousemove,
		mousemove: function(ev) {
			var ev=ev||window.event; var target=resolveTarget(ev); var d=config.dragscroll;
			if (!d.scrolling || !ev.shiftKey) { // NOT SCROLLING
				if (d.savedMouseMove!=undefined) return d.savedMouseMove.apply(target,arguments);
				else return;
			}
			// set scroll pos based on diff between new and old (x,y)
			var mx=!config.browser.isIE?ev.pageX:ev.clientX;
			var my=!config.browser.isIE?ev.pageY:ev.clientY;
			var sx=!config.browser.isIE?findScrollX():d.sX;
			var sy=!config.browser.isIE?findScrollY():d.sY;
			window.scrollTo(sx-mx+d.mX,sy-my+d.mY);
			return config.dragscroll.processed(ev);
		},
		// MOUSEUP - CLEAR THE DRAG DATA, RESET THE CURSOR
		savedMouseUp: document.onmouseup,
		mouseup: function(ev) {
			var ev=ev||window.event; var target=resolveTarget(ev); var d=config.dragscroll;
			var wasScrolling=d.scrolling; d.scrolling=false; document.body.style.cursor='auto';
			if (d.savedMouseUp!=undefined) return d.savedMouseUp.apply(target,arguments);
			if (wasScrolling) return config.dragscroll.processed(ev);
			return;
		}
	}
	// DEFAULT SETTING (ENABLED)
	if (config.options.chkDragScroll===undefined) config.options.chkDragScroll=true;
	// HIJACK MOUSE HANDLERS
	document.onmousedown=config.dragscroll.mousedown;
	document.onmousemove=config.dragscroll.mousemove;
	document.onmouseup  =config.dragscroll.mouseup;
}
//}}}