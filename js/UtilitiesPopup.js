//--
//-- TiddlyWiki-specific popup utility functions
//--

// Event handler for 'open all' on a tiddler popup
function onClickTagOpenAll(ev) {
	var tiddlers = store.getTaggedTiddlers(this.getAttribute("tag"));
	var sortby = this.getAttribute("sortby");
	if(sortby && sortby.length) {
		store.sortTiddlers(tiddlers, sortby);
	}
	story.displayTiddlers(this, tiddlers);
	return false;
}

// Event handler for clicking on a tiddler tag
function onClickTag(ev) {
	var e = ev || window.event;
	var popup = Popup.create(this);
	jQuery(popup).addClass("taggedTiddlerList");
	var tag = this.getAttribute("tag");
	var title = this.getAttribute("tiddler");
	if(popup && tag) {
		var tagged = tag.indexOf("[") == -1 ? store.getTaggedTiddlers(tag) : store.filterTiddlers(tag);
		var sortby = this.getAttribute("sortby");
		if(sortby && sortby.length) {
			store.sortTiddlers(tagged, sortby);
		}
		var titles = [];
		for(var i = 0; i < tagged.length; i++) {
			if(tagged[i].title != title)
				titles.push(tagged[i].title);
		}
		var lingo = config.views.wikified.tag;
		if(titles.length > 0) {
			var openAll = createTiddlyButton(createTiddlyElement(popup, "li"),
				lingo.openAllText.format([tag]), lingo.openAllTooltip, onClickTagOpenAll);
			openAll.setAttribute("tag", tag);
			openAll.setAttribute("sortby", sortby);
			createTiddlyElement(createTiddlyElement(popup, "li", null, "listBreak"), "div");
			for(i = 0; i < titles.length; i++) {
				createTiddlyLink(createTiddlyElement(popup, "li"), titles[i], true);
			}
		} else {
			createTiddlyElement(popup, "li", null, "disabled", lingo.popupNone.format([tag]));
		}
		createTiddlyElement(createTiddlyElement(popup, "li", null, "listBreak"), "div");
		var link = createTiddlyLink(createTiddlyElement(popup, "li"), tag, false);
		createTiddlyText(link, lingo.openTag.format([tag]));
	}
	Popup.show();
	e.cancelBubble = true;
	if(e.stopPropagation) e.stopPropagation();
	return false;
}

// Create a button for a tag with a popup listing all the tiddlers that it tags
//# title and tooltip arguments are optional
function createTagButton(place, tag, excludeTiddler, title, tooltip) {
	var btn = createTiddlyButton(place, title || tag,
		(tooltip || config.views.wikified.tag.tooltip).format([tag]), onClickTag);
	btn.setAttribute("tag", tag);
	if(excludeTiddler)
		btn.setAttribute("tiddler", excludeTiddler);
	return btn;
}

function onClickTiddlyPopup(ev) {
	var e = ev || window.event;
	var tiddler = this.tiddler;
	if(tiddler.text) {
		var popup = Popup.create(this, "div", "popupTiddler");
		wikify(tiddler.text, popup, null, tiddler);
		Popup.show();
	}
	if(e) e.cancelBubble = true;
	if(e && e.stopPropagation) e.stopPropagation();
	return false;
}

function createTiddlyPopup(place, caption, tooltip, tiddler) {
	if(tiddler.text) {
		createTiddlyLink(place, caption, true);
		var btn = createTiddlyButton(place, glyph("downArrow"), tooltip, onClickTiddlyPopup, "tiddlerPopupButton");
		btn.tiddler = tiddler;
	} else {
		createTiddlyText(place, caption);
	}
}

function onClickError(ev) {
	var e = ev || window.event;
	var popup = Popup.create(this);
	var lines = this.getAttribute("errorText").split("\n");
	for(var i = 0; i < lines.length; i++) {
		createTiddlyElement(popup, "li", null, "popupMessage", lines[i]);
	}
	Popup.show();
	e.cancelBubble = true;
	if(e.stopPropagation) e.stopPropagation();
	return false;
}

function createTiddlyError(place, title, text) {
	var btn = createTiddlyButton(place, title, null, onClickError, "errorButton");
	if(text) btn.setAttribute("errorText", text);
}
