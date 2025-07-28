/***
|Name|SetUserNamePlugin|
|Source|http://www.TiddlyTools.com/#SetUserNamePlugin|
|Version|1.0.0|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|prompt for TiddlyWiki username|
!!!!!Usage
<<<
{{{
<<setUserName>>
<<setUserName force>>
}}}
If the default username ("YourName") is currently set, the macro automatically prompts for a new username. The optional 'force' keyword triggers a prompt even if a non-default username has already been set.  When the plugin is installed, the default (shadow) EditTemplate definition is updated to invoke the macro (using 
template syntax: {{{<span macro='setUserName'></span>}}}).  As a result, whenever a user attempts to edit/create a tiddler AND have not yet entered a username, they will be automatically prompted to enter a new username.  If you are using a customized EditTemplate, you will need to edit it yourself to add the above syntax.

{{{
<<showUserName>>
}}}
Displays the current username.  Clicking the name prompts for a new username.  Note: for backward-compatibility, the plugin also creates a shadow tiddler named [[ShowUserName]] so you can invoke the macro by using: {{{<<tiddler ShowUserName>>}}}
<<<
!!!!!Revisions
<<<
2012.07.11 1.1.0 added ShowUserName macro and shadow (replaces ShowUserName transclusion)
2006.12.01 1.0.0 initial release - converted from SetUserName inline script
<<<
!!!!!Code
***/
//{{{
version.extensions.SetUserNamePlugin= {major: 1, minor: 1, revision: 0, date: new Date(2012,7,11)};

config.macros.setUserName = {
	msg: "Please set your username",
	handler: function(place,macroName,params) {
		// only prompt when needed or forced
		var force=params[0]&&params[0].toLowerCase()=="force";
		if (!force && (readOnly || config.options.txtUserName!="YourName")) return;
		var opt="txtUserName";
		var who=prompt(this.msg,config.options[opt]);
		if (!who||!who.trim().length) return; // cancelled by user
		config.options[opt]=who;
		saveOptionCookie(opt);
		config.macros.option.propagateOption(opt,"value",config.options[opt],"input");
	}
}

config.macros.showUserName = {
	msg: "click to set your username",
	handler: function(place,macroName,params) {
		createTiddlyButton(place,config.options.txtUserName,this.msg,this.action);
	},
	action: function(ev) {
		var place=resolveTarget(ev);
		config.macros.setUserName.handler(resolveTarget(ev),"showUserName",['force']);
		place.innerHTML=config.options.txtUserName;
		return false;
	}
}

config.shadowTiddlers.ShowUserName="<<showUserName>>";

// add trigger to default shadow EditTemplate (custom templates: add this by hand)
config.shadowTiddlers.EditTemplate+="<span macro='setUserName'></span>";
//}}}