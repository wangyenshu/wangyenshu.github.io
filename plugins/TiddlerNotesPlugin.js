/***
|''Name:''|TiddlerNotesPlugin|
|''Description:''|Add notes to tiddlers without modifying the original content|
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Source:''|http://tiddlernotesplugin.tiddlyspot.com/|
|''Code Repository:''|http://tiddlernotesplugin.tiddlyspot.com/|
|''Version:''|2.2|
|''Date:''|22/02/14|
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.2.6|

!! Concept:
*The TiddlerNotesPlugin allows you to add notes to tiddlers, without needing to edit the original tiddler. This means that your original content will remain unaltered, and if you update it in the future, you won't lose your notes. Notes are stored in separate tiddlers, but can be viewed and edited from within the original tiddler.
*For a tiddler titled "~MySlide", the notes are by default saved in a tiddler titled "~MySlide-Notes" and is given a tag of "Notes". The suffix and tags of the notes tiddlers are customizable. You can have one or multiple notes per tiddlers. So it is possible to have for example, teacher's notes and student's notes in the same file.
*Notes can be configured to start off blank, or pre-filled with the contents of the original tiddler.

!! Usage:
*{{{<<notes>>}}} is the simplest usage form.
* additional optional parameters include:
**{{{heading:}}} the heading to use for the notes box
**{{{tag:}}} the tag to be given to the notes tiddler
**{{{suffix:}}} the suffix to be used when naming the notes tiddler
* a full macro call could look like: {{{<<notes heading:"My Notes" tag:"NoteTiddlers" suffix:"Comments">>}}}
* To avoid adding {{{<<notes>>}}} to each tiddler you want notes for, you could add the macro call to the ViewTemplate
** below the line {{{<div class='viewer' macro='view text wikified'></div>}}} add the following line: <br> {{{<div class='viewer' macro='notes'></div>}}}
** Used in combination with the ~HideWhenPlugin or ~PublisherPlugin, you could have notes be shown only for tiddlers with specific tags. The ~PublisherPlugin would allow you for instance to only have the ~TeachersNotes visible to the teacher, and the ~StudentsNotes for the same tiddler visible to the Student.

!! Configuration
*<<option chkPrefillNotes>> Enable to pre-fill notes with the original tiddler's contents

!! Demo:
* [[MySlide]]

!! Revisions
V2.2 - 2014.02.22 by pmario
* Removed createTiddlyElement() and createTiddlyButton() functions from the plugin, since extensions needed, are part of the core since core Version 2.2.6. This modification fixes problems when used together with the TagSearchPlugin.
* Gave the plugin a new home at TiddlerNotesPlugin.tiddlyspot.com since the old repo is not available anymore. 

***/
// /%
//!BEGIN-PLUGIN-CODE

if (!config.options.chkPrefillNotes)
	config.options.chkPrefillNotes = false;
	
