/***
|Name|TiddlyLifePlugin|
|Source|http://www.TiddlyTools.com/#TiddlyLifePlugin|
|Documentation|http://www.TiddlyTools.com/#TiddlyLifePlugin|
|Version|1.6.5|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|Cellular Automata: Conway's "Game of Life"|
!!!!!Documentation
<<<
[[TiddlyLife]] is a TiddlyWiki-enabled javascript version of Conway's "Game of Life" cellular automata simulator.  It provides a "life matrix" on which to place cells, run the simulation, and observe the results.  The speed of the simulation is related to the total size of the matrix (i.e., rows X cols): the larger the matrix, the longer it takes to compute each 'generation' of cells.

You can set the number of rows and columns in the matrix, as well as the size of each cell and the color of the cells, grid, and background.  You can use the mouse to click/drag over the grid to add/delete cells (hold shift to add "walls").  The current life matrix can be saved as text in a tiddler and then reloaded later from a popup list of tiddlers tagged with<<tag tiddlyLife>>

Please see Wikipedia for an overview of [[Conway's "Game of Life"|http://en.wikipedia.org/wiki/Conway%27s_Game_of_Life]].
<<<
!!!!!Syntax
<<<
{{{
<<life	cellcolor:... gridcolor:... bgcolor:... wallcolor:...
	cellsize:... gridwidth:... delay:... limit:... stability:...
	autostart nomenu nostats noedit width:... height:... tid:...>>
}}}
where all parameters are optional (default values are shown in parentheses):
*''cellcolor:'' (//green//), ''gridcolor:'' (//#111//), ''bgcolor:'' (//black//) and ''wallcolor:'' (//gray//)<br>are CSS color names or RGB values (e.g.: "black", "blue",  "#fff", "#9af", etc.)
*''cellsize:'' (//1em//), and ''gridwidth:'' (//1px//)<br>are CSS dimensions, including units (e.g., px,em,cm,in)
*''delay:'' (//0//)<br>delay time (in msec) between simulation ticks (a larger number results in a slower simulation, but also leaves more CPU cycles available for other processes)
*''limit:'' (//10000//)<br>automatically stop stimulation after the indicated number of generations (use 0 for no limit)
*''stability:'' (//500//)<br>automatically stop simulation if population count remains stable for the indicated number of generations (use 0 for no limit)
*''autostart'' (//keyword//)<br>when present, causes the simulation to begin running as soon as the macro is rendered
*''nomenu'' (//keyword//)<br>when present, suppresses display of command menu (use with ''autostart'')
*''nostats'' (//keyword//)<br>when present, suppresses display of the current matrix statistics (generation #, population count/min/avg/max, birthrate/deathrate, average age)
*''noedit'' (//keyword//)<br>when present, prevent hand editing of cells in the matrix.  Instead, clicking on the matrix starts/stops the simulation (useful with ''nomenu'' and ''autostart'')
*''width:'' (//30//) and ''height:'' (//30//)<br>are dimensions for an empty life matrix
*''tid:'' (//no default//)<br>specifies a tiddler containing a saved life matrix definition.  note: when using a saved matrix, the width/height are determined by the stored definition and any width/height macro parameters that are present will be ignored.
<<<
!!!!!Examples
<<<
"Multi-cellular organisms" can be constructed by arranging blocks in specific patterns that exhibit emergent behaviors such as movement, symmetry, oscillation and generative abilities.  Two well-known organisms that are [[discussed in the Wikipedia article|http://en.wikipedia.org/wiki/Conway%27s_Game_of_Life]] are ''//gliders//'' and ''//Gosper's glider gun//'':

[[GliderDance]]: many small moving organisms just missing each other!
{{{<<life cellsize:.8em tid:GliderDance>>}}}
<<life cellsize:.8em tid:GliderDance>>
[[GliderGun]]: generates a stream of gliders that hits a wall
{{{<<life cellsize:.6em tid:GliderGun>>}}}
<<life cellsize:.6em tid:GliderGun>>
... and here's an ''empty life matrix'' for you to play with:
{{{<<life>>}}}
<<life>>
<<<
!!!!!Revisions
<<<
2008.10.11 [1.6.5] added 'step' command.  Also, for performance, removed birth/death stats and don't display average age (but //do// calculate it)
2008.10.10 [1.6.0] added birthrate, deathrate, and average age to statistics
2008.10.09 [1.5.0] use //named// params.  changed matrix values: 0==empty, >0==alive, <0==wall, where value=generation # in which cell was created
2008.10.08 [1.4.0] added 'stability' and 'limit' options (replaces 'autostop' checkbox)
2008.10.08 [1.3.0] added optional 'autostart', 'nomenu' and 'nostats' macro params
2008.10.07 [1.2.1] fixed update handling so multiple timers will no longer be created
2008.10.06 [1.2.0] added support for walls (unchanging dead cells) using dead="-", alive="O", wall="#"
2008.10.06 [1.1.1] redraw optimization: 300% speed improvement by setting CSS only when cell state *changes*
2008.10.05 [1.1.0] drag to draw (set/clear) multiple cells, new option controls (rows,cols,cellsize,delay,autostop), popup list for opening saved matrix
2008.10.04 [1.0.0] initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.TiddlyLifePlugin= {major: 1, minor: 6, revision: 5, date: new Date(2008,10,11)};
config.shadowTiddlers.TiddlyLife="<<life>>";
config.macros.life={
//}}}
// // DEFAULTS
//{{{
	cellcolor:	"green",
	cellsize:	"1em",
	gridcolor:	"#111",
	gridwidth:	"1px",
	bgcolor:	"black",
	wallcolor:	"gray",
	width:		30,
	height:		30,
	stability: 	300,
	limit:		5000,
	delay:		0,
//}}}
// // TRANSLATE
//{{{
	lifeTag:	"tiddlyLife",
	titlePrompt:	"Enter a new tiddler title",
	openErr:	"Could not open '%0'",
	limitMsg:	"stopped: completed %0 generations",
	stableMsg:	"stopped: no growth for %0 generations",
	cellEditTip:	"CLICK=set/clear, SHIFT-CLICK=set wall",
	noEditTip:	"CLICK=start/stop simulation",
	startLabel:	"start",
	stopLabel:	"<b>STOP</b>",
	stats:		"gen: <b>%0</b> pop: <b>%1</b> min: <b>%2</b> avg: <b>%3</b> max: <b>%4</b> %5",
	cmds:		"<a href='#' title='start/stop simulation'\
				onclick='return config.macros.life.toggle(\"%0\")'>%1</a> \
			 | <a href='#' title='advance simulation by one generation'\
				onclick='return config.macros.life.step(\"%0\")'>step</a> \
			 | <a href='#' title='reload the starting life matrix'\
				onclick='return config.macros.life.reset(\"%0\")'>reset</a> \
			 | <a href='#' title='clear the life matrix'\
				onclick='return config.macros.life.clear(\"%0\")'>clear</a> \
			 | <a href='#' title='load a life matrix from a tiddler'\
				onclick='return config.macros.life.open(this,event,\"%0\")'>open</a> \
			 | <a href='#' title='save the current life matrix to a tiddler'\
				onclick='return config.macros.life.save(\"%0\")'>save</a> \
			 | <a href='#' title='change simulation option settings'\
				onclick='var s=this.nextSibling.style; var show=s.display==\"none\"; \
					s.display=show?\"block\":\"none\"; \
					return false;'>options</a><span style='display:none'>%2</span>",
	opts:		"delay:<input type='text' title='delay between generations (msec)' \
				value='%1' style='width:4em;font-size:90%;text-align:center;'>\
			 limit:<input type='text' title='automatically stop after N generations (0=no limit)' \
				value='%2' style='width:4em;font-size:90%;text-align:center;'>\
			 stability:<input type='text' title='stop if population count is stable for N generations (0=no limit)'\
				value='%3' style='width:4em;font-size:90%;text-align:center;'><br>\
			 rows:<input type='text' title='matrix height' \
				value='%4' style='width:3em;font-size:90%;text-align:center;'>\
			 cols:<input type='text' title='matrix width' \
				value='%5' style='width:3em;font-size:90%;text-align:center;'>\
			 cells:<input type='text' title='cellsize' \
				value='%6' style='width:3em;font-size:90%;text-align:center;'>\
			 <input type='button' value='OK' style='font-size:90%;' \
				title='change the life matrix dimensions' \
				onclick='var ins=this.parentNode.getElementsByTagName(\"input\"); \
					var t=ins[0].value; var l=ins[1].value; var a=ins[2].value; \
					var h=ins[3].value; var w=ins[4].value; var s=ins[5].value; \
					return config.macros.life.setoptions(\"%0\",w,h,s,t,a,l)'>",
	msgfmt: 	"<br><span title='use \"options\" command to change autostop settings' \
			onclick='this.style.display=\"none\"' \
			style='display:block;position:absolute;padding:0 .5em;cursor:pointer; \
			margin:.5em;color:%1;background-color:%2;border:1px solid %1'>%3</span>",

//}}}
// // GENERAL UTILITIES
//{{{
	empty: function(w,h) { // generate an empty matrix
		var m=[]; for (var r=0; r<h; r++) { m[r]=[]; for (var c=0; c<w; c++) m[r][c]=0; } return m;
	},
	paste: function(row,col,m1,m2) { // copy one matrix into another
		for (var r=row; r<m1.length && r<m2.length; r++)
			for (var c=col; c<m1[r].length && c<m2[r].length; c++)
				m2[r][c]=m1[r][c];
	},
	zeroPad: function(v,m) { // formatting for population stats
		var t=("0000"+v.toString());
		return t.substr(t.length-Math.max(m.toString().length,v.toString().length));
	},
	getValue: function(s) { // cell value from stored matrix symbol
		return s=='O'?1:s=='#'?-1:0;
	},
	getSymbol: function(v) { // stored matrix symbol from cell value
		return v>0?'O':v<0?'#':'-';
	},
	getColor: function(v,d) { // color from cell value
		return v>0?d.cellcolor:v<0?d.wallcolor:'';
	},
	getAge: function(v,d) { // age of a cell or wall
		return v?(d.gen||1)-Math.abs(v):0;
	},
	isAlive: function(v) { // 0 if dead, 1 if alive
		return v>0;
	},
	isWall: function(v) { // 1 if cell is a wall
		return v<0;
	},
	isAncient: function(v,d) { // true if cell age is more than ten times the average age
		return d.avgage>0 && this.getAge(v,d)>10*d.avgage;
	},
//}}}
// // MACRO HANDLER
//{{{
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var autostart	=params.contains("autostart");
		var nomenu	=params.contains("nomenu");
		var nostats	=params.contains("nostats");
		var noedit	=params.contains("noedit");
		params = paramString.parseParams("anon",null,true,false,false);
		var cellcolor	=getParam(params,"cellcolor",this.cellcolor);
		var wallcolor	=getParam(params,"wallcolor",this.wallcolor);
		var cellsize	=getParam(params,"cellsize",this.cellsize);
		var gridcolor	=getParam(params,"gridcolor",this.gridcolor);
		var gridwidth	=getParam(params,"gridwidth",this.gridwidth);
		var bgcolor	=getParam(params,"bgcolor",this.bgcolor);
		var tid		=getParam(params,"tid",this.tid);
		var w		=getParam(params,"rows",this.width);
		var h		=getParam(params,"cols",this.height);
		var delay	=getParam(params,"delay",this.delay);
		var stability	=getParam(params,"stability",this.stability);
		var limit	=getParam(params,"limit",this.limit);
		var m=this.load(tid); if (!m) var m=this.empty(w,h);
		var id="tiddlyLife_"+new Date().getTime()+Math.random();
		var e=createTiddlyElement(place,"span",id,"tiddlyLife");
		e.data={w:w, h:h, tid:tid, matrix:m, gen:0, stopped:!autostart,
			gencount:0, stable:0, total:0, birthrate:0, deathrate:0, age:0, 
			cellcolor:cellcolor, wallcolor:wallcolor, gridcolor:gridcolor, bgcolor:bgcolor,
			cellsize:cellsize, gridwidth:gridwidth, delay:delay, stability:stability, limit:limit,
			nostats:nostats, nomenu:nomenu, noedit:noedit };
		this.draw(id); if (autostart) this.go(id);
	},
//}}}
// // COMMAND HANDLERS
//{{{
	toggle: function(id) { // toggle simulation
		var e=document.getElementById(id); if (!e) return; var d=e.data; var m=d.matrix;
		if (d.stopped) this.go(id); else this.stop(id);
		return false;
	},
	go: function(id) { // start simulation and set command text
		var e=document.getElementById(id); if (!e) return; var d=e.data; var m=d.matrix;
		var b=e.getElementsByTagName("a")[0]; if (b) b.innerHTML=this.stopLabel;
		d.stopped=false; d.stable=0; d.gencount=0; clearTimeout(d.timer); this.refresh(id);
		return false;
	},
	stop: function(id) { // stop simulation and set command text
		var e=document.getElementById(id); if (!e) return; var d=e.data; var m=d.matrix;
		var b=e.getElementsByTagName("a")[0]; if (b) b.innerHTML=this.startLabel;
		d.stopped=true; clearTimeout(d.timer);		
		return false;
	},
	reset: function(id) { // reload initial matrix
		var e=document.getElementById(id); if (!e) return; var d=e.data;
		var m=this.load(d.tid); if (!m) var m=this.empty(d.w,d.h);
		this.stop(id); d.matrix=m; d.gen=0; this.draw(id);
		return false;
	},
	clear: function(id) { // load empty matrix
		var e=document.getElementById(id); if (!e) return; var d=e.data;
		var tid=d.tid; d.tid=""; this.reset(id); d.tid=tid;
		return false;
	},
	setoptions: function(id,w,h,s,t,a,l) { // options: width,height,cellsize,delaytime,autostop,limit
		var e=document.getElementById(id); if (!e) return; var d=e.data; var m=d.matrix;
		clearTimeout(d.timer); // stop simulation while changing matrix content
		d.w=w; d.h=h; d.stability=a; d.limit=l; d.cellsize=s; d.delay=t;
		var m2=this.empty(w,h); this.paste(0,0,m,m2); d.matrix=m2; this.draw(id);
		d.min=Math.min(d.min,d.count); d.max=Math.max(d.max,d.count);
		if (!d.stopped) d.timer=setTimeout('config.macros.life.refresh("'+id+'")',d.delay);
		return false;
	},
//}}}
// // I/O HANDLERS
//{{{
	load: function(tid) { // read tiddler into matrix
		var t=store.getTiddlerText(tid); if (!t) return;
		var lines=t.split("\n"); var m=[];
		if (lines[0]=="{{{") lines.shift();
		if (lines[lines.length-1]=="}}}") lines.pop();
		for (var r=0; r<lines.length; r++) { m[r]=[];
			for (var c=0; c<lines[r].length; c++) m[r].push(this.getValue(lines[r].substr(c,1)));
		}
		return m;
	},
	save: function(id) { // write matrix to tiddler
		var e=document.getElementById(id); if (!e) return; var d=e.data; var m=d.matrix;
		var tid=d.tid; var msg=config.messages.overwriteWarning.format([tid]);
		while (!tid||!tid.length ||(store.tiddlerExists(tid)&&!confirm(msg)))
			{ tid=prompt(this.titlePrompt,tid); if (!tid||!tid.length) return false; }
		d.tid=tid;
		var out=[];
		out.push('{{{');
		for (var r=0; r<m.length; r++) { var row='';
			for (var c=0; c<m[r].length; c++) row+=this.getSymbol(m[r][c]);
			out.push(row);
		}
		out.push('}}}');
		var t=store.getTiddler(tid);
		var txt=out.join('\n');
		var who=t&&config.options.chkForceMinorUpdate?t.modifier:config.options.txtUserName;
		var when=t&&config.options.chkForceMinorUpdate?t.modified:new Date();
		var tags=t?t.tags:[]; tags.pushUnique(this.lifeTag);
		var fields=t?t.fields:{};
		store.saveTiddler(tid,tid,txt,who,when,tags,fields);
		story.displayTiddler(null,tid); story.refreshTiddler(tid,null,true);
		return false;
	},
	open: function(here,event,id) { // select from a list of saved matrix tiddlers
		var p=Popup.create(here); if (!p) return false;
		p.style.padding="2px .5em";
		var tids=store.getTaggedTiddlers(this.lifeTag);
		for (var t=0; t<tids.length; t++) {
			var b=createTiddlyButton(createTiddlyElement(p,"li"),tids[t].title,tids[t].title,
				function() {
					var cml=config.macros.life;
					var id=this.getAttribute("id");
					var e=document.getElementById(id); if (!e) return false; var d=e.data;
					var tid=this.getAttribute("tid");
					var m=cml.load(tid);
					if (!m) { displayMessage(this.openErr.format([tid])); return false; }
					cml.stop(id); d.tid=tid; d.matrix=m; d.gen=0; cml.draw(id);
					return false;
				});
			b.setAttribute("id",id);
			b.setAttribute("tid",tids[t].title);
		}
		Popup.show();
		event.cancelBubble=true;if(event.stopPropagation)event.stopPropagation();
		return false;
	},
//}}}
// // EDIT HANDLERS
//{{{
	mousedown: function(here,ev,id,r,c) { // start manual edit
		var e=document.getElementById(id); if (!e) return; var d=e.data; var m=d.matrix;
		d.savedstop=d.stopped; this.stop(id); d.draw=!this.isAlive(m[r][c])?(d.gen||1):0;
		return this.setcell(here,id,r,c,ev&&ev.shiftKey?-(d.gen||1):d.draw);
	},
	mouseover: function(here,ev,id,r,c) { // drag edit
		var e=document.getElementById(id); if (!e) return; var d=e.data; var m=d.matrix;
		if (d.draw!==undefined) this.setcell(here,id,r,c,ev&&ev.shiftKey?-(d.gen||1):d.draw);
		return false;
	},
	mouseup: function(here,ev,id,r,c) { // end manual edit
		var e=document.getElementById(id); if (!e) return; var d=e.data; var m=d.matrix;
		if (d.savedstop!==undefined) d.stopped=d.savedstop; if (!d.stopped) this.go(id);
		d.draw=undefined; d.savedstop=undefined;
		return false;
	},
	setcell: function(here,id,r,c,v) { // set cell content and revise stats display
		var e=document.getElementById(id); if (!e) return; var d=e.data; var m=d.matrix;
		if (m[r][c]==v) return;
		if (this.isAlive(m[r][c]) && !this.isAlive(v)) { d.count--; d.min=Math.min(d.min,d.count); }
		if (!this.isAlive(m[r][c]) && this.isAlive(v)) { d.count++; d.max=Math.max(d.max,d.count); }
		m[r][c]=v; here.style.background=this.getColor(v,d);
		this.showstats(id,'');
		return false;
	},
//}}}
// // RENDER
//{{{
	draw: function(id) { // render entire tiddlyLife container (menu, stats, and table)
		var e=document.getElementById(id); if (!e) return; var d=e.data; var m=d.matrix;
		var out=[]; var count=0; var maxwidth=0;
		var style="border:%0 solid %1;background:%2;height:%3 !important;width:%3; !important";
		var onmousedown=d.noedit?"":"return config.macros.life.mousedown(this,event,'%4',%5,%6);";
		var onmouseover=d.noedit?"":"return config.macros.life.mouseover(this,event,'%4',%5,%6);";
		var onmouseup  =d.noedit?"":"return config.macros.life.mouseup(this,event,'%4',%5,%6);";
		var onclick    =d.noedit?"return config.macros.life.toggle('%4');":"";
		var tip="[%7,%8] "+(d.noedit?this.noEditTip:this.cellEditTip);
		var cell='<td style="margin:0;padding:0;'+style +'" title="'+tip+'" onclick="'+onclick
			+'" onmousedown="'+onmousedown+'" onmouseover="'+onmouseover+'" onmouseup="'+onmouseup+'"></td>';
		out.push('<table style="table-layout:fixed;border-collapse:collapse;'
			+'margin:0;padding:0;border:0;background-color:'+d.bgcolor+'">');
		for (var r=0; r<m.length; r++) {
			if (m[r].length>maxwidth) maxwidth=m[r].length;
			out.push('<tr style="margin:0;padding:0;border:0;">');
			for (var c=0; c<m[r].length; c++) {
				out.push(cell.format([d.gridwidth,d.gridcolor,this.getColor(m[r][c],d),
					d.cellsize,id,r,c,r+1,c+1]));
				count+=this.isAlive(m[r][c]);
			}
			out.push('</tr>');
		}
		out.push('</table>');
		d.count=count;
		if (!d.gen) { d.gencount=d.stable=d.total=d.oldest=d.maxage=d.avgage=0; d.min=d.max=d.avg=count; }
		var hdr=[];
		if (!d.nomenu) hdr.push(this.cmds.format([id,d.stopped?this.startLabel:this.stopLabel,
			this.opts.format([id,d.delay,d.limit,d.stability,m.length,maxwidth,d.cellsize])]));
		if (!d.nostats) hdr.push('<div style="font-size:90%">'
			+this.stats.format([d.gen,d.count,d.min,d.avg,d.max])+'</div>');
		e.innerHTML=hdr.join('')+out.join('');
		return false;
	},
//}}}
// // RUN SIMULATION
//{{{
	refresh: function(id) { // timer-based refresh cycle
		var e=document.getElementById(id); if (!e) return; var d=e.data; var m=d.matrix;
		this.step(id); if (!d.stopped) d.timer=setTimeout('config.macros.life.refresh("'+id+'")',d.delay);
		return false;
	},
	step: function(id) { // calc new matrix, gather stats and display changes
		var e=document.getElementById(id); if (!e) return; var d=e.data; var m=d.matrix;
		// calculate next generation
		var m2=[]; var count=agecount=agetotal=oldest=0; d.gen++; d.gencount++;
		var table=e.getElementsByTagName("table")[0]; if (!table) return;
		var rows=table.getElementsByTagName("tr");
		for (var r=0; r<m.length; r++) {
			m2[r]=[];
			var cells=rows[r].getElementsByTagName("td");
			for (var c=0; c<m[r].length; c++) {
				var v=this.tick(d.gen,m,r,c); // apply Conway's 23/3 rule
				m2[r].push(v);
				var color=this.getColor(v,d);
				if (cells[c].style.backgroundColor!=color)
					cells[c].style.backgroundColor=color;
				if (this.isAlive(v)) {
					var a=this.getAge(v,d);
					if (!this.isAncient(v,d)) { agecount++; agetotal+=a; }
					oldest=Math.max(oldest,a);
					count++;
				}
			}
		}
		d.matrix=m2; // update matrix
		this.calcstats(id,count,agecount,agetotal,oldest); // calculate statistics
		var msg=this.autostop(id); // autostop if conditions apply
		this.showstats(id,msg); // show statistics and message (if any)
		return false;
	},
	tick: function(gen,m,r,c) { // apply Conway's 23/3 rule
		if (this.isWall(m[r][c])) return m[r][c]; // walls don't change
		var prevrow=r>0?r-1:(m.length-1);
		var nextrow=r<m.length-1?r+1:0;
		var prevcol=c>0?c-1:(m[r].length-1);
		var nextcol=c<m[r].length-1?c+1:0;
		var near=this.isAlive(m[prevrow][prevcol]) + this.isAlive(m[prevrow][c]) + this.isAlive(m[prevrow][nextcol])
			+this.isAlive(m[r][prevcol])       + this.isAlive(m[r][nextcol])
			+this.isAlive(m[nextrow][prevcol]) + this.isAlive(m[nextrow][c]) + this.isAlive(m[nextrow][nextcol]);
		if (!this.isAlive(m[r][c])&&near==3) return gen; // birth
		if (this.isAlive(m[r][c])&&near==2||near==3) return m[r][c]; // stay alive
		return 0; // death
	},
	autostop: function(id) { // autostop if run limit reached or no changes for N generations
		var e=document.getElementById(id); if (!e) return; var d=e.data; var m=d.matrix;
		var msg='';
		var limited=d.limit>0 && d.gencount>=d.limit;
		var stabilized=d.stability>0 && d.stable>=d.stability;
		if (limited || stabilized) {
			this.stop(id); 
			msg=stabilized?this.stableMsg.format([d.stability]):this.limitMsg.format([d.limit]);
			msg=this.msgfmt.format([id,d.cellcolor,d.bgcolor,msg]);
		}
		return msg;
	},
	calcstats: function(id,count,agecount,agetotal,oldest) {
		var e=document.getElementById(id); if (!e) return; var d=e.data; var m=d.matrix;
		d.stable+=(count==d.count)?1:-d.stable; // add one or reset to zero
		d.count=count; d.total+=count;
		d.min=Math.min(d.min,count); d.max=Math.max(d.max,count); d.avg=Math.floor(d.total/d.gen);
		d.avgage=agecount?agetotal/agecount:0; d.oldest=oldest; d.maxage=Math.max(d.maxage,oldest);
		return false;
	},
	showstats: function(id,msg) {
		var e=document.getElementById(id); if (!e) return; var d=e.data; var m=d.matrix;
		var stats=e.getElementsByTagName("div")[0];
		if (stats) stats.innerHTML=this.stats.format([d.gen,this.zeroPad(d.count,d.max),d.min,d.avg,d.max,msg]);
		return false;
	}
}
//}}}