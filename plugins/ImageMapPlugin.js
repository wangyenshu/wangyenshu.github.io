/***
|Name|ImageMapPlugin|
|Source|http://www.TiddlyTools.com/#ImageMapPlugin|
|Documentation|http://www.TiddlyTools.com/#ImageMapPluginInfo|
|Version|1.2.2|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|apply image maps ('hotspots') with links to tiddlers|
!!!!!Documentation
>see [[ImageMapPluginInfo]]
!!!!!Revisions
<<<
2009.05.27 [1.2.2] improved autoscroll for {{{<<mapMaker>>}}} textarea
2009.05.14 [1.2.1] added cursor changes
see [[ImageMapPluginInfo]] for additional revision details
2009.05.09 [1.0.0] initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.ImageMapPlugin= {major: 1, minor: 2, revision: 2, date: new Date(2009,5,27)};
//}}}
//{{{
config.macros.imageMap = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		// image element must immediately precede macro
		var img=place.lastChild; if (!img||img.nodeName!='IMG') return;
		var map=params[0]; var items=store.getTiddlerText(map,'').split('\n----\n'); if (!items) return;
		var out=['<MAP NAME="'+map+'">'];
		var fmt='<AREA SHAPE="POLY" TIDDLER="%0" COORDS="%1" TITLE="%2" ALT="%2" ONCLICK="%3" STYLE="%4">';
		var click="story.displayTiddler(story.findContainingTiddler(this),this.getAttribute('tiddler'));";
		var style='cursor:pointer';
		for (var i=0; i<items.length; i++) {
			var lines=items[i].split('\n'); var tid=lines.shift(); var coords=lines.join('');
			var tip=store.tiddlerExists(tid)?store.getTiddler(tid).getSubtitle():tid;
			out.push(fmt.format([tid,coords,tip,click,style]));
		}
		out.push('</MAP>');
		createTiddlyElement(place,'span').innerHTML=out.join('');
		img.setAttribute('isMap',true);
		img.setAttribute('useMap','#'+map);
		img.style.border=0;
	}
}
//}}}
//{{{
config.macros.mapMaker= {
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var img=place.lastChild; // image element must immediately precede macro
		if (!img||img.nodeName!='IMG') return;
		img.onmousemove=function(ev){ ev=ev||window.event;
			var mX=!config.browser.isIE?ev.pageX:(ev.clientX+findScrollX());
			var mY=!config.browser.isIE?ev.pageY:(ev.clientY+findScrollY());
			var ta=this.nextSibling.getElementsByTagName('textarea')[0];
			var lines=ta.value.split('\n'); var last=lines.length?lines.length-1:0;
			var vals=lines[last].split(','); vals.pop(); vals.pop(); lines[last]=vals.join(',');
			lines[last]+=(lines[last].length?',':'')+(mX-findPosX(this))+','+(mY-findPosY(this));
			ta.value=lines.join('\n');
			ta.scrollTop=ta.scrollHeight-ta.offsetHeight+this.emH*2;
			ta.scrollLeft=lines[last].length*this.emW-ta.offsetWidth;
			ta.focus();
		};
		img.onmouseout=function(ev){ ev=ev||window.event;
			var ta=this.nextSibling.getElementsByTagName('textarea')[0];
			var lines=ta.value.split('\n'); var last=lines.length?lines.length-1:0;
			var vals=lines[last].split(','); vals.pop(); vals.pop(); lines[last]=vals.join(',');
			ta.value=lines.join('\n');
			ta.scrollTop=ta.scrollHeight-ta.offsetHeight+this.emH*2;
			ta.scrollLeft=lines[last].length*this.emW-ta.offsetWidth;
		};
		img.onmouseover=img.onclick=function(ev) { ev=ev||window.event;
			var mX=!config.browser.isIE?ev.pageX:(ev.clientX+findScrollX());
			var mY=!config.browser.isIE?ev.pageY:(ev.clientY+findScrollY());
			var ta=this.nextSibling.getElementsByTagName('textarea')[0];
			ta.value+=(ta.value.length?',':'')+(mX-findPosX(this))+','+(mY-findPosY(this));
			var lines=ta.value.split('\n'); var last=lines.length?lines.length-1:0;
			ta.scrollTop=ta.scrollHeight-ta.offsetHeight+this.emH*2;
			ta.scrollLeft=lines[last].length*this.emW-ta.offsetWidth;
			ta.focus();
		}
		img.style.border='1px solid #999';
		img.style.cursor='crosshair';
		var map=params[0]||'';
		var s=createTiddlyElement(place,'div');
		s.style.height=s.style.width='1em';
		img.emW=s.offsetWidth; img.emH=s.offsetHeight; // get font metrics (for auto scrolling)
		s.style.height=s.style.width='';
		s.innerHTML+='<div class="toolbar">'
			+'<a href="javascript:;" '
			+'onclick="config.macros.mapMaker.load(this.parentNode.nextSibling)">load map</a>'
			+'<a href="javascript:;" '
			+'onclick="config.macros.mapMaker.save(this.parentNode.nextSibling)">save map</a>'
			+'</div>'
			+'<textarea rows="8" style="display:block;clear:both;width:100%;" tiddler="'+map+'">'
			+store.getTiddlerText(map,'')
			+'</textarea>';
	},
	load: function(ta) {
		var tid=prompt('Enter a tiddler title:',ta.getAttribute('tiddler')||'');
		if (!tid||!tid.length) return; // cancelled by user
		ta.value=store.getTiddlerText(tid,''); ta.setAttribute('tiddler',tid);
		return false;
	},
	save: function(ta) {
		var tid=prompt('Enter a tiddler title:',ta.getAttribute('tiddler')||'NewImageMap');
		while (tid && tid.length && store.tiddlerExists(tid)) {
			if(confirm(config.messages.overwriteWarning.format([tid]))) break;
			var tid=prompt('Enter a different tiddler title:',tid);
		}
		if (!tid||!tid.length) return; // cancelled by user
		store.saveTiddler(tid,tid,ta.value,config.options.txtUserName,new Date(),['imageMap'],{});
		story.displayTiddler(null,tid);
		displayMessage('image map saved to: '+tid);
		ta.setAttribute('tiddler',tid);
		return false;
	}
}
//}}}