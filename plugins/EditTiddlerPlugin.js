/***
|Name|EditTiddlerPlugin|
|Source|http://www.TiddlyTools.com/#EditTiddlerPlugin|
|Version|1.3.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|embed an 'edit' link in tiddler content to invoke edit on any specified tiddler title|
!!!!!Usage
<<<
{{{
<<editTiddler TiddlerName label>>
}}}
*''~TiddlerName''<br>the title of the tiddler to edit (omit or use the keyword 'here' for current //containing// tiddler)
*''label''<br>command link text (default="edit")
The plugin also adds ''ctrl-enter'' as a ''keyboard shortcut to start editing'' the current //selected// tiddler (the one with an active toolbar menu)
<<<
!!!!!Revisions
<<<
2009.08.15 1.3.1 in shortcut, invoke editTiddler command handler (sets focus and custom fields)
2009.08.14 1.3.0 added CTRL-ENTER keyboard shortcut to invoke edit for 'selected' tiddlers
2007.03.22 1.2.0 added 'here' keyword and optional 2nd param to specify label text
2007.03.15 1.1.1 fixed 'get tiddler ID' logic so it actually works! D'oh! 
2007.03.11 1.1.0 changed 'get tiddler ID' logic so that macro can be used outside a tiddler (i.e., in mainMenu) by specifying the ID
2006.10.04 1.0.1 invoke findContainingTiddler() as fallback when 'tiddler' param is null
2006.04.28 1.0.0 Initial release
<<<
!!!Code
***/
//{{{
version.extensions.EditTiddlerPlugin={major:1, minor:3, revision:1, date: new Date(2009,8,15)};

config.macros.editTiddler={
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var tid=params.shift(); // use specified tiddler ID (or "here")
		if (!tid || tid=="here") {
			var here=story.findContainingTiddler(place);
			if (!here) return; // not in a tiddler, do nothing
			tid=here.getAttribute('tiddler'); // get ID from tiddler element
		}
		var label="edit"; if (params[0]) label=params.shift();
		createTiddlyButton(place,label,'edit tiddler: '+tid,this.onclick).setAttribute('which',tid);
	},
	onclick: function(e) {
		story.displayTiddler(null,this.getAttribute('which'),DEFAULT_EDIT_TEMPLATE);
	}
}
//}}}
//{{{
	addEvent(document,'keypress', function(ev) { var ev=ev||window.event;
		if (!ev.ctrlKey || ev.keyCode!=13) return; // CTRL-ENTER = edit tiddler
		story.forEachTiddler(function(title,tiddler){
			if (hasClass(tiddler,'selected') && !story.isDirty(title))
				config.commands.editTiddler.handler(ev,null,title);
		});
		return false;
	});
//}}}