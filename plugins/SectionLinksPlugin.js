/***
|Name|SectionLinksPlugin|
|Source|http://www.TiddlyTools.com/#SectionLinksPlugin|
|Documentation|http://www.TiddlyTools.com/#SectionLinksPlugin|
|Version|1.4.2|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|allow tiddler sections in TiddlyLinks to be used as anchor points|
This plugin enhances tiddler links so that they can include section references that ''auto-scroll to the indicated section heading'' within a tiddler (i.e., similar to the 'anchor' behavior provided in HTML by {{{<a name="foo">}}} and {{{<a href="#foo">...</a>}}}).  The {{{<<tiddler>>}}} macro syntax has also be extended to allow section references without a tiddler name, so that transclusion of //hidden sections from the same tiddler// can be easily accomplished.  The plugin also adds a new macro, <<sectionTOC>> which can auto-generate and embed a 'Table of Contents' outline view into a tiddler to enable quick navigation to sections within that tiddler.
!!!Usage
<<<
!!!!~TiddlyLink syntax
You can link to a section of a tiddler by adding the "##sectionname" syntax to the tiddlername:
{{{
[[SomeTiddler##SomeSection]]
}}}
When clicked, the tiddler is displayed and the specified section heading is automatically scrolled into view. If the tiddler title is omitted or the 'here' keyword is used, e.g.,
{{{
[[##SomeSection]] or [[here##SomeSection]]>>
}}}
then the current containing tiddler is implied by default.
!!!!HTML anchor syntax
You can use HTML syntax to create a scrollable 'anchor' location within a tiddler without use of the standard TW section heading syntax:
{{{
<html><a name="sectionname" /></html>
}}}
You can then link to that section using the enhanced TiddlyLink syntax as above.
!!!!{{{<<tiddler>>}}} macro 
The {{{<<tiddler>>}}} syntax has been extended so that when the tiddler title is omitted or the 'here' keyword is used, e.g.,
{{{
<<tiddler ##SomeSection>> or <<tiddler here##SomeSection>>
}}}
then the current containing tiddler is implied by default.
!!!!"""<<sectionTOC>>""" macro
This macro generates a 'Table of Contents' outline-style bullet list with links to all sections within the current tiddler.  Simply place the following macro at the //end of the tiddler content// (i.e., following all section headings).  Important note: //''The {{{<<sectionTOC>>}}} macro must occur at the end of the tiddler in order to locate the rendered section headings that precede it.''//
{{{
<<sectionTOC>> or <<sectionTOC className>>
}}}
To position the macro's //output// within the tiddler, you must create a special 'target element' that uses a specific classname (default='sectionTOC'), like this:
{{{
{{sectionTOC{}}}
}}}
When the {{{<<sectionTOC>>}}} macro is rendered, it will find the matching 'sectionTOC'-classed element and writes it's output there.  You can also add the macro and/or target elements directly to the [[ViewTemplate]] definition, so that every tiddler can automatically display the table of contents:
{{{
<span class='sectionTOC'></span> <!-- target element -->
...
<span macro='sectionTOC'></span> <!-- must be at end of tiddler -->
}}}
<<<
!!!Configuration
<<<
You can change the {{{<<SectionTOC>>}}} output link format by adding the following statement to a tiddler tagged with <<tag systemConfig>>
{{{
config.macros.sectionTOC.linkFormat='[[%0|##%0]]';
}}}
The default value (shown above) produces a link to each section within the tiddler, using "%0" to insert the section name into the link.  You can add extra formatting to generate additional output to suit your purposes.  For example, if you have EditSectionPlugin installed, you could include a link that invokes that plugin's popup editor directly from each item in the TOC display, like this:
{{{
config.macros.sectionTOC.linkFormat='[[%0|##%0]] <<editSection [[##%0]] [[(edit)]]>>';
}}}
<<<
!!!Examples
<<<
links to sections defined by ''TW heading syntax'' (e.g, {{{!!!sectionname}}}):{{indent{
[[SectionLinksPlugin##onClickTiddlerLink]]
[[##onClickTiddlerLink]] //(current tiddler implied)//}}}
links to anchors defined by ''HTML syntax'' (e.g., {{{<html><a href="anchorname"></html>}}}):{{indent{
[[SectionLinksPlugin##sampleanchorlink]]
[[##sampleanchorlink]] //(current tiddler implied)//}}}
<<<
!!!Revisions
<<<
2011.12.21 1.4.2 refactor sectionTOCformat to permit customization
2011.02.08 1.4.1 in isExternalLink() hijack, strip section references before testing for external link
2010.08.09 1.4.0 in scrollToSection(), added support for using HTML <a name="..."> anchor elements
2009.08.21 1.3.4 added handling to ignore leading/trailing whitespace in section references
2009.08.21 1.3.3 in createTiddlyLink(), add tiddlyLinkNonExistingSection class if matching section is not found
2009.08.14 1.3.2 in createTiddlyLink(), don't override core value for ~TiddlyLink attribute
2009.08.02 1.3.1 in sectionTOC.handler(), trim leading/trailing whitespace from generated section links
2009.08.01 1.3.0 in scrollToSection(), apply 3-tier section matching (exact, startsWith, contains)
2009.07.06 1.2.2 fixed displayTiddler() hijack
2009.07.03 1.2.1 in {{{<<sectionTOC>>}}}, suppress output if target is not found
2009.06.02 1.2.0 added support for 'here' keyword in {{{[[here##section]]}}} links and {{{<<tiddler here##section>>}}} macro
2009.04.09 1.1.1 in sectionTOC macro, make target visible when TOC is rendered.
2009.01.18 1.1.0 added {{{<<sectionTOC>>}}} macro to generate numbered-bullet links to sections of current tiddler
2009.01.06 1.0.0 converted to stand-alone plugin
2008.10.14 0.0.0 initial release (as [[CoreTweaks]] #784 - http://trac.tiddlywiki.org/ticket/784)
<<<
!!!Code
***/
//{{{
version.extensions.SectionLinksPlugin= {major: 1, minor: 4, revision: 2, date: new Date(2011,12,21)};

