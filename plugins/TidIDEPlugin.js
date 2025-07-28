/***
|Name|TidIDEPlugin|
|Source|http://www.TiddlyTools.com/#TidIDEPlugin|
|Documentation|http://www.TiddlyTools.com/#TidIDEPluginInfo|
|Version|1.8.5|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|TiddlyWiki Integrated Development Environment - tools for authors and plugin writers|
~TidIDE (//prounounced "Tie Dyed"//) - ''Tid''dlyWiki ''I''ntegrated ''D''evelopment ''E''nvironment - allows you to define a set of checkboxes to toggle a stack of 'tool panels' containing tools for TiddlyWiki authors to use when creating and debugging their TiddlyWiki documents.  Each tool is defined by a separate tiddler, allowing you to define any convenient set of tools simply by adding/removing tiddler references from the {{{<<tidIDE...>>}}} macro call.

In addition to presenting checkboxes/tool panels that are defined in separate tiddlers, the {{{<<tidIDE>>}}} macro can invoke an optional built-in "editor panel" that presents an alternative tiddler editor to create, modify, and manage the tiddlers in your document... and, if you have also installed [[PreviewPlugin]], the editor can automatically display a ''//formatted preview//'' of the current tiddler content that is updated ''live, key-by-key'' while you edit the tiddler source.
!!!!!Documentation
>see [[TidIDEPluginInfo]]
!!!!!Configuration
<<<
Number of rows to display in text input area <<option txtTidIDEMaxEditRows>> 
{{{usage: <<option txtTidIDEMaxEditRows>>}}}
^^//Note: if not specified here, default uses {{{<<option txtMaxEditRows>>}}} value (see [[AdvancedOptions]])//^^
<<<
!!!!!Revisions
<<<
2009.09.22 [1.8.5] added edit='tags' to tags input so {{{<<newTiddler tags:...>>}}} can init field
2009.08.27 [1.8.4] added 'tidIDEPanel' classname to container element (for custom CSS)
|please see [[TidIDEPluginInfo]] for additional revision details|
2006.04.15 [0.5.0] Initial ALPHA release. Converted from inline script.
<<<
!!!!!Code
***/
//{{{
version.extensions.TidIDEPlugin= {major: 1, minor: 8, revision: 5, date: new Date(2009,9,22)};

// settings
if (config.options.txtTidIDEMaxEditRows==undefined)
	config.options.txtTidIDEMaxEditRows=config.options.txtMaxEditRows

// shadow payload
config.shadowTiddlers['TidIDEPluginEditorPanel']=store.getTiddlerText('TidIDEPlugin##editorPanel');

config.macros.tidIDE = {
	versionMsg: "TidIDE v%0.%1.%2: ",
	datetimefmt: "0MM/0DD/YYYY 0hh:0mm",
	titleMsg: "Please enter a new tiddler title",
	isShadowMsg: "'%0' is a shadow tiddler and cannot be removed.",
	evalMsg: "Warning!! Processing '%0' as a systemConfig (plugin) tiddler may produce unexpected results! Are you sure you want to proceed?",
	evalCompletedMsg: "Processing completed",
	toolsDef: "<html><a href='javascript:config.macros.tidIDE.set(\"%0\",\"%1\");'>edit %1...</a></html>",
	editorLabel: "TiddlerEditor"
};

