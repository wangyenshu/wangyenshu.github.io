/***
|Name|LooseLinksPlugin|
|Source|http://www.TiddlyTools.com/#LooseLinksPlugin|
|Documentation|http://www.TiddlyTools.com/#LooseLinksPlugin|
|Version|1.1.2|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|case-folded/space-folded wiki words|
!!!!!Documentation
<<<
This plugin extends the TiddlyWiki core handling for tiddler links to permit use of non-WikiWord variations of mixed-case and/or added/omitted spaces within double-bracketed text with titles of //existing// tiddlers, using a 'loose' (case-folded/space-folded) comparison.  This allows text that occurs in normal prose to be more easily linked to tiddler titles by using double-brackets without the full 'pretty link' syntax.  For example:
{{{
[[CoreTweaks]], [[coreTweaks]], [[core tweaks]],
[[CORE TWEAKS]], [[CoRe TwEaKs]], [[coreTWEAKS]]
}}}
>[[CoreTweaks]], [[coreTweaks]], [[core tweaks]],
>[[CORE TWEAKS]], [[CoRe TwEaKs]], [[coreTWEAKS]]
<<<
!!!!!Configuration
<<<
<<option chkLooseLinks>> Allow case-folded and/or space-folded text to link to existing tiddler titles
"""<<option chkLooseLinks>>"""
<<<
!!!!!Revisions
<<<
2009.08.14 [1.1.2] corrected call to addNotification()
2009.08.14 [1.1.1] code cleanup
2009.08.02 [1.1.0] big performance rewrite: use cached LooseLinksMap[] instead of scanning each time
2009.01.06 [1.0.0] converted to stand-alone plugin
2008.10.14 [0.0.0] initial release (as [[CoreTweaks]] #664 - http://trac.tiddlywiki.org/ticket/664)
<<<
!!!!!Code
***/
//{{{
version.extensions.LooseLinksPlugin={major:1, minor:1, revision:2, date: new Date(2009,8,15)};

if (!config.options.chkLooseLinks)
	config.options.chkLooseLinks=false; // default to standard

if (window.caseFold_createTiddlyLink===undefined) { // only once
	window.caseFold_createTiddlyLink = window.createTiddlyLink;
	window.createTiddlyLink = function(place,title,includeText,className) {
		var btn=window.caseFold_createTiddlyLink.apply(this,arguments); // create core link
		if (!config.options.chkLooseLinks) return btn;
		if (store.getTiddlerText(title)) return btn; // matching tiddler (or shadow) exists
		var tid=window.getLooseLinksMap()[title.toLowerCase().replace(/\s/g,'')];
		if (tid) {
			var i=getTiddlyLinkInfo(tid,className);
			btn.setAttribute('tiddlyLink',tid);
			btn.title=i.subTitle;
			btn.className=i.classes;
		}
		return btn;
	}
}
window.getLooseLinksMap=function(title) {
	if (!config.options.chkLooseLinks) return {}; // disable
	if (!config.looseLinksMap) { // init/cache on demand
		config.looseLinksMap={};
		store.forEachTiddler(function(title,tiddler){
			config.looseLinksMap[title.toLowerCase().replace(/\s/g,'')]=title;
		});
	}
	if (title) config.looseLinksMap[title.toLowerCase().replace(/\s/g,'')]=title; // update
	return config.looseLinksMap;
}
store.addNotification(null,window.getLooseLinksMap); // notify
//}}}