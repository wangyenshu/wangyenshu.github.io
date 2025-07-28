//--
//-- Wikifier
//--

//# "parser" = "custom or default formatter" (should be just 1 term actually)
function getParser(tiddler, format) {
	if(tiddler) {
		if(!format) format = tiddler.fields["wikiformat"];
		var i;
		//# format field takes precedence over format tag
		if(format) {
			for(i in config.parsers)
				if(format == config.parsers[i].format)
					return config.parsers[i];
		} else {
			for(i in config.parsers)
				if(tiddler.isTagged(config.parsers[i].formatTag))
					return config.parsers[i];
		}
	}
	return formatter;
}

//# Construct a wikifier object
//# source - source string that's going to be wikified
//# formatter - Formatter() object containing the list of formatters to be used
//# highlightRegExp - regular expression of the text string to highlight
//# tiddler - reference to the tiddler that's taken to be the container for this wikification
function Wikifier(source, formatter, highlightRegExp, tiddler) {
	this.source = source;
	this.output = null;
	this.formatter = formatter;
	this.nextMatch = 0;
	this.autoLinkWikiWords = tiddler && tiddler.autoLinkWikiWords() == false ? false : true;
	this.highlightRegExp = highlightRegExp;
	this.highlightMatch = null;
	this.isStatic = false;
	if(highlightRegExp) {
		highlightRegExp.lastIndex = 0;
		this.highlightMatch = highlightRegExp.exec(source);
	}
	this.tiddler = tiddler;
}

Wikifier.prototype.wikifyPlain = function() {
	var e = createTiddlyElement(document.body, "div");
	e.style.display = "none";
	this.subWikify(e);
	var text = jQuery(e).text();
	jQuery(e).remove();
	return text;
};

Wikifier.prototype.subWikify = function(output, terminator) {
	//# Handle the terminated and unterminated cases separately, this speeds up wikifikation by about 30%
	try {
		if(terminator)
			this.subWikifyTerm(output, new RegExp("(" + terminator + ")", "mg"));
		else
			this.subWikifyUnterm(output);
	} catch(ex) {
		showException(ex);
	}
};

Wikifier.prototype.subWikifyUnterm = function(output) {
	//# subWikify can be indirectly recursive, so we need to save the old output pointer
	var oldOutput = this.output;
	this.output = output;
	//# Start matching from nextMatch position
	this.formatter.formatterRegExp.lastIndex = this.nextMatch;
	var formatterMatch;
	while(formatterMatch = this.formatter.formatterRegExp.exec(this.source)) {
		// Output any text before the match
		if(formatterMatch.index > this.nextMatch)
			this.outputText(this.output, this.nextMatch, formatterMatch.index);
		// Set the match parameters for the handler
		this.matchStart = formatterMatch.index;
		this.matchLength = formatterMatch[0].length;
		this.matchText = formatterMatch[0];
		this.nextMatch = this.formatter.formatterRegExp.lastIndex;
		//# Figure out which formatter matched and call its handler
		for(var i = 1; i < formatterMatch.length; i++) {
			if(formatterMatch[i]) {
				this.formatter.formatters[i - 1].handler(this);
				this.formatter.formatterRegExp.lastIndex = this.nextMatch;
				break;
			}
		}
	}
	//# Output any text after the last match
	if(this.nextMatch < this.source.length) {
		this.outputText(this.output, this.nextMatch, this.source.length);
		this.nextMatch = this.source.length;
	}
	//# Restore the output pointer
	this.output = oldOutput;
};

