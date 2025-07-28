/***
|Name|CopyTiddlerPlugin|
|Source|http://www.TiddlyTools.com/#CopyTiddlerPlugin|
|Version|3.2.6|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.3|
|Type|plugin|
|Description|Quickly create a copy of any existing tiddler|
!!!Usage
<<<
The plugin automatically updates the default (shadow) ToolbarCommands definitions to insert the ''copyTiddler'' command, which will appear as ''copy'' when a tiddler is rendered.  If you are already using customized toolbar definitions, you will need to manually add the ''copyTiddler'' toolbar command to your existing ToolbarCommands tiddler, e.g.:
{{{
|EditToolbar|... copyTiddler ... |
}}}
When the ''copy'' command is selected, a new tiddler is created containing an exact copy of the current text/tags/fields, using a title of "{{{TiddlerName (n)}}}", where ''(n)'' is the next available number (starting with 1, of course).  If you copy while //editing// a tiddler, the current values displayed in the editor are used (including any changes you may have already made to those values), and the new tiddler is immediately opened for editing.

The plugin also provides a macro that allows you to embed a ''copy'' command directly in specific tiddler content:
{{{
<<copyTiddler TidderName label:"..." prompt:"...">>
}}}
where
* ''TiddlerName'' (optional)<br>specifies the //source// tiddler to be copied.  If omitted, the current containing tiddler (if any) will be copied.
* ''label:"..."'' (optional)<br>specifies text to use for the embedded link (default="copy TiddlerName")
* ''prompt:"..."'' (optional)<br>specifies mouseover 'tooltip' help text for link
//Note: to use non-default label/prompt values with the current containing tiddler, use "" for the TiddlerName//
<<<
!!!Configuration
<<<
<<option chkCopyTiddlerDate>> use date/time from existing tiddler (otherwise, use current date/time)
{{{<<option chkCopyTiddlerDate>>}}}
<<<
!!!Revisions
<<<
2010.11.30 3.2.6 use story.getTiddler()
2009.06.08 3.2.5 added option to use timestamp from source tiddler
2009.03.09 3.2.4 fixed IE-specific syntax error
2009.03.02 3.2.3 refactored code (again) to restore use of config.commands.copyTiddler.* custom settings
2009.02.13 3.2.2 in click(), fix calls to displayTiddler() to use current tiddlerElem and use getTiddlerText() to permit copying of shadow tiddler content
2009.01.30 3.2.1 fixed handling for copying field values when in edit mode
2009.01.23 3.2.0 refactored code and added {{{<<copyTiddler TiddlerName>>}}} macro
2008.12.18 3.1.4 corrected code for finding next (n) value when 'sparse' handling is in effect
2008.11.14 3.1.3 added optional 'sparse' setting (avoids 'filling in' missing numbers that may have been previously deleted)
2008.11.14 3.1.2 added optional 'zeroPad' setting
2008.11.14 3.1.1 moved hard-coded '(n)' regex into 'suffixPattern' object property so it can be customized
2008.09.26 3.1.0 changed new title generation to use '(n)' suffix instead of 'Copy of' prefix
2008.05.20 3.0.3 in handler, when copying from VIEW mode, create duplicate array from existing tags array before saving new tiddler.
2007.12.19 3.0.2 in handler, when copying from VIEW mode, duplicate custom fields before saving new tiddler.
2007.09.26 3.0.1 in handler, use findContainingTiddler(src) to get tiddlerElem (and title).  Allows 'copy' command to find correct tiddler when transcluded using {{{<<tiddler>>}}} macro or enhanced toolbar inclusion (see [[CoreTweaks]])
2007.06.28 3.0.0 complete re-write to handle custom fields and alternative view/edit templates
2007.05.17 2.1.2 use store.getTiddlerText() to retrieve tiddler content, so that SHADOW tiddlers can be copied correctly when in VIEW mode
2007.04.01 2.1.1 in copyTiddler.handler(), fix check for editor fields by ensuring that found field actually has edit=='text' attribute
2007.02.05 2.1.0 in copyTiddler.handler(), if editor fields (textfield and/or tagsfield) can't be found (i.e., tiddler is in VIEW mode, not EDIT mode), then get text/tags values from stored tiddler instead of active editor fields.  Allows use of COPY toolbar directly from VIEW mode
2006.12.12 2.0.0 completely rewritten so plugin just creates a new tiddler EDITOR with a copy of the current tiddler EDITOR contents, instead of creating the new tiddler in the STORE by copying the current tiddler values from the STORE.
2005.xx.xx 1.0.0 original version by Tim Morgan
<<<
!!!Code
***/
//{{{
version.extensions.CopyTiddlerPlugin= {major: 3, minor: 2, revision: 6, date: new Date(2010,11,30)};

// automatically tweak shadow EditTemplate to add 'copyTiddler' toolbar command (following 'cancelTiddler')
config.shadowTiddlers.ToolbarCommands=config.shadowTiddlers.ToolbarCommands.replace(/cancelTiddler/,'cancelTiddler copyTiddler');

if (config.options.chkCopyTiddlerDate===undefined) config.options.chkCopyTiddlerDate=false;

