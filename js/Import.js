//--
//-- ImportTiddlers macro
//--

config.macros.importTiddlers.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	if(readOnly) {
		createTiddlyElement(place, "div", null, "marked", this.readOnlyWarning);
		return;
	}
	var w = new Wizard();
	w.createWizard(place, this.wizardTitle);
	this.restart(w);
};

config.macros.importTiddlers.onCancel = function(e) {
	var wizard = new Wizard(this);
	wizard.clear();
	config.macros.importTiddlers.restart(wizard);
	return false;
};

config.macros.importTiddlers.onClose = function(e) {
	backstage.hidePanel();
	return false;
};

config.macros.importTiddlers.restart = function(wizard) {
	var me = config.macros.importTiddlers;
	wizard.addStep(this.step1Title, this.step1Html);

	var name, s = wizard.getElement("selTypes");
	for(name in config.adaptors) {
		var e = createTiddlyElement(s, "option", null, null, config.adaptors[name].serverLabel || name);
		e.value = name;
	}
	if(config.defaultAdaptor) s.value = config.defaultAdaptor;

	s = wizard.getElement("selFeeds");
	var feeds = this.getFeeds();
	for(name in feeds) {
		e = createTiddlyElement(s, "option", null, null, name);
		e.value = name;
	}
	wizard.setValue("feeds", feeds);
	s.onchange = me.onFeedChange;

	var fileInput = wizard.getElement("txtBrowse");
	fileInput.onchange = me.onBrowseChange;
	fileInput.onkeyup = me.onBrowseChange;
	wizard.setButtons([{ caption: this.openLabel, tooltip: this.openPrompt, onClick: me.onOpen }]);
	wizard.formElem.action = "javascript:;";
	wizard.formElem.onsubmit = function() {
		if(!this.txtPath || this.txtPath.value.length) //# check for manually entered path in first step
			this.lastChild.firstChild.onclick();
	};
};

config.macros.importTiddlers.getFeeds = function() {
	var feeds = {};
	var i, tagged = store.getTaggedTiddlers("systemServer", "title");
	for(i = 0; i < tagged.length; i++) {
		var title = tagged[i].title;
		feeds[title] = {
			title: title,
			url: store.getTiddlerSlice(title, "URL"),
			workspace: store.getTiddlerSlice(title, "Workspace"),
			workspaceList: store.getTiddlerSlice(title, "WorkspaceList"),
			tiddlerFilter: store.getTiddlerSlice(title, "TiddlerFilter"),
			serverType: store.getTiddlerSlice(title, "Type") || "file",
			description: store.getTiddlerSlice(title, "Description")
		};
	}
	return feeds;
};

config.macros.importTiddlers.onFeedChange = function(e) {
	var wizard = new Wizard(this);
	var selTypes = wizard.getElement("selTypes");
	var fileInput = wizard.getElement("txtPath");
	var feeds = wizard.getValue("feeds");
	var f = feeds[this.value];
	if(f) {
		selTypes.value = f.serverType;
		fileInput.value = f.url;
		wizard.setValue("feedName", f.serverType);
		wizard.setValue("feedHost", f.url);
		wizard.setValue("feedWorkspace", f.workspace);
		wizard.setValue("feedWorkspaceList", f.workspaceList);
		wizard.setValue("feedTiddlerFilter", f.tiddlerFilter);
	}
	return false;
};

config.macros.importTiddlers.onBrowseChange = function(e) {
	var wizard = new Wizard(this);
	var file = this.value;
	file = file.replace(/^C:\\fakepath\\/i, ''); // remove fakepath (chrome/opera/safari)
	if(this.files && this.files[0]) {
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalFileRead");
			file = this.files[0].fileName; // REQUIRES PRIVILEGES.. NULL otherwise
		} catch (ex) {
			// non-priv fallback: combine filename with path to current document
			var path = tw.io.getOriginalLocalPath();
			var slashpos = path.lastIndexOf('/');
			if (slashpos == -1) slashpos = path.lastIndexOf('\\');
			if (slashpos != -1) path = path.substr(0, slashpos + 1); // remove filename, leave trailing slash
			file = path + file;
		}
	}
	var fileInput = wizard.getElement("txtPath");
	fileInput.value = config.macros.importTiddlers.getURLFromLocalPath(file);
	var serverType = wizard.getElement("selTypes");
	serverType.value = "file";
	return true;
};