config.macros.tidIDE.handler= function(place,macroName,params) {
	var here=story.findContainingTiddler(place);
	var selectors="";
	var panels="";
	var showsys=false;
	var title="";
	var id=""; if (here) id=here.getAttribute("tiddler").replace(/ /g,"_");
	var p=params.shift();
	if (!p) p="edit:here"; // default to editor if no params
	var openpanels=[];
	var panelcount=0;
	while (p) {
		var defOpen=(p.substr(0,1)=="+"); if (defOpen) p=p.substr(1);
		if (p.substr(0,3)=="id:")
			{ id=p.substr(3); }
		else if (p.substr(0,4)=="edit") {
			panelcount++;
			defOpen=defOpen || (!params[0] && panelcount==1); // if only one panel to show, default to open
			var toolname=this.editorLabel;
			if (p.indexOf('|')!=-1) toolname=p.substr(0,p.indexOf('|'));
			selectors+=this.html.editorchk.replace(/%toolname%/mg,toolname);
			selectors=selectors.replace(/%showpanel%/mg,defOpen?"CHECKED":"");
			panels+=store.getTiddlerText('TidIDEPluginEditorPanel');
			// editor panel setup...
			panels=panels.replace(/%showpanel%/mg,defOpen?"block":"none");
			panels=panels.replace(/%maxrows%/mg,config.options.txtTidIDEMaxEditRows);
			panels=panels.replace(/%disabled%/mg,readOnly?"DISABLED":"");
			panels=panels.replace(/%readonlychk%/mg,readOnly?"CHECKED":"");
			panels=panels.replace(/%minoredits%/mg,config.options.chkForceMinorUpdate&&!readOnly?"":"DISABLED");
			panels=panels.replace(/%minorchk%/mg,config.options.chkForceMinorUpdate?"CHECKED":"");
			var tiddlers=store.getTiddlers("title"); var tiddlerlist=""; 
			for (var t=0; t<tiddlers.length; t++)
				tiddlerlist+='<option value="'+tiddlers[t].title+'">'+tiddlers[t].title+'</option>';
			for (var t in config.shadowTiddlers)
				if (!store.tiddlerExists(t)) tiddlerlist+="<option value='"+t+"'>"+t+" (shadow)</option>";
			panels=panels.replace(/%tiddlerlist%/mg,tiddlerlist);
			var tags = store.getTags(); var taglist="";
			for (var t=0; t<tags.length; t++)
				taglist+="<option value='"+tags[t][0]+"'>"+tags[t][0]+"</option>";
			panels=panels.replace(/%taglist%/mg,taglist);
			if (p.substr(0,5)=="edit:") { 
				title=p.substr(5); 
				if (here && title=="here") title=here.id.substr(7);
			}
		}
		else {
			panelcount++;
			defOpen=defOpen || (!params[0] && panelcount==1); // if only one panel to show, default to open
			var toolid=toolname=p;
			if (p.indexOf('|')!=-1)
				{ toolname=p.substr(0,p.indexOf('|')); toolid=p.substr(p.indexOf('|')+1); }
			selectors+=this.html.toolschk.replace(/%toolid%/mg,toolid).replace(/%toolname%/mg,toolname);
			selectors=selectors.replace(/%showpanel%/mg,defOpen?"CHECKED":"");
			panels+=this.html.toolspanel.replace(/%toolid%/mg,toolid);
			panels=panels.replace(/%showpanel%/mg,defOpen?"block":"none");
			if (defOpen) openpanels.push(toolid);
		}
		p=params.shift(); // next param
	}
	var html=this.html.framework;
	if (panelcount<2)
		html=html.replace(/%version%/mg,'').replace(/%selector%/mg,''); // omit header/selectors if just one panel to display
	else {
		var v=version.extensions.TidIDEPlugin;
		html=html.replace(/%version%/mg, this.versionMsg.format([v.major,v.minor,v.revision]));
		html=html.replace(/%selector%/mg,selectors+"<hr style='margin:0;padding:0'>");
	}
	html=html.replace(/%panels%/mg,panels);
	html=html.replace(/%id%/mg,id);
	var newIDE=createTiddlyElement(place,"span",null,"tidIDEPanel");
	newIDE.innerHTML=html;
	if (title.length) this.set(id,title);  // pre-load tiddler editor values (if needed)
	if (openpanels.length) for (i=0;i<openpanels.length;i++) { config.macros.tidIDE.loadPanel(id,openpanels[i]); }
	// see [[TextAreaPlugin]] for extended ctrl-F/G (search/search again)and TAB handler definitions
	if (window.addKeyDownHandlers!=undefined) {
		var elems=newIDE.getElementsByTagName("textarea");
		for (var i=0;i<elems.length;i++) window.addKeyDownHandlers(elems[i]);
	}
	var prev=document.getElementById(id+'_previewpanel');
	if (config.macros.preview && prev)  // add previewer to editor (if installed)
		config.macros.preview.handler(prev,"preview",["text","15"]);
}
//}}}