Story.prototype.scrollToSection = function(title,section) {
	if (!title||!section) return; var t=this.getTiddler(title); if (!t) return null;
	var elems=t.getElementsByTagName('*');
	var heads=[]; var anchors=[];
	for (var i=0; i<elems.length; i++)
		if (['H1','H2','H3','H4','H5'].contains(elems[i].nodeName)) heads.push(elems[i]);
	for (var i=0; i<elems.length; i++)
		if (elems[i].nodeName=='A' && (elems[i].getAttribute('name')||'').length) anchors.push(elems[i]);
	var found=null;
	for (var i=0; i<heads.length; i++)
		if (getPlainText(heads[i]).trim()==section) { found=heads[i]; break; }
	if (!found) for (var i=0; i<heads.length; i++)
		if (getPlainText(heads[i]).trim().startsWith(section)) { found=heads[i]; break; }
	if (!found) for (var i=0; i<heads.length; i++)
		if (getPlainText(heads[i]).trim().indexOf(section)!=-1) { found=heads[i]; break; }
	if (!found) for (var i=0; i<anchors.length; i++)
		if (anchors[i].getAttribute('name')==section) { found=anchors[i]; break; }
	if (!found) for (var i=0; i<anchors.length; i++)
		if (anchors[i].getAttribute('name').startsWith(section)) { found=anchors[i]; break; }
	if (!found) for (var i=0; i<anchors.length; i++)
		if (anchors[i].getAttribute('name').indexOf(section)!=-1) { found=anchors[i]; break; }
	if (found) {
		// if section heading is collapsed, click to expand it - see [[FoldHeadingsPlugin]]
		if (hasClass(found,'foldable') && found.nextSibling.style.display=='none') found.onclick();
		// scroll *after* tiddler animation
		var delay=config.options.chkAnimate?config.animDuration+100:0;
		setTimeout('window.scrollTo('+findPosX(found)+','+findPosY(found)+')',delay);
		return found;
	}
}
//}}}
/***
!!!!core hijacks
***/
/***
!!!!!createTiddlyLink
***/
//{{{
// [[tiddlername##section]] and [[##section]]
if (!window.createTiddlyLink_section)
	window.createTiddlyLink_section=window.createTiddlyLink;
window.createTiddlyLink=function(place,title) {
	var t=story.findContainingTiddler(place); var tid=t?t.getAttribute('tiddler'):'';
	var parts=title.split(config.textPrimitives.sectionSeparator);
	var title=parts[0]; var section=parts[1]; if (section) section=section.trim();
	if (!title.length || title.toLowerCase()=='here') title=tid;  // default=current tiddler
	arguments[1]=title;
	var btn=createTiddlyLink_section.apply(this,arguments);
	if (section) {
		btn.setAttribute('section',section);
		if (store.getTiddlerText(title+config.textPrimitives.sectionSeparator+section)===null)
			addClass(btn,'tiddlyLinkNonExistingSection');
	}
	return btn;
}
//}}}
/***
!!!!!onClickTiddlerLink
***/
//{{{
if (!window.onClickTiddlerLink_section)
	window.onClickTiddlerLink_section=window.onClickTiddlerLink;
