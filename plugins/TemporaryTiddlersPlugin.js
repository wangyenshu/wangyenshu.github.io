/***
|Name|TemporaryTiddlersPlugin|
|Source|http://www.TiddlyTools.com/#TemporaryTiddlersPlugin|
|Version|1.1.2|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|blocks tiddlers tagged with "temporary" from being saved into the TW file|
!!!!!Usage
<<<
When the TW document is saved (either to local disk or remote URL), any tiddlers tagged with "temporary" will be skipped over, so that they are not written to the file.  To keep a temporary tiddler, simply edit it and remove the tag before saving the file.  This feature can be combined with various plugins that can automatically create new tiddlers, such as [[SearchOptionsPlugin]] ([[SearchResults]]) and [[ImportTiddlersPlugin]] ([[ImportedTiddlers]]) so that these transient results are not retained when you save you document.

You can also use this tag with the {{{<<loadTiddlers>>}}} macro and the //auto-tagging// features provided by [[ImportTiddlersPlugin]], so that each time you open your document, you can automatically retrieve an up-to-date set of common tiddlers that are stored in another document (either local or via remote URL), without those tiddlers being retained when you save your document.
<<<
!!!!!Configuration
<<<
When saving the document:
<<option chkTemporaryQuiet>> Suppress reporting of individual temporary tiddlers that have not been saved
<<option chkTemporaryKeep>> Keep temporary tiddlers (i.e., ignore the 'temporary' tag)
Enter a tag value to use when marking tiddlers as temporary: <<option txtTemporaryTag>>
<<<
!!!!!Revisions
<<<
2008.11.14 [1.1.2] added "nnn temporary tiddlers not saved" summary message
2008.04.08 [1.1.1] don't automatically add configuration options to AdvancedOptions tiddler
2008.03.01 [1.1.0] added support for recognizing 'temporary' flag stored as a tiddler *field* (as an optional alternative to using a tag)
2007.02.08 [1.0.0] initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.TemporaryTiddlersPlugin= {major: 1, minor: 1, revision: 2, date: new Date(2008,11,14)};

// configuration defaults
if (config.options.chkTemporaryKeep ==undefined) config.options.chkTemporaryKeep =false;
if (config.options.chkTemporaryQuiet==undefined) config.options.chkTemporaryQuiet=true;
if (config.options.txtTemporaryTag==undefined) config.options.txtTemporaryTag="temporary";
// lingo
config.messages.TemporaryWarning = "'%0' ...temporary tiddler";
config.messages.TemporarySummary = "%0 temporary tiddlers will not be saved";
// core override
SaverBase.prototype.externalize = function(store) 
{
	var results=[]; var totaltemps=0;
	var tiddlers=store.getTiddlers("title");
	for (var t=0; t<tiddlers.length; t++) {
		if (config.options.chkTemporaryKeep||!(tiddlers[t].fields['temporary']||tiddlers[t].isTagged(config.options.txtTemporaryTag)))
			results.push(this.externalizeTiddler(store, tiddlers[t]));
		else {
			if (!config.options.chkTemporaryQuiet) // notify user that tiddler won't be saved
				displayMessage(config.messages.TemporaryWarning.format([tiddlers[t].title]));
			totaltemps++;
		}
	}
	if (totaltemps) displayMessage(config.messages.TemporarySummary.format([totaltemps]));
	return results.join("\n");
}
//}}}