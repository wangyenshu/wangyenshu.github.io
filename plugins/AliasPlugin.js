/***
|Name|AliasPlugin|
|Source|http://www.TiddlyTools.com/#AliasPlugin|
|Documentation|http://www.TiddlyTools.com/#AliasPluginInfo|
|Version|1.1.2|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|Create text-substitution macros|
Define macros for abbreviations and other "aliases", and then embed them in the rest of your tiddler content to quickly insert common terms, phrases and links without a lot of repetitive typing.
!!!!!Documentation
> see [[AliasPluginInfo]]
!!!!!Revisions
<<<
2012.08.10 1.2.0 handle backslash quoting to allow direct use of macro calls in aliases
2009.09.09 1.1.1 'tiddler' arg passed to wikify() so aliases containing macros render with correct context
| Please see [[AliasPluginInfo]] for previous revision details |
2005.08.12 1.0.0 initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.AliasPlugin= {major: 1, minor: 2, revision: 0, date: new Date(2012,8,10)};
config.macros.alias= { };
config.macros.alias.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var alias=params.shift(); if (!alias) return; alias=alias.replace(/ /g,"_"); // don't allow spaces in alias
	if (config.macros[alias]==undefined) { // create new macro (as needed)
		config.macros[alias] = { };
		config.macros[alias].handler =
			function (place,macroName,params,wikifier,paramString,tiddler)
				{ wikify(config.macros[macroName].text.format(params),place,null,tiddler); }
	}
	var t=(params[0]?params.join(' '):alias); // construct paramstring
	t=t.replace(/\\n/g,'\n').replace(/\\t/g,'\t').replace(/\\([<>])/g,'$1'); // fixup escaped chars
	config.macros[alias].text = t; // set alias text
}
//}}}