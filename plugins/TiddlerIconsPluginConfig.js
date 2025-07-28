/***
|Name|TiddlerIconsPluginConfig|
|Source|http://www.TiddlyTools.com/#TiddlerIconsPluginConfig|
|Version|2.0.0|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Requires|TiddlerIconsPlugin|
|Description|configure additional icons for TiddlerIconsPlugin, based on containing tiddler's tags|

!!!!!Usage
<<<
This plugin configuration tiddler can be used to add extra icon definitions, based on matching tag values, using the following code format:
{{{
merge(config.macros.tiddlerIcons.map, {
	tagvalue: ["tooltip","imagefile"],
	tagvalue: ["tooltip","imagefile"],
	...
	tagvalue: ["tooltip","imagefile"]   // note: no comma after last definition
}
}}}
<<<
!!!!!Revisions
<<<
2007.08.01 [2.0.0] converted from inline script
<<<
!!!!!Code
***/
//{{{
merge(config.macros.tiddlerIcons.map, {
	Trash: ["this tiddler has been tagged as TRASH","delete.png"],
	core: ["this is a CUSTOMIZED TiddlyWiki core tiddler","application_add.png"],
	systemConfig: ["this is a PLUGIN tiddler","cog.png"],
	CSS: ["this is a CSS STYLESHEET tiddler","css.png"],
	template: ["this is a TiddlyWiki layout TEMPLATE","layout.png"],
	script: ["this is an INLINE SCRIPT tiddler","script_code.png"],
	attachment: ["this is a binary file ATTACHMENT","disk.png"],
	settings: ["this tiddler contains SETTINGS or DATA used by plugins or core features","wrench.png"],
	pluginInfo: ["this tiddler contains PLUGIN DOCUMENTATION","information.png"],
	TiddlyTools: ["this tiddler contains TIDDLYTOOLS INFORMATION","information.png"],
	faq: ["this tiddler contains a FAQ/HOW-TO article","help.png"],
	bookmark: ["this tiddler contains a BOOKMARK URL","page_link.png"],
	task: ["this is a TASK tiddler","tick.png"]
});
//}}}