config.commands.copyTiddler = {
	text: 'copy',
	hideReadOnly: true,
	tooltip: 'Make a copy of this tiddler',
	notitle: 'this tiddler',
	prefix: '',
	suffixText: ' (%0)',
	suffixPattern: / \(([0-9]+)\)$/,
	zeroPad: 0,
	sparse: false,
	handler: function(event,src,title)
		{ return config.commands.copyTiddler.click(src,event); },
	click: function(here,ev) {
		var tiddlerElem=story.findContainingTiddler(here);
		var template=tiddlerElem?tiddlerElem.getAttribute('template'):null;
		var title=here.getAttribute('from');
		if (!title || !title.length) {
			if (!tiddlerElem) return false;
			else title=tiddlerElem.getAttribute('tiddler');
		}
		var root=title.replace(this.suffixPattern,''); // title without suffix
		// find last matching title
		var last=title;
		if (this.sparse) { // don't fill-in holes... really find LAST matching title
			var tids=store.getTiddlers('title','excludeLists');
			for (var t=0; t<tids.length; t++) if (tids[t].title.startsWith(root)) last=tids[t].title;
		}
		// get next number (increment from last matching title)
		var n=1; var match=this.suffixPattern.exec(last); if (match) n=parseInt(match[1])+1;
		var newTitle=this.prefix+root+this.suffixText.format([String.zeroPad(n,this.zeroPad)]);
		// if not sparse mode, find the next hole to fill in...
		while (store.tiddlerExists(newTitle)||story.getTiddler(newTitle))
			{ n++; newTitle=this.prefix+root+this.suffixText.format([String.zeroPad(n,this.zeroPad)]); }
		if (!story.isDirty(title)) { // if tiddler is not being EDITED
			// duplicate stored tiddler (if any)
			var text=store.getTiddlerText(title,'');
			var who=config.options.txtUserName;
			var when=new Date();
			var newtags=[]; var newfields={};
			var tid=store.getTiddler(title); if (tid) {
				if (config.options.chkCopyTiddlerDate) var when=tid.modified;
				for (var t=0; t<tid.tags.length; t++) newtags.push(tid.tags[t]);
				store.forEachField(tid,function(t,f,v){newfields[f]=v;},true);
			}
	                store.saveTiddler(newTitle,newTitle,text,who,when,newtags,newfields,true);
			story.displayTiddler(tiddlerElem,newTitle,template);
		} else {
			story.displayTiddler(tiddlerElem,newTitle,template);
			var fields=config.commands.copyTiddler.gatherFields(tiddlerElem); // get current editor fields
			var newTiddlerElem=story.getTiddler(newTitle);
			for (var f=0; f<fields.length; f++) {  // set fields in new editor
				if (fields[f].name=='title') fields[f].value=newTitle; // rename title in new tiddler
				var fieldElem=config.commands.copyTiddler.findField(newTiddlerElem,fields[f].name);
				if (fieldElem) {
					if (fieldElem.getAttribute('type')=='checkbox')
						fieldElem.checked=fields[f].value;
					else 
						fieldElem.value=fields[f].value;
				}
			}
		}
		story.focusTiddler(newTitle,'title');
		return false;
	},
	findField: function(tiddlerElem,field) {
		var inputs=tiddlerElem.getElementsByTagName('input');
		for (var i=0; i<inputs.length; i++) {
			if (inputs[i].getAttribute('type')=='checkbox' && inputs[i].field == field) return inputs[i];
			if (inputs[i].getAttribute('type')=='text' && inputs[i].getAttribute('edit') == field) return inputs[i];
		}
		var tas=tiddlerElem.getElementsByTagName('textarea');
		for (var i=0; i<tas.length; i++) if (tas[i].getAttribute('edit') == field) return tas[i];
		var sels=tiddlerElem.getElementsByTagName('select');
		for (var i=0; i<sels.length; i++) if (sels[i].getAttribute('edit') == field) return sels[i];
		return null;
	},
	gatherFields: function(tiddlerElem) { // get field names and values from current tiddler editor
		var fields=[];
		// get checkboxes and edit fields
		var inputs=tiddlerElem.getElementsByTagName('input');
		for (var i=0; i<inputs.length; i++) {
			if (inputs[i].getAttribute('type')=='checkbox')
				if (inputs[i].field) fields.push({name:inputs[i].field,value:inputs[i].checked});
			if (inputs[i].getAttribute('type')=='text')
				if (inputs[i].getAttribute('edit')) fields.push({name:inputs[i].getAttribute('edit'),value:inputs[i].value});
		}
		// get textareas (multi-line edit fields)
		var tas=tiddlerElem.getElementsByTagName('textarea');
		for (var i=0; i<tas.length; i++)
			if (tas[i].getAttribute('edit')) fields.push({name:tas[i].getAttribute('edit'),value:tas[i].value});
		// get selection lists (droplist or listbox)
		var sels=tiddlerElem.getElementsByTagName('select');
		for (var i=0; i<sels.length; i++)
			if (sels[i].getAttribute('edit')) fields.push({name:sels[i].getAttribute('edit'),value:sels[i].value});
		return fields;
	}
};
//}}}
// // MACRO DEFINITION
//{{{
config.macros.copyTiddler = {
	label: 'copy',
	prompt: 'Make a copy of %0',
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var title=params.shift();
		params=paramString.parseParams('anon',null,true,false,false);
		var label	=getParam(params,'label',this.label+(title?' '+title:''));
		var prompt	=getParam(params,'prompt',this.prompt).format([title||this.notitle]);
		var b=createTiddlyButton(place,label,prompt,
			function(ev){return config.commands.copyTiddler.click(this,ev)});
		b.setAttribute('from',title||'');
	}
};
//}}}