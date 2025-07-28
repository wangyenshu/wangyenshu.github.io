/***
|Name|TagGridPlugin|
|Source|http://www.TiddlyTools.com/#TagGridPlugin|
|Documentation|http://www.TiddlyTools.com/#TagGridPluginInfo|
|Version|1.7.0|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|Generate a cross-referenced grid of tiddlers, based on tag values|
!!!!!Documentation
>see [[TagGridPluginInfo]]
!!!!!Revisions
<<<
2008.04.21 [1.7.0] added support for "filter:..." param to exclude tiddlers from grid
2008.01.08 [*.*.*] plugin size reduction: documentation moved to ...Info tiddler
2007.12.04 [*.*.*] update for TW2.3.0: replaced deprecated core functions, regexps, and macros
2007.07.24 [1.6.5] corrected handling for @TiddlerName with excluded tags, so that excluded tags are not actually removed from the @TiddlerName source tiddler.
|please see [[TagGridPluginInfo]] for additional revision details|
2006.10.05 [1.0.0] initial release (converted from prototype inline script)
<<<
!!!!!Code
***/
//{{{
version.extensions.TagGridPlugin= {major: 1, minor: 7, revision: 0, date: new Date(2008,4,21)};

config.macros.tagGrid= {
	verbose:false, // display debugging/performance feedback messages
	warn:true,	// display workload warning message before rendering
	threshold:300000, // workload warning threshold (workload=# of comparisons to perform)
	handler:
	function(place,macroName,params) {

		// get columns
		var columntags=params.shift(); var cols=[];
		if ((!columntags)||(columntags=="all")) // no param (or "all") - use all tags
			{ var all=store.getTags(); for (i=0;i<all.length;i++) cols.push(all[i][0]); }
		else if (columntags.substr(0,1)=="+") // get tag list from tiddler content
			{ var t=store.getTiddlerText(columntags.substr(1)); if (t&&t.length) cols=t.readBracketedList(); }
		else if (columntags.substr(0,1)=="@") // get tag list from tiddler tags
			{ var t=store.getTiddler(columntags.substr(1)); if (t&&t.tags) for (i=0;i<t.tags.length;i++) cols.push(t.tags[i]); }
		else if (columntags.substr(0,1)=="=")  // get names of "tagtiddlers" tagged with meta-tag
			{ var t=store.getTaggedTiddlers(columntags.substr(1)); for (i=0;i<t.length;i++) cols.push(t[i].title); }
		else cols=columntags.readBracketedList();
		if (!cols.length) { wikify("~TagGrid: no columns to display\n",place); return; }

		// exclude specific column tags
		if (params[0]&&params[0].substr(0,8)=="exclude:") {
			var ex=params.shift().substr(8).readBracketedList();
			for (x=0; x<ex.length; x++) {
				var i=cols.indexOf(ex[x]);
				if (i!=-1) cols.splice(i,1); // remove excluded tags
			}
		}

		// get rows
		var rowtags=params.shift(); var rows=[];
		if ((!rowtags)||(rowtags=="all")) // no param (or "all") - use all tags
			{ var all=store.getTags(); for (i=0;i<all.length;i++) rows.push(all[i][0]); }
		else if (rowtags.substr(0,1)=="+") // get tag list from tiddler content
			{ var t=store.getTiddlerText(rowtags.substr(1)); if (t&&t.length) rows=t.readBracketedList(); }
		else if (rowtags.substr(0,1)=="@") // get tag list from tiddler tags
			{ var t=store.getTiddler(rowtags.substr(1)); if (t&&t.tags) for (i=0;i<t.tags.length;i++) rows.push(t.tags[i]); }
		else if (rowtags.substr(0,1)=="=")  // get names of "tagtiddlers" tagged with meta-tag
			{ var t=store.getTaggedTiddlers(rowtags.substr(1)); for (i=0;i<t.length;i++) rows.push(t[i].title); }
		else rows=rowtags.readBracketedList();
		if (!rows.length) { wikify("~TagGrid: no rows to display\n",place); return; }

		// exclude specific row tags
		if (params[0]&&params[0].substr(0,8)=="exclude:") {
			var ex=params.shift().substr(8).readBracketedList();
		 	for (x=0; x<ex.length; x++) {
				var i=rows.indexOf(ex[x]);
				if (i!=-1) rows.splice(i,1); // remove excluded tags
			}
		}

		// get optional tiddler filter
		if (params[0]&&params[0].substr(0,7).toUpperCase()=="FILTER:")
			var filter=params.shift().substr(7);

		// get optional flag keywords and/or color gradient endpoints
		var defOpen=false;
		var colorAll=false;
		var sortRows=false;
		var sortColumns=false;
		var showInline=false;
		var p=params.shift();
		while (p) {
			switch (p.toUpperCase()) {
				case "OPEN":
					defOpen=true; break;
				case "COLORALL":
					colorAll=true; break;
				case "SORTROWS":
					sortRows=true; break;
				case "SORTCOLUMNS":
					sortColumns=true; break;
				case "INLINE":
					showInline=true; break;
				default:
					if (startcolor==undefined) var startcolor=p;
					else if (endcolor==undefined) var endcolor=p;
					else alert("unexpected parameter: '"+p+"'");
					break;
			}
			p=params.shift();
		}

		// get the tiddlers
		if (filter&&filter.length)
			var tiddlers=store.filterTiddlers(filter);
		else
			var tiddlers=store.getTiddlers("modified","excludeLists");

		// show "workload warning"... get permission to proceed...
		if (this.warn) {
			var workload=rows.length*cols.length*tiddlers.length;
			var warning="Cross-indexing %0 tiddlers in %1 row%3 by %2 column%4...\n(up to %5 comparisons MAY be needed)\n\n";
			warning+="This may take a while.  It is OK to proceed?";
			warning=warning.format([tiddlers.length,rows.length,cols.length,rows.length!=1?"s":"",cols.length!=1?"s":"",workload]);
			if (workload>this.threshold&&!confirm(warning)) { wikify("~TagGrid: display cancelled by user\n",place); return; }
		}

		// sort row and column tags in decending order, by frequency of use
		if (sortRows||sortColumns) {
			var tags=store.getTags(); var tagcount={}; for (i=0; i<tags.length; i++) tagcount[tags[i][0]]=tags[i][1];
			if (sortRows) rows.sort(function(a,b){return (!tagcount[a]||tagcount[a]<tagcount[b])?+1:(tagcount[a]==tagcount[b]?0:-1);});
			if (sortColumns) cols.sort(function(a,b){return (!tagcount[a]||tagcount[a]<tagcount[b])?+1:(tagcount[a]==tagcount[b]?0:-1);});
		}

		// cross-index tiddlers by tags, building lists of tiddler titles into grid[i][j] (sparse array)
		var time1=new Date();
		var grid=new Array();
		var max=0;  // track maximum cross-index value
		for (var t=0;t<tiddlers.length;t++) { // for each tiddler
			for (var i=0;i<tiddlers[t].tags.length;i++) { // for each tag in tiddler
				var row=rows.indexOf(tiddlers[t].tags[i]); if (row==-1) continue; // this tag not in rows
				if (!grid[row]) grid[row]=new Array(); // create row as needed
				for (var j=0;j<tiddlers[t].tags.length;j++) {  // for each tag in tiddler
					var col=cols.indexOf(tiddlers[t].tags[j]); if (col==-1) continue; // this tag not in columns
					if (!grid[row][col]) grid[row][col]=new Array(); // create cell
					grid[row][col].push("[["+tiddlers[t].title+"]]"); // add tiddler title to cell
					if (max<grid[row][col].length) max=grid[row][col].length; // check for new maximum
				}
			}
		}

		// compute gradient color map
		if (startcolor && endcolor) {
			var digits="0123456789ABCDEF";
			function hexToDec(s) // 2-digit conversion
				{ return digits.indexOf(s.substr(0,1).toUpperCase())*16+digits.indexOf(s.substr(1,1).toUpperCase()); }
			function decToHex(d) // 2-digit conversion
				{ return digits.substr(Math.floor(d/16),1)+digits.substr(d%16,1); }
			var steps=max;
			var startR=hexToDec(startcolor.substr(0,2));
			var startG=hexToDec(startcolor.substr(2,2));
			var startB=hexToDec(startcolor.substr(4,2));
			var endR=hexToDec(endcolor.substr(0,2));
			var endG=hexToDec(endcolor.substr(2,2));
			var endB=hexToDec(endcolor.substr(4,2));
			var rangeR=endR-startR;
			var rangeG=endG-startG;
			var rangeB=endB-startB;
			var stepR=rangeR/steps; if (stepR>0) stepR=Math.floor(stepR); else stepR=Math.ceil(stepR);
			var stepG=rangeG/steps; if (stepG>0) stepG=Math.floor(stepG); else stepG=Math.ceil(stepG);
			var stepB=rangeB/steps; if (stepB>0) stepB=Math.floor(stepB); else stepB=Math.ceil(stepB);
			var colors=[];
			colors[0]=startcolor;
			for (var i=1; i<steps; i++)
				colors[i]=decToHex(startR+stepR*i)+decToHex(startG+stepG*i)+decToHex(startB+stepB*i);
			colors[steps-1]=endcolor; // fixup for roundoff error
		}

		// generate HTML table containing popups (and optional inline links)
		var time2=new Date();
		var out="<html><table cellpadding='0' cellspacing='0' style='border:0;border-collapse:collapse'>";
		// column headings
		out+="<tr style='border:0;'><td style='text-align:right;border:0'>";
		out+="<a href='' style='font-size:80%;'";
		out+="	title='show all column headings'";
		out+="	onclick='return config.macros.tagGrid.toggleAllColumns(this,event,"+defOpen+")'>"+(defOpen?"&lt;&lt;&lt;":"&gt;&gt;&gt;")+"</a>";
		out+="</td>";
		for (var i=0;i<cols.length;i++) {
			out+="<td style='text-align:center;cursor:pointer;border:0;padding-left:2px;padding-right:2px' ";
			out+="	title='show/hide column heading' ";
			out+="	onclick='return config.macros.tagGrid.toggleColumn(this,event)'>";
			out+="<a href='' title='open tag tiddler'";
			if (!defOpen) out+="	style='display:none' ";
			out+="	onclick='story.displayTiddler(this,\""+cols[i]+"\");return false'>"+cols[i]+"</a>";
			out+="</td>";
		}
		out+="</tr>";
		for (var i=0;i<rows.length;i++) {
			// row heading
			var rowlink="<a href='' onclick='story.displayTiddler(this,\""+rows[i]+"\");return false'>"+rows[i]+"</a>";
			out +="<tr style='border:0'>";
			out +="<td style='text-align:right;border:0;padding-right:2px'>"+rowlink+"</td>";
			for (var j=0;j<cols.length;j++) {
				var content="";
				var bgcolor="transparent"; // default empty cell background
				if (colors && colorAll) bgcolor="#"+colors[0]; // empty cell background uses startcolor 
				var bordercolor=""; // default border color (inherits current CSS value)
				if (colors) bordercolor="#"+colors[Math.floor(colors.length/2-1)]; // border uses mid-tone color 
				var linkstyle=""; // use default unless background color is very light or very dark
				var cross=(grid[i]&&grid[i][j])?grid[i][j]:null;
				var hdr=rows[i]+(rows[i]!=cols[j]?(" + "+cols[j]):"");
				if (cross) {
					// cross-tagged list of tiddlers (in a popup)
					var label="<b>"+cross.length+"</b>";
					var tip=hdr;
					var list=cross.sort().join(' ').replace(/'/g,"\\'").replace(/"/g,'&quot;');
					var handler="return config.macros.tagGrid.popup(this,event,\'"+rows[i]+"\',\'"+cols[j]+"\',\'"+list+"\')";
					if (colors) {
						var c=colors[cross.length-1];
						bgcolor="#"+c;
						linkstyle="style='color:#000000 !important'";
						// invert link color if background is very light
						if (c.substr(0,2)<"60" || c.substr(2,2)<"60" || c.substr(4,2)<"60")
							linkstyle="style='color:#FFFFFF !important'";
					}
				} else {
					var label="&nbsp;-&nbsp;";
					var tip="create a new tiddler tagged with: "+hdr;
					var list="";
					var handler="var title=config.macros.newTiddler.title;";
					handler+="story.displayTiddler(this,title,DEFAULT_EDIT_TEMPLATE);";
					handler+="story.setTiddlerTag(title,\'"+rows[i]+"\',+1);";
					handler+="story.setTiddlerTag(title,\'"+cols[j]+"\',+1);";
					handler+="story.focusTiddler(title,\'text\');return(false);";
				}
				if (!showInline || !cross)
					content+='<a href="javascript:;" '+linkstyle+' onclick="'+handler+'" title="'+tip+'">'+label+'</a>';
				if (showInline && cross) {
					content+="<div "+linkstyle+"><span style='white-space:nowrap'>";
					content+=hdr+" ("+label+")";
					content+="</span></div><hr>";
					// list tiddler links inline in table cell
					for (t=0; t<cross.length; t++) {
						var title=cross[t].replace(/\[\[/g,'').replace(/\]\]/g,'');
						var handler="story.displayTiddler(null,'"+title+"');return false;"
						var tid=store.getTiddler(title);
						var author=tid.modifier;
						var date=tid.modified.toLocaleString();
						var tip=config.messages.tiddlerLinkTooltip.format([title,author,date]);
						if (t>0) content+="<br>";
						content+='<a href="javascript:;" '+linkstyle+' onclick="'+handler+'" title="'+tip+'">'+title+'</a>';
					}
					content+="<hr>";
					handler="var tids=\'"+list+"\'.readBracketedList();story.displayTiddlers(this,tids); return(false);"
					tip="display all tiddlers tagged with: "+hdr;
					content+='<a href="javascript:;" '+linkstyle+' onclick="'+handler+'" title="'+tip+'">open all...</a><br>';
					handler="var title=config.macros.newTiddler.title;";
					handler+="story.displayTiddler(this,title,DEFAULT_EDIT_TEMPLATE);";
					handler+="story.setTiddlerTag(title,\'"+rows[i]+"\',+1);";
					handler+="story.setTiddlerTag(title,\'"+cols[j]+"\',+1);";
					handler+="story.focusTiddler(title,'text'); return(false);"
					tip="create a new tiddler tagged with: "+hdr;
					content+='<a href="javascript:;" '+linkstyle+' onclick="'+handler+'" title="'+tip+'">new tiddler...</a>';
				}
				out+="<td style='background-color:"+bgcolor+";border:1px solid "+bordercolor+" !important;text-align:center'>"+content+"</td>";
			}
			out+="</tr>";
		}
		out+="</table>";
		out+="</html>";
		createTiddlyElement(place,"span").innerHTML=out;
		var time3=new Date();
		if (this.verbose) displayMessage("TagGrid: scan="+(time2-time1)+", generate table="+(time3-time2));
	},
	popup:
	function(here,event,row,col,list) {
		var tids=list.replace(/&quot;/g,'"').readBracketedList();
		var hdr=row+(row!=col?(" AND "+col):"");
		if (tids.length) {
			var p=Popup.create(here); if (!p) return;
			createTiddlyText(p,hdr);
			createTiddlyElement(p,'hr');
			for(var t=0; t<tids.length; t++) createTiddlyLink(createTiddlyElement(p,'li'),tids[t],true);
			createTiddlyElement(p,'hr');
			createTiddlyButton(createTiddlyElement(p,'li'),
				"open all...", "display all tiddlers tagged with: "+hdr,
				function(){story.displayTiddlers(null,tids); return(false);});
			var a=createTiddlyButton(createTiddlyElement(p,'li'),
				"new tiddler...", "create a new tiddler tagged with: "+hdr,
				function(){
					var title=config.macros.newTiddler.title;
					story.displayTiddler(this,title,DEFAULT_EDIT_TEMPLATE);
					story.setTiddlerTag(title,this.getAttribute("rowtag"),+1);
					story.setTiddlerTag(title,this.getAttribute("coltag"),+1);
					story.focusTiddler(title,"text");
					return(false);
				});
			a.setAttribute("rowtag",row);
			a.setAttribute("coltag",col);
			Popup.show();
		}
		event.cancelBubble = true;
		if (event.stopPropagation) event.stopPropagation();
		return(false);
	},
	toggleAllColumns:
	function(here,event,defOpen) {
		if (here.expanded==undefined) here.expanded=defOpen;
		var ex=here.expanded=!here.expanded; 
		here.innerHTML=ex?"&lt;&lt;&lt;":"&gt;&gt;&gt;";
		here.title=ex?'hide all column headings':'show all column headings';
		var cells=here.parentNode.parentNode.getElementsByTagName("td");
		for (i=1; i<cells.length; i++) cells[i].firstChild.style.display=ex?"inline":"none";
		event.cancelBubble = true;
		if (event.stopPropagation) event.stopPropagation();
		return(false);
	},
	toggleColumn:
	function(here,event) {
		here.firstChild.style.display=(here.firstChild.style.display=="none")?"inline":"none";
		event.cancelBubble = true;
		if (event.stopPropagation) event.stopPropagation();
		return(false);
	}
};
//}}}