config.macros.importTiddlers.getURLFromLocalPath = function(path) {
	if(!path) return path;
	// use "/" for cross-platform consistency
	path = path.replace(/\\/g, "/");

	var t = path.split(":");
	if(t[1] && (t[0] == "http" || t[0] == "https" || t[0] == "file")) {
		// input is already a URL
		return path;
	}

	var p = t[1] || t[0]; // remove drive letter (if any)
	if(p.substr(0, 1) == "/") {
		// path is absolute, add protocol + domain + extra slash (if drive letter)
		return document.location.protocol + "//" + document.location.hostname + (t[1] ? "/" : "") + path;
	}

	// path is relative, add current document protocol + domain + path
	var c = document.location.href.replace(/\\/g, "/");
	var pos = c.lastIndexOf("/");
	if(pos != -1)
		c = c.substring(0, pos); // remove filename
	return c + "/" + p;
};

config.macros.importTiddlers.onOpen = function(e) {
	var me = config.macros.importTiddlers;
	var wizard = new Wizard(this);
	var fileInput = wizard.getElement("txtPath");
	var url = fileInput.value;
	var serverType = wizard.getElement("selTypes").value || config.defaultAdaptor;
	var adaptor = new config.adaptors[serverType]();
	wizard.setValue("adaptor", adaptor);
	wizard.setValue("serverType", serverType);
	wizard.setValue("host", url);
	adaptor.openHost(url, null, wizard, me.onOpenHost);
	wizard.setButtons([{ caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel }], me.statusOpenHost);
	return false;
};

config.macros.importTiddlers.onOpenHost = function(context, wizard) {
	var me = config.macros.importTiddlers;
	var adaptor = wizard.getValue("adaptor");
	if(context.status !== true)
		displayMessage("Error in importTiddlers.onOpenHost: " + context.statusText);
	adaptor.getWorkspaceList(context, wizard, me.onGetWorkspaceList);
	wizard.setButtons([{ caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel }], me.statusGetWorkspaceList);
};

config.macros.importTiddlers.onGetWorkspaceList = function(context, wizard) {
	var me = config.macros.importTiddlers;
	if(context.status !== true)
		displayMessage("Error in importTiddlers.onGetWorkspaceList: " + context.statusText);
	wizard.setValue("context", context);
	var workspace = wizard.getValue("feedWorkspace");
	if(!workspace && context.workspaces.length == 1)
		workspace = context.workspaces[0].title;
	if(workspace) {
		//# if there is only one workspace, then open it directly
		context.adaptor.openWorkspace(workspace, context, wizard, me.onOpenWorkspace);
		wizard.setValue("workspace", workspace);
		wizard.setButtons([{ caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel }], me.statusOpenWorkspace);
		return;
	}
	wizard.addStep(me.step2Title, me.step2Html);
	var i, s = wizard.getElement("selWorkspace");
	s.onchange = me.onWorkspaceChange;
	for(i = 0; i < context.workspaces.length; i++) {
		var e = createTiddlyElement(s, "option", null, null, context.workspaces[i].title);
		e.value = context.workspaces[i].title;
	}
	var workspaceList = wizard.getValue("feedWorkspaceList");
	if(workspaceList) {
		var list = workspaceList.parseParams("workspace", null, false, true);
		for(i = 1; i < list.length; i++) {
			if(context.workspaces.findByField("title", list[i].value) == null) {
				e = createTiddlyElement(s, "option", null, null, list[i].value);
				e.value = list[i].value;
			}
		}
	}
	if(workspace) {
		wizard.getElement("txtWorkspace").value = workspace;
	}
	wizard.setButtons([{ caption: me.openLabel, tooltip: me.openPrompt, onClick: me.onChooseWorkspace }]);
};

