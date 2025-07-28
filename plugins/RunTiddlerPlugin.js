/***
|Name|RunTiddlerPlugin|
|Source|http://www.TiddlyTools.com/#RunTiddlerPlugin|
|Version|1.2.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|command to invoke tiddler content as if tagged with systemConfig (i.e., a plugin)|
!!!!!Usage/Example
<<<
Toolbar command:
>{{{<<toolbar runTiddler>>}}} (in tiddler content)
>{{{<span class='toolbar' macro='toolbar runTiddler'></span>}}} (in ViewTemplate definition)
><<toolbar runTiddler>>
>when clicked, invokes the current tiddler as javascript code
Macro function:
>{{{<<runTiddler TiddlerName>>}}} or {{{<<runTiddler TiddlerName label tip>>}}}
>if only a TiddlerName is provided, the specified tiddler is automatically invoked as javascript code as soon as the macro is rendered.  If //optional// ''label'' and ''tip'' parameters are present, a command link is created that, when clicked, invokes the specified tiddler as javascript code.
<<<
!!!!!Revisions
<<<
2008.09.01 [1.2.1] fixed return value from command handler to prevent IE from attempt to leave the page
2008.08.26 [1.2.0] added optional label and tooltip params to macro (creates 'onclick' button to invoke specified tiddler)
2008.08.26 [1.1.0] added {{{<<runTiddler TiddlerName>>}}} macro to invoke specified tiddler
2007.09.27 [1.0.0] toolbar command based on run button functionality from TidIDEPlugin
<<<
!!!!!Code
***/
//{{{
version.extensions.RunTiddlerPlugin= {major: 1, minor: 2, revision: 1, date: new Date(2008,9,1)};
//}}}
//{{{
config.commands.runTiddler = {
	text: 'run',
	tooltip: 'evaluate tiddler content as systemConfig (plugin) javascript code',
	warning: "Warning!!  Processing '%0' as a systemConfig (plugin) tiddler may produce unexpected results! Are you sure you want to proceed?",
	completed: "%0: Processing completed",
	handler: function(event,src,title) {
		var here=story.findContainingTiddler(src); if (!here) return;
		return this.invoke(here.getAttribute("tiddler"),true,false);
	},
	invoke: function(tid,ask,quiet) {
		if (ask && !confirm(this.warning.format([tid]))) return false;
		var text=store.getTiddlerText(tid); if (!text) return false;
		try { window.eval(text); if (!quiet) displayMessage(config.commands.runTiddler.completed.format([tid])); }
		catch(ex) { displayMessage(config.messages.pluginError.format([exceptionText(ex)])); }
		return false;
	}
};
//}}}
//{{{
config.macros.runTiddler = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var tid=params[0];
		var label=params[1];
		var tip=params[2]||config.commands.runTiddler.tooltip;
		if (!label) config.commands.runTiddler.invoke(tid,false,true);
		else createTiddlyButton(place,label,tip,function(){
			return config.commands.runTiddler.invoke(this.getAttribute("tid"),true,false);
		},"button").setAttribute("tid",tid);
	}
}
//}}}