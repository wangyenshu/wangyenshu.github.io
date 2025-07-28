/***
|Name|QuoteOfTheDayPlugin|
|Source|http://www.TiddlyTools.com/#QuoteOfTheDayPlugin|
|Documentation|http://www.TiddlyTools.com/#QuoteOfTheDayPluginInfo|
|Version|1.4.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|Display a randomly selected "quote of the day" from a list defined in a separate tiddler|

!!!!!Documentation
>see [[QuoteOfTheDayPluginInfo]]
!!!!!Revisions
<<<
2008.03.21 [1.4.1] in showNextItem(), corrected handling for random selection so that //initial// index value will randomized correctly instead of always showing first item, even when randomizing.  Thanks to Riccardo Gherardi for finding this.
| Please see [[QuoteOfTheDayPluginInfo]] for previous revision details |
2005.10.21 [1.0.0] Initial Release.  Based on a suggestion by M.Russula
<<<
!!!!!Code
***/
//{{{
version.extensions.QuoteOfTheDayPlugin= {major: 1, minor: 4, revision: 1, date: new Date(2008,3,21)};
config.macros.QOTD = {
	clickTooltip: "click to view another item",
	timerTooltip: "auto-timer stopped...  'mouseout' to restart timer",
	timerClickTooltip: "auto-timer stopped...  click to view another item, or 'mouseout' to restart timer",
	handler:
	function(place,macroName,params) {
		var tid=params.shift(); // source tiddler containing HR-separated quotes
		var p=params.shift();
		var click=true; // allow click for next item
		var inline=false; // wrap in slider for animation effect
		var random=true; // pick an item at random (default for "quote of the day" usage)
		var folder=false; // use local filesystem folder list
		var cookie=""; // default to no cookie
		var next=0; // default to first item (or random item)
		while (p) {
			if (p.toLowerCase()=="noclick") var click=false;
			if (p.toLowerCase()=="inline") var inline=true;
			if (p.toLowerCase()=="norandom") var random=false;
			if (p.toLowerCase().substr(0,7)=="cookie:") var cookie=p.substr(8);
			if (!isNaN(p)) var delay=p;
			p=params.shift();
		}
		if ((click||delay) && !inline) {
			var panel = createTiddlyElement(null,"div",null,"sliderPanel");
			panel.style.display="none";
			place.appendChild(panel);
			var here=createTiddlyElement(panel,click?"a":"span",null,"QOTD");
		}
		else
			var here=createTiddlyElement(place,click?"a":"span",null,"QOTD");
		here.id=(new Date()).convertToYYYYMMDDHHMMSSMMM()+Math.random().toString(); // unique ID
		// get items from tiddler or file list
		var list=store.getTiddlerText(tid,"");
		if (!list||!list.length) { // not a tiddler... maybe an image directory?
			var list=this.getImageFileList(tid);
			if (!list.length) { // maybe relative path... fixup and try again
				var h=document.location.href;
				var p=getLocalPath(decodeURIComponent(h.substr(0,h.lastIndexOf("/")+1)));
				var list=this.getImageFileList(p+tid);
			}
		}
		if (!list||!list.length) return false; // no contents... nothing to display!
		here.setAttribute("list",list);
		if (delay) here.setAttribute("delay",delay);
		here.setAttribute("random",random);
		here.setAttribute("cookie",cookie);
		if (click) {
			here.title=this.clickTooltip
			if (!inline) here.style.display="block";
			here.setAttribute("href","javascript:;");
			here.onclick=function(event)
				{ config.macros.QOTD.showNextItem(this); }
		}
		if (config.options["txtQOTD_"+cookie]!=undefined) next=parseInt(config.options["txtQOTD_"+cookie]);
		here.setAttribute("nextItem",next);
		config.macros.QOTD.showNextItem(here);
		if (delay) {
			here.title=click?this.timerClickTooltip:this.timerTooltip
			here.onmouseover=function(event)
				{ clearTimeout(this.ticker); };
			here.onmouseout=function(event)
				{ this.ticker=setTimeout("config.macros.QOTD.tick('"+this.id+"')",this.getAttribute("delay")); };
			here.ticker=setTimeout("config.macros.QOTD.tick('"+here.id+"')",delay);
		}
	},
	tick: function(id) {
		var here=document.getElementById(id); if (!here) return;
		config.macros.QOTD.showNextItem(here);
		here.ticker=setTimeout("config.macros.QOTD.tick('"+id+"')",here.getAttribute("delay"));
	},
	showNextItem:
	function (here) {
		// hide containing slider panel (if any)
		var p=here.parentNode;
		if (p.className=="sliderPanel") p.style.display = "none"
		// get a new quote
		var index=here.getAttribute("nextItem"); 
		var items=here.getAttribute("list").split("\n----\n");
		if (index<0||index>=items.length) index=0;
		if (here.getAttribute("random")=="true") index=Math.floor(Math.random()*items.length);
		var txt=items[index];
		// re-render quote display element, and advance index counter
		removeChildren(here); wikify(txt,here);
		index++; here.setAttribute("nextItem",index);
		var cookie=here.getAttribute("cookie");
		if (cookie.length) {
			config.options["txtQOTD_"+cookie]=index.toString();
			saveOptionCookie("txtQOTD_"+cookie);
		}
		// redisplay slider panel (if any)
		if (p.className=="sliderPanel") {
			if(anim && config.options.chkAnimate)
				anim.startAnimating(new Slider(p,true,false,"none"));
			else p.style.display="block";
		}
	},
	getImageFileList: function(cwd) { // returns HR-separated list of image files
		function isImage(fn) {
			var ext=fn.substr(fn.length-3,3).toLowerCase();
			return ext=="jpg"||ext=="gif"||ext=="png";
		}
		var files=[];
		if (config.browser.isIE) {
			cwd=cwd.replace(/\//g,"\\");
			// IE uses ActiveX to read filesystem info
			var fso = new ActiveXObject("Scripting.FileSystemObject");
			if(!fso.FolderExists(cwd)) return [];
			var dir=fso.GetFolder(cwd);
			for(var f=new Enumerator(dir.Files); !f.atEnd(); f.moveNext())
				if (isImage(f.item().path)) files.push("[img[%0]]".format(["file:///"+f.item().path.replace(/\\/g,"/")]));
		} else {
			// FireFox (mozilla) uses "components" to read filesystem info
			// get security access
			if(!window.Components) return;
			try { netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect"); }
			catch(e) { alert(e.description?e.description:e.toString()); return []; }
			// open/validate directory
			var file=Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			try { file.initWithPath(cwd); } catch(e) { return []; }
			if (!file.exists() || !file.isDirectory()) { return []; }
			var folder=file.directoryEntries;
			while (folder.hasMoreElements()) {
				var f=folder.getNext().QueryInterface(Components.interfaces.nsILocalFile);
				if (f instanceof Components.interfaces.nsILocalFile)
					if (isImage(f.path)) files.push("[img[%0]]".format(["file:///"+f.path.replace(/\\/g,"/")]));
			}
		}
		return files.join("\n----\n");
	}
}
//}}}