config.macros.importTiddlers.onWorkspaceChange = function(e) {
	var wizard = new Wizard(this);
	wizard.getElement("txtWorkspace").value = this.value;
	this.selectedIndex = 0;
	return false;
};

config.macros.importTiddlers.onChooseWorkspace = function(e) {
	var me = config.macros.importTiddlers;
	var wizard = new Wizard(this);
	var adaptor = wizard.getValue("adaptor");
	var workspace = wizard.getElement("txtWorkspace").value;
	wizard.setValue("workspace", workspace);
	var context = wizard.getValue("context");
	adaptor.openWorkspace(workspace, context, wizard, me.onOpenWorkspace);
	wizard.setButtons([{ caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel }], me.statusOpenWorkspace);
	return false;
};

config.macros.importTiddlers.onOpenWorkspace = function(context, wizard) {
	var me = config.macros.importTiddlers;
	if(context.status !== true)
		displayMessage("Error in importTiddlers.onOpenWorkspace: " + context.statusText);
	var adaptor = wizard.getValue("adaptor");
	var browse = wizard.getElement("txtBrowse");
	if (browse.files) context.file = browse.files[0]; // for HTML5 FileReader
	adaptor.getTiddlerList(context, wizard, me.onGetTiddlerList, wizard.getValue("feedTiddlerFilter"));
	wizard.setButtons([{ caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel }], me.statusGetTiddlerList);
};

config.macros.importTiddlers.onGetTiddlerList = function(context, wizard) {
	var me = config.macros.importTiddlers;
	if(context.status !== true) {
		var error = context.statusText || me.errorGettingTiddlerList;
		if(context.host.indexOf("file://") === 0) {
			error = me.errorGettingTiddlerListFile;
		} else {
			error = context.xhr && context.xhr.status == 404 ? me.errorGettingTiddlerListHttp404 :
				me.errorGettingTiddlerListHttp;
		}
		wizard.setButtons([{ caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel }], "");
		jQuery("span.status", wizard.footerEl).html(error); // so error message can be html
		return;
	}

	// Extract data for the listview
	var listedTiddlers = [];
	if(context.tiddlers) {
		for(var i = 0; i < context.tiddlers.length; i++) {
			var tiddler = context.tiddlers[i];
			listedTiddlers.push({
				title: tiddler.title,
				modified: tiddler.modified,
				modifier: tiddler.modifier,
				text: tiddler.text ? wikifyPlainText(tiddler.text, 100) : "",
				tags: tiddler.tags,
				size: tiddler.text ? tiddler.text.length : 0,
				tiddler: tiddler
			});
		}
	}
	listedTiddlers.sort(function(a, b) { return a.title < b.title ? -1 : (a.title == b.title ? 0 : +1) });

	// Display the listview
	wizard.addStep(me.step3Title, me.step3Html);
	var markList = wizard.getElement("markList");
	var listWrapper = document.createElement("div");
	markList.parentNode.insertBefore(listWrapper, markList);
	var listView = ListView.create(listWrapper, listedTiddlers, me.listViewTemplate);
	wizard.setValue("listView", listView);
	wizard.setValue("context", context);
	var txtSaveTiddler = wizard.getElement("txtSaveTiddler");
	txtSaveTiddler.value = me.generateSystemServerName(wizard);
	wizard.setButtons([
		{ caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel },
		{ caption: me.importLabel, tooltip: me.importPrompt, onClick: me.doImport }
	]);
};

config.macros.importTiddlers.generateSystemServerName = function(wizard) {
	var serverType = wizard.getValue("serverType");
	var host = wizard.getValue("host");
	var workspace = wizard.getValue("workspace");
	var pattern = config.macros.importTiddlers[workspace ? "systemServerNamePattern" : "systemServerNamePatternNoWorkspace"];
	return pattern.format([serverType, host, workspace]);
};

