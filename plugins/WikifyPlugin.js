/***
|Name|WikifyPlugin|
|Source|http://www.TiddlyTools.com/#WikifyPlugin|
|Documentation|http://www.TiddlyTools.com/#WikifyPluginInfo|
|Version|1.2.0|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|insert sections, slices, fields, literals, or computed values into a wiki-format output|
!!!!!Documentation
> see [[WikifyPluginInfo]]
!!!!!Revisions
<<<
2011.03.07 1.2.0 added handling in getFieldReference() for retrieving section values
|please see [[WikifyPluginInfo]] for additional revision details|
2007.06.22 1.0.0 initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.WikifyPlugin= {major: 1, minor: 2, revision: 0, date: new Date(2011,3,7)};

config.macros.wikify={
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var fmt=params.shift();
		var values=[];
		var out="";
		if (!fmt.match(/\%[0-9]/g) && params.length) // format has no markers, just join all params with spaces
			out=fmt+" "+params.join(" ");
		else { // format param has markers, get values and perform substitution
			while (p=params.shift()) values.push(this.getFieldReference(place,p));
			out=fmt.format(values);
		}
		if (macroName=="wikiCalc") out=eval(out).toString();
		wikify(out.unescapeLineBreaks(),place,null,tiddler);
	},
	getFieldReference: function(place,p) {
		if (typeof p != "string") return p; // literal non-string value... just return it...

		var val=undefined;
		var here=story.findContainingTiddler(place);
		var current=here?here.getAttribute('tiddler'):'';

		// SLICES: "::slicename" OR "here::slicename" OR "tiddlername::slicename"
		var parts=p.split(config.textPrimitives.sliceSeparator);
		var tid=parts[0]; var slice=parts[1];
		if (slice) { // slice reference
			if (!tid || !tid.length || tid=="here") tid=current;
			var val=store.getTiddlerSlice(tid,slice);
		}

		// SECTIONS: "##sectionname" OR "here##sectionname" OR "tiddlername##sectionname"
		if (!slice) {
			var parts=p.split(config.textPrimitives.sectionSeparator);
			var tid=parts[0]; var section=parts[1];
			if (section) {
				if (!tid || !tid.length || tid=="here") tid=current;
				var val=store.getTiddlerText(tid+config.textPrimitives.sectionSeparator+section);
			}
		}

		// FIELDS: "fieldname" OR "fieldname@tiddlername"
		if (!slice && !section) {
			var parts=p.split("@");
		 	var field=parts[0]; var tid=parts[1];
			if (!tid || !tid.length || tid=="here") tid=current;
			var val=store.getValue(tid,field);
		}

		// not a slice, section or field, or value not found... return value unchanged
		return val===undefined?p:val;
	}
}
//}}}
//{{{
// define alternative macroName for triggering pre-rendering call to eval()
config.macros.wikiCalc=config.macros.wikify;
//}}}