config.macros.notes={
	
	cancelWarning: "Are you sure you want to abandon changes to your notes for '%0'?",
	editLabel: "edit notes",
	editTitle: "double click to edit",
	saveLabel: "save notes",
	saveTitle: "double click to save",
	cancelLabel: "cancel",
	heading: "Notes",
	suffix: "Notes",
	tag: "Notes",
	
	saveNotes: function(ev){
		e = ev? ev : window.event;
		var theTarget = resolveTarget(e);
		if (theTarget.nodeName.toLowerCase() == "textarea")
			return false;
		var title = story.findContainingTiddler(theTarget).getAttribute("tiddler");
		story.setDirty(title,false);
		var box = document.getElementById("notesContainer"+title);
		var textarea = document.getElementById("notesTextArea"+title);
		if(textarea.getAttribute("oldText")!=textarea.value && !hasClass(theTarget,"cancelNotesButton")){
			var suffix = box.getAttribute("suffix");
			var t = store.getTiddler(title+"-"+suffix);
			store.saveTiddler(title+"-"+suffix,title+"-"+suffix,textarea.value,config.options.txtUserName,new Date(),t?t.tags:box.getAttribute("tag"),t?t.fields:{});
		}
		story.refreshTiddler(title,1,true);
		autoSaveChanges(true);
		return false;
	},
	
	editNotes: function(box,tiddler){
		removeChildren(box);
		story.setDirty(tiddler,true);
		box.title = this.saveTitle;
		box.ondblclick = this.saveNotes;
		createTiddlyButton(box,this.cancelLabel,this.cancelLabel,this.saveNotes,"cancelNotesButton");
		createTiddlyButton(box,this.saveLabel,this.saveLabel,this.saveNotes,"saveNotesButton");
		wikify("!!"+box.getAttribute("heading")+"\n",box);
		addClass(box,"editor");
		var wrapper1 = createTiddlyElement(null,"fieldset",null,"fieldsetFix");
		var wrapper2 = createTiddlyElement(wrapper1,"div");
		var e = createTiddlyElement(wrapper2,"textarea","notesTextArea"+tiddler);
		var v = store.getValue(tiddler+"-"+box.getAttribute("suffix"),"text");
		if(!v) 
			v = config.options.chkPrefillNotes? store.getValue(tiddler,"text"):'';
		e.value = v;
		e.setAttribute("oldText",v);
		var rows = 10;
		var lines = v.match(/\n/mg);
		var maxLines = Math.max(parseInt(config.options.txtMaxEditRows),5);
		if(lines != null && lines.length > rows)
			rows = lines.length + 5;
		rows = Math.min(rows,maxLines);
		e.setAttribute("rows",rows);
		box.appendChild(wrapper1);
	},
	
	editNotesButtonOnclick: function(e){
		var title = story.findContainingTiddler(this).getAttribute("tiddler");
		var box = document.getElementById("notesContainer"+title);
		config.macros.notes.editNotes(box,title);
		return false;
	},
	
	ondblclick : function(ev){
		e = ev? ev : window.event;
		var theTarget = resolveTarget(e);
		var title = story.findContainingTiddler(theTarget).getAttribute("tiddler");
		var box = document.getElementById("notesContainer"+title);
		config.macros.notes.editNotes(box,title);
		e.cancelBubble = true;
		if(e.stopPropagation) e.stopPropagation();
		return false;
	},
	
	handler : function(place,macroName,params,wikifier,paramString,tiddler){
		
		params = paramString.parseParams("anon",null,true,false,false);
		var heading = getParam(params,"heading",this.heading);
		var tag = getParam(params,"tag",this.tag);
		var suffix = getParam(params,"suffix",this.suffix);
		var box = createTiddlyElement(place,"div","notesContainer"+tiddler.title,"TiddlerNotes",null,{"source":tiddler.title,params:paramString,heading:heading,tag:tag,suffix:suffix});
		createTiddlyButton(box,this.editLabel,this.editLabel,this.editNotesButtonOnclick,"editNotesButton");
		wikify("!!"+heading+"\n",box);
		box.title=this.editTitle;
		box.ondblclick = this.ondblclick;
		wikify("<<tiddler [["+tiddler.title+"-"+suffix+"]]>>",box);
	}		
};

Story.prototype.old_notes_closeTiddler = Story.prototype.closeTiddler;
Story.prototype.closeTiddler = function(title,animate,unused){
	if(story.isDirty(title)) {
		if(!confirm(config.macros.notes.cancelWarning.format([title])))
			return false;
	}
	return this.old_notes_closeTiddler.apply(this,arguments);
}

setStylesheet(".TiddlerNotes {\n"+ " background:#eee;\n"+ " border:1px solid #ccc;\n"+ " padding:10px;\n"+ " margin:15px;\n"+ "}\n"+ "\n"+ ".cancelNotesButton,.editNotesButton, .saveNotesButton {\n"+ " float:right;\n"+ " border:1px solid #ccc;\n"+ " padding:2px 5px;\n"+ "}\n"+ "\n"+ ".saveNotesButton{\n"+ " margin-right:0.5em;\n"+ "}\n"+ "\n"+ ".TiddlerNotes.editor textarea{\n"+ " border:1px solid #ccc;\n"+ "}","NotesPluginStyles");
//!END-PLUGIN-CODE
// %/
