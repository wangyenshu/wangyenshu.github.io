/***
|Name|ClickifyPlugin|
|Source|http://www.TiddlyTools.com/#ClickifyPlugin|
|Documentation|http://www.TiddlyTools.com/#ClickifyPlugin|
|Version|1.0.2|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|re-compute parameters when a 'command link' macro is clicked|
!!!!!Usage
<<<
Normally, when you use a //computed parameter// in a macro, it's value is determined when the macro is rendered.  The {{{<<clickify>>}}} macro can be used to force the macro parameters of an 'on-click' command link (such as created by the {{{<<newTiddler>>}}} macro) to be automatically re-computed when the command link is clicked, rather than when it is initially displayed.  This allows use of computed values that depend upon data that may change between the time the macro is rendered and when it's action is actually triggered by a click.

To apply this extended processing to any macro that creates a command link, simply insert the 'clickify' keyword in front of the usual macro name, like this:
{{{
<<clickify macroName param param param ...>>
}}}
<<<
!!!!!Example
<<<
When {{{<<newTiddler>>}}} is clicked, prompt for a title and set default text to current timestamp:
{{{
<<clickify newTiddler title:{{prompt('enter a title','NewTiddler')}} text:{{new Date()}}>>
}}}
><<clickify newTiddler title:{{prompt('enter a title','NewTiddler')}} text:{{new Date()}}>>
<<<
!!!!!Revisions
<<<
2010.07.17 [1.0.2] in b.onclick handler, pass event data ('ev') to command link click handler
2009.02.08 [1.0.1] make sure command link has been rendered before trying to modify it
2009.01.25 [1.0.0] initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.ClickifyPlugin={major: 1, minor: 0, revision: 2, date: new Date(2010,7,17)};
config.macros.clickify={
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var cmd='<<'+paramString+'>>';
		var e=createTiddlyElement(place,'span');
		wikify(cmd.replace(/alert\(|prompt\(|confirm\(/g,'isNaN('),e);
		var b=e.getElementsByTagName('a')[0]; if (!b) return;
		b.setAttribute('cmd',cmd);
		b.onclick=function(ev) {
			var cmd=this.getAttribute('cmd');
			var e=createTiddlyElement(this.parentNode,'span');
			e.style.display='none';
			wikify(cmd,e);
			e.getElementsByTagName('a')[0].onclick(ev);
			this.parentNode.removeChild(e);
		}
	}
}
//}}}