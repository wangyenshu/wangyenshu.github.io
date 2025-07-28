/***
|Name|~QuotePlugin|
|Source|http://web.ist.utl.pt/tiago.dionizio/twiki/twiki.cgi/TWPlugins.html#%5B%5BQuote%20Plugin%5D%5D|
|Documentation||
|Version|1.0.0|
|Date|15/7/2005|
|Author|Tiago Dionízio|
|License||
|~CoreVersion||
|Type|plugin|
|Description|Create a direct link to a tiddler using a normal button and a button that expands the specified tiddler inside the current tiddler.|

!!!Syntax:
{{{<<quote 'Text to display' 'Tiddler name' [open]>>}}}

!!!Description:
Create a direct link to a tiddler using a normal button and a button that expands the specified tiddler inside the current tiddler.
To display the included tiddler initially visible just pass ''open'' in the third parameter (not actually the only possible value but you can interpret it like that).
The expand button can also collapse the included tiddler, this will actually remove the included contents. If the included tiddler is changed you can simply expand it again.

!!!Code
***/
{{{
version.extensions.quote = { major: 1, minor: 0, revision: 0, date: new Date(2005, 07, 15)};

config.macros.quote = {};
config.macros.quote.onClick = function(e) {
    if (!e) var e = window.event;
    var container = this.nextSibling;
    var isOpen = container.style.display == "block";

    var tick;
    this.removeChild(this.firstChild);
    if (isOpen) {
        container.style.display = "none";
        tick = "+";
        removeChildren(container);
    }
    else {
        tick = "-";
        var title = container.getAttribute("tiddlyLink");
        var text = store.getTiddlerText(title);
        removeChildren(container);
        if(text)
            wikify(text,container,null,null);
        container.style.display = "block";
    }
    this.appendChild(document.createTextNode(tick));
}
config.macros.quote.handler = function(place,macroName,params) {
    // param 0: text button
    // param 1: tiddler name to display
    // param 2: initial display by default
    var label = params[0];
    var title = params[1];
    var isOpen = params[2] != null;
    var link = createTiddlyLink(place,title,false);
    link.appendChild(document.createTextNode(label));
    var btn = createTiddlyButton(place, isOpen ? "-" : "+", "expand tiddler " + title, this.onClick);
    var container = createTiddlyElement(place, "blockquote");
    container.setAttribute("tiddlyLink", title);
    container.style.display = isOpen ? "block" : "none";
    if (isOpen) {
        var text = store.getTiddlerText(title);
        if(text)
            wikify(text,container,null,null);
    }
}

}}}
