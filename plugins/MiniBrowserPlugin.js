/***
|Name|MiniBrowserPlugin|
|Source|http://www.TiddlyTools.com/#MiniBrowserPlugin|
|Documentation|http://www.TiddlyTools.com/#MiniBrowserPluginInfo|
|Version|1.5.3|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.2|
|Type|plugin|
|Requires|PlayerPlugin (optional, recommended)|
|Description|embedded browser-in-browser with favorites lists and media support|
!!!!!Documentation
>see [[MiniBrowserPluginInfo]]
!!!!!Configuration
>Default mini browser size:
>width: <<option txtMiniBrowserWidth>> height: <<option txtMiniBrowserHeight>>
!!!!!Revisions
<<<
2011.02.08 1.5.3 added 'nocontrols' macro keyword parameter
2009.08.29 1.5.2 in load(), fixed 'noplayer' IFRAME output
2009.07.03 1.5.1 added onclick handling to 'n of m' button.  also, if noedit mode, add line numbers to bookmarks droplist items
2009.06.08 1.5.0 added optional 'noedit' mode: replaces add/del/edit buttons with next/previous navigation.
|see [[MiniBrowserPluginInfo]] for additional revision details|
2007.10.15 1.0.0 combined MiniBrowser and MediaCenter inline scripts and converted to true plugin
2006.03.01 0.0.0 inline script
<<<
!!!!!Code
***/
//{{{
version.extensions.MiniBrowserPlugin={major: 1, minor: 5, revision: 3, date: new Date(2011,2,8)};

