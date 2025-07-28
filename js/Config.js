//--
//-- Configuration repository
//--

// Miscellaneous options
var config = {
	numRssItems: 20, // Number of items in the RSS feed
	animDuration: 400, // Duration of UI animations in milliseconds
	cascadeFast: 20, // Speed for cascade animations (higher == slower)
	cascadeSlow: 60, // Speed for EasterEgg cascade animations
	cascadeDepth: 5, // Depth of cascade animation
	locale: "en" // W3C language tag
};

// Hashmap of alternative parsers for the wikifier
config.parsers = {};

config.adaptors = {};
config.defaultAdaptor = null;

// defines the order of the backstage tasks
config.backstageTasks = ["save", "importTask", "tweak", "upgrade", "plugins"];
// map by names from config.backstageTasks, defines their content (see Lingo.js and Backstage.js)
config.tasks = {};
//# the two structures are not merged yet not to hurt backward compatibility

config.annotations = {};

// Custom fields to be automatically added to new tiddlers
config.defaultCustomFields = {};

config.messages = {
	messageClose: {},
	dates: {},
	tiddlerPopup: {}
};

// Options that can be set in the options panel and/or cookies
config.options = {
	chkAnimate: true,
	chkAutoSave: false,
	chkBackstage: false,
	chkCaseSensitiveSearch: false,
	chkConfirmDelete: true,
	chkDisplayInstrumentation: false,
	chkForceMinorUpdate: false,
	chkGenerateAnRssFeed: false,
	chkHttpReadOnly: true,
	chkIncrementalSearch: true,
	chkInsertTabs: false,
	chkOpenInNewWindow: true,
	chkPreventAsyncSaving: true,
	chkRegExpSearch: false,
	chkRemoveExtraMarkers: false, // #162
	chkSaveBackups: true,
	chkSaveEmptyTemplate: false,
	chkSliderOptionsPanel: false,
	chkToggleLinks: false,
	chkUsePreForStorage: true, // Whether to use <pre> format for storage
	txtBackupFolder: "",
	txtEditorFocus: "text",
	txtFileSystemCharSet: "UTF-8",
	txtMainTab: "tabTimeline",
	txtMaxEditRows: "30",
	txtMoreTab: "moreTabAll",
	txtTheme: "",
	txtUpgradeCoreURI: ""
};
config.optionsDesc = {};

//# config.optionSource["chkAnimate"] can be:
//# 	cookie: the option gets stored in a cookie, with the default value coming from SystemSettings
//#		volatile: the option isn't persisted at all, and reverts to the default specified in SystemSettings when the document is reloaded
//#		setting: the option is stored in the SystemSettings tiddler
//#	The default is "setting"
config.optionsSource = {};

// Default tiddler templates
var DEFAULT_VIEW_TEMPLATE = 1;
var DEFAULT_EDIT_TEMPLATE = 2;
config.tiddlerTemplates = {
	1: "ViewTemplate",
	2: "EditTemplate"
};

// More messages (rather a legacy layout that should not really be like this)
config.views = {
	wikified: {
		tag: {}
	},
	editor: {
		tagChooser: {}
	}
};

config.extensions = {};

// Macros; each has a 'handler' member that is inserted later
config.macros = {
	today: {},
	version: {},
	search: { sizeTextbox: 15 },
	tiddler: {},
	tag: {},
	tags: {},
	tagging: {},
	timeline: {},
	allTags: {},
	list: {
		all: {},
		missing: {},
		orphans: {},
		shadowed: {},
		touched: {},
		filter: {}
	},
	closeAll: {},
	permaview: {},
	saveChanges: {},
	slider: {},
	option: {},
	options: {},
	newTiddler: {},
	newJournal: {},
	tabs: {},
	gradient: {},
	message: {},
	view: { defaultView: "text" },
	edit: {},
	tagChooser: {},
	toolbar: {},
	plugins: {},
	refreshDisplay: {},
	importTiddlers: {},
	upgrade: {
		source: "https://classic.tiddlywiki.com/upgrade/",
		backupExtension: "pre.core.upgrade"
	},
	sync: {},
	annotations: {}
};

// Commands supported by the toolbar macro
config.commands = {
	closeTiddler: {},
	closeOthers: {},
	editTiddler: {},
	saveTiddler: { hideReadOnly: true },
	cancelTiddler: {},
	deleteTiddler: { hideReadOnly: true },
	permalink: {},
	references: { type: "popup" },
	jump: { type: "popup" },
	syncing: { type: "popup" },
	fields: { type: "popup" }
};

