/***
|Name|SwitchThemePlugin|
|Source|http://www.TiddlyTools.com/#SwitchThemePlugin|
|Documentation|http://www.TiddlyTools.com/#SwitchThemePluginInfo|
|Version|5.4.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.3|
|Type|plugin|
|Description|Select alternative TiddlyWiki template/stylesheet 'themes' from a droplist|
!!!!!Documentation
>see [[SwitchThemePluginInfo]]
!!!!!Configuration
<<<
Current theme:<<switchTheme width:auto>>
<<option chkRandomTheme>> select a random theme at startup
//Note: to prevent a given theme from being chosen at random, tag it with <<tag excludeTheme>>//
<<<
!!!!!Installation Note
>As of 4/13/2008, a "core patch" function that provides backward-compatibility with TW2.3.x has been split into a separate tiddler, [[SwitchThemePluginPatch]], to reduce installation overhead for //this// plugin.  ''You should only install the patch tiddler when using this plugin in documents based on a core version prior to TW2.4.0''
!!!!!Revisions
<<<
2009.10.01 [5.4.1] changed 'noRandom' tag to 'excludeTheme' and recognize 'excludeLists' tag
| Please see [[SwitchThemePluginInfo]] for previous revision details |
2008.01.22 [5.0.0] Completely re-written and renamed from [[SelectStylesheetPlugin]] (now retired)
//history for retired SelectStylesheetPlugin omitted//
2005.07.20 [1.0.0] initial release (as SelectStylesheetPlugin)
<<<
!!!!!Code
***/
//{{{
version.extensions.SwitchThemePlugin= {major: 5, minor: 4, revision: 1, date: new Date(2009,10,1)};

config.macros.switchTheme = {
	handler: function(place,macroName,params) {
		setStylesheet(".switchTheme {width:100%;font-size:8pt;margin:0em}","switchThemePlugin");
		if (params[0] && (params[0].substr(0,6)=="width:"))	var width=(params.shift()).substr(6);
		if (params[0] && (params[0].substr(0,6)=="label:"))	var label=(params.shift()).substr(6);
		if (params[0] && (params[0].substr(0,7)=="prompt:"))	var prompt=(params.shift()).substr(7);
		if (params[0] && params[0].trim().length) // create a link that sets a specific theme
			createTiddlyButton(place,label?label:params[0],prompt?prompt:params[0],
				function(){ config.macros.switchTheme.set(params[0]); return false;});
		else { // create a select list of available themes
			var theList=createTiddlyElement(place,"select",null,"switchTheme",null);
			theList.size=1;
			if (width) theList.style.width=width;
			theList.onchange=function() { config.macros.switchTheme.set(this.value); return true; };
			this.refresh(theList);
		}
	},
	refresh: function(list) {
		var indent = String.fromCharCode(160)+String.fromCharCode(160);
		while(list.length > 0){list.options[0]=null;} // clear list
		list.options[list.length] = new Option("select a theme:","",true,true);
		list.options[list.length] = new Option(indent+"[default]","StyleSheet");
		list.options[list.length] = new Option(indent+"[random]","*");
		var themes=store.getTaggedTiddlers("systemTheme");
		for (var i=0; i<themes.length; i++)
			if (themes[i].title!="StyleSheet" && !themes[i].isTagged('excludeLists'))
				list.options[list.length]=new Option(indent+themes[i].title,themes[i].title);
		// show current selection
		for (var t=0; t<list.options.length; t++)
			if (list.options[t].value==config.options.txtTheme)
				{ list.selectedIndex=t; break; }
	},
	set: function(theme) {
		if (!theme||!theme.trim().length) return;
		if (theme=="*") { // select a random theme (except themes with "excludeTheme")
			var curr=config.options.txtTheme;
			var themes=store.getTaggedTiddlers("systemTheme");
			if (!themes.length) return false;
			var which=Math.floor(Math.random()*themes.length);
			while (themes[which].title==curr
				||themes[which].tags.contains('excludeTheme','excludeLists'))
					which=Math.floor(Math.random()*themes.length);
			theme=themes[which].title;
		}
		// apply selected theme
		story.switchTheme(theme);
		// sync theme droplists
		var elems=document.getElementsByTagName("select");
		var lists=[]; for (var i=0; i<elems.length; i++)
			if (hasClass(elems[i],"switchTheme")) lists.push(elems[i]);
		for (var k=0; k<lists.length; k++)
			for (var t=0; t<lists[k].options.length; t++)
				if (lists[k].options[t].value==config.options.txtTheme)
					{ lists[k].selectedIndex=t; break; }
		return;
	}
}
//}}}
// // option to select a random theme at startup (if enabled)
//{{{
if (config.options.chkRandomTheme===undefined)
	config.options.chkRandomTheme=false;
if (config.options.chkRandomTheme)
	config.macros.switchTheme.set("*");
//}}}
// // hijack switchTheme to add Check/Init/Reset code handlers
//{{{
if (Story.prototype.switchTheme_saved===undefined) { // only once
Story.prototype.switchTheme_saved=Story.prototype.switchTheme;
Story.prototype.switchTheme=function(t){
	function run(t,s){
		var f=store.getTiddlerText(store.getTiddlerSlice(t,s));
		return f?eval('(function(){\n'+f+'\n})()'):false;
	}
	if (!startingUp && (run(config.options.txtTheme,'Reset')||run(t,'Check'))) return;
	this.switchTheme_saved.apply(this,arguments);
	run(t,'Init');
}
}
//}}}