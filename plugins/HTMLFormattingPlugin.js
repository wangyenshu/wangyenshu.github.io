/***
|Name|HTMLFormattingPlugin|
|Source|http://www.TiddlyTools.com/#HTMLFormattingPlugin|
|Documentation|http://www.TiddlyTools.com/#HTMLFormattingPluginInfo|
|Version|2.4.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|embed wiki syntax formatting inside of HTML content|
The ~HTMLFormatting plugin allows you to ''mix wiki-style formatting syntax within HTML formatted content'' by extending the action of the standard TiddlyWiki formatting handler.
!!!!!Documentation
>see [[HTMLFormattingPluginInfo]]
!!!!!Configuration
<<<
Use {{{<hide linebreaks>}}} within HTML content to wiki-style rendering of line breaks.  To //always// omit all line breaks from the rendered output, you can set this option:
><<option chkHTMLHideLinebreaks>> ignore all line breaks
which can also be 'hard coded' into your document by adding the following to a tiddler, tagged with <<tag systemConfig>>
>{{{config.options.chkHTMLHideLinebreaks=true;}}}
<<<
!!!!!Revisions
<<<
2010.05.07 2.4.1 added chkHTMLHideLinebreaks option
| see [[HTMLFormattingPluginInfo]] for additional revision details |
2005.06.26 1.0.0 Initial Release (as code adaptation - pre-dates TiddlyWiki plugin architecture!!)
<<<
!!!!!Code
***/
//{{{
version.extensions.HTMLFormattingPlugin= {major: 2, minor: 4, revision: 1, date: new Date(2010,5,7)};

// find the formatter for HTML and replace the handler
initHTMLFormatter();
function initHTMLFormatter()
{
	for (var i=0; i<config.formatters.length && config.formatters[i].name!="html"; i++);
	if (i<config.formatters.length)	config.formatters[i].handler=function(w) {
		if (!this.lookaheadRegExp)  // fixup for TW2.0.x
			this.lookaheadRegExp = new RegExp(this.lookahead,"mg");
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var html=lookaheadMatch[1];
			// if <nowiki> is present, just let browser handle it!
			if (html.indexOf('<nowiki>')!=-1)
				createTiddlyElement(w.output,"span").innerHTML=html;
			else {
				// if <hide linebreaks> is present, or chkHTMLHideLinebreaks is set
				// suppress wiki-style literal handling of newlines
				if (config.options.chkHTMLHideLinebreaks||(html.indexOf('<hide linebreaks>')!=-1))
					html=html.replace(/\n/g,' ');
				// remove all \r's added by IE textarea and mask newlines and macro brackets
				html=html.replace(/\r/g,'').replace(/\n/g,'\\n').replace(/<</g,'%%(').replace(/>>/g,')%%');
				// create span, let browser parse HTML
				var e=createTiddlyElement(w.output,"span"); e.innerHTML=html;
				// then re-render text nodes as wiki-formatted content
				wikifyTextNodes(e,w);
			}
			w.nextMatch = this.lookaheadRegExp.lastIndex; // continue parsing
		}
	}
}

// wikify #text nodes that remain after HTML content is processed (pre-order recursion)
function wikifyTextNodes(theNode,w)
{
	function unmask(s) { return s.replace(/\%%\(/g,'<<').replace(/\)\%%/g,'>>').replace(/\\n/g,'\n'); }
	switch (theNode.nodeName.toLowerCase()) {
		case 'style': case 'option': case 'select':
			theNode.innerHTML=unmask(theNode.innerHTML);
			break;
		case 'textarea':
			theNode.value=unmask(theNode.value);
			break;
		case '#text':
			var txt=unmask(theNode.nodeValue);
			var newNode=createTiddlyElement(null,"span");
			theNode.parentNode.replaceChild(newNode,theNode);
			wikify(txt,newNode,highlightHack,w.tiddler);
			break;
		default:
			for (var i=0;i<theNode.childNodes.length;i++)
				wikifyTextNodes(theNode.childNodes.item(i),w); // recursion
			break;
	}
}
//}}}