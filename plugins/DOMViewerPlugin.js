/***
|Name|DOMViewerPlugin|
|Source|http://www.TiddlyTools.com/#DOMViewerPlugin|
|Version|1.8.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|display internal Document Object Model for wiki-formatted content|
Whenever TiddlyWiki renders a given tiddler, it creates a 'tree' of DOM (Document Object Model) elements that represent the information that is displayed by the browser.  You can use the ''DOMViewer'' macro to examine the internal DOM elements that are produced by TiddlyWiki's formatter (the 'wikifier'), or elements directly produced by embedded macros that create custom formatted output.  This can be particularly helpful when trying to fine tune the layout and appearance of your tiddler content.
!!!!! Usage/Example:
<<<
syntax: {{{<<DOMViewer rows:nn indent:xxxx inline path elementID|tiddlertitle>>}}}

DOMViewer creates a textarea control and reports the DOM tree for the current 'insertion point' where the DOMViewer macro is being placed.  ''inline'' flag uses TiddlyWiki rendering instead of textarea control. ''path'' shows the relative location of each child element in the DOM tree, using subscript notation, ''[elementID or tiddlertitle]'' displays DOM elements starting from the node with the specified ID.  If that ID is not found in the DOM tree, the macro attempts to open a tiddler with that title and then displays the DOM elements that were rendered for that tiddler.

<<DOMViewer tiddlerDOMViewerPlugin>>
<<<
!!!!!Revisions
<<<
2010.11.30 1.8.1 use story.getTiddler()
2007.09.27 1.8.0 split DOMViewer macro into separate plugin (see [[TidIDEPlugin]])
|please see [[TidIDEPluginInfo]] for additional revision details|
2006.04.15 0.5.0 Initial ALPHA release. Converted from inline script.
<<<
!!!!!Code
***/
//{{{
version.extensions.DOMViewerPlugin= {major: 1, minor: 8, revision: 1, date: new Date(2010,11,30)};
config.macros.DOMViewer = { 
	handler: function(place,macroName,params) {
		// set default params
		var inline=false;
		var theRows=15;
		var theIndent="|  ";
		var showPath=false;
		var theTarget=place;
		// unpack options parameters
		if (params[0]=='inline') { inline=true; theIndent=">"; params.shift(); } 
		if (params[0]&&(params[0].substr(0,7)=="indent:")) { theIndent=params[0].substr(7); params.shift(); } 
		if (params[0]&&(params[0].substr(0,5)=="rows:")) { theRows=params[0].substr(5); params.shift(); } 
		if (params[0]=='path') { showPath=true; params.shift(); } 
		if (params[0]) { var title=params[0]
			theTarget=document.getElementById(title);
			if (!theTarget)
				if (store.getTiddler(title)!=undefined) {
					theTarget=story.getTiddler(title);
					if (!theTarget && confirm("DOMViewer asks:\n\nIs it OK to open tiddler '"+title+"' now?")) { 
						story.displayTiddler(null,title,1,null,null,false);
						theTarget=story.getTiddler(title);
					}
				}
			params.shift();
		}
		// generate and display DOM tree
		if (inline) {
			var out=this.getNodeTree(theTarget,theIndent,showPath,inline);
			wikify(out,place);
		}
		else {
			var out=this.getNodeTree(theTarget,theIndent,showPath,inline);
			var css=".DOMViewer{width:100%;font-size:8pt;color:inherit;background:transparent;border:0px;}";
			setStylesheet(css,"DOMViewerStylesheet");
			var theTextArea=createTiddlyElement(place,"textarea",null,"DOMViewer",out);
			theTextArea.rows=theRows;
			theTextArea.cols=60;
			theTextArea.wrap="off";
			theTextArea.theTarget=theTarget;
			theTextArea.theIndent=theIndent;
			theTextArea.showPath=showPath;
		}
	},
	getNodeTree: function(theNode,theIndent,showPath,inline,thePrefix,thePath) {
		if (!theNode) return "";
		if (!thePrefix) thePrefix="";
		if (!thePath) thePath="";
		var mquote='"'+(inline?"{{{":"");
		var endmquote=(inline?"}}}":"")+'"';
		// generate output for this node
		var out = thePrefix;
		if (showPath && thePath.length)
			out += (inline?"//":"")+thePath.substr(1)+":"+(inline?"//":"")+"\r\n"+thePrefix;
		if (theNode.className=="DOMViewer")
			return out+'[DOMViewer]\r\n'; // avoid self-referential recursion
		out += (inline?"''":"")+theNode.nodeName.toUpperCase()+(inline?"''":"");
		if (theNode.nodeName=="#text")
			out += ' '+mquote+theNode.nodeValue.replace(/\n/g,'\\n')+endmquote;
		if (theNode.className)
			out += ' class='+mquote+theNode.className+endmquote;
		if (theNode.type)
			out += ' type='+mquote+theNode.type+endmquote;
		if (theNode.id)
			out += ' id='+mquote+theNode.id+endmquote;
		if (theNode.name)
			out += " "+theNode.name+(theNode.value?"="+mquote+theNode.value+endmquote:"");
		if (theNode.href)
			out += ' href='+mquote+theNode.href+endmquote;
		if (theNode.src)
			out += ' src='+mquote+theNode.src+endmquote;
		if (theNode.attributes && theNode.getAttribute("tiddlyLink")!=undefined)
			out += ' tiddler='+mquote+theNode.getAttribute("tiddlyLink")+endmquote;
		out += "\r\n";
		// recursively generate output for child nodes
		thePath=thePath+"."+theNode.nodeName.toLowerCase();
		thePrefix=theIndent+thePrefix;
		for (var i=0;i<theNode.childNodes.length;i++) {
			var thisChild=theNode.childNodes.item(i);
			var theNum=(inline?"~~":"(")+(i+1)+(inline?"~~":")");
			out += this.getNodeTree(thisChild,theIndent,showPath,inline,thePrefix,thePath+theNum);
		}
		return out;
	}
}
//}}}