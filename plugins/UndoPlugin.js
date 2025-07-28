/***
|Name|UndoPlugin|
|Author|Eric Shulman|
|Source|http://www.TiddlyTools.com/#UndoPlugin|
|Documentation|http://www.TiddlyTools.com/#UndoPlugin|
|Version|0.2.1|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|undo/redo changes to tiddlers|
|Status|Experimental - DO NOT DISTRIBUTE|
This plugin records changes to tiddlers edited during the session, allowing you to quickly revert to previous revisions of a tiddler, even after pressing 'done'.
!!!!!Documentation
<<<
TBD
<<<
!!!!!Configuration
<<<
<<option chkEnableUndo>> enable undo handling
<<<
!!!!!Revisions
<<<
2011.09.11 0.2.1 in setmsg(), make sure undo stack is not empty.  In go(), make sure index is >0.  added disabledmsg with option checkbox.  In render(), use wikify() to display static menu content (noundomsg/disabledmsg)
2011.09.07 0.2.0 refactored click handler and added toolbar command wrapper
2011.05.15 0.1.1 edits to message text
2011.05.02 0.1.0 started
<<<
!!!!!Code
***/
//{{{
version.extensions.UndoPlugin= {major: 0, minor: 2, revision: 1, date: new Date(2011,9,11)};

if (config.options.chkEnableUndo===undefined) config.options.chkEnableUndo=true;

config.macros.undo =  {
	label: 'undo',
	prompt: 'undo changes',
        tip: 'undo changes to "%0"',
	multimsg: 'Undo %0 tiddler changes.  Are you sure?',
	revertedmsg: '"%0" - previous content restored',
	renamedmsg: '"%0" - renamed to "%1"',
	deletedmsg: '"%0" - removed',
	shadowmsg: '"%0" - default (shadow) content restored',
	noundomsg: 'nothing to undo',
	disabledmsg: 'undo is disabled\n----\n<<option chkEnableUndo>>enable undo',
	undoheading: 'undo tiddler changes:',
	dateformat: 'YYYY.0MM.0DD 0hh:0mm:0ss',
	popupformat: '%1 %0<div style="font-size:80%"><i>action: </i><b>%2</b></div>',
	changes: [], // the list of previous tiddler changes
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var p=paramString.parseParams('name',null,true,false,true);
		var label=getParam(p,'label',this.label);
		var prompt=getParam(p,'prompt',this.prompt);
		createTiddlyButton(place,label,prompt,this.click);
	},
	click: function(ev){
		var p=Popup.create(this); if (!p) return false;
		config.macros.undo.render(p);
		Popup.show();
		ev=ev||window.event; ev.cancelBubble=true;
		if(ev.stopPropagation) ev.stopPropagation();
		return false;
	},
	render: function(p) {
		var cmu=config.macros.undo; // abbrev
		if (!config.options.chkEnableUndo) wikify(cmu.disabledmsg,p);
		else if (!cmu.changes.length) wikify(cmu.noundomsg,p);
		else {
			createTiddlyText(p, cmu.undoheading);
			for (var i=cmu.changes.length-1; i>=0; i--) { var c=cmu.changes[i]; var t=c.tiddler;
				var b=createTiddlyButton(createTiddlyElement(p,'li'),
					c.title, cmu.tip.format([c.title]),
					function(ev){return config.macros.undo.go(this.getAttribute('i'));});
				b.innerHTML=cmu.popupformat.format(
					[c.title,c.when.formatString(cmu.dateformat),c.msg]);
				b.setAttribute('i',i);
			}
		}
	},
	add: function(title,tiddler,action,msg){
		this.changes.push({
			title:title,
			tiddler:merge({},tiddler),
			action: action, // create, rename, change, delete
			when: new Date(),
			who: config.options.txtUserName,
			msg: msg
		});
	},
	setmsg: function(msg) {
		if (this.changes.length) this.changes[this.changes.length-1].msg=msg;
	},
	reset: function(i){
		while (this.changes.length) this.changes.pop();
	},
	go: function(i){
		var co=config.options; // abbrev
		var steps=this.changes.length-i; if (steps<0) return false;
		if (steps>1 && !confirm(this.multimsg.format([steps]))) return false;
		var temp=co.chkEnableUndo; co.chkEnableUndo=false; // SUSPEND undo
		var msgs=[];
		for (var j=this.changes.length; j>i; j--) {
			var c=this.changes.pop();
			if (c.action=='create') {
				store.removeTiddler(c.title);
				m=store.isShadowTiddler(c.title)?this.shadowmsg:this.deletedmsg;
				msgs.push(m.format([c.title]));
			} else {
				var t=c.tiddler;
				var revert=store.getTiddlerText(c.title)!=t.text;
				var rename=c.title!=t.title
				store.saveTiddler(t.title,t.title,t.text,
					t.modifier,t.modified,t.tags,t.fields);
				if (rename) { // RENAME: re-render with previous name
					var tidelem=story.getTiddler(c.title);
					if (tidelem) { // if displayed, re-render with previous name
						story.displayTiddler(tidelem,t.title);
						story.closeTiddler(c.title);
					}
					store.removeTiddler(c.title);
					msgs.push(this.renamedmsg.format([c.title,t.title]));
				}
				if (revert) msgs.push(this.revertedmsg.format([t.title]));
			}
		}
		co.chkEnableUndo=temp; // RESUME undo
		while (msgs.length) displayMessage(msgs.shift());
		autoSaveChanges();
		return false;
	}
};
//}}}
// // TOOLBAR COMMAND: undo
//{{{
config.commands.undoChanges = {
	text: 'undo',
	hideReadOnly: true,
	tooltip: 'undo individual document changes since the last save',
	handler: function(ev,src,title) { return config.macros.undo.click.call(src,ev); }
};
//}}}
// // HIJACKS - update changes when a tiddler is saved or deleted
//{{{
if (store.undo_saveTiddler==undefined) store.undo_saveTiddler=store.saveTiddler;
store.saveTiddler = function(title,newTitle,text) {
	var tiddler=store.getTiddler(title);
	if (config.options.chkEnableUndo) {
		var msgs=[];
		if (!tiddler) {
			var action='create';
			msgs.push('remove "'+newTitle+'"');
			if (store.isShadowTiddler(newTitle))
				msgs.push('use default (shadow) content');
		} else {
			var action=title!=newTitle?'rename':'change';
			if (action=='rename') {
				msgs.push('rename to "'+title+'"');
			}
			if (store.getTiddlerText(title)!=text || !msgs.length)
				msgs.push('restore previous content');
		}
		config.macros.undo.add(newTitle,tiddler,action,msgs.join(', '));
	}
	this.undo_saveTiddler.apply(this,arguments);
}
if (store.undo_removeTiddler==undefined) store.undo_removeTiddler=store.removeTiddler;
store.removeTiddler = function(title) {
	var tiddler=store.getTiddler(title);
	if (tiddler && config.options.chkEnableUndo) {
		var action='delete';
		var msg='restore deleted tiddler';
		config.macros.undo.add(title,tiddler,action,msg);
	}
	this.undo_removeTiddler.apply(this,arguments);
}
//}}}