// // CUSTOM PANEL FUNCTIONS 
//{{{
config.macros.tidIDE.loadPanel=function(id,toolid) {
	var place=document.getElementById(id+"_"+toolid+"_panel"); if (!place) return;
	var t=store.getTiddlerText(toolid,"");
	place.innerHTML=""; 
	if (t) wikify(t,place); else place.innerHTML=this.toolsDef.format([id,toolid]);
}
//}}}

// // EDITOR PANEL FUNCTIONS
//{{{
config.macros.tidIDE.set=function(id,title) {
	var place=document.getElementById(id+"_editorpanel"); if (!place) return;
	var f=document.getElementById(id+"_editorform");
	if (f.dirty && !confirm(config.commands.cancelTiddler.warning.format([f.current]))) return;
	// reset to form defaults
	f.dirty=false;
	f.current="";
	f.created.value=f.created.defaultValue;
	f.modified.value=f.modified.defaultValue;
	f.author.value=f.author.defaultValue;
	f.content.value=f.content.defaultValue;
	f.tags.value=f.tags.defaultValue;
	f.size.value=f.size.defaultValue;
	if (!title.length) return;
	f.current=title;
	// values for new/shadow tiddlers
	var cdate=new Date();
	var mdate=new Date();
	var modifier=config.options.txtUserName;
	var text=config.views.editor.defaultText.format([title]);
	var tags="";
	// adjust values for shadow tiddlers
	if (store.isShadowTiddler(title))
		{ modifier=config.views.wikified.shadowModifier; text=store.getTiddlerText(title) }
	// get values for specified tiddler (if it exists)
	var t=store.getTiddler(title);
	if (t)	{ var cdate=t.created; var mdate=t.modified; var modifier=t.modifier; var text=t.text; var tags=t.getTags(); }
	if (!t && !store.isShadowTiddler(title)) f.tiddlers.options[f.tiddlers.options.length]=new Option(title,title,false,true); // add item to list
	f.tiddlers.value=title; // select current title (just in case it wasn't already selected)
	f.created.value=cdate.formatString(this.datetimefmt);
	f.modified.value=mdate.formatString(this.datetimefmt);
	f.author.value=modifier;
	f.content.value=text;
	f.tags.value=tags;
	f.minoredits.checked=config.options.chkForceMinorUpdate&&!readOnly;
	f.size.value=f.content.value.length+" bytes";
}

config.macros.tidIDE.add=function(id) {
	var place=document.getElementById(id+"_editorpanel"); if (!place) return;
	var f=document.getElementById(id+"_editorform");
	if (f.dirty && !confirm(config.commands.cancelTiddler.warning.format([f.current]))) return;
	var title=prompt(this.titleMsg,config.macros.newTiddler.title);
	while (title && store.tiddlerExists(title) && !confirm(config.messages.overwriteWarning.format([title])))
		title=prompt(this.titleMsg,config.macros.newTiddler.title);
	if (!title || !title.trim().length) return; // cancelled by user
	f.dirty=false; // suppress unneeded confirmation message
	this.set(id,title);
}

config.macros.tidIDE.remove=function(id) {
	var place=document.getElementById(id+"_editorpanel"); if (!place) return;
	var f=document.getElementById(id+"_editorform");
	if (!f.current.length) return;
	if (!store.tiddlerExists(f.current) && store.isShadowTiddler(f.current)) { alert(this.isShadowMsg.format([f.current])); return; }
	if (config.options.chkConfirmDelete && !confirm(config.commands.deleteTiddler.warning.format([f.current]))) return;
	if (store.tiddlerExists(f.current)) {
		story.closeTiddler(f.current);
		store.removeTiddler(f.current);
		store.setDirty(true);
		if(config.options.chkAutoSave) saveChanges();
	}
	f.tiddlers.options[f.tiddlers.selectedIndex]=null; // remove item from list
	f.dirty=false; // suppress unneeded confirmation message
	this.set(id,""); // clear form controls
}