// Control of macro parameter evaluation
config.evaluateMacroParameters = "all";

// Basic regular expressions
var isBadSafari = !((new RegExp("[\u0150\u0170]", "g")).test("\u0150")); //# see 52678d4 and #22  ..remove at all?
config.textPrimitives = {
	upperLetter: "[A-Z\u00c0-\u00de\u0150\u0170]",
	lowerLetter: "[a-z0-9_\\-\u00df-\u00ff\u0151\u0171]",
	anyLetter:   "[A-Za-z0-9_\\-\u00c0-\u00de\u00df-\u00ff\u0150\u0170\u0151\u0171]",
	anyLetterStrict: "[A-Za-z0-9\u00c0-\u00de\u00df-\u00ff\u0150\u0170\u0151\u0171]"
};
// Moved navigator dependent code out of Config.js into a separate module. Helps with https://github.com/TiddlyWiki/tiddlywiki/issues/22
if(isBadSafari) {
	config.textPrimitives = {
		upperLetter: "[A-Z\u00c0-\u00de]",
		lowerLetter: "[a-z0-9_\\-\u00df-\u00ff]",
		anyLetter:   "[A-Za-z0-9_\\-\u00c0-\u00de\u00df-\u00ff]",
		anyLetterStrict: "[A-Za-z0-9\u00c0-\u00de\u00df-\u00ff]"
	};
}
config.textPrimitives.sliceSeparator = "::";
config.textPrimitives.sectionSeparator = "##";
config.textPrimitives.urlPattern =
	"(?:file|http|https|mailto|ftp|irc|news|data):[^\\s'\"]+(?:/|\\b|\\[|\\])"; // #132
config.textPrimitives.unWikiLink = "~";
config.textPrimitives.wikiLink = "(?:(?:" + config.textPrimitives.upperLetter + "+" +
	config.textPrimitives.lowerLetter + "+" +
	config.textPrimitives.upperLetter +
	config.textPrimitives.anyLetter + "*)|(?:" +
	config.textPrimitives.upperLetter + "{2,}" +
	config.textPrimitives.lowerLetter + "+))";

config.textPrimitives.cssLookahead = "(?:(" + config.textPrimitives.anyLetter +
	"+)\\(([^\\)\\|\\n]+)(?:\\):))|(?:(" + config.textPrimitives.anyLetter + "+):([^;\\|\\n]+);)";
config.textPrimitives.cssLookaheadRegExp = new RegExp(config.textPrimitives.cssLookahead, "mg");

config.textPrimitives.brackettedLink = "\\[\\[([^\\]]+)\\]\\]";
config.textPrimitives.titledBrackettedLink = "\\[\\[([^\\[\\]\\|]+)\\|([^\\[\\]\\|]+)\\]\\]";
config.textPrimitives.tiddlerForcedLinkRegExp =
	new RegExp("(?:" + config.textPrimitives.titledBrackettedLink + ")|(?:" +
	config.textPrimitives.brackettedLink + ")|(?:" +
	config.textPrimitives.urlPattern + ")", "mg");
config.textPrimitives.tiddlerAnyLinkRegExp =
	new RegExp("(" + config.textPrimitives.wikiLink + ")|(?:" +
	config.textPrimitives.titledBrackettedLink + ")|(?:" +
	config.textPrimitives.brackettedLink + ")|(?:" +
	config.textPrimitives.urlPattern + ")", "mg");

config.glyphs = {
	currBrowser: null,
	browsers: [],
	codes: {}
};

//--
//-- Shadow tiddlers
//--

config.shadowTiddlers = {
	StyleSheet: "",
	MarkupPreHead: "",
	MarkupPostHead: "",
	MarkupPreBody: "",
	MarkupPostBody: "",
	TabTimeline: '<<timeline>>',
	TabAll: '<<list all>>',
	TabTags: '<<allTags excludeLists>>',
	TabMoreMissing: '<<list missing>>',
	TabMoreOrphans: '<<list orphans>>',
	TabMoreShadowed: '<<list shadowed>>',
	AdvancedOptions: '<<options>>',
	PluginManager: '<<plugins>>',
	SystemSettings: '',
	ToolbarCommands: '|~ViewToolbar|closeTiddler closeOthers +editTiddler > fields permalink references jump|\n' +
		'|~EditToolbar|+saveTiddler -cancelTiddler deleteTiddler|', // #160
	WindowTitle: '<<tiddler SiteTitle>> - <<tiddler SiteSubtitle>>'
};

