//--
//-- Main
//--

var params = null; // Command line parameters
var store = null; // TiddlyWiki storage
var story = null; // Main story
var formatter = null; // Default formatters for the wikifier
var anim = typeof Animator == "function" ? new Animator() : null; // Animation engine
var readOnly = false; // Whether we're in readonly mode
var highlightHack = null; // Embarrassing hack department...
var hadConfirmExit = false; // Don't warn more than once
var safeMode = false; // Disable all plugins and cookies
var showBackstage; // Whether to include the backstage area
var installedPlugins = []; // Information filled in when plugins are executed
var startingUp = false; // Whether we're in the process of starting up
var pluginInfo, tiddler; // Used to pass information to plugins in loadPlugins()

// Whether this file can be saved back to the same location [Preemption]
window.allowSave = window.allowSave || function(l) {
	//# allow save from ANYWHERE (TW280+ uses fallback HTML5 download from data:// URI)
	//#	return (document.location.protocol == "file:");
	return true;
};

// Whether this file is being viewed locally
window.isLocal = function() {
	return (document.location.protocol == "file:");
};

//# Use of the JavaSaver applet is removed from the core; this is only kept for backwards compatibility
var useJavaSaver = false;

// Allow preemption code a chance to tweak config and useJavaSaver [Preemption]
if (window.tweakConfig) window.tweakConfig();

if(!window || !window.console) {
	console = { tiddlywiki: true, log: function(message) { displayMessage(message) } };
}

// Starting up
function main() {
//#	save loaded document HTML before making changes
	window.originalHTML = recreateOriginal();

	var t10, t9, t8, t7, t6, t5, t4, t3, t2, t1, t0 = new Date();
	startingUp = true;
	var doc = jQuery(document);
	jQuery.noConflict();
	window.onbeforeunload = function(e) { if(window.confirmExit) return confirmExit(); };
	params = getParameters();
	if(params) params = params.parseParams("open", null, false);
	store = new TiddlyWiki({ config: config });
	invokeParamifier(params, "oninit");
	story = new Story("tiddlerDisplay", "tiddler");
	addEvent(document, "click", Popup.onDocumentClick);
	saveTest();
	for(var i = 0; i < config.notifyTiddlers.length; i++)
		store.addNotification(config.notifyTiddlers[i].name, config.notifyTiddlers[i].notify);
	t1 = new Date();
	loadShadowTiddlers();
	doc.trigger("loadShadows");
	t2 = new Date();
	store.loadFromDiv("storeArea", "store", true);
	doc.trigger("loadTiddlers");
	loadOptions();
	t3 = new Date();
	invokeParamifier(params, "onload");
	t4 = new Date();
	readOnly = window.isLocal() ? false : config.options.chkHttpReadOnly;
	var pluginProblem = loadPlugins("systemConfig");
	doc.trigger("loadPlugins");
	t5 = new Date();
	formatter = new Formatter(config.formatters);
	invokeParamifier(params, "onconfig");
	story.switchTheme(config.options.txtTheme);
	showBackstage = showBackstage !== undefined ? showBackstage : !readOnly;
	t6 = new Date();
	for(var name in config.macros) {
		if(config.macros[name].init)
			config.macros[name].init();
	}
	t7 = new Date();
	store.notifyAll();
	t8 = new Date();
	restart();
	refreshDisplay();
	t9 = new Date();
	if(pluginProblem) {
		story.displayTiddler(null, "PluginManager");
		displayMessage(config.messages.customConfigError);
	}
	if(showBackstage)
		backstage.init();
	t10 = new Date();
	if(config.options.chkDisplayInstrumentation) {
		displayMessage("LoadShadows " + (t2 - t1) + " ms");
		displayMessage("LoadFromDiv " + (t3 - t2) + " ms");
		displayMessage("LoadPlugins " + (t5 - t4) + " ms");
		displayMessage("Macro init " + (t7 - t6) + " ms");
		displayMessage("Notify " + (t8 - t7) + " ms");
		displayMessage("Restart " + (t9 - t8) + " ms");
		displayMessage("Total: " + (t10 - t0) + " ms");
	}
	startingUp = false;
	doc.trigger("startup");
}