config.macros.tidIDE.save=function(id,saveAs) {
	var place=document.getElementById(id+"_editorpanel"); if (!place) return;
	var f=document.getElementById(id+"_editorform");
	var title=f.current;
	if (!title || !title.trim().length || saveAs) { // get a new title
		title=prompt(this.titleMsg,config.macros.newTiddler.title);
		while (title && store.tiddlerExists(title) && !confirm(config.messages.overwriteWarning.format([title])))
			title=prompt(this.titleMsg,config.macros.newTiddler.title);
		if (!title || !title.trim().length) return; // cancelled by user
		f.tiddlers.options[f.tiddlers.options.length]=new Option(title,title,false,true); // add item to list
		f.current=title;
	}
	var author=config.options.txtUserName;
	var mdate=new Date();
	var content=f.content.value;
	var tags=f.tags.value;
	var tiddler=store.saveTiddler(title,title,content,author,mdate,tags);
	if (f.minoredits.checked) {
		var author=f.author.value;
		var mdate=new Date(f.modified.value);
		var cdate=new Date(f.created.value);
		tiddler.assign(null,null,author,mdate,null,cdate);
	}
	store.setDirty(true);
	if(config.options.chkAutoSave) saveChanges();
	story.refreshTiddler(title,null,true);
	f.dirty=false;
}
//}}}

