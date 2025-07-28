/***
|Name|AutoTaggerPlugin|
|Source|http://www.TiddlyTools.com/#AutoTaggerPlugin|
|Documentation|http://www.TiddlyTools.com/#AutoTaggerPluginInfo|
|Version|1.8.0|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|Tag tiddlers with date, author, etc. and/or scan the tiddler for any tags that are embedded in the content|
~AutoTagger ''automatically generates tag values for all newly created or edited tiddlers''
!!!!!Documentation
> see [[AutoTaggerPluginInfo]]
!!!!!Configuration
<<<
|<<option chkAutoTagAuthor>> add 'created by' author tag //(when a tiddler is first created)//||
|<<option chkAutoTagEditor>> add 'edited by' author tag //(when a tiddler is updated)//||
|<<option chkAutoTagDate>> add 'creation date' tag, using date format:|<<option txtAutoTagFormat>>|
|<<option chkAutoTagModDate>> add 'modification date' tag, using date format:|<<option txtAutoTagModFormat>>|
|<<option chkAutoTagNewTags>> add default tag(s) when creating new tiddlers:|<<option txtAutoTagNewTags>>|
|<<option chkAutoTagDefault>> add default tag(s) when saving tiddlers that are not otherwise tagged:|<<option txtAutoTagDefault>>|
|<<option chkAutoTagTrigger>> scan tiddler content for matching tags when tagged with:|<<option txtAutoTagTrigger>>|
|<<option chkAutoTagAliases>> replace 'aliased' tags using definitions contained in:|<<option txtAutoTagAliases>>|
|borderless|k
<<<
!!!!!Revisions
<<<
2010.06.30 1.8.0 in saveTiddler(), added extra checks for valid alias definitions
| Please see [[AutoTaggerPluginInfo]] for previous revision details |
2005.08.15 1.0.0 Initial Release
<<<
!!!!!Code
***/
//{{{
version.extensions.AutoTaggerPlugin= {major: 1, minor: 8, revision: 0, date: new Date(2010,6,30)};

var co=config.options; // shorthand temp variable
if (co.chkAutoTagDate==undefined) co.chkAutoTagDate=false;
if (co.chkAutoTagModDate==undefined) co.chkAutoTagModDate=false;
if (co.chkAutoTagEditor==undefined) co.chkAutoTagEditor=false;
if (co.chkAutoTagAuthor==undefined) co.chkAutoTagAuthor=false;
if (co.chkAutoTagTrigger==undefined) co.chkAutoTagTrigger=false;
if (co.txtAutoTagTrigger==undefined) co.txtAutoTagTrigger="auto";
if (co.chkAutoTagDefault==undefined) co.chkAutoTagDefault=false;
if (co.txtAutoTagDefault==undefined) co.txtAutoTagDefault="untagged";
if (co.txtAutoTagFormat==undefined) co.txtAutoTagFormat="YYYY.0MM.0DD";
if (co.txtAutoTagModFormat==undefined) co.txtAutoTagModFormat="YYYY.0MM.0DD";
if (co.chkAutoTagNewTags==undefined) co.chkAutoTagNewTags=false;
if (co.txtAutoTagNewTags==undefined) co.txtAutoTagNewTags="";
if (co.chkAutoTagAliases==undefined) co.chkAutoTagAliases=true;
if (co.txtAutoTagAliases==undefined) co.txtAutoTagAliases="AutoTaggerAliases";

// hijack displayTiddler()
Story.prototype.autotagger_displayTiddler=Story.prototype.displayTiddler;
Story.prototype.displayTiddler=function(srcElement,tiddler,template,animate,unused,customFields,toggle)
{
	var title=(tiddler instanceof Tiddler)?tiddler.title:tiddler;
        this.autotagger_displayTiddler.apply(this,arguments);
	if (!config.options.chkAutoTagNewTags) return; // IF add new tags is enabled
	if (!story.isDirty(title)) return; // AND tiddler is being edited
	if (store.tiddlerExists(title)) return; // AND tiddler doesn't exist
	var newtags=config.options.txtAutoTagNewTags.readBracketedList(); // get new tags
	for (var t=0; t<newtags.length; t++)
		story.setTiddlerTag(title,newtags[t],+1); // preload tag edit field
} 

// hijack saveTiddler()
TiddlyWiki.prototype.autotagger_SaveTiddler=TiddlyWiki.prototype.saveTiddler;
TiddlyWiki.prototype.saveTiddler=function(title,newTitle,newBody,modifier,modified,tags,fields)
{
	var co=config.options; // shorthand temp variable
	var newTags = [];
	if (tags) newTags = (typeof tags == "string") ? tags.readBracketedList() : tags;
	var txt=store.getTiddlerText(config.options.txtAutoTagAliases,'')
	if (config.options.chkAutoTagAliases && txt.length) {
		// replace tag aliases with one or more other tags
		var map={};
		var list=txt.split('\n');
		for (var i=0; i<list.length; i++) {
			var parts=list[i].split('=');
			var name=parts.shift(); var val=parts.join('=');
			if (val.length) map[name]=val.readBracketedList();
		}
		for (var a in map) if (newTags.contains(a)) {
			newTags.splice(newTags.indexOf(a),1); // remove alias
			for (var i=0; i<map[a].length; i++) // add replacements
				newTags.pushUnique(map[a][i]);
		}
	}
	var now=new Date().formatString(co.txtAutoTagFormat);
	if (co.chkAutoTagDate && (store.getTiddler(title)==undefined))
		if (newTitle!=now) newTags.pushUnique(now); // created date - don't add to journals
	if (co.chkAutoTagAuthor && (store.getTiddler(title)==undefined))
		newTags.pushUnique(co.txtUserName); // creator
	if (co.chkAutoTagEditor && store.getTiddler(title))
		newTags.pushUnique(co.txtUserName); // modifier
	if (co.chkAutoTagModDate && store.getTiddler(title))
		newTags.pushUnique(new Date().formatString(co.txtAutoTagModFormat)); // modified
	var allTags = store.getTags(); // scan content for tags
	if (co.chkAutoTagTrigger && co.txtAutoTagTrigger.length	&& newTags.contains(co.txtAutoTagTrigger))
		for (var t=0; t<allTags.length; t++) {
			if (allTags[t][0]=='systemConfig') continue; // don't add 'systemConfig'
			if ((newBody.indexOf(allTags[t][0])!=-1) || (newTitle.indexOf(allTags[t][0])!=-1))
				newTags.pushUnique(allTags[t][0]); // autotag
		}
	for (var t=0; t<newTags.length; t++)
		newTags[t]=String.encodeTiddlyLink(newTags[t]); // add brackets around tags
	if (!newTags.length && co.chkAutoTagDefault && co.txtAutoTagDefault.length)
		newTags.push(co.txtAutoTagDefault); // untagged - add default tag
	arguments[5]=newTags.join(" ");
	return this.autotagger_SaveTiddler.apply(this,arguments);
}
//}}}