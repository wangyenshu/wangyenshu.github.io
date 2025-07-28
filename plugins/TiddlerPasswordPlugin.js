/***
|Name|TiddlerPasswordPlugin|
|Source|http://www.TiddlyTools.com/#TiddlerPasswordPlugin|
|Documentation|http://www.TiddlyTools.com/#TiddlerPasswordPluginInfo|
|Version|1.1.3|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|block viewing of tiddler content by prompting for a password before content is displayed|
This plugin blocks viewing of specific tiddler content by prompting for a NON-SECURE, UNENCRYPTED password before the tiddler is displayed.  If the correct password is not entered, the tiddler is automatically closed.  The process does not prevent tiddler content from being viewed directly from the TiddlyWiki source file's storeArea, nor does it encrypt the tiddler content in any way.  Because it is relatively simple to bypass and/or disable the password prompting process, this macro should be thought of as a "latch" rather than a "lock" on a given tiddler.
!!!!!Documentation
> see [[TiddlerPasswordPluginInfo]]
!!!!!Installation Notes
<<<
''As soon as you have installed this plugin, you should change the default admin password in [[TiddlerPasswordPluginConfig]].''  Note: the configuration tiddler is password-protected to prevent the admin password from being viewed (and/or modified) unless the current password is provided.  By default, the admin password is set to "admin".
<<<
!!!!!Revisions
<<<
2008.03.10 [*.*.*] plugin size reduction - documentation moved to [[TiddlerPasswordPluginInfo]]
2007.09.13 [1.1.3] adjusted wording of "cancelMsg" text so it can apply to either view-mode or edit-mode activities, and documented usage in ViewTemplate/EditTemplate.
| Please see [[TiddlerPasswordPluginInfo]] for previous revision details |
2006.12.02 [1.0.0] initial release - converted from GetTiddlerPassword inline script
<<<
!!!!!Code
***/
//{{{
version.extensions.TiddlerPasswordPlugin= {major: 1, minor: 1, revision: 3, date: new Date(2007,9,13)};

config.macros.getTiddlerPassword = {
	msg: "Please enter a password to view '%0'",
	defaultText: "enter password here",
	retryMsg: "'%0' is not the correct password for '%1'.  Please try again:",
	cancelMsg: "Sorry, you cannot access '%0' without a valid password.",
	thanksMsg: "Thank you, your password has been accepted.",
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var here=story.findContainingTiddler(place); if (!here) return;
		var title=tiddler?tiddler.title:here.getAttribute("tiddler");
		var who=here.getAttribute("logID");
		var userPass=params[0]?params[0]:""; if (userPass=='-') userPass="";
		var msg=params[1]?params[1]:this.msg;
		if (who==userPass||who==this.adminPass) return; // already 'logged in'?
		var who=prompt(msg.format([title]),this.defaultText); // ask for ID
		while (who && who!=userPass && who!=this.adminPass) // not correct ID?
			who=prompt(this.retryMsg.format([who,title]),this.defaultText); // ask again
		if (who==userPass||who==this.adminPass) // correct ID? mark tiddler logged in...
			{ here.setAttribute("logID",who); alert(this.thanksMsg); }
		else // incorrect ID (e.g., entry cancelled by user)...
			{ story.closeTiddler(here.getAttribute("tiddler")); alert(this.cancelMsg.format([title])); }
	}
}
// default admin password (may be overridden in TiddlerPasswordPluginConfig)
if (config.macros.getTiddlerPassword.adminPass==undefined)
	config.macros.getTiddlerPassword.adminPass="admin";
//}}}