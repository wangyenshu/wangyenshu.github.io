/***
|Name|CommentPlugin|
|Source|http://www.TiddlyTools.com/#CommentPlugin|
|Documentation|http://www.TiddlyTools.com/#CommentPluginInfo|
|Version|2.9.5|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|automatically insert formatted comments into tiddler content|
!!!!!Documentation
>see [[CommentPluginInfo]]
!!!!!Configuration
>see [[CommentPluginInfo]]
!!!!!Revisions
<<<
2011.04.27 2.9.5 merge/clone defaultCustomFields for saving on TiddlySpace
| please see [[CommentPluginInfo]] for previous revision details |
2006.04.20 1.0.0 initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.CommentPlugin= {major: 2, minor: 9, revision: 5, date: new Date(2011,4,27)};

config.macros.comment= {
	marker: '/%'+'comment'+'%/',
	fmt: "__''%subject%''__\n^^posted by %who% on %when%^^\n<<<\n%message%\n<<<\n",
	datefmt: 'DDD, MMM DDth, YYYY at hh12:0mm:0ss am',
	tags: '',
	reverse: false,
	handler: function(place,macroName,params,wikifier,paramstring,tiddler) {
		var span=createTiddlyElement(place,'span');
		var here=story.findContainingTiddler(place);
		if (here) var tid=here.getAttribute('tiddler');  // containing tiddler title
		span.setAttribute('here',tid);
		var target=(params[0]&&params[0].length&&params[0]!='here')?params[0]:tid;  // target title
		span.setAttribute('target',target);
		var overwrite=(params[1]&&params[1].toLowerCase()=='overwrite'); if (overwrite) params.shift();
		span.setAttribute('overwrite',overwrite?'true':'false');
		var reverse=(params[1]&&params[1].toLowerCase()=='reverse'); if (reverse) params.shift();
		span.setAttribute('reverse',(reverse||this.reverse)?'true':'false');
		var marker=this.marker;
		if (params[1]&&params[1].substr(0,7)=='marker:') {
			var marker='/%'+params[1].substr(7)+'%/';
			params.shift();
		}
		span.setAttribute('marker',marker);
		var tags=(params[1]&&params[1].length)?params[1]:this.tags; // target tags
		span.setAttribute('tags',tags);
		var fmt=(params[2]&&params[2].length)?params[2]:this.fmt; // output format
		span.setAttribute('fmt',fmt.unescapeLineBreaks());
		var datefmt=(params[3]&&params[3].length)?params[3]:this.datefmt; // date format
		span.setAttribute('datefmt',datefmt.unescapeLineBreaks());
		var html=this.html;
		html=html.replace(/%nosubject%/g,(fmt.indexOf('%subject%')==-1)?'none':'block');
		html=html.replace(/%nomessage%/g,(fmt.indexOf('%message%')==-1)?'none':'block');
		var subjtxt=''; var msgtxt='';
		html=html.replace(/%subjtxt%/g,subjtxt);
		html=html.replace(/%msgtxt%/g,msgtxt);
		span.innerHTML=html;
	},
	html: "<form style='display:inline;margin:0;padding:0;'>\
		<div style='display:%nosubject%'>\
		subject:<br>\
		<input type='text' name='subject' title='enter subject text' style='width:100%' value='%subjtxt%'>\
		</div>\
		<div style='display:%nomessage%'>\
		message:<br>\
		<textarea name='message' rows='7' title='enter message text' \
			style='width:100%'>%msgtxt%</textarea>\
		</div>\
		<center>\
		<i>Please enter your information and then press</i>\
		<input type='button' value='post' onclick='\
			var s=this.form.subject; var m=this.form.message;\
			if (\"%nosubject%\"!=\"none\" && !s.value.length)\
				{ alert(\"Please enter a subject\"); s.focus(); return false; }\
			if (\"%nomessage%\"!=\"none\" && !m.value.length)\
				{ alert(\"Please enter a message\"); m.focus(); return false; }\
			var here=this.form.parentNode.getAttribute(\"here\");\
			var reverse=this.form.parentNode.getAttribute(\"reverse\")==\"true\";\
			var target=this.form.parentNode.getAttribute(\"target\");\
			var marker=this.form.parentNode.getAttribute(\"marker\");\
			var tags=this.form.parentNode.getAttribute(\"tags\").readBracketedList();\
			var fmt=this.form.parentNode.getAttribute(\"fmt\");\
			var datefmt=this.form.parentNode.getAttribute(\"datefmt\");\
			var overwrite=this.form.parentNode.getAttribute(\"overwrite\")==\"true\";\
			config.macros.comment.addComment(here,reverse,target,tags,fmt,datefmt,\
				s.value,m.value,overwrite,marker);'>\
		</center>\
		</form>",
	addComment: function(here,reverse,target,newtags,fmt,datefmt,subject,message,overwrite,marker) {
		var UTC=new Date().convertToYYYYMMDDHHMMSSMMM();
		var rand=Math.random().toString();
		var who=config.options.txtUserName;
		var when=new Date().formatString(datefmt);
		target=target.replace(/%tiddler%/g,here);
		target=target.replace(/%UTC%/g,UTC);
		target=target.replace(/%random%/g,rand);
		target=target.replace(/%who%/g,who);
		target=target.replace(/%when%/g,when);
		target=target.replace(/%subject%/g,subject);
		var t=store.getTiddler(target);
		var text=t?t.text:'';
		var modifier=t?t.modifier:config.options.txtUserName;
		var modified=t?t.modified:new Date();
		var tags=t?t.tags:[];
		for(var i=0; i<newtags.length; i++) tags.pushUnique(newtags[i]);
		var fields=merge(t?t.fields:{},config.defaultCustomFields,true)
		var out=fmt;
		out=out.replace(/%tiddler%/g,here);
		out=out.replace(/%UTC%/g,UTC);
		out=out.replace(/%when%/g,when);
		out=out.replace(/%who%/g,who);
		out=out.replace(/%subject%/g,subject);
		out=out.replace(/%message%/g,message);
		var pos=text.indexOf(marker);
		if (pos==-1) pos=text.length; // no marker - insert at end
		else if (reverse) pos+=marker.length; // reverse order by inserting AFTER marker
		var newtxt=overwrite?out:(text.substr(0,pos)+out+text.substr(pos));
		store.saveTiddler(target,target,newtxt,modifier,modified,tags,fields);
		autoSaveChanges();
		if (story.getTiddler(target))
			story.refreshTiddler(target,DEFAULT_VIEW_TEMPLATE,true);
		if (here!=target && story.getTiddler(here))
			story.refreshTiddler(here,DEFAULT_VIEW_TEMPLATE,true);
	}
};
//}}}