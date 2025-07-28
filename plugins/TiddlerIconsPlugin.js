/***
|Name|TiddlerIconsPlugin|
|Source|http://www.TiddlyTools.com/#TiddlerIconsPlugin|
|Version|2.1.0|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|display icons next to tiddler title, based on tiddler's attributes (tags, fields, slices, etc)|
!!!!!Usage
<<<
{{{<<tiddlerIcons>>}}} - shows icons for the current tiddler
or
{{{<<tiddlerIcons =TiddlerName>>}}} - shows icons for the specified tiddler
or
{{{<<tiddlerIcons iconID>>}}} - shows a specific icon
<<<
!!!!!Examples
<<<
{{{
icons for current tiddler: <<tiddlerIcons>>
}}}
icons for current tiddler: <<tiddlerIcons>>
{{{
icons for [[Welcome]] tiddler: <<tiddlerIcons =Welcome>>
}}}
icons for [[Welcome]] tiddler: <<tiddlerIcons =Welcome>>
{{{
All icons:
<<tiddlerIcons recent>> <<tiddlerIcons changed>> <<tiddlerIcons unsaved>> <<tiddlerIcons Trash>>
<<tiddlerIcons tag>> <<tiddlerIcons core>> <<tiddlerIcons systemConfig>> <<tiddlerIcons CSS>>
<<tiddlerIcons html>> <<tiddlerIcons template>> <<tiddlerIcons script>> <<tiddlerIcons attachment>>
<<tiddlerIcons settings>> <<tiddlerIcons pluginInfo>> <<tiddlerIcons faq>> <<tiddlerIcons task>>
}}}
All icons:
<<tiddlerIcons recent>> <<tiddlerIcons changed>> <<tiddlerIcons unsaved>> <<tiddlerIcons Trash>> <<tiddlerIcons tag>> <<tiddlerIcons core>> <<tiddlerIcons systemConfig>> <<tiddlerIcons CSS>> <<tiddlerIcons html>> <<tiddlerIcons template>> <<tiddlerIcons script>> <<tiddlerIcons attachment>> <<tiddlerIcons settings>> <<tiddlerIcons pluginInfo>> <<tiddlerIcons faq>> <<tiddlerIcons task>>
<<<
!!!!!Configuration
<<<
You can add extra icons definitions based on matching tag values.  First, import or create a tiddler called [[TiddlerIconsPluginConfig]] and tag it with<<tag systemConfig>>.  Then, in that tiddler, use the following code format to //merge// your additional icon definitions into the default {{{config.macros.tiddlerIcons.map}}} object.
{{{
merge(config.macros.tiddlerIcons.map,{
	tagvalue: ["tooltip","imagefile"],
	tagvalue: ["tooltip","imagefile"],
	...
	tagvalue: ["tooltip","imagefile"]   // note: no comma after last definition
}
}}}
<<<
!!!!!Revisions
<<<
2008.10.02 [2.1.0] added "=TiddlerName" param (shows icons for specified tiddler)
2007.08.01 [2.0.0] converted from inline script
2007.05.28 [1.0.0] initial release (as inline script)
<<<
!!!!!Code
***/
//{{{
version.extensions.TiddlerIconsPlugin= {major: 2, minor: 1, revision: 0, date: new Date(2008,10,2)};
config.macros.tiddlerIcons = {
	unknown: "unknown tiddler icon: %0",
	map: {
		recent: ["this tiddler was UPDATED within the last 10 days","asterisk_yellow.png"],
		changed: ["this tiddler was UPDATED after your last visit","star.png"],
		unsaved: ["this tiddler has UNSAVED CHANGES","exclamation.png"],
		tag: ["this is a TAG tiddler","tag_blue.png"],
		html: ["this is an HTML MARKUP tiddler","html.png"]
	},
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var img="[img[%0|%1]]";
		var imgs=[]; // collected set of applicable images
		var p=params[0]; // abbrev

		// if icon keyword was supplied, just show one icon and exit.
		if (p&&p.substr(0,1)!="=") {
			wikify(this.map[p]?img.format(this.map[p]):this.unknown.format([p]),place);
			return;
		}

		// if TiddlerName was supplied, use that tiddler, otherwise use current tiddler
		var here=story.findContainingTiddler(place);
		if (!p && !here) return; // not in a tiddler
		var title=p?p.substr(1):here.getAttribute('tiddler');
		var tid=store.getTiddler(title); if (!tid) return; // tiddler not found

		// add 'tag' icon if this tiddler IS a tag
		var tags=store.getTags();
		for (i=0;i<tags.length;i++) if (tags[i][0]==title) imgs.push(img.format(this.map["tag"]));
		if (!tid) { wikify(imgs.join(""),place); return; }

		// add 'unsaved', 'changed', or 'recent' icon based on tiddler vs. document date
		// (uses config.options.lastSaved, updated by [[UnsavedChangesPlugin]])
		if (tid.modified > (config.options.lastSaved?config.options.lastSaved:document.lastModified))
			imgs.push(img.format(this.map["unsaved"]));
		else {
			// add 'changed' icon if tiddler has been modified since last visit
			// (uses config.lastVisit, updated by [[VisitCounterPlugin]])
			// truncate seconds from last visit timestamp for comparison with tiddler modification timestamp
			if (config.lastVisit)
				var last=new Date((new Date(config.lastVisit).getTime())-(new Date(config.lastVisit).getSeconds()*1000));
			if (tid.modified >= last)
				imgs.push(img.format(this.map["changed"]));
			else if (tid.modified >= (new Date()).getTime()-86400000*10)
				imgs.push(img.format(this.map["recent"])); // add 'recent' icon if tiddler has been modified in last 10 days
		}
		if (title.substr(0,6)=="Markup")
			imgs.push(img.format(this.map["html"]));

		// add 'type' icons based on tag(s)... see TiddlerIconsPluginConfig for icon map definitions
		// sort tags for consistent icon display order 
		var tags=[]; for (i=0;i<tid.tags.length;i++) tags.push(tid.tags[i]); tags.sort();
		for (var t=0; t<tags.length; t++)
			if (this.map[tags[t]]) imgs.push(img.format(this.map[tags[t]]));
		wikify(imgs.join(""),place);
	}
};
//}}}