// // HTML DEFINITIONS
//{{{
config.macros.tidIDE.html = { };
config.macros.tidIDE.html.framework = " \
	<html> %version% <form style='display:inline;margin:0;padding:0;'>%selector%</form> %panels% </html> \
";
//}}}
//{{{
config.macros.tidIDE.html.editorchk = " \
	<input type=checkbox name=editor \
		style='display:inline;width:auto;margin:1px;' \
		title='add/delete/modify tiddlers' %showpanel% \
		onclick='document.getElementById(\"%id%_editorpanel\").style.display=this.checked?\"block\":\"none\";'>%toolname% \
";
config.macros.tidIDE.html.toolschk = " \
	<input type=checkbox name=tools \
		style='display:inline;width:auto;margin:1px;' \
		title='' %showpanel% \
		onclick='document.getElementById(\"%id%_%toolid%_panel\").style.display=this.checked?\"block\":\"none\"; \
			if (this.checked) config.macros.tidIDE.loadPanel(\"%id%\",\"%toolid%\");'>%toolname% \
";
//}}}
//{{{
config.macros.tidIDE.html.toolspanel = " \
	<div id='%id%_%toolid%_panel' style='display:%showpanel%;margin:0;margin-top:0.5em'> \
	</div> \
";
//}}}
/***
//{{{
!editorPanel
<div id='%id%_editorpanel' style='display:%showpanel%;margin:0;margin-top:0.5em'>
<form id='%id%_editorform' style='display:inline;margin:0;padding:0;'>

<!-- tiddler editor list and buttons -->
<select size=1 name=tiddlers style='display:inline;width:44%;'
	onchange='config.macros.tidIDE.set("%id%",this.value); this.value=this.form.current;'>
<option value=''>select a tiddler...</option>
%tiddlerlist%
</select><!--

--><input name=add type=button style='display:inline;width:8%'
	value='new' title='create a new tiddler'
	onclick='config.macros.tidIDE.add("%id%")' %disabled%><!--
--><input name=remove type=button style='display:inline;width:8%'
	value='remove' title='delete this tiddler'
	onclick='config.macros.tidIDE.remove("%id%")' %disabled%><!--
--><input name=save type=button style='display:inline;width:8%'
	value='save' title='save changes to this tiddler'
	onclick='config.macros.tidIDE.save("%id%")' %disabled%><!--
--><input name=saveas type=button style='display:inline;width:8%'
	value='save as' title='save changes to a new tiddler'
	onclick='config.macros.tidIDE.save("%id%",true)' %disabled%><!--
--><input name=view type=button style='display:inline;width:8%'
	value='open' title='open this tiddler for regular viewing'
	onclick='if (!this.form.current.length) return;	story.displayTiddler(null,this.form.current)'><!--
--><input name=run type=button style='display:inline;width:8%'
	value='run' title='evaluate this tiddler as a javascript "systemConfig" plugin'
	onclick='if (!confirm(config.macros.tidIDE.evalMsg.format([this.form.current]))) return false;
		try { window.eval(this.form.content.value); displayMessage(config.macros.tidIDE.evalCompletedMsg); }
		catch(e) { displayMessage(config.messages.pluginError.format([err])); }'><!--
--><input name=previewbutton type=button style='display:inline;width:8%;'
	value='preview' title='show "live" preview display'
	onclick='if (!config.macros.preview) { alert("Please install PreviewPlugin"); return false; }
		this.form.preview.checked=!this.form.preview.checked;
		document.getElementById("%id%_previewpanel").style.display=this.form.preview.checked?"block":"none";
		if (this.form.freeze) this.form.freeze.checked=!this.form.preview.checked;
		if (this.form.preview.checked) config.macros.preview.render(this.form.content.id,this.form.content.getAttribute("previewid"));'><!--

hidden field for preview show/hide state:
--><input name=preview type=checkbox style='display:none;'>

<!-- tiddler content edit -->
<div><textarea id='%id%_content' name='content' edit='text' cols=60 rows=%maxrows%
	style='width:100%;'
	onkeyup='var f=this.form; f.dirty=true; f.size.value=this.value.length+" bytes";'></textarea></div>

<!-- tag edit and droplist -->
<table width='100%' style='border:0;padding:0;margin:0'><tr style='border:0;padding:0;margin:0'>
<td style='border:0;padding:0;margin:0'>
	<input type=text name=tags edit='tags' size=60 style='width:100%;' value=''
		onchange='this.form.dirty=true' %disabled%>
</td><td width='1' style='border:0;padding:0;margin:0;'>
	<select size=1 name=taglist
		onchange='this.form.dirty=true; this.form.tags.value+=" "+this.value' %disabled%>
	<option value=''>select tags...</option>
	%taglist%
	</select>
</td></tr></table>

<!-- created/modified dates, author, current tiddler size -->
<div style='float:right;'>
	created <input type=text name=created size=15
		style='display:inline;;text-align:center;padding:0;' value=''
		onchange='this.form.dirty=true' %minoredits%>
	modified <input type=text name=modified size=15
		style='display:inline;text-align:center;padding:0;' value=''
		onchange='this.form.dirty=true;' %minoredits%>
	by <input type=text name=author size=15
		style='display:inline;padding:0;' value=''
		onfocus='this.select()' onchange='this.form.dirty=true' %minoredits%>
	<input type=text name=size size=10
		style='display:inline;text-align:center;padding:0;' value=''
		onfocus='this.blur()' onkeydown='return false' DISABLED>
</div>

<!-- toggles: read-only, minor edit -->
<span style='white-space:nowrap'>
<input type=checkbox name=readonly
	style='display:inline;width:auto;margin:1px;' %readonlychk%
	title='do not allow tiddler changes to be saved'
	onclick='readOnly=config.options.chkHttpReadOnly=this.checked;saveOptionCookie("chkHttpReadOnly");
		var f=this.form; f.minoredits.disabled=f.tags.disabled=f.taglist.disabled=this.checked;
		f.add.disabled=f.remove.disabled=f.save.disabled=f.saveas.disabled=this.checked;
		f.created.disabled=f.modified.disabled=f.author.disabled=this.checked||!f.minoredits.checked;'>readonly
<input type=checkbox name=minoredits
	style='display:inline;width:auto;margin:1px;' %disabled% %minorchk%
	title='check: save datestamps/author as entered, uncheck: auto-update modified/author'
	onclick='this.form.created.disabled=this.form.modified.disabled=this.form.author.disabled=!this.checked;
		config.options.chkForceMinorUpdate=this.checked;saveOptionCookie("chkForceMinorUpdate");'>minor edits
</span>

<!-- tiddler preview display -->
<div id='%id%_previewpanel' style='display:none;white-space:nowrap'></div>
!end
//}}}
***/
 