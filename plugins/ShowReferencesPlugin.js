/***
|Name|[[ShowReferencesPlugin]]|
|Source|http://www.TiddlyTools.com/#ShowReferencesPlugin|
|Version|2.0.0|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|format and display references to the current tiddler|
!!!!!Documenatation
>see [[ShowReferencesPluginInfo]]
!!!!!Revisions
<<<
2011.03.01 2.0.0 converted to plugin and added optional TiddlerName and message params
| Please see [[ShowReferencesPluginInfo]] for previous revision details |
2006.09.04 1.0.0 original release (transclusion)
<<<
!!!!!Code
***/
//{{{
version.extensions.ShowReferencesPlugin =
	{ major:2, minor:0, revision:0, date:new Date(2011,3,1) };
config.macros.showReferences = {
	defaultFormat: '[[%0]]\n',
	fallbackMsg: 'no references',
	init: function() {
		config.shadowTiddlers.ShowReferences =
			'<<showReferences "$1" [[$2]] "$3">>';
		config.annotations.ShowReferences =
			'created by ShowReferencesPlugin';
	},
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var here=story.findContainingTiddler(place);
		var tid=here?here.getAttribute('tiddler'):'';
		var fmt=params[0];	if (!fmt||fmt=='$1')	 fmt	=this.defaultFormat;
		var title=params[1];	if (!title||title=='$2') title	=tid;
		var msg=params[2];	if (!msg||msg=='$3')	 msg	=this.fallbackMsg;
		var refs=store.getReferringTiddlers(title);
		var out='';
		fmt=fmt.unescapeLineBreaks();
		for(var r=0; r<refs.length; r++)
			if(refs[r].title!=title && !refs[r].isTagged('excludeLists'))
				out+=fmt.format([refs[r].title]);
		wikify(out.length?out:msg,place);
	}
}
//}}}