config.shadowTiddlers.MiniBrowser='<<miniBrowser>>';
config.options.txtMiniBrowserWidth=config.options.txtMiniBrowserWidth||'100%';
config.options.txtMiniBrowserHeight=config.options.txtMiniBrowserHeight||'1000';
config.macros.miniBrowser= {
	favoritesList: 'MiniBrowserList',
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var noPlayer=params[0]&&params[0].toLowerCase()=='noplayer'; if (noPlayer) params.shift();
		var noEdit  =params[0]&&params[0].toLowerCase()=='noedit';   if (noEdit)   params.shift();
		var expand  =params[0]&&params[0].toLowerCase()=='expand';   if (expand)   params.shift();
		var hideControls=params[0]&&params[0].toLowerCase()=='hidecontrols'; if (hideControls) params.shift();
		var noControls  =params[0]&&params[0].toLowerCase()=='nocontrols';   if (noControls)   params.shift();
		hideControls	=noControls||hideControls;	// no controls implies hide controls
		var url		=(params[0]&&!store.tiddlerExists(params[0]))?params.shift():'';
		if (!url.length) noControls=hideControls=false; // if no initial URL, force controls to show
		if (!config.macros.player) noPlayer=true; // PlayerPlugin not installed
		var w=config.options.txtMiniBrowserWidth;
		var h=config.options.txtMiniBrowserHeight;

		// create form
		var guid=new Date().getTime()+Math.random().toString(); // globally unique ID
		var html=store.getTiddlerText('MiniBrowserPlugin##html');
		html=html.replace(/%id%/g,guid)
			.replace(/%noplayer%/g,noPlayer?'true':'')
			.replace(/%noedit%/g,noEdit||readOnly?'none':'inline')
			.replace(/%shownav%/g,noEdit||readOnly?'inline':'none')
			.replace(/%hidecontrols%/g,hideControls?'none':'block')
			.replace(/%bookmarksize%/g,(expand?70:20)+'%')
			.replace(/%urlsize%/g,(expand?69.5:20)+'%')
			.replace(/%linebreak%/g,expand?'<br>':'')
			.replace(/%favorites%/g,params[0]||config.macros.miniBrowser.favoritesList);
		createTiddlyElement(place,'span').innerHTML=html;

		// init form
		function $(i){return document.getElementById(i)}; // abbrev
		$('minibrowser_controls_'+guid).style.display=hideControls?'none':'block';
		$('minibrowser_resize_'+guid).style.display=hideControls?'none':'block';
		$('minibrowser_nocontrols_'+guid).style.display=noControls?'none':'inline';
		$('minibrowser_togglecontrols_'+guid).checked=!hideControls;
		$('minibrowser_form_'+guid).url.value=url;
		$('minibrowser_form_'+guid).w.value=w;
		$('minibrowser_form_'+guid).h.value=h;
		if (noPlayer) { // hide type list no PlayerPlugin
			$('minibrowser_type_'+guid).style.display='none';
			$('minibrowser_url_'+guid).style.width=(expand?81.5:32)+'%';
		}

		// load bookmarks droplist from HR-separated tiddler contents
		var b=$('minibrowser_bookmarks_'+guid);
		while (b.options[1]) b.options[1]=null; // clear list but leave 'prompt' item
		var p; while (p=params.shift()) this.getFavorites(b,p,noEdit); // load custom bookmarks
		if (b.length<2) this.getFavorites(b,config.macros.miniBrowser.favoritesList,noEdit); // default list
		$('minibrowser_nav_'+guid).value='1 out of '+b.length;

		// load initial URL (if any)
		var place=$('minibrowser_player_'+guid);
		this.load(place,guid,'','',w,h,true,noPlayer);
		this.go($('minibrowser_form_'+guid));
	},
	getFavorites: function(list,tid,noEdit) {
		var txt=store.getTiddlerText(tid); if (!txt||!txt.trim().length) return;
		txt=this.getWikifiedData(txt);
		var parts=txt.split('\n----\n');
		for (var p=0; p<parts.length; p++) {
			var lines=parts[p].split('\n');
			var label=lines.shift()||''; // 1st line=display text
			var value=lines.shift()||''; // 2nd line=item value
			var indent=value&&value.length?'\xa0\xa0':'';
			var prefix=value.length&&noEdit?list.length+1+': ':'';
			list.options[list.length]=new Option(prefix+indent+label,value,false,false);
		}
	},
	getWikifiedData: // wikify content, then extract text WITH newlines and HRs included
	function(txt) {
		var e=createTiddlyElement(document.body,'div'); wikify(txt,e);
		var breaks=e.getElementsByTagName('br');
		for (var b=0; b<breaks.length; b++)
			breaks[b].parentNode.insertBefore(document.createTextNode('\n'),breaks[b]);
		var lines=e.getElementsByTagName('hr');
		for (var l=0; l<lines.length; l++)
			lines[l].parentNode.insertBefore(document.createTextNode('----\n'),lines[l]);
		var items=e.getElementsByTagName('li');
		for (var i=0; i<items.length; i++)
			items[i].parentNode.insertBefore(document.createTextNode('\n'),items[i]);
		var txt=getPlainText(e);
		removeNode(e);
		return txt.replace(/\r*/g,'').replace(/\n\n/g,'\n');
	},
	load: function(place,id,type,url,w,h,showcontrols,noPlayer) {
		if (!noPlayer)
			config.macros.player.loadURL(place,id,type,url,w,h,showcontrols);
		else { // force IFRAME-only display
			if (!place) place=document.getElementById(id).parentNode;
			var fmt="<iframe name='%0' id='%0' src='%1' width='%2' height='%3' \
				style='background:#fff;border:1px solid'></iframe>";
			place.innerHTML=fmt.format([id,url,w,h]);
		}
	},
	go: function(f) {
		var url=f.url.value.trim();
		if (!url.length) url=f.url.value=f.bookmarks.value.trim();
		if (!url.length) { this.done(f); return false; }
		var id=f.playerID.value;
		document.getElementById('minibrowser_player_'+id).style.display='block';
		document.getElementById('minibrowser_controls2_'+id).style.display='block';
		this.load(null,id,f.type.value,f.url.value,f.w.value,f.h.value,f.ctrls.checked,f.noPlayer.value=='true');
		var matched=false; for (var i=0; i<f.bookmarks.options.length; i++) // select matching bookmark
			if (f.bookmarks.options[i].value==url) { f.bookmarks.selectedIndex=i; matched=true; break; }
		if (!matched) f.bookmarks.selectedIndex=0;
		f.done.disabled=false;
		return false;
	},
	done: function(f) {
		var id=f.playerID.value;
		this.load(null,id,null,null,f.w.value,0,f.ctrls.checked,f.noPlayer.value=='true');
		document.getElementById('minibrowser_player_'+id).style.display='none';
		document.getElementById('minibrowser_controls2_'+id).style.display='none';
		f.done.disabled=true; 
		return false;
	},
	fit: function(place) {
		// fudge factor to account for the other controls + padding + borders.  ADJUST THIS VALUE TO FIT LAYOUT
		var trim=89;
		var t=story.findContainingTiddler(place);
		if (!t) { t=place; while (t && t.className!='floatingPanel') t=t.parentNode; } if (!t) return;
		var w='100%'; // horizontal stretching via CSS works, but vertical stretching doesn't... so:
		var h=t.offsetHeight-trim; // workaround: get containing panel/tiddler height and subtract trim height
		var f=place.form;
		this.load(null,f.playerID.value,f.type.value,f.url.value,w,h,f.ctrls.checked,f.noPlayer.value=='true');
		place.form.w.value=w; place.form.h.value=h; // update width/height input fields
	},
	add: function(place,title) {
		var v=place.value; if (!v.length) return;
		var d=prompt('Please enter a description for\n'+place.value); if (!d || !d.length) return;
		var who=config.options.txtUserName;
		var when=new Date();
		var tid=store.getTiddler(title);
		var txt='%0\n%1\n----\n%2'.format([d,v,tid?tid.text:'']);
		store.saveTiddler(title,title,txt,who,when,tid?tid.tags:[],tid?tid.fields:{});
		if (!tid) story.displayTiddler(story.findContainingTiddler(place),title);
		else story.refreshTiddler(title,1,true);
		var here=story.findContainingTiddler(place);
		if (here) story.refreshTiddler(here.getAttribute('tiddler'),1,true);
	},
	del: function(place,title) {
		var v=place.value; if (!v.length) return;
		var d=place.options[place.selectedIndex].text; if (!d.length) return;
		if (!confirm('Are you sure you want to remove this favorite?\n\n'+d+'\n'+v)) return;
		var tid=store.getTiddler(title); if (!tid) return;
		var who=config.options.txtUserName;
		var when=new Date();
		var pat='%0\n%1\n----\n'.format([d.replace(/\xa0/g,''),v]); var re=new RegExp(pat,'i');
		var txt=tid.text.replace(re,'');
		store.saveTiddler(title,title,txt,who,when,tid?tid.tags:[],tid?tid.fields:{});
		story.refreshTiddler(title,1,true);
		var here=story.findContainingTiddler(place);
		if (here) story.refreshTiddler(here.getAttribute('tiddler'),1,true);
	}
}
//}}}
/***
//{{{
!html
<form id='minibrowser_form_%id%' style='display:block;margin:0;padding:0' onsubmit='return config.macros.miniBrowser.go(this);'><!--
--><nobr><input type='hidden' name='playerID' value='%id%'><input type='hidden' name='noPlayer' value='%noplayer%'><!--
--><div id='minibrowser_controls_%id%' style='display:%hidecontrols%'><!--
--><input type='button' value='<' title='back' style='width:3%'
	onclick='try{window.frames["player_%id%"].history.go(-1)}catch(e){window.history.go(-1)}' ><!--
--><input type='button' value='>' title='forward' style='width:3%'
	onclick='try{window.frames["player_%id%"].history.go(+1)}catch(e){window.history.go(+1)}'><!--
--><input type='button' value='+' title='refresh'style='width:3%'
	onclick='try{window.frames["player_%id%"].location.reload()}catch(e){;}'><!--
--><input type='button' value='x' title='stop'style='width:3%'
	onclick='window.stop()'><!--
--><select name='bookmarks' id='minibrowser_bookmarks_%id%' size='1' style='width:%bookmarksize%'
	onchange='this.form.url.value=this.value;
		this.form.nav.value="%0 out of %1".format([this.selectedIndex+1,this.length]);
		this.form.nav.title="reload %0".format([this.options[this.selectedIndex].text]);
		return config.macros.miniBrowser.go(this.form);'><!--
--><option value=''>bookmarks...</option><!--
--></select><!--
--><span style='display:%noedit%'><!--
--><input type='button' value='add' title='add URL to the bookmarks' style='width:6%'
	favorites="%favorites%"
	onclick='config.macros.miniBrowser.add(this.form.url,this.getAttribute("favorites"));'><!--
--><input type='button' value='del' title='remove URL from the bookmarks' style='width:6%'
	favorites="%favorites%"
	onclick='config.macros.miniBrowser.del(this.form.bookmarks,this.getAttribute("favorites"));'><!--
--><input type='button' value='edit' title='edit the bookmarks list' style='width:6%'
	favorites="%favorites%"
	onclick='story.displayTiddler(null,this.getAttribute("favorites"),2)'><!--
--></span><!--
--><span style='display:%shownav%'><!--
--><input name=prev type='button' value='&#x25C4;' title='view previous bookmark' style='width:3%'
	onclick='var b=document.getElementById("minibrowser_bookmarks_%id%");
		b.selectedIndex=Math.max(b.selectedIndex-1,0); b.onchange();'><!--
--><input name='nav' id='minibrowser_nav_%id%'
	type='button' value='N out of MM' title='enter a bookmark number' style='width:12%'
	onclick='return this.form.next.click();
		var b=this.form.bookmarks;
		var i=prompt("Enter a bookmark number (1-"+b.length+")",b.selectedIndex+1);
		if (i && i<b.length) { b.selectedIndex=i-1; b.onchange(); }'><!--
--><input name=next type='button' value='&#x25BA;' title='view next bookmark' style='width:3%'
	onclick='var b=document.getElementById("minibrowser_bookmarks_%id%");
		b.selectedIndex=Math.min(b.selectedIndex+1,b.length); b.onchange();'><!--
--></span><!--
-->%linebreak%<!--
--><select name='type' id='minibrowser_type_%id%' size='1' style='width:12%'
	onchange='var opt=this.options; for (var i=0; i<opt.length; i++)
		if (i==this.selectedIndex) opt[i].text=opt[i].text.replace(/\xa0\xa0/,"&radic;");
		else opt[i].text=opt[i].text.replace(/&radic;/,"\xa0\xa0");
		if (this.selectedIndex==0) opt[1].text=opt[1].text.replace(/\xa0\xa0/,"&radic;");'><!--
--><option value=''>type...</option><!--
--><option value=''>&radic; auto-detect</option><!--
--><option value='iframe'>&nbsp;&nbsp; web page</option><!--
--><option value='windows'>&nbsp;&nbsp; windows media</option><!--
--><option value='realone'>&nbsp;&nbsp; real one</option><!--
--><option value='quicktime'>&nbsp;&nbsp; quicktime</option><!--
--><option value='flash'>&nbsp;&nbsp; flash</option><!--
--><option value='image'>&nbsp;&nbsp; jpg/gif/png</option><!--
--></select><!--
--><input type='text' name='url' id='minibrowser_url_%id%' size='60' value='' style='width:%urlsize%'
	onfocus='this.select()'><!--
--><input type='submit' value='go' title='view URL' style='width:6%'><!--
--><input type='button' value='open' title='open a separate tab/window' style='width:6%'
	onclick='if (this.form.url.value.length) window.open(this.form.url.value)'><!--
--><input type='button' value='done' name='done' disabled title='disconnect from URL' style='width:6%'
	onclick='return config.macros.miniBrowser.done(this.form);'><!--
--></div><!--
--><div id='minibrowser_player_%id%' style='display:none;text-align:center'></div><!--
--><span id='minibrowser_controls2_%id%' style='margin-top:2px;display:none;'><!--
--><div id='minibrowser_resize_%id%' style='display:%hidecontrols%;float:right'><!--
--> size: <input type='text' name='w' size='3' value='' style=''
	onfocus='this.select()'><!--
-->x<input type='text' name='h' size='3' value='' style=''
	onfocus='this.select()'><!--
--> <input type='submit' value='set' style='width:5em'
	onclick='var f=this.form;
		if(!f.w.value.trim().length) f.w.value=config.options.txtMiniBrowserWidth;
		if(!f.h.value.trim().length) f.h.value=config.options.txtMiniBrowserHeight;
		config.options.txtMiniBrowserWidth=f.w.value; config.options.txtMiniBrowserHeight=f.h.value;
		saveOptionCookie("txtMiniBrowserWidth"); saveOptionCookie("txtMiniBrowserHeight");'><!--
--><input type='submit' value='reset' style='width:5em'
	onclick='var f=this.form; f.ctrls.checked=true; f.w.value="100%"; f.h.value="480";
		config.options.txtMiniBrowserWidth=f.w.value; config.options.txtMiniBrowserHeight=f.h.value;
		saveOptionCookie("txtMiniBrowserWidth"); saveOptionCookie("txtMiniBrowserHeight");'><!--
--><input type='button' value='fit' title='resize player to fit containing window' style='width:5em'
	onclick='config.macros.miniBrowser.fit(this)'><!--
--></div><!--
 style='display:%hidecontrols%'
--><span id='minibrowser_nocontrols_%id%'><!--
--> <input type='checkbox' name='ctrls' id='minibrowser_togglecontrols_%id%' title='toggle minibrowser controls' CHECKED 
	onclick='document.getElementById("minibrowser_controls_%id%").style.display=this.checked?"block":"none";
		document.getElementById("minibrowser_resize_%id%").style.display=this.checked?"block":"none";'
><a href='' title='toggle minibrowser controls'
	onclick='this.previousSibling.click();return false;'>show controls</a><!--
--></span><!--
--></span><!--
--></nobr></form>
!end
//}}}
***/
 