/***
|Name|FAQViewerPlugin|
|Source|http://www.TiddlyTools.com/#FAQViewerPlugin|
|Version|1.4.3|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|select and display FAQ tiddlers from a droplist, sorted by date|
!!!!!Usage
<<<
{{{<<faqViewer startwith:TiddlerName tagname classname sortby dateformat>>}}}
where:
*''startwith:TiddlerName'' (optional)<br>
*''tagname'' (optional)<br>specifies the set of tiddlers to include in the FAQ list (default='faq')
*''classname'' (optional)<br>specifies a CSS class to be applied surrounding the FAQ tiddler content
*''sortby'' (optional)<br>specifies the name of a tiddler field to sort by.  Use '+' or '-' as a prefix on the fieldname to indicate ascending or descending order, respectively (default='-modified').  You can also use the special keyword, ''Description'', to sort alphabetically based on the value of a slice named 'Description', that can be defined in each FAQ tiddler.  Note: if a particular FAQ tiddler has no description slice, the title of the tiddler is used as a fallback.
*''dateformat'' (optional)<br>specifies the formatting for dates displayed in the list.  Use " " (a single space) to suppress the date display.
examples:
{{{<<faqViewer>>}}}
{{smallform small{<<faqViewer>>}}}
{{{<<faqViewer package outline +title " ">>}}}
{{smallform small{<<faqViewer package outline +title " ">>}}}
<<<
!!!!!Revisions
<<<
2009.06.14 [1.4.3] moved html definition to tiddler section (saves space)
2008.10.21 [1.4.2] removed animation (was interfering with 'overflow:scroll' CSS)
2008.09.30 [1.4.1] corrected filter by tag handling broken in 1.4.0
2008.09.29 [1.4.0] added optional 'startwith:TiddlerName' param
2008.09.24 [1.3.1] added animation when opening/closing faq content panel
2008.09.21 [1.3.0] sort by 'description' slice values.  also added 'previous' and 'next' buttons for sequential viewing of FAQ articles
2008.09.20 [1.2.0] optional 'sortby' and 'dateformat' params
2008.01.20 [1.1.0] support for alternative 'target' tag instead of 'faq' (default)
2007.10.15 [1.0.0] converted to true plugin
2007.02.01 [0.0.0] inline script
<<<
!!!!!Code
***/
//{{{
version.extensions.FAQViewerPlugin={major: 1, minor: 4, revision: 3, date: new Date(2009,6,14)};

config.shadowTiddlers.FAQViewer='{{smallform{<<faqViewer>>}}}';

