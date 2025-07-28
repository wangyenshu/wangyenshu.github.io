/***
|Name|MissingTiddlersPlugin|
|Source|http://www.TiddlyTools.com/#MissingTiddlersPlugin|
|Documentation|http://www.TiddlyTools.com/#MissingTiddlersPluginInfo|
|Version|1.2.0|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|define fallback content for missing tiddlers|
!!!Documentation
>see [[MissingTiddlersPluginInfo]]
!!!Revisions
<<<
2009.10.11 1.2.0 strip leading/trailing 'pre' formatting from fallback content
| Please see [[MissingTiddlersPluginInfo]] for previous revision details |
2009.01.20 1.0.0 initial release
<<<
!!!Code
***/
//{{{
version.extensions.MissingTiddlersPlugin={major: 1, minor: 2, revision: 0, date: new Date(2009,10,11)};

config.views.wikified.defaultText
	='<<missingTiddler [[%0]] MissingTiddlersList MissingTiddler>>';

config.shadowTiddlers.MissingTiddler
	="The tiddler '$1' does not exist. Double-click to create it.";

config.macros.missingTiddler = { 
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var title=params[0]||'';
		var tid=params[1]||'MissingTiddlersList';
		var t=store.getTiddlerText(tid,'');
		var out=store.getTiddlerText(params[2]||'MissingTiddler','');
		var list=[]; var p=/(?:^|\n)!{1,6}([^\n]*)\n/gm;
		do { var m=p.exec(t); if (m) { if (m[1]!='end') list.push(m[1]); } } while(m);
		for (var i=0; i<list.length; i++) if (title.match(new RegExp(list[i])))
			{ out=store.getTiddlerText(tid+'##'+list[i]).trim(); break; }
		out=out.replace(/^\{\{\{\n/,'').replace(/\n\}\}\}$/,'').replace(/\$1/g,title);
		wikify(out,place);
	}
}
//}}}