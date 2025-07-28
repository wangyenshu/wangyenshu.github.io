/***
|Name|PreviewPlugin|
|Source|http://www.TiddlyTools.com/#PreviewPlugin|
|Documentation|http://www.TiddlyTools.com/#PreviewPluginInfo|
|Version|1.8.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|add key-by-key wikified preview to any textarea input field|
Provides key-by-key ''LIVE PREVIEW'' of //formatted// tiddler content as you type input into a textarea (multi-line) edit field.
!!!!!Documentation
>see [[PreviewPluginInfo]]
!!!!!Configuration
<<<
Automatically freeze preview updates when a tiddler takes more than <<option txtPreviewAutoFreeze>> milliseconds to render.
<<<
!!!!!Revisions
<<<
2008.01.08 [*.*.*] plugin size reduction: documentation moved to ...Info tiddler
2007.12.04 [*.*.*] update for TW2.3.0: replaced deprecated core functions, regexps, and macros
2007.11.18 [1.8.1] in config.commands.previewTiddler, changed alt command text to use character-based "psuedo-checkbox" instead of embedded html fragment
2007.09.27 [1.8.0] split TidIDE preview functionality into separate stand-alone plugin (see [[TidIDEPlugin]]).  
|please see [[TidIDEPluginInfo]] for additional revision details|
2006.04.15 [0.5.0] Initial ALPHA release. Converted from inline script.
<<<
!!!!!Code
***/
// // version info
//{{{
version.extensions.PreviewPlugin= {major: 1, minor: 8, revision: 1, date: new Date(2007,11,18)};
//}}}

// //  macro definition
//{{{
if (config.options.txtPreviewAutoFreeze==undefined)
	config.options.txtPreviewAutoFreeze=250; // limit (in milliseconds) for auto-freezing preview display

