/***
|Name|RecentChangesPlugin|
|Source|http://www.TiddlyTools.com/#RecentChangesPlugin|
|Version|2.2.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|display droplist of recently changed tiddlers with goto, edit, and preview buttons|
!!!!!Usage
<<<
The {{{<<recentChanges>>}}} macro displays a droplist of all tiddlers that have been changed within the last N days (default=10 days).  
{{{
<<recentChanges>>
<<recentChanges #ofdays summary noEdit previewheight previewclass>>
}}}
where:
* #ofdays specifies the time limit for listing changed tiddlers.  Use 0 (zero) to list all tiddlers in the document.
* ''summary'' is an optional keyword that outputs only the summary text (without the droplist or buttons)
* ''noEdit'' is an optional keyword that hides the 'edit' button
* previewheight is a CSS height measurement and sets the FIXED height of the tiddler preview area (default is 15em)
* previewclass is any CSS classname, and can be used to apply custom styles to the preview area (default is to use the standard 'viewer' class)
<<<
!!!!!Examples
<<<
{{smallform{
{{{<<recentChanges>>}}}
<<recentChanges>>
{{{<<recentChanges 30 summary>>}}}
<<recentChanges 30 summary>>

{{{<<recentChanges 30 noedit 10em groupbox>>}}}
<<recentChanges 30 noedit 10em groupbox>>
}}}
<<<
!!!!!Revisions
<<<
2009.09.07 [2.2.1] fixed typo in shadow definition
2009.07.02 [2.2.0] added optional 'noedit' keyword to hide 'edit' button
2008.07.01 [2.1.0] added optional 'summary' keyword for simple text output
2008.05.01 [2.0.1] fixup for titles with double-quotes
2007.07.26 [2.0.0] re-written as plugin
2006.10.02 [1.0.0] initial release (as inline script ShowRecentChanges)
<<<
!!!!!Code
***/
//{{{
version.extensions.RecentChangesPlugin= {major: 2, minor: 2, revision: 1, date: new Date(2009,9,7)};

config.shadowTiddlers.RecentChanges='<<recentChanges>>';

config.macros.recentChanges = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var days=10; if (!isNaN(params[0])) days=parseInt(params[0]); // time limit in days (use 0 for all tiddlers)
		var summary=params[1]&&params[1].toLowerCase()=='summary'; if (summary) params.shift();
		var noedit=params[1]&&params[1].toLowerCase()=='noedit'; if (noedit) params.shift();
		var height='15em'; if (params[1]) height=params[1]; // preview area fixed height
		var previewclass='viewer'; if (params[2]) previewclass=params[2]; // preview area CSS class
		var tiddlers=store.getTiddlers('modified','excludeLists').reverse();
		var count=tiddlers.length;
		if (days) {
			var timelimit=(new Date()).getTime()-86400000*days;
			for (var count=0; count<tiddlers.length && tiddlers[count].modified>timelimit; count++);
		}
		var s=count+' tiddlers have changed since ';
		s+=new Date(timelimit).formatString('DDD, MMM DDth YYYY 0hh:0mm');
		s+=' ('+days+' days ago)';
		if (summary)
			{ wikify(s,place); return; }
		var opts='<option value="">'+s+'</option>';
		for (var i=0; i<count; i++) { var t=tiddlers[i];
			opts+='<option value="'+t.title.replace(/"/g,"&#x22;")+'">';
			opts+=t.modified.formatString('YYYY.0MM.0DD 0hh:0mm')+' - '+t.title;
			opts+='</option>';
		}
		var h=store.getTiddlerText('RecentChangesPlugin##html')
		h=h.replace(/%options%/,opts);
		h=h.replace(/%listwidth%/,noedit?79.5:69.5);
		h=h.replace(/%noedit%/,noedit?'none':'inline');
		createTiddlyElement(place,'div').innerHTML=h;
		var preview=createTiddlyElement(place,'div',null,previewclass);
		preview.style.display='none';
		preview.style.whiteSpace='normal';
		preview.style.overflow='auto';
		preview.style.height=height;
	}
}
//}}}
/***
//{{{
!html
<form><select size=1 name="list" style="width:%listwidth%%"
	onchange="this.form.goto.disabled=this.form.edit.disabled=this.form.preview.disabled=!this.value.length;
		var target=this.parentNode.parentNode.nextSibling; removeChildren(target);
		if (!this.value.length)
			{ target.style.display='none'; this.form.preview.value='preview'; }
		else if (target.style.display=='block') {
			wikify('<'+'<tiddler [['+this.value+']]>'+'>',target);
			target.style.display='block';
			this.form.preview.value='done';
		}
">%options%</select><!--
--><input type="button" name="goto" value="goto" disabled title="view selected tiddler" style="width:10%"
	onclick="var target=this.parentNode.parentNode.nextSibling; removeChildren(target);
		target.style.display='none'; this.form.preview.value='preview';
		story.displayTiddler(story.findContainingTiddler(this),this.form.list.value);
"><input type="button" name="edit" value="edit" disabled title="edit selected tiddler" style="width:10%;display:%noedit%"
	onclick="var target=this.parentNode.parentNode.nextSibling; removeChildren(target);
		target.style.display='none'; this.form.preview.value='preview';
		story.displayTiddler(story.findContainingTiddler(this),this.form.list.value,DEFAULT_EDIT_TEMPLATE);
"><input type="button" name="preview" value="preview" disabled title="show/hide tiddler preview" style="width:10%"
	onclick="var target=this.parentNode.parentNode.nextSibling;
		if (this.value=='preview') {
			removeChildren(target);
			wikify('<'+'<tiddler [['+this.form.list.value+']]>'+'>',target);
			target.style.display=this.form.list.value.length?'block':'none'; this.value='done';
		} else {
			removeChildren(target);
			target.style.display='none'; this.value='preview';
		}
"></form>
!end
//}}}
***/
 