// Called on unload. Functions may get unloaded too, so they are called conditionally.
function unload() {
	if(window.checkUnsavedChanges) checkUnsavedChanges();
	if(window.scrubNodes) scrubNodes(document.body);
}

// Restarting
function restart() {
	invokeParamifier(params, "onstart");
	if(story.isEmpty()) {
		story.displayDefaultTiddlers();
	}
	window.scrollTo(0, 0);
}

function saveTest() {
	var s = document.getElementById("saveTest");
	if(s.hasChildNodes())
		alert(config.messages.savedSnapshotError);
	s.appendChild(document.createTextNode("savetest"));
}

function loadShadowTiddlers() {
	var shadows = new TiddlyWiki();
	shadows.loadFromDiv("shadowArea", "shadows", true);
	shadows.forEachTiddler(function(title, tiddler) { config.shadowTiddlers[title] = tiddler.text });
}

function loadPlugins(tag) {
	if(safeMode) return false;
	var tiddlers = store.getTaggedTiddlers(tag);
	//# ensure the plugins are sorted into case sensitive order
	tiddlers.sort(function(a, b) { return a.title < b.title ? -1 : (a.title == b.title ? 0 : 1) });

	var toLoad = [];
	var nLoaded = 0;
	var map = {};
	var nPlugins = tiddlers.length;
	installedPlugins = [];
	for(var i = 0; i < nPlugins; i++) {
		var p = getPluginInfo(tiddlers[i]);
		installedPlugins[i] = p;
		var n = p.Name || p.title;
		if(n) map[n] = p;
		n = p.Source;
		if(n) map[n] = p;
	}
	var visit = function(p) {
		if(!p || p.done) return;
		p.done = 1;
		var reqs = p.Requires;
		if(reqs) {
			reqs = reqs.readBracketedList();
			for(var i = 0; i < reqs.length; i++)
				visit(map[reqs[i]]);
		}
		toLoad.push(p);
	};
	for(i = 0; i < nPlugins; i++)
		visit(installedPlugins[i]);
	for(i = 0; i < toLoad.length; i++) {
		p = toLoad[i];
		pluginInfo = p;
		tiddler = p.tiddler;
		if(isPluginExecutable(p)) {
			if(isPluginEnabled(p)) {
				p.executed = true;
				var startTime = new Date();
				try {
					if(tiddler.text) window.eval(tiddler.text);
					nLoaded++;
				} catch(ex) {
					p.log.push(config.messages.pluginError.format([exceptionText(ex)]));
					p.error = true;
					if(!console.tiddlywiki) {
						console.log("error evaluating " + tiddler.title, ex);
					}
				}
				pluginInfo.startupTime = String((new Date()) - startTime) + "ms";
			} else {
				nPlugins--;
			}
		} else {
			p.warning = true;
		}
	}
	return nLoaded != nPlugins;
}

function getPluginInfo(tiddler) {
	var p = store.getTiddlerSlices(tiddler.title, ["Name", "Description", "Version",
		"Requires", "CoreVersion", "Date", "Source", "Author", "License", "Browsers"]);
	p.tiddler = tiddler;
	p.title = tiddler.title;
	p.log = [];
	return p;
}

// Check that a particular plugin is valid for execution
function isPluginExecutable(plugin) {
	if(plugin.tiddler.isTagged("systemConfigForce")) {
		plugin.log.push(config.messages.pluginForced);
		return true;
	}
	if(plugin["CoreVersion"]) {
		var coreVersion = plugin["CoreVersion"].split(".");
		var w = parseInt(coreVersion[0], 10) - version.major;
		if(w == 0 && coreVersion[1])
			w = parseInt(coreVersion[1], 10) - version.minor;
		if(w == 0 && coreVersion[2])
			w = parseInt(coreVersion[2], 10) - version.revision;
		if(w > 0) {
			plugin.log.push(config.messages.pluginVersionError);
			return false;
		}
	}
	return true;
}

function isPluginEnabled(plugin) {
	if(plugin.tiddler.isTagged("systemConfigDisable")) {
		plugin.log.push(config.messages.pluginDisabled);
		return false;
	}
	return true;
}

