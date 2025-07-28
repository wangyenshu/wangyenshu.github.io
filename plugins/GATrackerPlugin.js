/***
|Name|GATrackerPlugin|
|Description|Google Analytics tracker|
|Author|Julien Coloos|
|Version|1.2.0|
|Date|2011-05-18|
|Status|stable|
|Source|http://julien.coloos.free.fr/TiddlyWiki-dev/#GATrackerPlugin|
|License|[img[CC BY-SA 3.0|http://i.creativecommons.org/l/by-sa/3.0/80x15.png][http://creativecommons.org/licenses/by-sa/3.0/]]|
|CoreVersion|2.6.2|
|Documentation|http://julien.coloos.free.fr/TiddlyWiki-dev/#GATrackerPlugin|

!Description
This plugin enables Google Analytics tracking inside TiddlyWiki.

The version used is the asynchronous one ({{{ga.js}}}).
The plugin comes with its own configuration, which is stored persistently inside the (hidden) [[SystemSettings]] tiddler.
The configuration has to be set before being effective: it can be done in the plugin tiddler (see below) if TiddlyWiki is not in read-only mode. Tracking works if an account ID has been set, tracking has been enabled, and TiddlyWiki access is non-local.

Tracking can be reported as either:
* page views
** pages are named {{{/#Tiddler name}}}
* events
** Category: {{{Tiddlers}}}
** Action: {{{Open}}}, {{{Refresh}}}, {{{Edit}}}, {{{Search}}}, {{{Close}}} or {{{CloseAll}}}
** Label
*** for {{{CloseAll}}} action: excluded tiddler
*** for {{{Search}}} action: searched text
*** otherwise, tiddler name on which action is performed
** Value: for the {{{CloseAll}}} action, the number of closed tiddlers
** Note: Google Analytics script limits the number of events (1 every 5 seconds, with a burst limit of 10)
Tracking can be globally disabled, or enabled per action on each tiddler:
* //Open//: when tiddler was not yet displayed
** Note: default tiddlers do not trigger this action when accessing TiddlyWiki
* //Refresh//: when tiddler was already displayed
** Note: this action is automatically triggered after editing a tiddler
* //Edit//: when editing (or viewing in read-only mode) the tiddler
* //Close//: when tiddler was displayed
** this action is never tracked in //pages views// tracking
** the //CloseAll// action is triggered by the TiddyWiki links //close all// and //close others// if at least one tiddler was closed; individual tiddlers closed are not tracked as //Close// actions
* //Search//: when searching in tiddlers
** this action is never tracked in //pages views// tracking
** {{{CloseAll}}} and {{{Open}}} actions are not taken into account while search is performed: TiddlyWiki automically closes opened tiddlers before searching and opens tiddler that match the searched text


!Configuration
<<GATrackerConfig>>


!Revision History
!!v1.2.0 (2011-05-18)
Enhancements:
* do not trigger {{{CloseAll}}} and {{{Open}}} actions when search is performed
* added the {{{Search}}} action

!!v1.1.0 (2011-05-17)
Enhancements:
* do not trigger {{{Open}}} action when displaying default tiddlers
* added the {{{CloseAll}}} action

!!v1.0.0 (2011-05-14)
Initial release.


!Code
***/
//{{{
/* Google Analytics queue object. Needs to be global. */
var _gaq = _gaq || [];