config.macros.importTiddlers.saveServerTiddler = function(wizard) {
	var me = config.macros.importTiddlers;
	var txtSaveTiddler = wizard.getElement("txtSaveTiddler").value;
	if(store.tiddlerExists(txtSaveTiddler)) {
		if(!confirm(me.confirmOverwriteSaveTiddler.format([txtSaveTiddler])))
			return;
		store.suspendNotifications();
		store.removeTiddler(txtSaveTiddler);
		store.resumeNotifications();
	}
	var serverType = wizard.getValue("serverType");
	var host = wizard.getValue("host");
	var workspace = wizard.getValue("workspace");
	var text = me.serverSaveTemplate.format([serverType, host, workspace]);
	store.saveTiddler(txtSaveTiddler, txtSaveTiddler, text, me.serverSaveModifier, new Date(), ["systemServer"]);
};

config.macros.importTiddlers.doImport = function(e) {
	var me = config.macros.importTiddlers;
	var wizard = new Wizard(this);
	if(wizard.getElement("chkSave").checked)
		me.saveServerTiddler(wizard);
	var chkSync = wizard.getElement("chkSync").checked;
	wizard.setValue("sync", chkSync);

	var listView = wizard.getValue("listView");
	var rowNames = ListView.getSelectedRows(listView);
	var adaptor = wizard.getValue("adaptor");
	var overwrite = [];
	for(var i = 0; i < rowNames.length; i++) {
		if(store.tiddlerExists(rowNames[i]))
			overwrite.push(rowNames[i]);
	}
	if(overwrite.length > 0) {
		if(!confirm(me.confirmOverwriteText.format([overwrite.join(", ")])))
			return false;
	}

	wizard.addStep(me.step4Title.format([rowNames.length]), me.step4Html);
	for(i = 0; i < rowNames.length; i++) {
		var linkHolder = document.createElement("div");
		createTiddlyLink(linkHolder, rowNames[i], true);
		var place = wizard.getElement("markReport");
		place.parentNode.insertBefore(linkHolder, place);
	}
	wizard.setValue("remainingImports", rowNames.length);
	wizard.setButtons([
		{ caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel }
	], me.statusDoingImport);
	var wizardContext = wizard.getValue("context");
	var tiddlers = wizardContext ? wizardContext.tiddlers : [];
	for(i = 0; i < rowNames.length; i++) {
		var context = {
			allowSynchronous: true,
			tiddler: tiddlers[tiddlers.findByField("title", rowNames[i])]
		};
		adaptor.getTiddler(rowNames[i], context, wizard, me.onGetTiddler);
	}
	return false;
};

config.macros.importTiddlers.onGetTiddler = function(context, wizard) {
	if(!context.status)
		displayMessage("Error in importTiddlers.onGetTiddler: " + context.statusText);
	var tiddler = context.tiddler;
	store.suspendNotifications();
	store.saveTiddler(tiddler.title, tiddler.title, tiddler.text, tiddler.modifier,
		tiddler.modified, tiddler.tags, tiddler.fields, true, tiddler.created);
	if(!wizard.getValue("sync")) {
		store.setValue(tiddler.title, 'server', null);
	}
	store.resumeNotifications();
	if(!context.isSynchronous) store.notify(tiddler.title, true);

	var remainingImports = wizard.getValue("remainingImports") - 1;
	wizard.setValue("remainingImports", remainingImports);

	if(remainingImports != 0) return;
	if(context.isSynchronous) {
		store.notifyAll();
		refreshDisplay();
	}
	var me = config.macros.importTiddlers;
	wizard.setButtons([
		{ caption: me.doneLabel, tooltip: me.donePrompt, onClick: me.onClose }
	], me.statusDoneImport);
	autoSaveChanges();
};

