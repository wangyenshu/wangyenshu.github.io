/***
| Name:|SiteMapMacro|
| Author:|Simon Baird|
| Location:|http://simonbaird.com/mptw/#SiteMapMacro|
| Version:|1.0.3, 15-Mar-06|

!!Examples
See SiteMap and SliderSiteMap for example usage.

!!Parameters
* Name of tiddler to start at
* Max depth (a number) 
* Format (eg, nested, see formats below)
* Don't show root flag (anything other than null turns it on)
* Tags - a string containing a bracketed list of tags that we are interested in

!!History
* 1.0.3 (15-Mar-06)
** added tag filtering
* 1.0.2 (15-Mar-06)
** Added json format and dontshowroot option
* 1.0.1 (9-Mar-06)
** Added selectable formats and fixed nested slider format
* 1.0.0 (8-Mar-06)
** first release

***/
//{{{

version.extensions.SiteMapMacro = {
	major: 1,
	minor: 0,
	revision: 3,
	date: new Date(2006,3,15),
	source: "http://simonbaird.com/mptw/#SiteMapMacro"
};

config.macros.siteMap = {

	formats: {
		bullets: {
			formatString: "%0[[%1]]\n%2",
			indentString: "*"
		},

		// put this in your StyleSheet to make it look good.
		// .sliderPanel { margin-left: 2em; }

		sliders: {
			formatString: "[[%1]]+++\n%2===\n\n",
			formatStringLeaf: "[[%1]]\n"
		},

		openSliders: {
			formatString: "[[%1]]++++\n%2===\n\n",
			formatStringLeaf: "[[%1]]\n"
		},

		popups: {
			formatString: "[[%1]]+++^\n%2===\n\n",
			formatStringLeaf: "[[%1]]\n"
		},

		// these don't work too well
		openPopups: {
			formatString: "[[%1]]++++^\n%2===\n\n",
			formatStringLeaf: "[[%1]]\n"
		},
		
		// this is a little nuts but it works
		json: {
			formatString: '\n%0{"%1":[%2\n%0]}',
			formatStringLeaf: '\n%0"%1"',
			indentString: "  ",
			separatorString: ","
		}


	},

	defaultFormat: "bullets",

	treeTraverse: function(title,depth,maxdepth,format,dontshowroot,tags,excludetags) {

		var tiddler = store.getTiddler(title);
		var tagging = store.getTaggedTiddlers(title);

		if (dontshowroot)
			depth = 0;

		var indent = "";
		if (this.formats[format].indentString)
			for (var j=0;j<depth;j++)
				indent += this.formats[format].indentString;

		var childOutput = "";
		if (!maxdepth || depth < parseInt(maxdepth)) 
			for (var i=0;i<tagging.length;i++)
				if (tagging[i].title != title) {
					if (this.formats[format].separatorString && i != 0)
						childOutput += this.formats[format].separatorString;
					childOutput += this.treeTraverse(tagging[i].title,depth+1,maxdepth,format,null,tags,excludetags);
				}

		if (childOutput == "" && (
				(tags && tags != "" && !tiddler.tags.containsAll(tags.readBracketedList())) ||
				(excludetags && excludetags != "" && tiddler.tags.containsAny(excludetags.readBracketedList()))
				)
			) {
			// so prune it cos it doesn't have the right tags and neither do any of it's children
			return "";
		}

		if (dontshowroot)
			return childOutput;

		if (this.formats[format].formatStringLeaf && childOutput == "") {
			// required for nestedSliders
			return this.formats[format].formatStringLeaf.format([indent,title,childOutput]);
		}

		return this.formats[format].formatString.format([indent,title,childOutput]);
	},

	handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		wikify(this.treeTraverse(
			params[0] && params[0] != '.' ? params[0] : tiddler.title, 1, 
			params[1] && params[1] != '.' ? params[1] : null, // maxdepth
			params[2] && params[2] != '.' ? params[2] : this.defaultFormat, // format
			params[3] && params[3] != '.' ? params[3] : null, // dontshowroot
			params[4] && params[4] != '.' ? params[4] : null, // tags
			params[5] && params[5] != '.' ? params[5] : null // excludetags
			),place);
	}

}

//}}}