Wikifier.prototype.subWikifyTerm = function(output, terminatorRegExp) {
	//# subWikify can be indirectly recursive, so we need to save the old output pointer
	var oldOutput = this.output;
	this.output = output;
	//# Get the first matches for the formatter and terminator RegExps
	terminatorRegExp.lastIndex = this.nextMatch;
	var terminatorMatch = terminatorRegExp.exec(this.source);
	this.formatter.formatterRegExp.lastIndex = this.nextMatch;
	var formatterMatch = this.formatter.formatterRegExp.exec(terminatorMatch ?
		this.source.substr(0, terminatorMatch.index) : this.source);
	while(terminatorMatch || formatterMatch) {
		//# Check for a terminator match before the next formatter match
		if(terminatorMatch && (!formatterMatch || terminatorMatch.index <= formatterMatch.index)) {
			//# Output any text before the match
			if(terminatorMatch.index > this.nextMatch)
				this.outputText(this.output, this.nextMatch, terminatorMatch.index);
			//# Set the match parameters
			this.matchText = terminatorMatch[1];
			this.matchLength = terminatorMatch[1].length;
			this.matchStart = terminatorMatch.index;
			this.nextMatch = this.matchStart + this.matchLength;
			//# Restore the output pointer
			this.output = oldOutput;
			return;
		}
		//# It must be a formatter match; output any text before the match
		if(formatterMatch.index > this.nextMatch)
			this.outputText(this.output, this.nextMatch, formatterMatch.index);
		//# Set the match parameters
		this.matchStart = formatterMatch.index;
		this.matchLength = formatterMatch[0].length;
		this.matchText = formatterMatch[0];
		this.nextMatch = this.formatter.formatterRegExp.lastIndex;
		//# Figure out which formatter matched and call its handler
		for(var i = 1; i < formatterMatch.length; i++) {
			if(formatterMatch[i]) {
				this.formatter.formatters[i - 1].handler(this);
				this.formatter.formatterRegExp.lastIndex = this.nextMatch;
				break;
			}
		}
		//# Get the next match
		terminatorRegExp.lastIndex = this.nextMatch;
		terminatorMatch = terminatorRegExp.exec(this.source);
		formatterMatch = this.formatter.formatterRegExp.exec(terminatorMatch ?
			this.source.substr(0, terminatorMatch.index) : this.source);
	}
	//# Output any text after the last match
	if(this.nextMatch < this.source.length) {
		this.outputText(this.output, this.nextMatch, this.source.length);
		this.nextMatch = this.source.length;
	}
	//# Restore the output pointer
	this.output = oldOutput;
};

Wikifier.prototype.outputText = function(place, startPos, endPos) {
	//# Check for highlights
	while(this.highlightMatch && (this.highlightRegExp.lastIndex > startPos) &&
		  (this.highlightMatch.index < endPos) && (startPos < endPos)) {
		//# Deal with any plain text before the highlight
		if(this.highlightMatch.index > startPos) {
			createTiddlyText(place, this.source.substring(startPos, this.highlightMatch.index));
			startPos = this.highlightMatch.index;
		}
		//# Deal with the highlight
		var highlightEnd = Math.min(this.highlightRegExp.lastIndex, endPos);
		createTiddlyElement(place, "span", null, "highlight", this.source.substring(startPos, highlightEnd));
		startPos = highlightEnd;
		//# Nudge along to the next highlight if we're done with this one
		if(startPos >= this.highlightRegExp.lastIndex)
			this.highlightMatch = this.highlightRegExp.exec(this.source);
	}
	//# Do the unhighlighted text left over
	if(startPos < endPos) {
		createTiddlyText(place, this.source.substring(startPos, endPos));
	}
};

function wikify(source, output, highlightRegExp, tiddler) {
	if(!source) return;
	var wikifier = new Wikifier(source, getParser(tiddler), highlightRegExp, tiddler);
	var t0 = new Date();
	wikifier.subWikify(output);
	if(tiddler && config.options.chkDisplayInstrumentation)
		displayMessage("wikify:" + tiddler.title + " in " + (new Date() - t0) + " ms");
}

//# get static html for RSS and alike
function wikifyStatic(source, highlightRegExp, tiddler, format) {
	if(!source) return "";
	if(!tiddler) tiddler = new Tiddler("temp");
	var wikifier = new Wikifier(source, getParser(tiddler, format), highlightRegExp, tiddler);
	wikifier.isStatic = true;

	var e = createTiddlyElement(document.body, "pre");
	e.style.display = "none";
	wikifier.subWikify(e);
	var html = e.innerHTML;
	jQuery(e).remove();
	return html;
}

//# Wikify a string to plain text
//#   text - text to wikify
//#   limit - maximum number of characters to generate
//#   tiddler - optional reference to the tiddler containing this text
function wikifyPlainText(text, limit, tiddler) {
	if(limit > 0)
		text = text.substr(0, limit);
	var wikifier = new Wikifier(text, formatter, null, tiddler);
	return wikifier.wikifyPlain();
}

//# Highlight plain text into an element
function highlightify(source, output, highlightRegExp, tiddler) {
	if(!source) return;
	var wikifier = new Wikifier(source, formatter, highlightRegExp, tiddler);
	wikifier.outputText(output, 0, source.length);
}