if (!config.extensions.GATracker) {(function($) {

version.extensions.GATrackerPlugin = {major: 1, minor: 2, revision: 0, date: new Date(2011, 5, 18)};

/* Prepare overridden TiddlyWiki displaying */
var trackOptions = {};
var displayDefault = 0, closingAll = 0, searching = 0;
var pl = config.extensions.GATracker = {
getOption: function(optKey) {
	return (config.optionsSource && (config.optionsSource[optKey] == "setting")) ? config.options[optKey] : null;
},
setOption: function(optKey, value) {
	config.options[optKey] = value;
	config.optionsSource[optKey] = "setting";
	saveOption(optKey);
},
loadOptions: function() {
	var gaTrack = (pl.getOption("txt_GATracker_track") || "1,0,1,1,1,0,0").split(",");
	trackOptions = {
		id: pl.getOption("txt_GATracker_id"),
		enabled: parseInt(gaTrack[0] || "1"),
		type: parseInt(gaTrack[1] || "0"),
		events: {
			open: parseInt(gaTrack[2] || "1"),
			refresh: parseInt(gaTrack[3]) || "1",
			edit: parseInt(gaTrack[4] || "1"),
			close: parseInt(gaTrack[5] || "0"),
			search: parseInt(gaTrack[6] || "0")
		}
	};
	if (trackOptions.id && !trackOptions.id.length) {
		trackOptions.id = null;
	}
},
saveOptions: function() {
	var opts = trackOptions.enabled && "1" || "0";
	opts += "," + trackOptions.type;
	for (var ev in trackOptions.events) {
		opts += "," + (trackOptions.events[ev] && "1" || "0");
	}
	pl.setOption("txt_GATracker_id", trackOptions.id || "");
	pl.setOption("txt_GATracker_track", opts);
},
track: function() {
	_gaq.push.apply(_gaq, arguments);
},
trackAndDisplayDefaultTiddlers: function() {
	displayDefault = 1;
	try { pl.displayDefaultTiddlers.apply(this, arguments) } catch(e){};
	displayDefault = 0;
},
trackAndDisplayTiddler: function(srcElement, tiddler, template, animate, unused, customFields, toggle, animationSrc) {
	if (!displayDefault) {
		var trackEvent, title = (tiddler instanceof Tiddler) ? tiddler.title : tiddler;
		if (story.getTiddler(title)) {
			/* Tiddler is already displayed */
			if (toggle === true) {
				/* Closing tiddler: tracked in separate function */
			}
			else if (template === DEFAULT_EDIT_TEMPLATE) {
				if (trackOptions.events.edit) trackEvent = "Edit";
			}
			else if (trackOptions.events.refresh) trackEvent = "Refresh";
		}
		else if (trackOptions.events.open && !searching) trackEvent = "Open";

		if (trackEvent) pl.track(trackOptions.type ? ["_trackPageview", "/#" + title] : ["_trackEvent", "Tiddlers", trackEvent, title]);
	}
	pl.displayTiddler.apply(this, arguments);
},
trackAndCloseTiddler: function(title, animate, unused) {
	if (closingAll) closingAll++;
	else pl.track(["_trackEvent", "Tiddlers", "Close", title]);
	pl.closeTiddler.apply(this, arguments);
},
trackAndCloseAllTiddlers: function(excluded) {
	closingAll = 1;
	try { pl.closeAllTiddlers.apply(this, arguments) } catch(e){};
	if ((closingAll > 1) && !searching) pl.track(["_trackEvent", "Tiddlers", "CloseAll", excluded, closingAll - 1]);
	closingAll = 0;
},
trackAndSearch: function(text, useCaseSensitive, useRegExp) {
	if (!trackOptions.type && trackOptions.events.search) pl.track(["_trackEvent", "Tiddlers", "Search", text]);
	searching = 1;
	try { pl.search.apply(this, arguments) } catch(e){};
	searching = 0;
}
};

pl.loadOptions();

/* Only track in non-local mode */
var local = "file:" == document.location.protocol;
if (!local && trackOptions.id && trackOptions.enabled) {
	/* Insert script tag to load GA */
	$("head").eq(0).prepend($("<script/>").attr({type: "text/javascript", async: "true", src: ("https:" == document.location.protocol ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js"}));

	/* Override TiddlyWiki display */
	pl.displayTiddler = story.displayTiddler;
	story.displayTiddler = pl.trackAndDisplayTiddler;
	pl.displayDefaultTiddlers = story.displayDefaultTiddlers;
	story.displayDefaultTiddlers = pl.trackAndDisplayDefaultTiddlers;
	if (!trackOptions.type && trackOptions.events.close) {
		pl.closeTiddler = story.closeTiddler;
		story.closeTiddler = pl.trackAndCloseTiddler;
		pl.closeAllTiddlers = story.closeAllTiddlers;
		story.closeAllTiddlers = pl.trackAndCloseAllTiddlers;
	}
	pl.search = story.search;
	story.search = pl.trackAndSearch;

	/* Initialize tracking */
	pl.track(["_setAccount", trackOptions.id], ["_trackPageview"]);
}

config.macros.GATrackerConfig = {
handler: function(place, macroName, params, wikifier, paramString, tiddler) {
	$(createTiddlyElement(place, "div")).html("Tracking status: <span style='color:" + (trackOptions.id && trackOptions.enabled ? "green'>enabled" : "red'>disabled") + "</span> and <span style='color:" + (local ? "red'>" : "green'>non-") + "local</span>");
	if (readOnly) {
		$(createTiddlyElement(place, "div")).html("Configuration is not available in read-only mode");
		return;
	}
	var formNode = $(createTiddlyElement(place, "div")).html("<div>Google Analytics plugin configuration:</div><table><tr><td>Account ID:</td><td><input id='ga_id' type='text'/></td></tr><tr><td>Tracking:</td><td><input id='ga_enabled' type='checkbox'/>Enabled<br/><br/>How: <select id='ga_track'><option value='0'>Events</option><option value='1'>Pages</option></select><br/><br/>What:<br/><input id='ga_track_open' type='checkbox'/>Open<br/><input id='ga_track_refresh' type='checkbox'/>Refresh<br/><input id='ga_track_edit' type='checkbox'/>Edit<br/><input id='ga_track_close' type='checkbox'/>Close<br/><input id='ga_track_search' type='checkbox'/>Search<br/></td></tr></table><input id='ga_action_submit' type='submit' value='Apply'/>");
	$("#ga_id", formNode).val(trackOptions.id);
	$("#ga_enabled", formNode)[0].checked = trackOptions.enabled;
	$("#ga_track option", formNode).eq(trackOptions.type)[0].selected = true;
	for (var ev in trackOptions.events) {
		$("#ga_track_" + ev, formNode)[0].checked = trackOptions.events[ev];
	}
	$("#ga_action_submit", formNode).click(function() {
		trackOptions.id = $("#ga_id", formNode).val();
		if (!trackOptions.id.length) trackOptions.id = null;
		trackOptions.enabled = $("#ga_enabled", formNode)[0].checked;
		trackOptions.type = parseInt($("#ga_track", formNode).val());
		for (var ev in trackOptions.events) {
			trackOptions.events[ev] = $("#ga_track_" + ev, formNode)[0].checked;
		}
		pl.saveOptions();

		var nodeDisplay = story.findContainingTiddler(place);
		var tiddlerDisplay;
		if (nodeDisplay) tiddlerDisplay = store.getTiddler(nodeDisplay.getAttribute("tiddler"));
		story.refreshTiddler(tiddlerDisplay ? tiddlerDisplay.title : tiddler.title, null, true);
	});
}
};

})(jQuery);}
//}}}