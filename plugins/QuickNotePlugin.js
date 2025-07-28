/***
|Name|[[QuickNotePlugin]]|
|Source|http://www.TiddlyTools.com/#QuickNotePlugin|
|Version|2.1.0|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|create quick notes using username+timestamp as tiddler titles|
!!!!!Documenatation
>see [[QuickNotePluginInfo]]
!!!!!Revisions
<<<
2011.06.07 2.1.0 added tiddler:... parameter (default=username)
2011.04.27 2.0.1 merge/clone defaultCustomFields for saving on TiddlySpace
| Please see [[QuickNotePluginInfo]] for previous revision details |
2009.09.15 1.0.0 initial release (transclusion)
<<<
!!!!!Code
***/
//{{{
version.extensions.QuickNotePlugin={ major:2, minor:1, revision:0, date:new Date(2011,6,7) };
config.macros.quickNote = {
	addedMsg: 'Note added to: "%0"',
	createdMsg: 'Created new note tiddler: "%0"',
	shadow: function(tid,txt) {
		config.shadowTiddlers[tid]=txt;
		config.annotations[tid]='see QuickNotePlugin';
	},
	init: function() {
		this.shadow('QuickNote',
			'<<quickNote dateformat:"$1" tags:"$2" tiddler:"$3">>');
		this.shadow('QuickNotePluginPanel',
			store.getTiddlerText('QuickNotePlugin##html',''));
	},
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var p=paramString.parseParams('name',null,true,false,true);
		var s=createTiddlyElement(place,'span');
		s.innerHTML=store.getTiddlerText('QuickNotePluginPanel','');
		var f=s.getElementsByTagName('form')[0]; if (!f) return;
		f.id=new Date().getTime()+Math.random().toString(); // globally unique ID
		var v=getParam(p,'dateformat',''); v=v=='$1'?'':v; f.dateformat.value=v;
		var v=getParam(p,'tags'      ,''); v=v=='$2'?'':v; f.tags.value=v;
		var v=getParam(p,'tiddler'   ,config.options.txtUserName); v=v=='$3'?'':v; f.target.value=v;
		if (v=='here') {
			var here=story.findContainingTiddler(place);
			if (here) f.target.value=here.getAttribute('tiddler');
		}
		this.tick(f.id);
	},
	tick: function(id) {
		var f=document.getElementById(id); if (!f) return;
		f.title.value=f.target.value+new Date().formatString(f.dateformat.value);
		window.setTimeout('config.macros.quickNote.tick("'+id+'")',1000);
	},
	saveNote: function(f) {
		var tid=f.title.value; if (!tid.length) return;
		var t=store.getTiddler(tid); var existing=t!=null;
		if (!existing) { t=new Tiddler(); t.text=store.getTiddlerText(tid,''); }
		var who =t&&config.options.chkForceMinorUpdate?t.modifier:config.options.txtUserName;
		var when=t&&config.options.chkForceMinorUpdate?t.modified:new Date();
		var txt =t.text+(t.text.length?'\n':'')+f.txt.value;
		var tags=t.tags.slice(0); var newtags=f.tags.value.readBracketedList();
		for (var i=0; i<newtags.length; i++) tags.pushUnique(newtags[i]);
		var fields=merge({},config.defaultCustomFields,true)
		store.saveTiddler(tid,tid,txt,who,when,tags,fields);
		autoSaveChanges(); story.displayTiddler(null,tid);
		if (existing) displayMessage(this.addedMsg.format([tid]));
		else displayMessage(this.createdMsg.format([tid]));
	}
}
//}}}
/***
!!!!!Shadow tiddler: QuickNotePluginPanel
{{{
!html
<html><nowiki><form class="quickNote" style="display:inline;margin:0;padding:0;white-space:nowrap;">
<input type=hidden name="dateformat" disabled value="">
<input type=hidden name="target" disabled value="">
<input type=text name="title" disabled value="" title="title for new tiddler" style="width:50%">
<input type=text name="tags" value="" title="tags for new tiddler" style="width:40%">
<input type=button value="save" style="width:8%"
	onclick="config.macros.quickNote.saveNote(this.form); return false;"><br>
<textarea name="txt" rows="5" cols="60" style="width:100%"></textarea>
</form></html>
!end
}}}
***/
 