config.macros.faqViewer= {
	dateFormat:'YYYY.0MM.0DD 0hh:0mm - ',
	startparam: 'startwith:',
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		// create form
		if (params[0]&&params[0].substr(0,this.startparam.length)==this.startparam)
			{ var startwith=params[0].substr(this.startparam.length); params.shift(); }
		var console=createTiddlyElement(place,'span');
		console.innerHTML=store.getTiddlerText('FAQViewerPlugin##html').replace(/%classname%/,params[1]||'');
		this.go(console.getElementsByTagName('form')[0],startwith, params[0],params[2],params[3]);
	},
	go: function(f,startwith,targetType,sortby,dateformat) {
		var targetType=targetType||'faq';
		var sortby=sortby||'-modified';
		var dateformat=dateformat||this.dateFormat;
		var datefield=sortby.indexOf('created')!=-1?'created':'modified';
		f.targetType.value=targetType;
		f.sortBy.value=sortby;
		f.dateFmt.value=dateformat;
		var lists=f.getElementsByTagName('select'); if (!lists.length) return;
		var FAQList=lists[0]; var taglist=lists[1];
		while (FAQList.options[0]) FAQList.options[0]=null; // empty FAQList
		if (f.search.value!=f.search.defaultValue) var find=f.search.value;
		var tiddlers=store.getTaggedTiddlers(targetType,'modified').reverse();
		if (tiddlers && sortby) {
			if (sortby.indexOf('escription')==-1)	// sort by tiddler field
				tiddlers=store.sortTiddlers(tiddlers,sortby);
			else 
				tiddlers.sort(function(a,b){	// sort by description slice (or title, if no slice)
					var da=store.getTiddlerSlice(a.title,'Description')||a.title;
					var db=store.getTiddlerSlice(b.title,'Description')||b.title;
					return da==db?0:(da>db?+1:-1);
				});
		}
		var matchcount=0; var tags=[]; var selectedIndex=0;
		FAQList.options[0]=new Option('select an item...','',false,false);
		for (var i=0; i<tiddlers.length; i++) {
			for (var t=0; t<tiddlers[i].tags.length; t++)
				tags.pushUnique(tiddlers[i].tags[t]); // collect other tags
			if (find && find.length && tiddlers[i].text.indexOf(find)==-1) continue;
			if (taglist.value && taglist.value.length && !tiddlers[i].tags.contains(taglist.value)) continue;
			matchcount++;
			var d=store.getTiddlerSlice(tiddlers[i].title,'Description')||tiddlers[i].title;
			d=tiddlers[i][datefield].formatString(dateformat)+d;
			FAQList.options[FAQList.options.length]=new Option(d,tiddlers[i].title,false,false);
			if (tiddlers[i].title==startwith) selectedIndex=i+1;
		}
		FAQList.options[0].text='select an item... ['+tiddlers.length+' item'+(tiddlers.length!=1?'s':'');
		if (find && find.length || taglist.value.length)
			FAQList.options[0].text+=', '+matchcount+' match'+(matchcount!=1?'es':'');
		FAQList.options[0].text+=']';
		FAQList.selectedIndex=selectedIndex;
		if (selectedIndex) config.macros.faqViewer.show(f,startwith);

		if (!taglist.options.length) { // only load tag list the first time, since it doesn't change
			while (taglist.options[0]) taglist.options[0]=null; // empty taglist
			taglist.options[0]=new Option('filter by tag...','',false,false);
			var tagcount=0;
			for (var t=0; t<tags.length; t++) {
				if (tags[t].toLowerCase()==targetType) continue;
				if (tags[t].indexOf('exclude')!=-1) continue;
				taglist.options[taglist.options.length]
					=new Option(tags[t],tags[t],false,false);
				tagcount++;
			}
			if (!tagcount) taglist.options[taglist.options.length]
				=new Option('no category tags found','',false,false);
		}
	},
	show: function(f,v) {
		var fmt=this.faqlayout;
		if (store.getTaggedTiddlers(v).length) fmt=this.packagelayout;
		var target=f.getElementsByTagName('div')[0];
		removeChildren(target);
		wikify(fmt.format([v]),target);
		target.style.display='block';
		f.prev.parentNode.style.display='block';
		f.next.focus();
		f.done.disabled=!v.length;
	},
	faqlayout:
		'{{toolbar floatright fine{//now viewing: //[[%0]] &nbsp;}}}<<tiddler [[%0]]>>',
	packagelayout:
		'{{toolbar floatright fine{//now viewing: //[[%0]] &nbsp;}}}\n'
			+'{{floatright borderleft fine{<<tagging [[%0]]>>}}}<<tiddler [[%0]]>>{{clear block{}}}'
}
//}}}
/***
//{{{
!html
<form onsubmit='return false;' style='display:inline;margin:0;padding:0;white-space:nowrap;'><!--
--><input type='hidden' name='targetType' value='faq'><!--
--><input type='hidden' name='sortBy' value='-modified'><!--
--><input type='hidden' name='dateFmt' value='YYYY.0MM.0DD 0hh:0mm - '><!--
--><select name='list' size=1 style='width:50%'
	onchange='if (!this.value.length) this.form.done.onclick();
		else config.macros.faqViewer.show(this.form,this.value);'><!--
--></select><!--
--><select name='taglist' size=1 style='width:12%'
	title='list only items that have a specific category tag'
	onchange='var f=this.form; f.done.onclick();
		config.macros.faqViewer.go(f,"",f.targetType.value,f.sortBy.value,f.dateFmt.value)'><!--
--></select><!--
--><input type='text' name='search' value='enter search text...' style='width:20%'
	title='list only items that contain the search text (use blank to match all)'
	onfocus='this.select()'
	onkeyup=' if (event.keyCode==13) this.form.find.onclick();
		if (!this.value.length) {this.value=this.defaultValue; this.select(); this.form.find.onclick();}'><!--
--><input type='button' name='find' value='find' style='width:6%'
	title='list only items that contain the search text '
	onclick='var f=this.form; f.done.onclick();
		config.macros.faqViewer.go(f,"",f.targetType.value,f.sortBy.value,f.dateFmt.value)'><!--
--><input type='button' name='reset' value='reset' style='width:6%'
	title='reset FAQViewer to default '
	onclick='var f=this.form; f.done.onclick();
		f.search.value=f.search.defaultValue; f.taglist.selectedIndex=0;
		config.macros.faqViewer.go(f,"",f.targetType.value,f.sortBy.value,f.dateFmt.value)'><!--
--><input type='button' name='done' value='done' disabled style='width:6%'
	title='hide current item display'
	onclick='var target=this.form.getElementsByTagName("div")[0];
		target.style.display="none"; removeChildren(target);
		this.form.prev.parentNode.style.display="none";
		this.form.list.selectedIndex=0; this.disabled=true;'><!--
--><div class="%classname%" style="display:none;white-space:normal;"></div><!--
--><span style='text-align:right;display:none;overflow:auto;'><!--
--><input type='button' name='prev' value='&#x25C4 prev' style='float:left;font-size:80%;'
	title='view previous item'
	onclick='var f=this.form; var i=f.list.selectedIndex-1;
		f.list.selectedIndex=i<0?f.list.length-1:i; f.list.onchange();'><!--
--><input type='button' name='next' value='next &#x25BA;' style='float:right;font-size:80%;'
	title='view next item'
	onclick='var f=this.form; var i=f.list.selectedIndex+1;
		f.list.selectedIndex=i>f.list.length-1?0:i; f.list.onchange();'><!--
--></span><!--
--></form>
!end
//}}}
***/
 