window.onClickTiddlerLink=function(ev) {
	var e=ev||window.event;	var target=resolveTarget(e); var title=null;
	while (target!=null && title==null) {
		title=target.getAttribute('tiddlyLink');
		section=target.getAttribute('section');
		target=target.parentNode;
	} 
	var t=story.findContainingTiddler(target); var tid=t?t.getAttribute('tiddler'):'';
	if (title!=tid||!section) // avoid excess scrolling for intra-tiddler links
		onClickTiddlerLink_section.apply(this,arguments);
	story.scrollToSection(title,section);
	return false;
}
//}}}
/***
!!!!! displayTiddler
***/
//{{{
if (!Story.prototype.displayTiddler_section)
	Story.prototype.displayTiddler_section=Story.prototype.displayTiddler;
Story.prototype.displayTiddler = function(srcElement,tiddler)
{
	var title=(tiddler instanceof Tiddler)?tiddler.title:tiddler;
	var parts=title.split(config.textPrimitives.sectionSeparator);
	var title=parts[0]; var section=parts[1]; if (section) section=section.trim();
	if (!title.length || title.toLowerCase()=='here') {
		var t=story.findContainingTiddler(place);
		title=t?t.getAttribute('tiddler'):'';
	}
	arguments[1]=title;  // default=current tiddler
	this.displayTiddler_section.apply(this,arguments);
	story.scrollToSection(title,section);
}
//}}}
/***
<html><a name="sampleanchorlink" /></html>This is a sample ''anchor link'': {{{<html><a name="sampleanchorlink" /></html>}}}
!!!!!isExternalLink
***/
//{{{
if (!config.formatterHelpers.isExternalLink_section)
	config.formatterHelpers.isExternalLink_section=config.formatterHelpers.isExternalLink;
config.formatterHelpers.isExternalLink=function(link) {  // remove section references before testing
	var l=link.split(config.textPrimitives.sectionSeparator)[0];
	return config.formatterHelpers.isExternalLink_section(l);
}
//}}}
/***
!!!!!tiddler.handler
***/
//{{{
if (!config.macros.tiddler.handler_section)
	config.macros.tiddler.handler_section=config.macros.tiddler.handler;
config.macros.tiddler.handler=function(place,macroName,params,wikifier,paramString,tiddler)
{
	if (!params[0]) return;
	var sep=config.textPrimitives.sectionSeparator;
	var parts=params[0].split(sep); var tid=parts[0]; var sec=parts[1]; if (sec) sec=sec.trim();
	if ((tid.toLowerCase()=='here'||!tid.length) && sec) { // fixup for 'here##section' and '##section'
		var here=story.findContainingTiddler(place)
		var tid=here?here.getAttribute('tiddler'):tiddler?tiddler.title:'';
		arguments[2][0]=tid+sep+sec;
		arguments[4]=paramString.replace(new RegExp('(here)?'+sep+sec),tid+sep+sec);
	}
	config.macros.tiddler.handler_section.apply(this,arguments);
}
//}}}
/***
!!!!sectionTOC macro
***/
//{{{
config.macros.sectionTOC = {
	targetClass: 'sectionTOC',
	linkFormat: '[[%0|##%0]]',
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var out=[];
		var targetClass=params[0]||this.targetClass;
		var t=story.findContainingTiddler(place); if (!t) return;
		var elems=t.getElementsByTagName('*');
		var level=5; // topmost heading level
		for (var i=0; i<elems.length; i++) {
			var txt=getPlainText(elems[i]).trim();
			var link=this.linkFormat.format([txt]);
			switch(elems[i].nodeName) {
				case 'H1': out.push('#'+link);		level=1; break;
				case 'H2': out.push('##'+link);		level=level<2?level:2; break;
				case 'H3': out.push('###'+link);	level=level<3?level:3; break;
				case 'H4': out.push('####'+link);	level=level<4?level:4; break;
				case 'H5': out.push('#####'+link);	level=level<5?level:5; break;
				default: if (hasClass(elems[i],targetClass)) var target=elems[i];
			}
		}
		// trim excess bullet levels
		if (level>1) for (var i=0; i<out.length; i++) out[i]=out[i].substr(level-1);
		// show numbered list
		if (out.length && target) {
			if (target.style.display=='none') target.style.display='block';
			wikify(out.join('\n'),target);
		}
	}
}
//}}}
/***
!!!Invoke macro
{{{
<<sectionTOC>>
}}}
***/
// //<<sectionTOC>>