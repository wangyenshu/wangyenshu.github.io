/***
|Name|TaggedTemplateTweak|
|Source|http://www.TiddlyTools.com/#TaggedTemplateTweak|
|Documentation|http://www.TiddlyTools.com/#TaggedTemplateTweakInfo|
|Version|1.6.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|use alternative ViewTemplate/EditTemplate for specific tiddlers|
This plugin extends the core function, story.chooseTemplateForTiddler(), so that any given tiddler can be viewed and/or edited using alternatives to the standard tiddler templates.
!!!!!Documentation
>see [[TaggedTemplateTweakInfo]]
!!!!!Revisions
<<<
2009.09.02 [1.6.1] apply field-based template (if any) *before* tag-based template
| please see [[TaggedTemplateTweakInfo]] for previous revision details |
2007.06.11 [1.0.0] initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.TaggedTemplateTweak= {major: 1, minor: 6, revision: 1, date: new Date(2009,9,2)};

if (!config.options.txtTemplateTweakFieldname)	
	config.options.txtTemplateTweakFieldname='template';

Story.prototype.taggedTemplate_chooseTemplateForTiddler = Story.prototype.chooseTemplateForTiddler
Story.prototype.chooseTemplateForTiddler = function(title,template)
{
	// get core template and split into theme and template name
	var coreTemplate=this.taggedTemplate_chooseTemplateForTiddler.apply(this,arguments);
	var theme=""; var template=coreTemplate;
	var parts=template.split(config.textPrimitives.sectionSeparator);
	if (parts[1]) { theme=parts[0]; template=parts[1]; }
	else theme=config.options.txtTheme||""; // if theme is not specified
	theme+=config.textPrimitives.sectionSeparator;

	// look for template using title as prefix
	if (!store.getTaggedTiddlers(title).length) { // if tiddler is not a tag
		if (store.getTiddlerText(theme+title+template))
			{ return theme+title+template; } // theme##TitleTemplate
		if (store.getTiddlerText(title+template))
			{ return title+template; }	 // TitleTemplate
	}

	// look for templates using custom field value as prefix
	var v=store.getValue(title,config.options.txtTemplateTweakFieldname);
	if (store.getTiddlerText(theme+v+template))
		{ return theme+v+template; }	// theme##valueTemplate
	if (store.getTiddlerText(v+template))
		{ return v+template; }		// valueTemplate

	// look for template using tags as prefix
	var tiddler=store.getTiddler(title);
	if (!tiddler) return coreTemplate; // tiddler doesn't exist... use core result
	for (i=0; i<tiddler.tags.length; i++) {
		var t=tiddler.tags[i]+template; // add tag prefix to template
		var c=t.substr(0,1).toUpperCase()+t.substr(1); // capitalized for WikiWord title
		if (store.getTiddlerText(theme+t))	{ return theme+t; } // theme##tagTemplate
		if (store.getTiddlerText(theme+c))	{ return theme+c; } // theme##TagTemplate
		if (store.getTiddlerText(t)) 		{ return t; }	    // tagTemplate
		if (store.getTiddlerText(c))		{ return c; }	    // TagTemplate
	}
	
	// no match... use core result
	return coreTemplate;
}
//}}}