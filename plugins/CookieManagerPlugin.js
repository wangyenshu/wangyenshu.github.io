/***
|Name|CookieManagerPlugin|
|Source|http://www.TiddlyTools.com/#CookieManagerPlugin|
|Version|2.4.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|view/add/delete browser-based cookies and "bake" cookies to CookieJar tiddler for 'sticky' settings|
!!!!!Usage
<<<
This plugin provides an interactive control panel that lets you select, view, modify, or delete any of the current values for TiddlyWiki options that have been stored as local, private, //browser cookies//.  You can also use the control panel to "bake cookies", which generates a set of javascript statements that assign hard-coded option values to the TiddlyWiki internal variables that correspond to the current browser cookie settings.  These hard-coded values are then stored in the [[CookieJar]] tiddler, which is tagged with<<tag systemConfig>> so that each time the document is loaded, the baked cookie settings will be automatically applied.

When a set of baked cookies is added to the [[CookieJar]], it is automatically surrounded by a conditional test so that the hard-coded settings will only be applied for the username that was in effect when they were initially generated.  In this way, if you publish or share your document with others, //your// particular baked cookie settings are not automatically applied to others, so that their own browser-based cookie settings (if defined) will be applied as usual.

Whenever you "bake cookies", new hard-coded javascript assignment statements are *appended* to the end of the [[CookieJar]].  However, any baked cookies that were previously generated and stored in the [[CookieJar]] are not automatically removed from the tiddler.  As a result, because the most recently baked cookie settings in the [[CookieJar]] are always the last to be processed, the values assigned by older baked cookies are immediately overridden by the values from the newest baked cookies, so that the newest values will be in effect when the CookieJar startup processing is completed.

Each time you bake a new batch of cookies, it is recommended that you should review and hand-edit the [[CookieJar]] to remove any "stale cookies" or merge the old and new sets of baked cookies into a single block to simplify readability (as well as saving a little tiddler storage space).  Of course, you can also hand-edit the [[CookieJar]] tiddler at any time simply to remove a few individual //baked cookies// if they are no longer needed, and you can even delete the entire [[CookieJar]] tiddler and start fresh, if that is appropriate.  Please note that changing or deleting a baked cookie does not alter the current value of the corresponding option setting, and any changes you make to the [[CookieJar]] will only be applied after you have saved and reloaded the document in your browser.
<<<
!!!!!Examples
<<<
{{{<<cookieManager>>}}}
{{smallform small center{
@@display:block;width:35em;<<cookieManager>>@@}}}
<<<
!!!!!Configuration
<<<
<<option chkAllowBrowserCookies>> store ~TiddlyWiki option settings using private browser cookies
<<option chkMonitorBrowserCookies>> monitor browser cookie activity (show a message whenever a cookie is set or deleted)
<<option chkCookieManagerAddToAdvancedOptions>> display [[CookieManager]] in [[AdvancedOptions]]
//note: this setting does not take effect until you reload the document//
<<<
!!!!!Revisions
<<<
2011.01.16 2.4.1 in init(), corrected double addition of CookieManager to backstage
2009.08.05 2.4.0 changed CookieJar output format to support odd symbols in option names (e.g. '@')
2008.09.14 2.3.2 fixed handling for blocked cookies (was still allowing some blocked cookies to be set)
2008.09.12 2.3.1 added blocked[] array and allowBrowserCookie() test function for selective blocking of changes to browser cookies based on cookie name
2008.09.08 2.3.0 extensive code cleanup: defined removeCookie(), renamed cookies, added 'button' param for stand-alone "bake cookies" button, improved init of shadow [[CookieManager]] and [[CookieJar]] tiddlers for compatibility with new [[CookieSaverPlugin]]. 
2008.07.11 2.2.1 fixed recursion error in hijack for saveOptionCookie()
2008.06.26 2.2.0 added chkCookieManagerNoNewCookies option
2008.06.05 2.1.3 replaced hard-coded definition for "CookieJar" title with option variable
2008.05.12 2.1.2 add "cookies" task to backstage (moved from BackstageTasks)
2008.04.09 2.1.0 added options: chkCookieManagerAddToAdvancedOptions
2008.04.08 2.0.1 automatically include CookieManager control panel in AdvancedOptions shadow tiddler
2007.08.02 2.0.0 converted from inline script
2007.04.29 1.0.0 initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.CookieManagerPlugin= {major: 2, minor: 4, revision: 1, date: new Date(2011,1,16)};
//}}}
//{{{
config.macros.cookieManager = {
	target:
		config.options.txtCookieJar||"CookieJar",
	blockedCookies:
		[],
	allowBrowserCookie: function(name) {
		return true;
	},
	displayStatus: function(msg) {
		if (config.options.chkMonitorBrowserCookies && !startingUp)
			displayMessage("CookieManager: "+msg);
	},
	init: function() {
		if (config.options.txtCookieJar===undefined)
			config.options.txtCookieJar=this.target;
		if (config.options.chkAllowBrowserCookies===undefined)
			config.options.chkAllowBrowserCookies=true;
		if (config.options.chkMonitorBrowserCookies===undefined)
			config.options.chkMonitorBrowserCookies=false;

		config.shadowTiddlers.CookieManager=
			 "/***\n"
			+"!!![[Browser cookies:|CookieManagerPlugin]] "
			+"{{fine{<<option chkAllowBrowserCookies>>enable <<option chkMonitorBrowserCookies>>monitor}}}\n"
			+"^^Review, modify, or delete browser cookies..."
			+"To block specific cookies, see [[CookieManagerPluginConfig]].^^\n"
			+"@@display:block;width:30em;{{smallform small{\n<<cookieManager>>}}}@@\n"
			+"***/\n";

		// add CookieManager to shadow CookieJar
		var h="/***\n<<tiddler CookieManager>>\n***/\n";
		var t=(config.shadowTiddlers[this.target]||"").replace(new RegExp(h.replace(/\*/g,'\\*'),''),'')
		config.shadowTiddlers[this.target]=h+t;

		if (config.options.chkCookieManagerAddToAdvancedOptions===undefined)
			config.options.chkCookieManagerAddToAdvancedOptions=true;
		if (config.options.chkCookieManagerAddToAdvancedOptions)
			config.shadowTiddlers.AdvancedOptions+="\n!!CookieManager\n><<tiddler CookieManager>>";

		// add "cookies" backstage task
		if (config.tasks && !config.tasks.cookies) { // for TW2.2b3 or above
			config.tasks.cookies = {
				text: "cookies",
				tooltip: "manage cookie-based option settings",
				content: "{{groupbox{<<tiddler [["+this.target+"]]>>}}}"
			}
			config.backstageTasks.push("cookies");
		}
	},
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var span=createTiddlyElement(place,"span");
		span.innerHTML=(params[0]&&params[0].toLowerCase()=="button")?this.button:this.panel;
		this.setList(span.firstChild.list);
	},
	panel: '<form style="display:inline;margin:0;padding:0" onsubmit="return false"><!--\
		--><select style="width:99%" name="list" \
			onchange="this.form.val.value=this.value.length?config.options[this.value]:\'\';"><!--\
		--></select><br>\
		<input type="text" style="width:98%;margin:0;" name="val" title="enter an option value"><br>\
		<input type="button" style="width:33%;margin:0;" value="get" title="refresh list" \
			onclick="config.macros.cookieManager.setList(this.form.list);"><!--\
		--><input type="button" style="width:33%;margin:0;" value="set" title="save cookie value" \
			onclick="var cmc=config.macros.cookieManager;\
				var opt=this.form.list.value; var v=this.form.val.value; \
				var msg=opt+\' is a blocked cookie.  OK to proceed?\';\
				if ((!cmc.blockedCookies.contains(opt) && cmc.allowBrowserCookie(opt))||confirm(msg)) {\
					config.options[opt]=opt.substr(0,3)==\'txt\'?v:(v.toLowerCase()==\'true\'); \
					saveOptionCookie(opt);config.macros.cookieManager.setList(this.form.list);\
				}"><!--\
		--><input type="button" style="width:33%;margin:0;" value="del" title="remove cookie" \
			onclick="var cmc=config.macros.cookieManager; var opt=this.form.list.value; \
				var msg=opt+\' is a blocked cookie.  OK to proceed?\';\
				if ((!cmc.blockedCookies.contains(opt) && cmc.allowBrowserCookie(opt))||confirm(msg)) {\
					removeCookie(this.form.list.value,true); \
					cmc.setList(this.form.list);\
				}"><br>\
		<input type="button" style="width:50%;margin:0;" value="bake cookies" \
			title="save current cookie-based option values into a tiddler" \
			onclick="return config.macros.cookieManager.bake(this,false)"><!--\
		--><input type="button" style="width:50%;margin:0;" value="bake all options" \
			title="save ALL option values (including NON-COOKIE values) into a tiddler" \
			onclick="return config.macros.cookieManager.bake(this,true)"><!--\
		--></form>\
	',
	button: '<form style="display:inline;margin:0;padding:0" onsubmit="return false"><!--\
		--><input type="button" style="margin:0;" value="bake cookies" \
			title="save current browser-based cookie values into a tiddler" \
			onclick="return config.macros.cookieManager.bake(this,false)"><!--\
		--></form>\
	',
	getCookieList: function() {
		var cookies = { };
		if (document.cookie != "") {
			var p = document.cookie.split("; ");
			for (var i=0; i < p.length; i++) {
				var pos=p[i].indexOf("=");
				if (pos==-1) cookies[p[i]]="";
				else cookies[p[i].substr(0,pos)]=unescape(p[i].slice(pos+1));
			}
		}
		var opt=new Array(); for (var i in config.options) if (cookies[i]) opt.push(i); opt.sort();
		return opt;
	},
	setList: function(list) {
		if (!list) return false;
		var opt=this.getCookieList();
		var sel=list.selectedIndex;
		while (list.options.length > 1) { list.options[1]=null; } // clear list (except for header item)
		list.options[0]=new Option("There are "+opt.length+" cookies...","",false,false);
		if (!opt.length) { list.form.val.value=""; return; } // no cookies
		var c=1;
		for(var i=0; i<opt.length; i++) {
			var txt="";
			if  (opt[i].substr(0,3)=="chk")
				txt+="["+(config.options[opt[i]]?"\u221A":"_")+"] ";
			txt+=opt[i];
			list.options[c++]=new Option(txt,opt[i],false,false);
		}
		list.selectedIndex=sel>0?sel:0;
		list.form.val.value=sel>0?config.options[list.options[sel].value]:"";
	},
	header:
		"/***\n"
		+"!!![[Baked cookies:|CookieManagerPlugin]]\n"
		+"^^Press {{smallform{<<cookieManager button>>}}} to save the current browser cookies... "
		+"then hand-edit this section to customize the results.^^\n"
		+"***/\n",
	format: function(name) {
		if (name.substr(0,3)=='chk')
			return '\tconfig.options["'+name+'"]='+(config.options[name]?'true;':'false;');
		return '\tconfig.options["'+name+'"]="'+config.options[name]+'";';
	},
	bake: function(here,all) {
		if (story.isDirty(this.target)) return false; // target is being hand-edited... do nothing
		var text=store.getTiddlerText(this.target);
		if (text.indexOf(this.header)==-1) {
			text+=this.header;
			displayMessage("CookieManager: added 'Baked Cookies' section to CookieJar");
		}
		var who=config.options.txtUserName;
		var when=new Date();
		var tags=['systemConfig'];
		var tid=store.getTiddler(this.target)||store.saveTiddler(this.target,this.target,text,who,when,tags,{});
		if (!tid) return false; // if no target... do nothing
		if (all) { 
			var opts=new Array();
			for (var i in config.options) if (i.substr(0,3)=='chk'||i.substr(0,3)=='txt') opts.push(i);
			opts.sort();
		}
		else var opts=this.getCookieList();
		var t=tid.text;
		if (t.indexOf(this.header)==-1) t+=this.header;
		t+='\n// '+opts.length+(all?' options':' cookies')+' saved ';
		t+=when.formatString('on DDD, MMM DDth YYYY at 0hh:0mm:0ss');
		t+=' by '+who+'//\n';
		t+='//^^(edit/remove username check and/or individual option settings as desired)^^//\n';
		t+='//{{{\n';
		t+='if (config.options.txtUserName=="'+who+'") {\n';
		for (i=0; i<opts.length; i++) t+=config.macros.cookieManager.format(opts[i])+"\n";
		t+='}\n//}}}\n';
		store.saveTiddler(this.target,this.target,t,who,when,tags,tid?tid.fields:{});
		story.displayTiddler(story.findContainingTiddler(this),this.target);
		story.refreshTiddler(this.target,null,true);
		var msg=opts.length+(all?' options':' cookies')+' have been saved in '+this.target+'.  ';
		msg+='Please review all stored settings.';
		displayMessage(msg);
		return false;
	}
}
//}}}
//{{{
// Hijack saveOptionCookie() to add cookie blocking and monitoring messages
config.macros.cookieManager.saveOptionCookie=saveOptionCookie;
window.saveOptionCookie=function(name,force)
{
	var cmc=config.macros.cookieManager; // abbrev
	if (force || ((config.options.chkAllowBrowserCookies || name=="chkAllowBrowserCookies")
		&& !cmc.blockedCookies.contains(name) && cmc.allowBrowserCookie(name))) {
		cmc.saveOptionCookie.apply(this,arguments);
		cmc.displayStatus(name+"="+config.options[name]);
	} else cmc.displayStatus("setting of '"+name+"' is blocked");
}

// if removeCookie() function is not defined by TW core, define it here.
if (window.removeCookie===undefined) {
	window.removeCookie=function(name) {
		document.cookie = name+'=; expires=Thu, 01-Jan-1970 00:00:01 UTC; path=/;'; 
	}
}

// ... and then hijack it to add cookie blocking and monitoring messages
config.macros.cookieManager.removeCookie=removeCookie;
window.removeCookie=function(name,force)
{
	var cmc=config.macros.cookieManager; // abbrev
	if (!cmc.getCookieList().contains(name))
		return; // not a current cookie!
	if (force || ((config.options.chkAllowBrowserCookies || name=="chkAllowBrowserCookies")
		&& !cmc.blockedCookies.contains(name) && cmc.allowBrowserCookie(name))) {
		cmc.removeCookie.apply(this,arguments);
		cmc.displayStatus("deleted "+name);
	} else cmc.displayStatus("deletion of '"+name+"' is blocked");
}
//}}}