/***
|Name|[[PasteUpHelperPlugin]]|
|Source|http://www.TiddlyTools.com/#PasteUpHelperPlugin|
|Version|1.7.5|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.5|
|Type|plugin|
|Requires|[[PasteUpPlugin]] [[EditSectionPlugin]]|
|Description|extends [[PasteUpPlugin]] popup editor with enhanced form controls|
!!!Documentation
> see [[PasteUpPluginInfo]]
!!!Example
<<<
<<tiddler PasteUpHelperPlugin##test style:"border:1px solid blue;color:black;background:white;" edit adjust x:1.2in y:-18px w:318px h:74px>>/%
!test
test ~PasteUpHelper test
line 2
line 3
line 4
!end
%/
<<<
!!!Configuration
<<<
<<option chkPasteUpHelper>>enable PasteUpHelper menu (use SHIFT-click to bypass)
{{{<<option chkPasteUpHelper>>}}}
<<option chkPasteUpNoMenuLink>>disable menu heading link to part tiddler
{{{<<option chkPasteUpNoMenuLink>>}}}
<<option chkPasteUpHelperAutoName>>automatically name/number new pages/parts (e.g, Page01, Part01, etc.)
{{{<<option chkPasteUpHelperAutoName>>}}}
Also see [[PasteUpPlugin]], [[PasteUpConfig]] and related shadow tiddlers: [[DefaultPage]], [[DefaultPart]], [[PasteUpStyleSheet]], [[PasteUpHelperTemplate]], [[PasteUpCommands]]
<<<
!!!Revisions
<<<
2012.01.29 1.7.5 invoke autoSaveChanges when tiddlers are modified
2011.12.27 1.7.4 in "add image" dialog, added hidden "filename" field with 'character fixup' for server-side filename to replace all but alphanum, dot, dash, and underscore with underscores (e.g., no spaces or special characters allowed)
2011.11.25 1.7.3 remove extra trailing "," after last function declaration (fixes IE7 error).  Also, revised "add image" dialog layout and input validation handling
2011.09.15 1.7.2 in renderMenu(), cleanup LI creation when menu items are suppressed
2011.09.13 1.7.1 in renderMenu(), suppress menu items if corresponding label is null (or blank)
2011.09.12 1.7.0 added csrf_token to "add image" form (for TiddlySpace binary file upload)
2011.09.09 1.6.0 added support for autonaming: pagenamePattern, partnamePattern and getNextName()
2011.09.08 1.5.0 added popupPicker() to support 'add part' and 'add page' list interface
2011.09.04 1.4.0 replaced 'behind text' image option with 'layer' placement (z-index) control for all elements.  Added "add image" interface: addImagePanel()+HTML Template (shadow)
2011.09.02 1.3.0 major interface changes: replaced big 'helper' form with type-specific forms and handlers.  Rewrote modifyPart() to handle *all* part changes.  SHIFT-CLICK now bypasses helper and shows RAW part definition (all syntax visible)
2011.08.02 1.2.3 added support for multiple listbox definition tiddlers (e.g,. multiple image lists)
2011.08.02 1.2.2 moved renderMenu() from PasteUpPlugin.  Changed menu text and added type-specific commands
2011.07.31 1.2.1 refactored form template and init/save handlers to use getForm(), getInitForm(), and getSaveForm() access functions to support type-specific forms (see also: [[EditSectionPlugin]])
2011.07.24 1.2.0 Added handling for '[edit this list...]'.  Hijack renderMenu() and added popupList() and modifyPart() for fontsize/style 'quick menu' handling.  Added confirmation (optional) to removePart() handling.
2011.06.19 1.1.3 moved default/example user-defined pasteup styles from PageUpConfig##css to [[PasteUpStyleSheet]] shadow and add notification trigger for style changes.  Also, minor wording changes in PasteUpHelperTemplate.
2011.06.18 1.1.2 in initForm(), added "\\r?" to all regexp for IE7 newline handling
2011.06.08 1.1.1 in HTML template, changed "delete" to "remove" and use removePart() (see PasteUpPlugin) instead of editSection() (see EditSectionPlugin)
2011.05.15 1.1.0 added imagePopup() image thumbnail display and selection handling
2011.05.06 1.0.8 fixed default tiddler names sizeList, styleList, and fontList
2011.05.05 1.0.7 in HTML template, use deleteSection() (see EditSectionPlugin)
2011.05.03 1.0.6 HTML template layout changes for 'advanced' checkbox.  Also, moved default config for fonts, styles, and images to separate tiddlers for easier 'overlay' customizations.
2010.12.30 1.0.5 added 'image lock' feature
2010.12.25 1.0.4 removed use of IDs in HTML template and related code (for finding helper elements).  Added transclusion of QuickEditToolbar (optional)
2010.12.18 1.0.3 added 'image behind text' feature
2010.12.12 1.0.2 added "show/hide dimensions" to helper form
2010.11.27 1.0.1 added PasteUpConfig defaults for position/size of new parts and images
2010.11.21 1.0.0 initial release
2010.11.01 0.9.5 helper form and handlers split from PasteUpPlugin
| Please see [[PasteUpPluginInfo]] for previous revision details |
2010.07.21 0.7.5 alpha prototype (for review - do not distribute)
<<<
!!!Code
***/
// // PLUGIN VERSION
//{{{
version.extensions.PasteUpHelperPlugin= {major: 1, minor: 7, revision: 5, date: new Date(2012,1,29)};
//}}}
// // OPTIONS (COOKIES)
//{{{
if (config.options.chkPasteUpHelper===undefined)	config.options.chkPasteUpHelper=true;
if (config.options.chkPasteUpNoMenuLink===undefined)	config.options.chkPasteUpNoMenuLink=false;
if (config.options.chkPasteUpHelperAutoName===undefined)config.options.chkPasteUpHelperAutoName=false;
//}}}
// // HARD-CODED DEFAULTS
//{{{
config.macros.pasteUpHelper = {
	sizeList:	'PasteUpFontList',
	styleList:	'PasteUpStyleList',
	imageList:	'PasteUpImageList',
	styleSheet:	'PasteUpStyleSheet',
	uploadScript:	'http://www.tiddlytools.com/showargs.php',
	uploadPath:	'http://www.servername.com/images/',
	thumbsize:	'100px',
	templates: {	// HTML template SHADOW tiddlers (forms for popup editor)
		text:	  'PasteUpHelperTemplate_Text',		// edit text
		image:	  'PasteUpHelperTemplate_Image',	// select image, x,y,w,h,adjust
		addimage: 'PasteUpHelperTemplate_AddImage',	// add image to list (w/upload)
		place:	  'PasteUpHelperTemplate_Placement'	// x,y,w,h
	},
	MWtag: 'mediawiki',
	MWmsg: 'This part uses MediaWiki-formatted content.  To add an image, please edit the part text and use MediaWiki\'s standard image-embedding syntax.',
//}}}
// // TRANSLATE
//{{{
	sizeListAnnotation:	'List paste up font sizes, one per line (use CSS classnames defined in PasteUpStyleSheet)',
	styleListAnnotation:	'List paste up styles, one per line (use CSS classnames defined in PasteUpStyleSheet)',
	imageListAnnotation:	'List image URLs, one per line (use "name=URL..." to create short names for long URLs)',
	styleSheetAnnotation:	'Add/edit custom styles (CSS) here, then add list entries in PasteUpFontList and/or PasteUpStyleList',
	editTextMenuTxt:	'text...',
	editTextMenuTip:	'Enter TEXT content for this part',
	selectImageMenuTxt:	'image...',
	selectImageMenuTip:	'Choose an IMAGE for this part',
	selectStyleMenuTxt:	'style...',
	selectStyleMenuTip:	'Change the STYLE of this part',
	selectFontMenuTxt:	'font...',
	selectFontMenuTip:	'Change the FONT of this part',
	adjustMenuTxt:		'placement...',
	adjustMenuTip:		'Change the POSITION and/or SIZE of this part',
	removeMenuTxt:		'remove part...',
	removeMenuTip:		'Remove this part from the current page',
	deleteMenuTxt:		'delete part...',
	deleteMenuTip:		'Delete this part definition from the document',
//}}}
// // PLUGIN INIT
//{{{
	init: function() {
		if (!config.macros.pasteUp) return;
		if (!config.macros.editSection) return;

		// override PasteUpPlugin click action to add popup menu
		config.macros.pasteUp.clickAction=this.clickAction;

		// override default EditSectionPlugin forms and handlers
		var cme=config.macros.editSection; // ABBREV
		cme.getForm=this.getForm;
		cme.getInitForm=this.getInitForm;
		cme.getSaveForm=this.getSaveForm;

		// deliver SHADOW HTML form definitions (PasteUpHelper...Template)
		for (var i in this.templates) {
			var tid=this.templates[i];
			config.shadowTiddlers[tid]=store.getTiddlerText('PasteUpHelperPlugin##'+tid,'');
		}

		// deliver SHADOW example/default user-defined pasteup styles (PasteUpStyleSheet)
		var tid=this.styleSheet;
		config.shadowTiddlers[tid]=
			'/*{{{*/\n'
			+store.getTiddlerText('PasteUpHelperPlugin##css','')
			+'\n/*}}}*/';;
		config.annotations[tid]=this.styleSheetAnnotation;
		store.addNotification(tid,refreshStyles);

		// set annotation 'help text' for configuration tiddlers (NOTE: *NO* SHADOWS)
		function annotate(t,a) {
			var tids=t.readBracketedList();
			for (var i=0;i<tids.length;i++) config.annotations[tids[i]]=a;
		}
		annotate(this.styleList,this.styleListAnnotation);
		annotate(this.imageList,this.imageListAnnotation);
		annotate(this.sizeList, this.sizeListAnnotation);
	},
//}}}
// // POPUP MENU (extends PasteUpPlugin default popup menu)
//{{{
	clickAction: function(here,ev) {
		if (config.options.chkPasteUpHelper&&!ev.shiftKey) {
			var cmp=config.macros.pasteUp; // abbrev
			config.macros.pasteUpHelper.renderMenu(Popup.create(here),here);
			var x=cmp.getMX(ev)-findPosX(here);
			var y=cmp.getMY(ev)-findPosY(here);
			Popup.show('top','left',{x:x,y:y});
			return cmp.ok(ev);
		}
		else return config.macros.editSection.click.call(here,ev,'raw');
	},
	renderMenu: function(p,target) {
		var cmp=config.macros.pasteUpHelper; // ABBREV
		var tid=target.getAttribute('tid');
		var txt =store.getTiddlerText(tid);
		cmp.currentTarget=target; // NOTE: GLOBAL STATE VARIABLE!

		// HEADING
		var tip='';
		var s=target.style; var a='auto'; // abbreviations
		var t=target.getAttribute('tiddler'); // source title
		var c=target.className.replace(/ ?pasteUpBorder/,'').replace(/ ?pasteUp/,''); // classname
		if (c.length) tip+=' class="'+c+'", ';
		tip+='x='+(s.left||a)+', y='+(s.top||a);
		tip+=((s.zIndex!=0&&s.zIndex!=1)?', z='+s.zIndex:'')
		tip+=', w='+(s.width||a)+', h='+(s.height||a);
		var li=createTiddlyElement(p,'li'); li.title=tip;
		if (config.options.chkPasteUpNoMenuLink) var head=createTiddlyText(li,t);
		else { var head=createTiddlyLink(li,t); head.innerHTML=t; head.title=tip; }
		createTiddlyElement(p,'hr');

		// GET CURRENT FONTSIZE/STYLE from "class:..." macro param
		var size=''; var classname=''; // FIRST CLASSNAME IS FONTSIZE, REST IS STYLENAME
		var pat='<<(?:pasteUp|tiddler)\\s+\\[\\[.+##content\\]\\]\\s+class:"([^"]*)".*?>>';
		var re=new RegExp(pat);	var m=re.exec(txt);
		if (m) { var t=m[1].split(' '); size=t.shift(); classname=t.join(' '); }
		else { // FALLBACK: GET FONTSIZE/STYLE from CSS class wrapper
			var pat="\\{\\{([^\\{]+)\\{\\r?\\n((?:.|\\n)*)\\r?\\n\\}\\}\\}$";
			var re=new RegExp(pat); var m=re.exec(txt);
			if (m) { var t=m[1].split(' '); size=t.shift(); classname=t.join(' '); }
			else { // FALLBACK: GET FONTSIZE/STYLE from HTML div
				var pat='<html><div class="([^"]+)">\\r?\\n((?:.|\\n)*)\\r?\\n</div></html>$';
				var re=new RegExp(pat); var m=re.exec(txt);
				if (m) { var t=m[1].split(' '); size=t.shift(); classname=t.join(' '); }
			}
		}

		// EDIT TEXT...
		var label=this.editTextMenuTxt; var tip=this.editTextMenuTip;
		if (label&&label.length) createTiddlyButton(
			createTiddlyElement(p,'li'),label,tip,function(ev){
			Popup.remove();
			config.macros.editSection.click.call(
				config.macros.pasteUpHelper.currentTarget,ev,'text');
			return config.macros.pasteUp.ok(ev);
		});

		// SELECT IMAGE...
		var label=this.selectImageMenuTxt; var tip=this.selectImageMenuTip;
		if (label&&label.length) createTiddlyButton(
			createTiddlyElement(p,'li'),label,tip,function(ev){
			var cmp=config.macros.pasteUpHelper; // ABBREV
			Popup.remove();
			var t=store.getTiddler(this.getAttribute('tid'));
			if (t&&t.isTagged(cmp.MWtag)) alert(cmp.MWmsg);
			else config.macros.editSection.click.call(cmp.currentTarget,ev,'image');
			return config.macros.pasteUp.ok(ev);
		},null,null,null,{tid:tid});

		// SET STYLE...
		var label=this.selectStyleMenuTxt; var tip=this.selectStyleMenuTip;
		if (label&&label.length) createTiddlyButton(
			createTiddlyElement(p,'li'),label,tip,cmp.popupList,
			null,null,null,{mode:'style',tid:tid,val:classname});

		// SET FONTSIZE...
		var label=this.selectFontMenuTxt; var tip=this.selectFontMenuTip;
		if (label&&label.length) createTiddlyButton(
			createTiddlyElement(p,'li'),label,tip,cmp.popupList,
			null,null,null,{mode:'size',tid:tid,val:size});

		// ADJUST PART...
		if (target.adjustable) {
			var label=this.adjustMenuTxt; var tip=this.adjustMenuTip;
			if (label&&label.length) createTiddlyButton(
				createTiddlyElement(p,'li'),label,tip,function(ev){
				Popup.remove();
				config.macros.editSection.click.call(
					config.macros.pasteUpHelper.currentTarget,ev,'place');
				return config.macros.pasteUp.ok(ev);
			});
		}

		// SEPARATOR
		if (this.removeMenuTxt || this.deleteMenuTxt)
			createTiddlyElement(p,'hr');

		// REMOVE PART...
		var label=this.removeMenuTxt; var tip=this.removeMenuTip;
		if (label&&label.length) createTiddlyButton(
			createTiddlyElement(p,'li'),label,tip,function(ev){
			var cmp=config.macros.pasteUp; // abbrev
			Popup.remove();
			cmp.removePart(config.macros.pasteUpHelper.currentTarget);
			return cmp.ok(ev);
		});

		// DELETE PART...
		var label=this.deleteMenuTxt; var tip=this.deleteMenuTip;
		if (label&&label.length) createTiddlyButton(
			createTiddlyElement(p,'li'),label,tip,function(ev){
			var cmp=config.macros.pasteUp; // abbrev
			var cmh=config.macros.pasteUpHelper; // abbrev
			var cme=config.macros.editSection; // abbrev
			Popup.remove();
			var tid=cmh.currentTarget.getAttribute('tid');
			var title=tid.split('##')[0]; var section=tid.split('##')[1];
			if (confirm(cme.deletemsg.format([tid]))) {
				cmp.removePart(cmh.currentTarget,true); // NO EXTRA WARNING
				cme.deleteSection(title,section);
				displayMessage(tid+' deleted');
			}
			return cme.ok(ev);
		});
	},
//}}}
// // LISTBOXES
//{{{
	popupList: function(ev) { ev=ev||window.event;
		var cmp=config.macros.pasteUpHelper; // ABBREV
		var mode=this.getAttribute('mode');
		var tid =this.getAttribute('tid');
		var val =this.getAttribute('val');

		// RENDER POPUP LIST
		var p=Popup.create(this,null,'popup smallform'); p.style.padding='0';
		Popup.show('top','right'); 
		var s=createTiddlyElement(p,'select');
		if (mode=='style') cmp.setList(s,cmp.styleList,val,'select a style...');
		if (mode=='size')  cmp.setList(s,cmp.sizeList, val,'select a font...');
		s.size=s.length; s.style.width='100%';
		s.setAttribute('tid',tid); s.setAttribute('mode',mode); s.setAttribute('val',val);
		s.onkeyup=function(ev) {
			var k=(ev||window.event).keyCode;
			if (k==13) this.onclick();
			if (k==27) Popup.remove();
		};
		s.onclick=function(){
			if (!this.selectedIndex) return; // ignore click on prompt
			var cmp =config.macros.pasteUpHelper; // ABBREV
			var mode=this.getAttribute('mode');
			var tid =this.getAttribute('tid');
			var val =this.getAttribute('val');
			if (this.value=='_edit')
				story.displayTiddler(null,this.getAttribute('src'),DEFAULT_EDIT_TEMPLATE);
			else if (this.value!=val) {
				var txt=store.getTiddlerText(tid); // CURRENT CONTENT
				txt=cmp.modifyPart(tid,txt,mode,this.value); // REVISED CONTENT
				var title=tid.split('##')[0]; var section=tid.split('##')[1];
				config.macros.editSection.updateTiddler(txt,title,section);
			}
			Popup.remove();
			return config.macros.pasteUp.ok(ev);
		};
		s.focus();
		return config.macros.pasteUp.ok(ev);
	},
	setList: function(list,src,val,prompt) { // SET SIZE, STYLE, and IMAGE LISTS
		if (prompt) list.options[0]=new Option(prompt,''); // OVERRIDE DEFAULT PROMPT
		while (list.length>1) list.options[list.length-1]=null; // empty list (leave prompt)
		var tids=src.readBracketedList(); var txt=[];
		for (var i=0;i<tids.length;i++) txt.push(store.getTiddlerText(tids[i],''));
		var items=txt.join('\n').split('\n');
		var found=false;
		for (var i=0; i<items.length; i++) { // fmt: "value" or "name=value"
			var t=items[i]; var v=t; if (!t.length) continue;
			if (items[i].indexOf('=')!=-1) 
				{ var t=items[i].split('=')[0]; var v=items[i].split('=')[1]||''; }
			var sel=val.length&&(v==val); found=found||sel;
			list.options[list.length]=new Option(t,v,sel,sel);
		}
		if (!found && val.length)
			list.options[list.length]=new Option('other: '+val,val,true,true);
		list.options[list.length]=new Option('[edit this list...]','_edit');
		list.setAttribute('src',tids[0]); list.setAttribute('val',val);
		if (!list.onchange_saved) list.onchange_saved=list.onchange
		list.onchange=function() {
			if (this.value=='_edit') {
				config.macros.editSection.removeAllPanels();
				if (!jQuery('.editSectionPanel').length) // CLOSE PANEL STOPPED BY USER
					story.displayTiddler(null,this.getAttribute('src'),DEFAULT_EDIT_TEMPLATE);
			} else if (list.onchange_saved) list.onchange_saved.apply(this,arguments);
		}
	},
	popupPicker: function(root,ev,tid,tag,createlabel,createval,createmsg,selectmsg) {
		var p=Popup.create(root,null,'popup smallform'); p.style.padding='0';
		var tids=store.getTaggedTiddlers(tag,'excludeLists');
		var s=createTiddlyElement(p,'select');
		s.setAttribute('tid',tid); // TARGET TIDDLER
		s.setAttribute('msg',createmsg); // POPUP MSG (ASK FOR NAME)
		var indent='';
		if (createlabel&&createlabel.length) {
			s.options[s.length]=new Option(createlabel,createval);
			var indent='\xa0\xa0';
		}
		if (tids.length)
			s.options[s.length]=new Option(selectmsg,'');
		for (var t=0; t<tids.length; t++) { if (tids[t].title==createval) continue;
			s.options[s.length]=new Option(indent+tids[t].title,tids[t].title);
			s.options[s.length-1].title=tids[t].getSubtitle();
		}
		s.size=Math.min(s.length,10);
		s.onkeyup=function(ev){ var k=(ev||window.event).keyCode;
			if (k==13) this.onclick();
			if (k==27) Popup.remove();
			return config.macros.pasteUp.ok(ev);
		}
		if (tag=='part') {
			s.onclick=function(ev) {
				if (!this.value.length) return false;
				var tid=this.getAttribute('tid');
				var msg=this.getAttribute('msg');
				var p=this.value;
				var cmh=config.macros.pasteUpHelper; // abbrev
				if (p=='DefaultPart') {
					p=config.macros.pasteUpHelper.getNextName(tid,'part');
					if (!config.options.chkPasteUpHelperAutoName) p=prompt(msg,p);
				}
				if (p && p.length) config.macros.pasteUp.addPart(tid,p);
				Popup.remove(); return config.macros.pasteUp.ok(ev);
			}
		} else {
			s.onclick=function(ev){
				if (!this.value.length) return false;
				var tid=config.macros.pasteUpHelper.getNextName('','pasteup');
				var msg=this.getAttribute('msg');
				if (!config.options.chkPasteUpHelperAutoName) tid=prompt(msg,tid);
				var msg=config.messages.overwriteWarning.format([tid||'']);
				if (tid && (!store.tiddlerExists(tid)||confirm(msg))) {
					// CREATE NEW PAGE
					var src=this.value;
					var who=config.options.txtUserName;
					var when=new Date();
					var text=store.getTiddlerText(src,'');
					var tags=['pasteup'];
					var fields=config.defaultCustomFields
					store.saveTiddler(tid,tid,text,who,when,tags,fields);
					story.displayTiddler(null,tid);
					displayMessage('Created '+tid+' from '+src);
					// ADD TO DEFAULT TIDDLERS
					if (confirm('Automatically display \x22'+tid+'\x22 at startup?')) {
						var tid2='DefaultTiddlers'; var t=store.getTiddler(tid2);
						var text=store.getTiddlerText(tid2)+'\n[['+tid+']]';
						store.saveTiddler(tid2,tid2,text,who,when,t?t.tags:[],
							config.macros.pasteUp.cloneFields(t?t.fields:{}));
						displayMessage('Added '+tid+' to '+tid2);
					}
					autoSaveChanges();
				}
				Popup.remove(); return config.macros.pasteUp.ok(ev);
			}
		}
		if (tids.length) { Popup.show(); s.focus(); }
		else { p.style.display='none'; s.onclick.call(s,ev); }
		return config.macros.pasteUp.ok(ev);
	},
	pagenamePattern: 'Page%1',	// %0=next number
	partnamePattern: '%0_Part%1',	// %1=current page name
	getNextName: function(tid,tag) {
		var pat=tag=='part'?this.partnamePattern:this.pagenamePattern;
		var prefix=pat.format([tid,'']);
		var tids=store.getTaggedTiddlers(tag,'excludeLists');
		for (var t=tids.length-1; t>=0; t--)	// find last matching title
			if (tids[t].title.startsWith(prefix)) { var found=tids[t].title; break }
		var next=1;
		if (found) var match=/([0-9]+)$/.exec(found);
		if (match) next=parseInt(match[1])+1;
		return pat.format([tid,next]);
	},
//}}}
// // THUMBNAIL BROWSER
//{{{
	imagePopup: function(event,list) {
		var p=Popup.create(list); if (!p) return false;
		config.macros.pasteUpHelper.renderThumbs(p,list);
		Popup.show('top','left');
		event.cancelBubble=true; if(event.stopPropagation)event.stopPropagation(); return false;
	},
	renderThumbs: function(p,list) {
		if (!list.id) list.id=new Date().getTime()+Math.random();
		var size=config.macros.pasteUpHelper.thumbsize; var rowsize=4;
		var thumb='<td style="width:%1;height:%1;text-align:center;border:1px solid transparent" '
			+'onmouseover="this.style.border=\'1px solid black\'" '
			+'onmouseout=" this.style.border=\'1px solid transparent\'">'
			+'<img src="%0" title="%0" '
			+'style="border:1px solid #999;max-width:%1;max-height:%1;cursor:pointer" '
			+'onclick="var v=this.title; var list=document.getElementById(\''+list.id+'\'); '
			+'Popup.remove(Popup.stack.length-1); '
			+'list.value=v; list.focus(); return list.onchange.call(list,event);"></td>';
		var out=[];
		var c=0;
		for (var i=0; i<list.options.length; i++) { var src=list.options[i].value;
			if (src==''||src=='_edit') continue;
			if (c && c%rowsize==0) out.push('</tr><tr>');
			if (src.length) { out.push(thumb.format([src,size])); c++; }
		}
		p.innerHTML+="<a href='javascript:;' style='float:right' "
			+" onclick='Popup.remove(Popup.stack.length-1);return false;'>close</a>"
			+" choose an image:<hr>";
		out=out.join('');
		if (out.length) p.innerHTML+='<table><tr>'+out+'</tr></table>';
	},
	addImagePanel: function(ev,root) {
		var cmp=config.macros.pasteUpHelper;
		var cme=config.macros.editSection;
		var p=createTiddlyElement(document.body,"ol",
			"addImagePanel","popup smallform editSectionPanel");
		p.root=root;
		p.innerHTML=store.getRecursiveTiddlerText(cmp.templates['addimage'],'',10);
		var f=p.getElementsByTagName('form')[0];
		// initialize internal form values
		f.panel=p;
		f.action=cmp.uploadScript;
		f.targetlist.value=cmp.imageList.readBracketedList()[0];
		f.targetlist.nextSibling.innerHTML=f.targetlist.value;
		f.uploadpath.value=cmp.uploadPath;
		if (config.extensions.tiddlyspace!==undefined)
			f.csrf_token.value=config.extensions.tiddlyspace.getCSRFToken();

		// display panel
		var x=findPosX(root); var y=findPosY(root);
		var winw=findWindowWidth(); var scrollw=winw-document.body.offsetWidth;
		if(p.offsetWidth>winw*0.75) p.style.width=winw*0.75 + "px";
		if(x+p.offsetWidth>winw-scrollw-1) x=winw-p.offsetWidth-scrollw-1;
		var s=p.style; s.left=x+'px'; s.top=y+'px'; s.display='block';
		if(config.options.chkAnimate && anim)	anim.startAnimating(new Scroller(p));
		else					window.scrollTo(0,ensureVisible(p));
		return cme.ok(ev);
	},
//}}}
// // TYPE-SPECIFIC FORM HANDLING OVERRIDES FOR EditSectionPlugin
//{{{
	getForm: function(tid,type) {
		var cmp=config.macros.pasteUpHelper;
		var cme=config.macros.editSection;
		return cmp.templates[type]||cme.template;
	},
	getInitForm: function(tid,type) {
		var cmp=config.macros.pasteUpHelper;
		var cme=config.macros.editSection;
		return cmp.templates[type]?cmp.initForm:cme.initForm;
	},
	getSaveForm: function(tid,type) {
		var cmp=config.macros.pasteUpHelper;
		var cme=config.macros.editSection;
		return cmp.templates[type]?cmp.saveForm:cme.saveForm;
	},
	initForm: function(elem,form,title,section,type) {
		var cmp=config.macros.pasteUpHelper; // ABBREV
		var tid=title; if (section) tid=[title,section].join('##');
		var txt=store.getTiddlerText(tid,'');
		form.title.value=title;
		form.section.value=section||'';
		form.rawContent.value=txt;
		form.newsection.value=tid;
		form.newsection.nextSibling.innerHTML=tid;

		// EXTRACT IMAGE SRC
		var imgsrc='';
		var pat='/%[.\\s]*?\\r?\\nimage:\\s*\\[img\\(.*,.*\\)\\[(.*)\\]\\]\\r?\\n[.\\s]*?%/';
		var re=new RegExp(pat);	var m=re.exec(txt); txt=txt.replace(re,'');
		if (m) imgsrc=m[1];

		// EXTRACT IMAGE PASTEUP POS/SIZE/ADJUST
		var imgleft=''; var imgtop=''; var imgwidth=''; var imgheight=''; var adjust=false;
		var pat='<<(?:pasteUp|tiddler)\\s+\\[\\[.+::image\\]\\].*?>>';
		var re=new RegExp(pat);	var m=re.exec(txt); txt=txt.replace(re,'');
		if (m) {
			function getXYWH(p) {
				var re=new RegExp(p+'\:([^\\s>]+)'); var ex=re.exec(m[0]); return ex?ex[1]:'';
			}
			imgleft=getXYWH('x');	imgtop=getXYWH('y');
			imgwidth=getXYWH('w');	imgheight=getXYWH('h');
			var adjust=m[0].indexOf(' noadjust')==-1; // 'adjust' CHECKBOX
		}

		// EXTRACT FONTSIZE AND STYLE 
		var size=''; var classname=''; // FIRST CLASSNAME IS FONTSIZE, REST IS STYLENAME
		var pat='<<(?:pasteUp|tiddler)\\s+\\[\\[.+##content\\]\\]\\s+class:"([^"]*)".*?>>';
		var re=new RegExp(pat);	var m=re.exec(txt); txt=txt.replace(re,'');
		if (m) { var t=m[1].split(' '); size=t.shift(); classname=t.join(' '); }

		// EXTRACT CONTENT FROM HIDDEN SECTION (IMAGE BEHIND TEXT)
		var content=txt;
		var pat='/%\\r?\\n!content\\r?\\n((?:.|\\n)*)\\r?\\n!end\\r?\\n%/';
		var re=new RegExp(pat); content=txt.replace(re,'$1');
		if (content==txt) { // FALLBACK: EXTRACT CONTENT FROM CLASS WRAPPER (IMAGE IN FRONT)
			var pat='(.*\\{\\{[^\\{]+\\{\\r?\\n)((?:.|\\n)*)(\\r?\\n\\}\\}\\}.*)';
			var re=new RegExp(pat); content=txt.replace(re,'$2');
			if (content==txt) { // FALLBACK: EXTRACT CONTENT FROM HTML DIV
				var pat='(.*<html><div class="[^"]+">\\r?\\n)((?:.|\\n)*)(\\r?\\n</div></html>.*)';
				var re=new RegExp(pat); content=txt.replace(re,'$2');
			}
		}

		if (form.type) type=form.type.value;
		switch (type) {
			case 'text': // SET TEXT CONTENT
				form.content.value=content;
				if (version.extensions.TextAreaPlugin) new window.TextAreaResizer(form.content);
				break;
			case 'image': // SET IMAGE SRC,X,Y,W,H
				cmp.setList(form.image,cmp.imageList,imgsrc);
				form.imgleft.value	=imgleft;
				form.imgtop.value	=imgtop;
				form.imgwidth.value	=imgwidth;
				form.imgheight.value	=imgheight;
				form.imgadjust.checked	=adjust;
				jQuery('.pasteUpImageAdjust',form).each(
					function(){this.style.display=adjust?'':'none';});
				// SET IMAGE PREVIEW // TBD: BRITTLE DOM REFERENCES
				var td=form.image.parentNode.parentNode;
				var i=td.getElementsByTagName('img')[0];
				if (i) {
					var p=i.parentNode.parentNode;
					var trim=jQuery(form.image.parentNode).height()+2;
					p.style.height=jQuery(td).height()-trim+'px';
					p.style.width=jQuery(td).width()-2+'px';
					cmp.setImagePreview(i,imgsrc,form);
				}
				break;
			case 'place': // SET ELEMENT POSITION/SIZE INPUTS
				var s=elem.style; var a='auto';
				form.left.defaultValue  =form.left.value  =s.left||a;
				form.top.defaultValue   =form.top.value   =s.top||a;
				form.width.defaultValue =form.width.value =s.width||a;
	 			form.height.defaultValue=form.height.value=s.height||a;
	 			form.zindex.defaultValue=form.zindex.value=s.zIndex||a;
				break;
		}
	},
	saveForm: function(here,ev) {	// RETURN CONTENT TO EditSectionPlugin FOR STORAGE
		var cmp=config.macros.pasteUpHelper; // ABBREV
		var cme=config.macros.editSection; // ABBREV
		var f=here.form; var elem=f.panel.root;

		// GET TARGET TITLE/SECTION
		var tid=f.newsection.value;
		var title=tid.split('##')[0];
		var section=tid.split('##')[1];
		var oldsection=f.section.value;
		if (!title) title=story.findContainingTiddler(elem).getAttribute('tiddler');
		if (!title) {
			displayMessage(cme.sectionerr.format([f.newsection.value]));
			f.newsection.focus(); f.newsection.select(); return false;
		}

		// CHECK FOR TIDDLER OVERWRITE
		if (!section && title!=f.title.value && store.tiddlerExists(title)) {
			if (!confirm(config.messages.overwriteWarning.format([title])))
				{ f.newsection.focus(); f.newsection.select(); return cme.ok(ev); }

		}

		// GET NEW TIDDLER/SECTION CONTENT
		var type=f.type?f.type.value:'';
		var txt=f.rawContent.value;
		if (type=='place') { // UPDATE ELEMENT POSITION/SIZE (if changed)
			var left=f.left.value; var top=f.top.value;
			var width=f.width.value; var height=f.height.value;
			var zindex=f.zindex.value;
			var changed=left!=f.left.defaultValue  || top!=f.top.defaultValue
				|| width!=f.width.defaultValue || height!=f.height.defaultValue
				|| zindex!=f.zindex.defaultValue;
			if (changed) config.macros.pasteUp.dragsave(elem,left,top,width,height,zindex);
		} else if (type=='image') {	// UPDATE IMAGE SRC,X,Y,W,H
			txt=cmp.modifyPart(tid,txt,'image',{
				title: f.title.value, src: f.image.value,
				adjust: f.imgadjust.checked, 
				x: f.imgleft.value,  y:f.imgtop.value,
				w: f.imgwidth.value, h:f.imgheight.value });
			cme.updateTiddler(txt,title,section,oldsection);
		} else if (type=='text') {	// UPDATE TEXT
			txt=cmp.modifyPart(tid,txt,'text',f.content.value);
			cme.updateTiddler(txt,title,section,oldsection);
		}
		f.panel.setAttribute('dirty',null); cme.removePanel(f.panel); // CLEAR FLAG AND CLOSE PANEL
		return cme.ok(ev);
	},
	setImagePreview: function(view,src,form) {
		view.src=src;
		view.parentNode.href=view.src;
		view.parentNode.title=src?'CLICK to view \x22'+src+'\x22':'select an image...';
		function setdef(e,def) { e.value=e.value||def; } // SET DEFAULT VALUE (IF BLANK INPUT)
		setdef(form.imgleft,  store.getTiddlerText('PasteUpConfig::ImageLeft',  '0px'));
		setdef(form.imgtop,   store.getTiddlerText('PasteUpConfig::ImageTop',   '0px'));
		setdef(form.imgwidth, store.getTiddlerText('PasteUpConfig::ImageWidth', 'auto'));
		setdef(form.imgheight,store.getTiddlerText('PasteUpConfig::ImageHeight','auto'));
	},
//}}}
// // PART DATA HANDLING
//{{{
	modifyPart: function(tid,txt,mode,val) {
		// DEBUG alert('modifyPart() before=\n'+txt);

		// DETECT HTML or MEDIAWIKI PART (= separate tiddler, tagged with 'html' or 'mediawiki')
		var t=store.getTiddler(tid);
		var isHTML=t && t.isTagged('html')||t.isTagged('mediawiki');

		var contentRE	// CONTENT IN EMBEDDED HIDDEN SECTION
			=/(.*\!content\r?\n)(.*)(\r?\n!end.*)/;
		var classRE	// FONTSIZE, STYLE IN EMBED
			=/(<<(?:pasteUp|tiddler)\s+\[\[.+##content\]\]\s+class:")([^"]*)(".*?>>)/;

		var wrapperRE	// FONTSIZE, STYLE, AND CONTENT IN CLASS WRAPPER
			=/(.*)(\{\{)([^\{]+)(\{\r?\n)((?:.|\r?\n)*)(\r?\n\}\}\})(.*)/;
		var wrapperOut
			='{{%0 %1{\n%2\n}}}';

		var divRE	// FONTSIZE, STYLE, AND CONTENT IN HTML DIV
			=/(.*)(<html><div class=")([^"]+)(">\r?\n)((?:.|\r?\n)*)(\r?\n<\/div><\/html>)(.*)/;
		var divOut
			='<html><div class="%0 %1">\n%2\n</div></html>';

		var imageRE	// IMAGE
			=/(<<(?:pasteUp|tiddler).*?>>\/%[.\s]*?\r?\nimage:\s*\[img\(.*,.*\)\[)(.*)(\]\]\r?\n[.\s]*?%\/)/;
		var imageOut	// IMAGE OUTPUT FORMAT (for new images)
			='<<pasteUp [[%0::image]] noedit%6 x:%2 y:%3 w:%4 h:%5>>/%\nimage: [img(100%,100%)[%1]]\n%/';


		switch(mode) {
		case "text":
			var m=contentRE.exec(txt); // CONTENT IN SECTION
			if (m) txt=txt.replace(contentRE,'$1'+val+'$3');
			else { // FALLBACK: CONTENT IN WRAPPER
				var m=imageRE.exec(txt); var i=(m?m[0]:'');	// GET IMAGE SYNTAX
				txt=txt.replace(imageRE,'');			// REMOVE IMAGE SYNTAX
				var m=wrapperRE.exec(txt);
				if (m) txt=txt.replace(wrapperRE,'$1$2$3$4'+val+'$6$7');
				else { // FALLBACK: CONTENT IN HTML DIV
					var m=divRE.exec(txt);
					if (m) txt=txt.replace(divRE,'$1$2$3$4'+val+'$6$7');
					else txt=val;	// FALLBACK: NO DIV, NO WRAPPER, NO SECTION
				}
				txt=i+txt;	// RESTORE IMAGE SYNTAX (if any)
			}
			break;
		case "image":
			var cfg='PasteUpConfig::'; // abbrev
			var x=val.x||store.getTiddlerText(cfg+'ImageLeft',  '0px');
			var y=val.y||store.getTiddlerText(cfg+'ImageTop',   '0px');
			var w=val.w||store.getTiddlerText(cfg+'ImageWidth', '100%');
			var h=val.h||store.getTiddlerText(cfg+'ImageHeight','auto');
			var m=imageRE.exec(txt);
			if (!m && val.src.length) {				// ADD IMAGE SYNTAX
				var noadjust=store.getTiddlerText(cfg+'ImageAdjust','')!='true';
				var i=imageOut.format([val.title,val.src,x,y,w,h,noadjust?' noadjust':'']);
				txt=i+txt;
			} else if (m && !val.src.length) {			// REMOVE IMAGE SYNTAX
				txt=txt.replace(imageRE,'');
			} else if (m && val.src.length) {			// REVISE IMAGE SYNTAX
				var i=m[1]+val.src+m[3];			//  CHANGE IMAGE SRC
				i=i.replace(/\s+[xywh]\:[^\s>]*/g,'');		//  REMOVE OLD xywh PARAMS
				// INSERT NEW xywh PARAMS
				i=i.replace(/>>/,' x:%0 y:%1 w:%2 h:%3>>'.format([x,y,w,h]));
				// REMOVE OLD noadjust AND ADD NEW noadjust (if 'adjust' not checked)
				i=i.replace(/ noedit noadjust/,' noedit');
				if (!val.adjust) i=i.replace(/ noedit/,' noedit noadjust');
				txt=txt.replace(imageRE,i); // UPDATE IMAGE SYNTAX
			}
			break;
		case "style":
		case "size":
			var m=imageRE.exec(txt); var i=(m?m[0]:'');	// GET IMAGE SYNTAX (if any)
			txt=txt.replace(imageRE,'');			// REMOVE IMAGE SYNTAX
			var s=''; var c='';
			var m=classRE.exec(txt); if (m) {
				var t=m[2].split(' '); s=t.shift(); c=t.join(' ');
				if (mode=='size') s=val; if (mode=='style') c=val;
				txt=txt.replace(classRE,'$1'+s+' '+c+'$3');
			} else { // FALLBACK: GET FONTSIZE/STYLE from CSS WRAPPER or HTML DIV (if any)
				var re=wrapperRE; m=re.exec(txt); if (!m) { re=divRE; m=re.exec(txt); }
				if (m) { var t=m[3].split(' '); var s=t.shift(); var c=t.join(' '); }
				if (mode=='size') s=val; if (mode=='style') c=val;
				if (s||c) {
					if (m)	txt=txt.replace(re,'$1$2'+s+' '+c+'$4$5$6$7'); // UPDATE
					else	txt=(isHTML?divOut:wrapperOut).format([s,c,txt]); // ADD
				} else {
					if (m)	txt=txt.replace(re,'$1$5$7'); // REMOVE
					else	txt=txt; // NO CHANGE!
				}
			}
			txt=i+txt;	// RESTORE IMAGE SYNTAX (if any)
			break;
		}
		// DEBUG alert('modifyPart() after=\n'+txt);
		return txt;
	}
}
//}}}
/***
!!!Form definitions for PasteUpHelper popup editor.
>note: modify shadow tiddlers to customize and/or translate forms
''Edit Text''
//{{{
!PasteUpHelperTemplate_Text
<!--{{{-->
<!--
|Name|PasteUpHelperTemplate_Text|
|Source|http://www.TiddlyTools.com/#PasteUpHelperPlugin|
|Version||
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|Type|template|
|Requires|EditSectionPlugin, PasteUpPlugin|
|Description|enhanced popup editor template used by PasteUpHelperPlugin|
-->
<form action="javascript:;" autocomplete="off" style="white-space:nowrap">
<input type="hidden" name="type" value="text"><!--REQUIRED-->
<input type="hidden" name="title" value=""><!--REQUIRED-->
<input type="hidden" name="section" value=""><!--REQUIRED-->
<input type="hidden" name="rawContent" value=""><!--REQUIRED-->
<!-- HEADING/BUTTONS -->
<table style="padding:0;margin:0;border:0;border-collapse:collapse;width:100%;"><tr><td>
	<div style="font-size:80%;font-style:italic">edit text for:</div>
	<input type="hidden" name="newsection" value="" style="width:98%;margin:0;padding:0;border:0;background:none;" disabled><span></span>
</td><td style="text-align:right;">
	<input type="button" style="width:5em;" value="ok"	onclick="return this.form.save(this,event)">
	<input type="button" style="width:5em;" value="cancel"	onclick="return config.macros.editSection.cancel(this,event)">
</td></tr></table><hr>
<!-- CONTROLS -->
<div macro="tiddler QuickEditToolbar"></div>
<textarea name="content" rows="10" cols="80" style="width:98%"
	onchange="return config.macros.editSection.changed(this,event)"></textarea>
</div></form>
<!--}}}-->
!end
//}}}

''Select Image''
//{{{
!PasteUpHelperTemplate_Image
<!--{{{-->
<!--
|Name|PasteUpHelperTemplate_Image|
|Source|http://www.TiddlyTools.com/#PasteUpHelperPlugin|
|Version||
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|Type|template|
|Requires|EditSectionPlugin, PasteUpPlugin|
|Description|enhanced popup editor template used by PasteUpHelperPlugin|
-->
<form action="javascript:;" autocomplete="off" style="white-space:nowrap">
<input type="hidden" name="type" value="image"><!--REQUIRED-->
<input type="hidden" name="title" value=""><!--REQUIRED-->
<input type="hidden" name="section" value=""><!--REQUIRED-->
<input type="hidden" name="rawContent" value=""><!--REQUIRED-->
<!-- HEADING/BUTTONS -->
<table style="padding:0;margin:0;border:0;border-collapse:collapse;width:100%;"><tr><td>
	<div style="font-size:80%;font-style:italic">select image for:</div>
	<input type="hidden" name="newsection" value="" style="width:98%;margin:0;padding:0;border:0;background:none;" disabled><span></span>
</td><td style="text-align:right;">
	<input type="button" style="width:5em;" value="ok"	onclick="return this.form.save(this,event)">
	<input type="button" style="width:5em;" value="cancel"	onclick="return config.macros.editSection.cancel(this,event)">
</td></tr></table><hr>
<!-- CONTROLS -->
<table style="border-collapse:collapse;width:100%;"><tr valign="top"><td xstyle="width:80%">
	<div>
	<select name="image" size="1" style="width:60%;" onchange="
		if (this.value=='_edit') return false;
		var i=this.parentNode.parentNode.getElementsByTagName('img')[0]
		config.macros.pasteUpHelper.setImagePreview(i,this.value,this.form);
		return config.macros.editSection.changed(this,event);
	"><option value="">select an image...</option>
	</select><input type="button" style="width:20%" value="select" onclick="
		return config.macros.pasteUpHelper.imagePopup(event,this.form.image);
	"><input type="button" style="width:20%" value="add" onclick="
		return config.macros.pasteUpHelper.addImagePanel(event,this.form.image);
	"><br>
	</div>
	<div style="border:1px solid gray;background-color:#ccc;overflow:hidden;min-height:85px;">
		<center><a href="" target="_blank" onclick="
			if (this.href==document.location) { // no image
				var td=this.parentNode.parentNode.parentNode;
				td.getElementsByTagName('select')[0].focus();
				return false;
			}
		"><img src="" style="height:100%;margin:0;padding:0;display:block;">
		</a></center>
	</div>
	<input name='imgadjust' type="checkbox" onclick="
		var vis=this.checked?'':'none';
		jQuery('.pasteUpImageAdjust',this.form).each(function(){this.style.display=vis;});
	">adjustable&nbsp;
</td><td class="pasteUpImageAdjust" style="display:none;padding-top:3px;">
	x-offset<br><input type="text" name="imgleft" style="width:5em"
		onchange="return config.macros.editSection.changed(this,event);"><br>
	y-offset<br><input type="text" name="imgtop" style="width:5em"
		onchange="return config.macros.editSection.changed(this,event);"><br>
	width<br><input type="text" name="imgwidth" style="width:5em"
		onchange="return config.macros.editSection.changed(this,event);"><br>
	height<br><input type="text" name="imgheight" style="width:5em"
		onchange="return config.macros.editSection.changed(this,event);"><br>
</td></tr></table>
</div></form>
<!--}}}-->
!end
//}}}

''Add Image''
//{{{
!PasteUpHelperTemplate_AddImage
<!--{{{-->
<!--
|Name|PasteUpHelperTemplate_AddImage|
|Source|http://www.TiddlyTools.com/#PasteUpHelperPlugin|
|Version|1.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|Type|template|
|Requires|EditSectionPlugin, PasteUpPlugin|
|Description|enhanced popup editor template used by PasteUpHelperPlugin|
-->
<form action="" target="_serverresponse" method="post" enctype="multipart/form-data"
	autocomplete="off" style="white-space:nowrap" class="smallform">
<!-- HEADING/BUTTONS -->
<table style="padding:0;margin:0;border:0;border-collapse:collapse;width:100%;"><tr><td>
	<div style="font-size:80%;font-style:italic">add a new image to:</div>
	<input type="hidden" name="targetlist" value="PasteUpImageList" style="width:98%;margin:0;padding:0;border:0;background:none;" disabled><span></span>
</td><td style="text-align:right;">
	<input type="button" name="add" value="ok" style="width:5em;"
		title="add item to image list" onclick="
		var cmp=config.macros.pasteUpHelper; // ABBREV
		var f=this.form; // ABBREV
		var tid=f.targetlist.value;
		var t=store.getTiddlerText(tid,'');
		var label=f.label.value;
		if (!label.length || label==f.label.defaultValue) {
			alert('Please enter a name for this image');
			f.label.focus(); f.label.select();
			return false;
		}
		if (label.length && t.indexOf(label+'=')!=-1) {
			alert('\x22'+label+'\x22 is already in use.\nPlease enter a different name.');
			f.label.focus(); f.label.select();
			return false;
		}
		var url=f.url.value;
		if (!url.length) {
			alert('Please enter an image location or upload an image file');
			f.url.focus();
			return false;
		}
		var item='\n'+(label.length?label+'=':'')+url;
		var who=config.options.txtUserName; var when=new Date();
		if (config.options.chkForceMinorUpdate) { who=t.modifier||who; when=t.modified||when; }
		store.saveTiddler(tid,tid,t+item,who,when,t.tags,
			config.macros.pasteUp.cloneFields(t.fields));
		displayMessage('New image added to '+tid);
		autoSaveChanges();
		cmp.setList(f.panel.root,cmp.imageList,url);
		f.panel.root.onchange(event);
		f.panel.root.focus();
		f.panel.parentNode.removeChild(f.panel);
		return false;
	">
	<input type="button" name="cancel" value="cancel" style="width:5em;" onclick="
		this.form.panel.root.focus();
		this.form.panel.parentNode.removeChild(this.form.panel);
		return false;
	">
</td></tr></table><hr>
<!-- CONTROLS -->
<div>
<input type="hidden" name="uploadpath" value=""><!-- REQUIRED -->
<input type="hidden" name="csrf_token" value=""><!-- REQUIRED (TIDDLYSPACE) -->
enter a new image name/location:<br>
<input type="text" name="label" size="15" value="name (for listbox)">
<input type="text" name="url" size="33" value="URL or path/filename" onchange="var f=this.form;
	if (this.value==this.defaultValue) return false; // ignore
	if (!f.label.value || f.label.value==f.label.defaultValue) {
		var slash='/'; if (this.value.indexOf('\\')!=-1) slash='\\';
		var parts=this.value.split(slash); var filename=parts[parts.length-1];
		f.label.value=filename.split('.')[0];
	}
"><br>
or, upload a local image file to this workspace:<br>
<input type="hidden" name="filename" value="">
<input type="file" name="file" size="30" onchange=" var f=this.form;
	var slash='/'; if (this.value.indexOf('\\')!=-1) slash='\\';
	var parts=this.value.split(slash); var filename=parts[parts.length-1];
	if (!f.label.value || f.label.value==f.label.defaultValue)
		f.label.value=filename.split('.')[0];
	f.filename.value=filename.replace(/[^A-Za-z0-9\_\-\.]/g,'_');;
	f.url.value=f.uploadpath.value+f.filename.value;
	f.url.onchange();
	if (confirm('Start uploading now?')) f.upload.click();
">
<input type="button" name="upload" value="upload" style="display:inline"
	title="upload file to remote host" onclick="
	this.parentNode.nextSibling.style.display='inline';
	this.form.submit();
	this.form.add.focus();
	return false;
"><br>
</div><div style="display:none">
<a href="javascript:;" style="float:right" onclick="
	this.parentNode.style.display='none'; return false;
">hide</a>server response:<br>
<iframe name="_serverresponse" id="_serverresponse" style="width:100%;height:10em;background:white"></iframe>
</div>
</form>
<!--}}}-->
!end
//}}}

''Place Part''
//{{{
!PasteUpHelperTemplate_Placement
<!--{{{-->
<!--
|Name|PasteUpHelperTemplate_Placement|
|Source|http://www.TiddlyTools.com/#PasteUpHelperPlugin|
|Version||
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|Type|template|
|Requires|EditSectionPlugin, PasteUpPlugin|
|Description|enhanced popup editor template used by PasteUpHelperPlugin|
-->
<form action="javascript:;" autocomplete="off" style="white-space:nowrap">
<input type="hidden" name="type" value="place"><!--REQUIRED-->
<input type="hidden" name="title" value=""><!--REQUIRED-->
<input type="hidden" name="section" value=""><!--REQUIRED-->
<input type="hidden" name="rawContent" value=""><!--REQUIRED-->
<!-- HEADING/BUTTONS -->
<table style="padding:0;margin:0;border:0;border-collapse:collapse;width:100%;"><tr><td>
	<div style="font-size:80%;font-style:italic">set position/size/layer for:</div>
	<input type="hidden" name="newsection" value="" style="width:98%;margin:0;padding:0;border:0;background:none;" disabled><span></span>
</td><td style="text-align:right;">
	<input type="button" style="width:5em;" value="ok"	onclick="return this.form.save(this,event)">
	<input type="button" style="width:5em;" value="cancel"	onclick="return config.macros.editSection.cancel(this,event)">
</td></tr></table><hr>
<!-- CONTROLS -->
<table style="border-collapse:collapse;padding:0;margin:0;border:0;width:100%;"><tr style="vertical-align:bottom"><td style="width:20%">
	left (x)<br>
	<input type="text" name="left" value="x" style="width:7em;margin:0;"
		onchange="return config.macros.editSection.changed(this,event);">
</td><td style="width:20%">
	top (y)<br>
	<input type="text" name="top" value="y" style="width:7em;margin:0;"
		onchange="return config.macros.editSection.changed(this,event);">
</td><td style="width:20%">
	width<br>
	<input type="text" name="width" value="w" style="width:7em;margin:0;"
		onchange="return config.macros.editSection.changed(this,event);">
</td><td style="width:20%">
	height<br>
	<input type="text" name="height" value="h" style="width:7em;margin:0;"
		onchange="return config.macros.editSection.changed(this,event);">
</td><td style="width:20%">
	layer (z-index)<br>
	<input type="text" name="zindex" value="z" style="width:7em;margin:0;"
		onchange="return config.macros.editSection.changed(this,event);">
</td></tr></table>
</form>
<!--}}}-->
!end
//}}}

Default/example CSS for user-defined pasteup styles
^^note: modify [[PasteUpStyleSheet]], [[PasteUpStyleList]] and/or [[PasteUpFontList]] to customize.^^
//{{{
!css
.bigger
	{ font-size:200%; line-height:100%; }
.biggest
	{ font-size:300%; line-height:100%; }
.headline
	{ text-align:center; font-weight:bold; }
.border
	{ border:1px solid; }
!end
//}}}
***/
 