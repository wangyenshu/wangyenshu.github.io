/***
|Name|GridPlugin|
|Source|http://www.TiddlyTools.com/#GridPlugin|
|Documentation|http://www.TiddlyTools.com/#GridPluginInfo|
|Version|2.0.7|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1.3|
|Type|plugin|
|Description|Display/edit slices, sections and fields in a grid (table) for a 'birds-eye' view of your document|
!!!!!Documentation
>see [[GridPluginInfo]]
!!!!!Revisions
<<<
2010.03.06 2.0.7 fixed setSection()
2009.09.26 2.0.6 fixed setSlice() for existing slices with empty values
|please see [[GridPluginInfo]] for additional revision details|
2007.01.30 0.0.1 started
<<<
!!!!!Code
***/
//{{{
version.extensions.GridPlugin= {major: 2, minor: 0, revision: 7, date: new Date(2010,3,6)};

config.macros.grid= {
	sizeSliceName: 'TiddlerSize', // fake slice to show # of bytes in tiddler 
	noColsMsg: '@@display:block;border:1px solid;there are no columns to display@@',
	showHeaders:'&#x25BA;&#x25BA;&#x25BA;',
	showHeadersTip:'show column headings',
	hideHeaders:'&#x25C4;&#x25C4;&#x25C4;',
	hideHeadersTip:'hide column headings',
	slicesRE: /(?:^\|\s*[\'\/]*~?(\w+)\:?[\'\/]*\s*\|\s*(.*?)\s*\|$)/gm,
	gridStyles: '.viewer .grid thead td, .grid thead td { background:transparent; }',
	init: function() { setStylesheet(this.gridStyles,'gridStyles'); },
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var edit=params.contains('edit') && !readOnly; // no editing if readOnly
		var wiki=params.contains('wikify');
		var inline=params.contains('inline');
		if (inline) var heads=true;
		var all=params.contains('all');
		params=paramString.parseParams('name',null,true,false,true); // for NAMED VALUES
		var filter=getParam(params,'filter',''); // core or MatchTagsPlugin tag filter syntax
		if (filter.length && !filter.startsWith('[tag[')) filter='[tag['+filter+']]';
		var tags=this.getList(getParam(params,'tags'),true); // older "match at least one tag" syntax
		if (tags.length) filter='[tag['+tags.join(']][tag[')+']]'+filter;
		var names=this.getList(getParam(params,'columns')); // slices/sections/fields to use as columns
		var clip=getParam(params,'clip',0); // 0=no clipping
		var width=getParam(params,'width','auto');
		var rc=this.getRowsAndCols(filter,names,all);
		if (!rc.cols.length) wikify(this.noColsMsg,place);
		else this.renderTable(place,rc.rows,rc.cols,inline,heads,wiki,edit,clip,width);
	},
	getList: function(t,gettags) {
		var items=(t||'').readBracketedList();
		for (var i=0;i<items.length;i++) { var item=items[i];
			// replace item with list based on item prefix:
			// +name  contents of tiddler (space-separated list)
			// @name  slices/tags,
			// @!name sections
			// @=name fields
			if ('@+'.indexOf(item.substr(0,1))!=-1) {
				var title=item.substr(1); var type=title.substr(0,1);
				if ('=!'.indexOf(type)!=-1) title=title.substr(1);
				if (title=='here')
					title=story.findContainingTiddler(place).getAttribute('tiddler');
				var tid=store.getTiddler(title); if (tid) {
					var list=[];
					if (item.substr(0,1)=='+') list=tid.text.readBracketedList();  // contents
					else if (gettags) list=tid.tags; // tags
					else if (type=='!') list=this.getSections(tid.title);  // sections
					else if (type=='=') list=this.getFields(tid.title); // fields
					else for (var s in this.getSlices(tid.title)) list.push(s);  // slices
					items.splice(i,1); // remove item
					for (var j=0;j<list.length;j++,i++) items.splice(i,0,list[j]); // add list
				}
			}
		}
		return items;
	},
	getRowsAndCols: function(filter,names,all) {
		var rows=[]; var cols=[]; // get rows (tiddlers) and columns (slices)
		var tiddlers=filter&&filter.length?store.filterTiddlers(filter):store.getTiddlers();
		for (i=0; i<tiddlers.length; i++) {
			var slices=this.getSlices(tiddlers[i].title);
			var include=false; for (var s in slices) { cols.pushUnique(s); include=true; }
			if (include||all) rows.push(tiddlers[i].title);
		}
		rows=rows.sort();
		// use specified list instead of collected slice names
		if (names.length) var cols=names;
		return {rows:rows,cols:cols};
	},
	renderTable: function(place,rows,cols,inline,heads,wiki,edit,clip,width) {
		var span=createTiddlyElement(place,'span')
		span.innerHTML=this.generateTable(rows,cols,inline,heads,wiki,edit,clip,width)
		// replace TD content with wikified elements
		var tds=span.getElementsByTagName('td');
		for (var t=0; t<tds.length; t++) {
			if (hasClass(tds[t],'wiki')) {
				var txt=getPlainText(tds[t]);
				if (hasClass(tds[t],'grid_heading')) txt='[['+txt+']]';
				removeChildren(tds[t]);
				wikify(txt,tds[t]);
			}
		}
	},
	generateTable: function(rows,cols,inline,heads,wiki,edit,clip,width) {
		var out= "<html><table class='sortable grid' style='border:0;padding:0;spacing:0;"
			+"border-collapse:collapse;width:"+width+"'>";

		// column headings
		out+=	 "<thead><tr style='border:0;vertical-align:bottom'>"
			+"<td style='text-align:right;border:0'>"
			+"<a href='javascript:;' style='font-size:80%;'"
			+"	title='"+(heads?this.hideHeadersTip:this.showHeadersTip)+"'"
			+"	onclick='return config.macros.grid.toggleHeaders("
			+"		this,event,"+(heads?"true":"false")+")'>"
			+(heads?this.hideHeaders:this.showHeaders)
			+"</a>"
			+"</td>";
		for (var i=0;i<cols.length;i++) {
			out+=	 "<td style='text-align:center;cursor:pointer;"
				+"	border:0;padding-left:2px;padding-right:2px;' "
				+"<span style='display:"+(heads?"block":"none")+"'>"
				+cols[i].replace(/^[=!]/,'')
				+"</span></td>";
		}
		out+="</tr></thead>";

		// row heading format ('fake' tiddler link)
		// %0=cell width, %1=tiddler name, %2='wiki' classname (optional), %3='inline' classname (optional)
		var head="<td style='text-align:right;border:0;padding-right:2px;white-space:nowrap;%0;'>"
			+"<a href='javascript:;' tid=\"%1\" class='grid_heading %2 %3' "
			+"onclick='story.displayTiddler("
			+"	this,this.getAttribute(\"tid\"));return false'>%1</a></td>";

		// row value format
		// %0=bgcolor, %1=cellwidth, %2=cell alignment, %3=tiddler name
		// %4=slice/section/field name, %5=tooltip, %6='wiki' classname (optional),
		// %7='inline' classname (optional), %8=cell content value
		var cell="<td style='background-color:%0;border:1px solid;%1;%2;' tid=\"%3\" ";
		if (edit) cell+="onclick='return config.macros.grid.editInPlace("
			+"this,event,this.getAttribute(\"tid\"),\"%4\");' ";
		cell+="title=\"%5\" class='grid_content %6 %7'>%8</td>";

		// generate rows
		for (var i=0;i<rows.length;i++) {
			var tiddlersrc=rows[i].replace(/"/g,"&#x22;");
			out+="<tr style='border:0;vertical-align:top'>";
			out+=head.format([inline?'width:1%':'',tiddlersrc,wiki?'wiki':'',inline?'inline':'']);
			for (var j=0;j<cols.length;j++) { var c=cols[j];
				var val=this.get(rows[i],c);
				var content="&nbsp;";
				if (val.length && inline) {
					content=val.htmlEncode();
					if (c=='=text'||clip) // truncate
						content=val.substr(0,clip||500)
							+(val.length>(clip||500)?"...":"");
					if (c=='=text') // format tiddler source
						content='<html><code style="line-height:100%">'
							+content.replace(/\n/g,'<br>')
							+'</code></html>';
				}
				var title=this.showName(tiddlersrc,c)+(!inline?'='+val:'');
				out+=cell.format([
					val.length&&!inline?'#999':'transparent', !inline?'width:1em;':'',
					inline&&!isNaN(parseFloat(val))?'text-align:right !important;':'',
					tiddlersrc, c, title, wiki?'wiki':'', inline?'inline':'', content]);
			}
			out+='</tr>';
		}
		out+="</table></html>";
		return out;
	},
	showName: function(tid,name) {
		if (name==this.sizeSliceName) var fmt='%0 - size (in bytes)'; // fake slice
		var fmt=(name.substr(0,1)=='=')?'%1@%0':(name.substr(0,1)=='!')?'%1##%0':'%0::%1';
		return fmt.format([tid,name.replace(/^[=!]/,'')]);
	},
	toggleHeaders: function(here,event,defOpen) {
		if (here.expanded==undefined) here.expanded=defOpen;
		var ex=here.expanded=!here.expanded; 
		here.innerHTML=ex?this.hideHeaders:this.showHeaders;
		here.title=ex?this.hideHeadersTip:this.showHeadersTip;
		var cells=here.parentNode.parentNode.getElementsByTagName('td');
		for (i=1; i<cells.length; i++) cells[i].firstChild.style.display=ex?'inline':'none';
		event.cancelBubble=true;if(event.stopPropagation)event.stopPropagation();return false;
	},
	editInPlace: function(here,event,tid,name) {
		if (here.editing) return false; // already editing, don't re-init
		if (name==this.sizeSliceName) return false; // read-only fake slice
		var v=this.get(tid,name); // current value
		var lines=v.split('\n').length;
		var title=this.showName(tid,name);
		var style=lines>1?'font-size:90%;width:99%;':'font-size:100%;width:95%;line-height:100%;'
		var maxlines=Math.min(lines,config.options['txtMaxEditRows']); // for textarea
		var html=lines>1?'<textarea rows='+maxlines:'<input type="text"';
		html   +=' tid="'+tid.replace(/"/g,'&#x22;')+'"'
			+' name="'+name.replace(/"/g,'&#x22;')+'"'
			+' style="margin:0px;padding:1px 0px 1px 3px;border:0;'+style+'"'
			+' title="'+title+' (ENTER=submit, ESC=cancel)"'
			+' onblur="config.macros.grid.blur(this,event)"'
			+' onkeydown="config.macros.grid.keydown(this,event)"';
		html+=lines>1?'></textarea>':'>';
		here.editing=true;
		here.setAttribute('savedWidth',here.style.width);
		here.setAttribute('savedPadding',here.style.padding);
		here.setAttribute('savedColor',here.style.backgroundColor);
		if (!hasClass(here,'inline')) here.style.width='99%';
		here.style.padding='0px'; 
		here.style.backgroundColor='#fff';
		here.innerHTML=html;
		var ta=here.firstChild; ta.value=v; ta.focus(); ta.select();
		event.cancelBubble=true;if(event.stopPropagation)event.stopPropagation();return false;
	},
	keydown: function(here,ev) { ev=ev||window.event;
		var tid=here.getAttribute('tid');
		var name=here.getAttribute('name');
		if (ev.keyCode==27) {
			var currval=this.get(tid,name);
			if (here.value==currval) { here.blur(); return false; }
			here.asking=true; // prevents blur handling during confirm()
			var discard=confirm('OK to discard changes to '+this.showName(tid,name)+'?');
			here.asking=false;
			if (discard) { here.value=currval; here.blur(); }
			return false;
		}
		else if (ev.keyCode==13 && !ev.ctrlKey) {
			this.set(tid,name,here.value);
			here.blur();
			return false;
		}
	},
	blur: function(here,ev) { ev=ev||window.event;
		if (here.asking) return false;
		var tid=here.getAttribute('tid');
		var name=here.getAttribute('name');
		var currval=this.get(tid,name);
		var msg=this.showName(tid,name)+' has changed... OK to save changes?';
		if (here.value!=currval && confirm(msg))
			{ this.set(tid,name,here.value); currval=this.get(tid,name); }
		var target=here.parentNode;
		target.editing=false;
		target.style.backgroundColor=target.getAttribute('savedColor');
		target.style.padding=target.getAttribute('savedPadding');
		target.style.width=target.getAttribute('savedWidth');
		if (name=='=text') currval='<html><code>'+currval.substr(0,500).replace(/\\n/g,'<br>')+'</code></html>';
		if (hasClass(target,'wiki')) { removeChildren(target); wikify(currval,target); }
		else target.innerHTML=hasClass(target,'inline')?currval:'&nbsp;';
	},
	get: function(tid,name) {
		if (name.substr(0,1)=='=') var v=store.getValue(tid,name.substr(1)); // field
		else if (name.substr(0,1)=='!') var v=store.getTiddlerText(tid+'##'+name.substr(1));  // section
		else if (name==this.sizeSliceName) var v=store.getTiddlerText(tid,'').length.toString();  // fake slice
		else var v=store.getTiddlerSlice(tid,name); // real slice
		return v||'';
	},
	set: function(tid,name,val) {
		if (val==this.get(tid,name)) return false; // unchanged... do nothing
		if (name.substr(0,1)=='=') // field
			{  name=name.substr(1); store.setValue(tid,name,val); }
		else if (name.substr(0,1)=='!') // section
			{  name=name.substr(1); this.setSection(tid,name,val); }
		else // slice
			{ this.setSlice(tid,name,val); }
		displayMessage(this.showName(tid,name)+' has been updated');
		return false;
	},
	setSection: function(tid,name,newval) {
		var t=store.getTiddler(tid); if (!t) { var t=new Tiddler(); t.text=''; }
		var oldval=this.get(tid,'!'+name).escapeRegExp();
		var pattern=new RegExp('(.*!{1,6}'+name+'\\n)'+oldval+'((?:\\n!{1,6}|$).*)');
		var newText=t.text.replace(pattern,'$1'+newval+'$2');
		var who=config.options.txtUserName; var when=new Date();
		if (config.options.chkForceMinorUpdate) { var who=t.modifier; var when=t.modified; }
		store.saveTiddler(tid,tid,newText,who,when,t.tags,t.fields);
		story.refreshTiddler(tid,null,true);
	},
	setSlice: function(tid,name,newval) {
		var t=store.getTiddler(tid); if (!t) { var t=new Tiddler(); t.text=''; }
		var oldval=this.get(tid,name)||'';
		var pattern="((?:^|\\n)\\|\\s*[\\'\\/]*~?(?:"
			+name.escapeRegExp()
			+")\\:?[\\'\\/]*\\s*\\|\\s*)(?:"
			+oldval.escapeRegExp()
			+")(\\s*\\|(?:\\n|$))";
		var match=t.text.match(new RegExp(pattern));
		if (match) {
			var pos=t.text.indexOf(match[0]);
			var newText=t.text.substr(0,pos)
				+match[1]+newval+match[2]
				+t.text.substr(pos+match[0].length);
		} else { // create new slice at start of tiddler or after last existing slice (if any)
			var match=t.text.match(this.slicesRE); if (match) var last=match[match.length-1];
			var pos=last?t.text.indexOf(last)+last.length+1:0; 
			var newText=t.text.substr(0,pos)+'|'+name+'|'+newval+'|\n'+t.text.substr(pos);
		}
		var who=config.options.txtUserName; var when=new Date();
		if (config.options.chkForceMinorUpdate) { var who=t.modifier; var when=t.modified; }
		store.saveTiddler(tid,tid,newText,who,when,t.tags,t.fields);
		story.refreshTiddler(tid,null,true);
	},
	getSlices: function(tid) {
		var slices = {};
		var text = store.getTiddlerText(tid,'');
		slices[this.sizeSliceName]=text.length.toString();  // fake slice
		this.slicesRE.lastIndex = 0;
		do {
			var m = this.slicesRE.exec(text);
			if (m) { if (m[1]) slices[m[1]] = m[2]; else slices[m[3]] = m[4]; }
		} while(m);
		return slices;
	},
	getSections: function(tid) {
		var s=[];
		var t=store.getTiddlerText(tid,'');
		var p=/(?:^|\n)!{1,6}([^\n]*)\n/gm;
		do { var m=p.exec(t); if (m) { s.push(m[1]); } } while(m);
		return s;
	},
	getFields: function(tid) {
		var t=store.getTiddler(tid); if (!t) return [];
		var fields=['=created','=modified','=modifier','=text','=tags'];
		for (var f in t.fields) fields.push('='+f);
		return fields;
	}
};
//}}}