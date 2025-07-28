/***
|Name|ListboxPlugin|
|Source|http://www.TiddlyTools.com/#ListboxPlugin|
|Documentation|http://www.TiddlyTools.com/#ListboxPluginInfo|
|Version|1.4.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|set custom field or tiddler tags by selecting from listbox/droplist|
The {{{<<select>>}}} macro allows you to set tiddler field values by selecting pre-configured values from a listbox/droplist control.  
!!!!!Documentation
>see [[ListboxPluginInfo]]
!!!!!Revisions
<<<
2010.03.14 1.4.1 use filterTiddlers() instead of getTaggedTiddlers() - use MatchTagsPlugin for tag expressions
|please see [[ListboxPluginInfo]] for additional revision details|
2007.05.12 0.5.0 started
<<<
!!!!!Code
***/
//{{{
version.extensions.ListboxPlugin= {major: 1, minor: 4, revision: 1, date: new Date(2010,3,14)};

config.macros.select = {
	tooltip: "select a value for %0@%1",
	blankTooltip: "set %0@%1=[no value]",
	valueTooltip: "set %0@%1=%2",
	otherLabel: "other",
	otherTooltip: "set %0@%1=[enter a value...]",
	otherPrompt: "enter a value for '%0'",
	editLabel: "edit list...",
	editTooltip: "edit '%0' list definition (%1)",
	changeMsg: "setting %0@%1=%2",
	verbose: false,
	hereKeyword: "here",
	defaultTarget: "SiteFields",
	handler:
	function(place,macroName,params,wikifier,paramString,tiddler) {

		// default to containing tiddler or "SiteFields" catch-all
		var here=story.findContainingTiddler(place);
		var targetID=here?here.getAttribute("tiddler"):this.defaultTarget;

		// get field name and non-default target (if any)
		var field=params.shift();
		var pos=field.indexOf("@"); // if non-default target ("field@tiddler" syntax)
		if(pos!=-1) { // split field into field and tiddlername.
			if (field.substr(pos+1)!=this.hereKeyword) // "here" == use default target
				targetID=field.substr(pos+1); // use different target tiddler
			field=field.substr(0,pos);
		}
		if(!field || !field.length) return; // no field name... do nothing
		if (field.substr(0,1)=="=") targetID="(system)"; // internal option value

		var items=[]; var listsrc='';
		var autosave=false; var allowBlank=false; var allowOther=false; var allowEdit=false;
		var allowMultiple=false; var wikifyData=false; var rows=0; var width='';
		var p=params.shift();
		while (p) {
			if (p.toLowerCase()=='autosave')	// autosave on change
				autosave=true;
			else if (p.toLowerCase()=='allowblank')	// add empty item
				var allowBlank=true;
			else if (p.toLowerCase()=='allowother')	// add "other: ____" item
				var allowOther=true;
			else if (p.toLowerCase()=='allowedit')	// add "edit list..." item
				var allowEdit=true;
			else if (p.toLowerCase()=='allowmultiple') // multi-select
				var allowMultiple=true;
			else if (p.startsWith('rows:')) // 0=autosize listbox, 1=droplist, n=listbox
				var rows=p.substr(5);
			else if (p.startsWith('width:')) // CSS width of list
				var width=p.substr(6);
			else if (p.startsWith('prompt:')) // prompt text (1st item in list)
				var ptext=p.substr(7);
			else if (p.substr(0,1)=="+"||p.substr(0,1)=="*") { // read HR-separated tiddler
				var listsrc=p.substr(1);
				var listtxt=store.getTiddlerText(listsrc,'');
				var wikifyData=p.substr(0,1)=="*";
				if (listtxt.length && wikifyData) // wikify source to handle macros/scripts
					listtxt=this.getWikifiedData(listtxt);
				if (listtxt.length)
					items=items.concat(listtxt.split(listtxt.indexOf('\n----\n')!=-1?'\n----\n':'\n'));
			}
			else if (p.startsWith("=")) { // get items from tagged tiddlers
				var filter=p.substr(1);
				if (!filter.startsWith('[')) filter='[tag['+filter+']]';
				var tids=store.filterTiddlers(filter);
				for (var t=0; t<tids.length; t++) items.push(tids[t].title);
			}
			else { // param is item value or 'label=value'
				var parts=p.split("=");
				var label=parts[0]; var v=parts[1]?parts[1]:parts[0];
				items.push(label+"="+v);
			}
			p=params.shift();
		}
		if (rows==1) allowMultiple=false; // droplist cannot do multi-select
		if (tiddler && !story.isDirty(tiddler.title)) autosave=true; // tiddler is in VIEW mode, force autosave

		this.render(createTiddlyElement(place,"span"), null,
			targetID, field, ptext, items, listsrc, wikifyData,
			rows, width, autosave, allowBlank, allowOther, allowEdit, allowMultiple);

		store.addNotification(null,this.refresh); // syncs lists when tiddlers are changed
	},
	getWikifiedData: // wikify tiddler content, then extract text WITH newlines and HRs included
	function(txt) {
		var e=createTiddlyElement(document.body,"div"); wikify(txt,e);
		var breaks=e.getElementsByTagName("br");
		for (var b=0; b<breaks.length; b++) breaks[b].parentNode.insertBefore(document.createTextNode("\n"),breaks[b]);
		var lines=e.getElementsByTagName("hr");
		for (var l=0; l<lines.length; l++) lines[l].parentNode.insertBefore(document.createTextNode("----\n"),lines[l]);
		var items=e.getElementsByTagName("li");
		for (var i=0; i<items.length; i++) items[i].parentNode.insertBefore(document.createTextNode("\n"),items[i]);
		var txt=getPlainText(e); removeNode(e); return txt;
	},
	refresh:
	function (title) { // re-render dependent lists
		var lists=document.getElementsByTagName('select');
		for (var i=0; i<lists.length; i++) { var list=lists[i];
			if (list.getAttribute('listsrc')!=title) continue; // no sync needed
			var listtxt=store.getTiddlerText(list.getAttribute('listsrc')||'','');
			if (listtxt.length && list.getAttribute("wikifyData")=="true")
				listtxt=this.getWikifiedData(listtxt);
			if (listtxt.length)
				var items=listtxt.split(listtxt.indexOf('\n----\n')!=-1?'\n----\n':'\n');
			config.macros.select.render(list.parentNode, list,
				list.getAttribute('tiddler'),
				list.getAttribute('edit'),
				list.getAttribute('ptext'),
				items||[],
				list.getAttribute('listsrc'),
				list.getAttribute("wikifyData")=="true",
				list.getAttribute("rows"),
				list.getAttribute("width"),
				list.getAttribute("autosave")=="true",
				list.getAttribute("allowBlank")=="true",
				list.getAttribute("allowOther")=="true",
				list.getAttribute("allowEdit")=="true",
				list.getAttribute("allowMultiple")=="true");
		}
	},
	render:
	function (place, here, targetID, field, ptext, items, listsrc, wikifyData,
		rows, width, autosave, allowBlank, allowOther, allowEdit, allowMultiple) {

		var values=[]; var opts=[];

		// use current selection(s) (if any) (except for "edit list..." item)
		if (here) for (var i=0; i<here.options.length; i++) {
			var opt=here.options[i];
			if (opt.selected && opt.text!=config.macros.select.editLabel) values.push(opt.value);
		}
		// no listbox or no selections... get value(s) from field (if any)
		if (!values.length) {
			var v=(field.substr(0,1)=='=')?config.options[field.substr(1)]:store.getValue(targetID,field);
			if (v) values=(field=='tags'||allowMultiple)?v.readBracketedList():[v];
		}
		// add prompt item
		if (ptext&&ptext.length)
			opts.push('<option value="_ptext" title="">'+ptext+'</option>');
		// add 'no value' item
		if ((!allowMultiple && !values.length) || allowBlank)
			opts.push('<option value="" title="'+this.blankTooltip.format([field,targetID])+'"></option>');
		// add enumerated items
		var isOther=values.length; // assume no matching value
		for (var opt=0; opt<items.length; opt++) {
			var lines=items[opt].split("\n"); var parts=lines[0].split("=");
			var label=parts[0];
			var v=parts[1]?parts[1]:parts[0];
			var title=lines[1]?lines[1]:this.valueTooltip.format([field,targetID,v]);
			var sel=values.contains(v); if (sel) isOther=false; // found matching value
			opts.push('<option value="'+v+'" '+(sel?'selected':'')+' title="'+title+'">'+label+'</option>');
		}
		// add 'other...'
		if (field=='tags') isOther=false;
		if (isOther||allowOther) {
			var label="other"+(isOther?(": "+values[0]):"...");
			var v=isOther?values[0]:'';
			var t=this.otherTooltip.format([field,targetID]);
			opts.push('<option value="'+v+'" '+(isOther?'selected':'')+' title="'+t+'">'+label+'</option>');
		}
		// add 'edit list...'
		if (listsrc && (!store.getTiddlerText(listsrc) || allowEdit)) {
			var title=this.editTooltip.format([field,listsrc]);
			opts.push('<option value="'+listsrc+'" title="'+title+'">'+this.editLabel+'</option>');
		}
		// render listbox
		var html='<select '+(values[0]?'value="'+values[0]+'" ':' ')
			+' title="'+this.tooltip.format([field,targetID])+'"'
			+' rows="'+rows+'"'+' size="'+(rows!=0?rows:opts.length)+'"'+' style="width:'+width+'"'
			+' tiddler="'+targetID+'"'+' edit="'+field+'"'+' ptext="'+ptext+'"'
			+' listsrc="'+listsrc+'"'+' wikifyData="'+wikifyData+'"'
			+' autosave="'+autosave+'"'+' allowBlank="'+allowBlank+'"'+' allowOther="'+allowOther+'"'
			+' allowEdit="'+allowEdit+'"'+' allowMultiple="'+allowMultiple+'"'+(allowMultiple?' multiple':'')
			+' onclick="return config.macros.select.onClick(this,event)"'
			+' onchange="return config.macros.select.onChange(this,event)"'
			+' ondblclick="return false">'+opts.join('')+'</select>';
		place.innerHTML=html;
	},
	onClick:
	function(here,event) {
		var sel=here.selectedIndex;
		if (sel!=-1 && here.options[sel].text.startsWith(config.macros.select.otherLabel))
			here.onchange.apply(here,arguments);
	},
	onChange:
	function(here,event) {
		var cms=config.macros.select; // abbrev
		var sel=here.selectedIndex;
		if (sel!=-1) {
			if (here.options[sel].text==cms.editLabel) {
				story.displayTiddler(story.findContainingTiddler(here),here.value,DEFAULT_EDIT_TEMPLATE);
				return false;
			}
			if (here.options[sel].text.startsWith(cms.otherLabel)) {
				var newval=prompt(cms.otherPrompt.format([here.getAttribute("edit")]),here.value);
				if (!newval) {// user cancelled
					var v=store.getValue(here.getAttribute("tiddler"),here.getAttribute("edit"));
					{ here.value=v; if (v==undefined) here.selectedIndex=0; return false; }
				};
				here.options[sel].value=newval;
				here.options[sel].text=cms.otherLabel+": "+newval;
				here.value=newval;
			}
			if (here.options[sel].value=='_ptext')
				for (var i=0; i<here.options.length; i++)
					here.options[i].selected=false;
		}
		if (here.getAttribute("autosave")=="true") config.macros.select.setFieldValue(here);
		return false;
	},
	setFieldValue: function(here) {
		var tid=here.getAttribute("tiddler"); if (!tid || !tid.length) return; // no target, do nothing
		var field=here.getAttribute("edit");
		if (field.substr(0,1)=='=') { // option cookie instead of tiddler field
			config.macros.option.propagateOption(field.substr(1),"value",here.value,"input");
			return;
		}
		// ensure tiddler exists
		if (!store.tiddlerExists(tid)) store.saveTiddler(tid,tid,"",config.options.txtUserName,new Date(),[]);
		if (field=='tags') {
			store.suspendNotifications();
			for (var i=0; i<here.options.length; i++) {
				var opt=here.options[i];
				if (opt.text==config.macros.select.editLabel) continue;
				store.setTiddlerTag(tid,opt.selected,opt.value);
			}
			store.resumeNotifications();
		} else {
			// get multi-select items
			var values=[];
			for (var i=0; i<here.options.length; i++) {
				var opt=here.options[i];
				if (opt.text==config.macros.select.editLabel) continue;
				if (opt.selected) values.pushUnique(String.encodeTiddlyLink(opt.value));
			}
			if (values.length==1) values=[here.value]; // remove unneeded brackets around single value
			store.setValue(tid,field,values.length?values.join(' '):null); // if no selections, delete field
		}
		// 'touch' tiddler and report to user
		var t=store.getTiddler(tid);
		var who=config.options.chkForceMinorUpdate?t.modifier:config.options.txtUserName;
		var when=config.options.chkForceMinorUpdate?t.modified:new Date();
		store.saveTiddler(tid,tid,t.body,who,when,t.tags,t.fields);
		if (config.macros.select.verbose)
			{ clearMessage(); displayMessage(config.macros.select.changeMsg.format([field,tid,here.value])); }
	}
}
//}}}