config.macros.preview = {
	renderMsg: "rendering preview...",
	timeoutMsg: " (> %0ms)",
	freezeMsg: " - preview is frozen.  Press [refresh] to re-display.",
	handler: function(place,macroName,params) {
		var hide=params[0]=="hide"; if (hide) params.shift();
		var field=params[0];
		var height=params[1]; if (!height) height=15;
		var here=this.findContainingForm(place);
		if (!here) here=story.findContainingTiddler(place);
		if (!here) here=place.parentNode;
		if (!here) here=place;
		var elems=here.getElementsByTagName("textarea");
		if (field) for (var e=0; e<elems.length; e++)  // find matching textarea (by fieldname)
			if (elems[e].getAttribute("edit")==field) var ta=elems[e];
		else
			if (elems.length) var ta=elems[elems.length-1]; // default to last rendered text area
		if (!ta) {
			var elems=here.getElementsByTagName("input");
			if (field) for (var e=0; e<elems.length; e++)  // find matching input field (by fieldname)
				if (elems[e].getAttribute("edit")==field) var ta=elems[e];
			else
				if (elems.length) var ta=elems[elems.length-1]; // default to last rendered input field
		}
		if (!ta) return false; // no textarea or input field found... do nothing...
		var id=(new Date().getTime()).toString()+Math.random(); // unique instance ID
		ta.id=id+"_edit";
		ta.setAttribute("previewid",id+"_preview");
		ta.saved_onkeyup=ta.onkeyup;
		ta.onkeyup=function(ev) {
			if (this.saved_onkeyup) this.saved_onkeyup.apply(this,arguments);
			config.macros.preview.render(this.id,this.getAttribute("previewid"));
		}
		var html=this.html.replace(/%previd%/g,id+"_preview")
		html=html.replace(/%srcid%/g,id+"_edit");
		html=html.replace(/%hide%/g,hide?"none":"block");
		html=html.replace(/%limit%/g,config.options.txtPreviewAutoFreeze);
		html=html.replace(/%frozen%/g,hide?"checked":"");
		html=html.replace(/%height%/g,height);
		html=html.replace(/%halfheight%/g,height/2);
		createTiddlyElement(place,"span").innerHTML=html;
		this.render(id+"_edit",id+"_preview");
	},
	findContainingForm: function(e) {
		while (e && e.nodeName.toLowerCase()!="form") e=e.parentNode;
		return e;
	},
	render: function(srcid,previd,force) {
		var value=document.getElementById(srcid).value;
		var panel=document.getElementById(previd);
		var f=this.findContainingForm(panel);
		if (!f || (f.freeze.checked && !force)) return;
		var p=panel.firstChild; var d=f.domview; var h=f.htmlview; if (!p||!d||!h) return;
		p.innerHTML="";
		f.status.value=this.renderMsg;
		var start=new Date();
		wikify(value.replace(/\r/g,''),p);
		var end=new Date();
		this.renderDOM(previd);
		this.renderHTML(previd);
		f.status.value="elapsed: "+(end-start+1)+"ms";
		// automatically suspend preview updates for slow rendering tiddlers
		if (end-start+1>config.options.txtPreviewAutoFreeze) {
			f.freeze.checked=true;
			f.status.value+=this.timeoutMsg.format([config.options.txtPreviewAutoFreeze]);
		}
		if (f.freeze.checked) f.status.value+=this.freezeMsg;
	},
	renderDOM: function(id) {
		var panel=document.getElementById(id);
		var f=this.findContainingForm(panel); if (!f) return;
		var p=panel.firstChild; var d=f.domview; var h=f.htmlview; if (!p||!d||!h) return;
		var height=p.getAttribute("height");
		p.style.height=((f.dom.checked||f.html.checked)?height/2:height)+"em";
		if (f.dom.checked) d.value=this.getNodeTree(p,"|  ");
		if (!d.style||!h.style) return;
		d.style.height=height/2+"em";
		d.style.display=f.dom.checked?"inline":"none";
		d.style.width=f.html.checked?"49.5%":"100%";
		h.style.width=f.dom.checked?"49.5%":"100%";
	},
	renderHTML: function(id) {
		var panel=document.getElementById(id);
		var f=this.findContainingForm(panel); if (!f) return;
		var p=panel.firstChild; var d=f.domview; var h=f.htmlview; if (!p||!d||!h) return;
		var height=p.getAttribute("height");
		p.style.height=((f.dom.checked||f.html.checked)?height/2:height)+"em";
		if (f.html.checked) h.value=this.formatHTML(p.innerHTML);
		if (!h.style||!d.style) return;
		h.style.height=height/2+"em";
		h.style.display=f.html.checked?"inline":"none";
		h.style.width=f.dom.checked?"49.5%":"100%";
		d.style.width=f.html.checked?"49.5%":"100%";
	},
	formatHTML: function(txt) {
		if (config.browser.isIE) return txt; // BYPASS - 4/24/2006 due to IE hang problem.  Will fix later...
		var out="";
		var indent="";
		var level=0;
		for (var i=0;i<txt.length;i++) {
			var c=txt.substr(i,1);
			if (c=="<") {
					if (txt.substr(i+1,1)=="/")  indent=indent.substr(0,indent.length-2);
				out+="\n"+indent;
				if (txt.substr(i+1,1)!="/" && txt.substr(i+1,3)!="br>" && txt.substr(i+1,2)!="p>" && txt.substr(i+1,3)!="hr>")  indent+="  ";
			}
			out+=c;
				if (c=="\n")
				out+=indent;
			if (c==">" && txt.substr(i+1,1)!="<")
				out+="\n"+indent;
		}
		return out;
	},
	getNodeTree: function(theNode,theIndent,showPath,inline,thePrefix,thePath)
	{
		if (!theNode) return "";
		if (!thePrefix) thePrefix="";
		if (!thePath) thePath="";
		var mquote='"'+(inline?"{{{":"");
		var endmquote=(inline?"}}}":"")+'"';
		// generate output for this node
		var out = thePrefix;
		if (showPath && thePath.length)
				out += (inline?"//":"")+thePath.substr(1)+":"+(inline?"//":"")+"\r\n"+thePrefix;
		if (theNode.className=="DOMViewer")
			return out+'[DOMViewer]\r\n'; // avoid self-referential recursion
		out += (inline?"''":"")+theNode.nodeName.toUpperCase()+(inline?"''":"");
		if (theNode.nodeName=="#text")
			out += ' '+mquote+theNode.nodeValue.replace(/\n/g,'\\n')+endmquote;
		if (theNode.className)
			out += ' class='+mquote+theNode.className+endmquote;
		if (theNode.type)
			out += ' type='+mquote+theNode.type+endmquote;
		if (theNode.id)
			out += ' id='+mquote+theNode.id+endmquote;
		if (theNode.name)
			out += " "+theNode.name+(theNode.value?"="+mquote+theNode.value+endmquote:"");
		if (theNode.href)
			out += ' href='+mquote+theNode.href+endmquote;
		if (theNode.src)
			out += ' src='+mquote+theNode.src+endmquote;
		if (theNode.attributes && theNode.getAttribute("tiddlyLink")!=undefined)
			out += ' tiddler='+mquote+theNode.getAttribute("tiddlyLink")+endmquote;
		out += "\r\n";
		// recursively generate output for child nodes
		thePath=thePath+"."+theNode.nodeName.toLowerCase();
		thePrefix=theIndent+thePrefix;
		for (var i=0;i<theNode.childNodes.length;i++)
		{
			var thisChild=theNode.childNodes.item(i);
			var theNum=(inline?"~~":"(")+(i+1)+(inline?"~~":")");
			out += this.getNodeTree(thisChild,theIndent,showPath,inline,thePrefix,thePath+theNum);
		}
		return out;
	},
	html: " <form style='width:100%'><span id='%previd%' editID='%srcid%' style='display:%hide%'><div class='viewer' \
			height='%height%' style='margin:0;margin-top:.5em;height:%height%em;overflow:auto;white-space:normal'> \
			&nbsp; \
			</div> \
		<!-- DOM and HTML viewers --> \
		<textarea name=domview cols=60 rows=12 wrap=off \
			onfocus='this.select()' style='display:none;width:100%;height:%halfheight%em;'></textarea><!-- \
		--><textarea name=htmlview cols=60 rows=12 wrap=off \
			onfocus='this.select()' style='display:none;width:100%;height:%halfheight%em;'></textarea> \
		<!-- status line, preview option checkboxes, run/refresh buttons --> \
		<table width='100%' style='border:0;padding:0;margin:0'><tr style='border:0;padding:0;margin:0'> \
		<td style='border:0;padding:0;margin:0'><!-- \
			--><input type=text name=status style='padding:0;width:100%;' \
				title='ELAPSED: time (in milliseconds) used to render tiddler content in preview display'><!-- \
		--></td><td style='width:1%;border:0;padding:0;margin:0;'><!-- \
			--><input type=text name=limit size='6' maxlength='6' style='padding:0;width:5em;text-align:center' \
				value='%limit%ms' title='TIME LIMIT: maximum rendering time (in milliseconds) before auto-freezing preview' \
				onfocus='this.select()' \
				onchange='var val=this.value.replace(/[^0-9]/g,\"\"); if (!val.length) val=this.defaultValue; \
					this.value=val+\"ms\"; config.options.txtPreviewAutoFreeze=val; saveOptionCookie(\"txtPreviewAutoFreeze\"); \
					this.form.freeze.checked=false; config.macros.preview.render(\"%srcid%\",\"%previd%\",true);'><!-- \
		--></td><td style='width:1%;border:0;padding:0;margin:0;'><!-- \
			--><input type=text name=height size='4' maxlength='4' style='padding:0;width:4em;text-align:center' \
				value='%height%em' title='HEIGHT: size (in \"ems\") of preview area, including controls' \
				onfocus='this.select()' \
				onchange='var val=this.value.replace(/[^0-9]/g,\"\");  if (!val.length) val=this.defaultValue; \
					this.value=val+\"em\"; document.getElementById(\"%previd%\").firstChild.setAttribute(\"height\",val); \
					config.macros.preview.render(\"%srcid%\",\"%previd%\",true)'><!-- \
		--></td><td style='width:1%;border:0;padding:0;margin:0;text-align:right;white-space:nowrap'> \
			<input type=checkbox name=dom style='display:inline;width:auto;margin:1px;' \
				title='show Document Object Model (DOM) information' \
				onclick='config.macros.preview.renderDOM(\"%previd%\");'>DOM \
			<input type=checkbox name=html style='display:inline;width:auto;margin:1px;' \
				title='show rendered HTML' \
				onclick='config.macros.preview.renderHTML(\"%previd%\");'>HTML \
			<input type=checkbox name=freeze style='display:inline;width:auto;margin:1px;' %frozen% \
				title='do not update preview display as changes are made' \
				onclick='var p=document.getElementById(\"%previd%\");  \
					if (this.checked) this.form.status.value+=config.macros.preview.freezeMsg; \
					else config.macros.preview.render(\"%srcid%\",\"%previd%\",true);'>freeze \
			<input type=button style='display:inline;width:auto;' value='refresh' \
				title='update preview display' \
				onclick='config.macros.preview.render(\"%srcid%\",\"%previd%\",true)'> \
		</td></tr></table> \
		</span></form>"
}
//}}}

// // toolbar definition
//{{{
config.commands.previewTiddler = {
	text: 'preview',
	tooltip: 'show key-by-key preview',
	text_alt: '\u221Apreview',
	handler: function(event,src,title) {
		var here=story.findContainingTiddler(src); if (!here) return;
		var elems=here.getElementsByTagName("span");
		for (var e=0; e<elems.length; e++) {
			if (elems[e].getAttribute("editid")) {
				var show=elems[e].style.display=="none";
				src.innerHTML=show?this.text_alt:this.text;
				elems[e].style.display=show?"block":"none";
				config.macros.preview.findContainingForm(elems[e]).freeze.checked=!show;
				if (show) config.macros.preview.render(elems[e].getAttribute("editid"),elems[e].id);
			}
		}
		return false;
	}
};
//}}}