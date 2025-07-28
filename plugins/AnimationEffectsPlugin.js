/***
|Name|AnimationEffectsPlugin|
|Source|http://www.TiddlyTools.com/#AnimationEffectsPlugin|
|Documentation|http://www.TiddlyTools.com/#AnimationEffectsPluginInfo|
|Version|3.1.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.2|
|Type|plugin|
|Description|display content with timer-based animations to manipulate multiple CSS attributes|
|Status|!BETA - EXPERIMENTAL - UNDER DEVELOPMENT - USE WITH CAUTION|
This plugin defines the {{{<<animate>>}}} macro that can be used to peform simple animations of formatted tiddler content by saving/setting/reseting the values of CSS style attributes at specified times.  The macro can also be used to smoothly animate CSS styles that use ''numeric values'', by automatically computing a series of incremental values, ranging from //start// to //stop//, for a specified //duration//, with optional "pause-and-reverse" //cycles// to create repeating animations or continuous loops.
!!!!!Documentation
>see [[AnimationEffectsPluginInfo]] for macro syntax
>see [[AnimationEffectsSampler]] for a live animation example...
!!!!!Revisions
<<<
2008.01.08 [*.*.*] plugin size reduction: documentation moved to [[AnimationEffectsPluginInfo]]
2008.01.07 [3.1.1] when animation is disabled, set inner container to original DIV/SPAN
2007.12.16 [3.1.0] added support for "add/remove" classname functionality.  Also, in handling for "set", only stored previous attribute value if not already saved and, on "reset", clear saved value.  This blocks animations from inadvertently overwriting the saved value while simulaneously processing animation sequences that act on the same attribute.
2007.12.08 [3.0.0] Combined ZoomTextPlugin and AnimateTiddler inline script into single plugin
2007.08.03 [2.1.0] converted from ZoomText inline script
2007.07.16 [2.0.0] added TW2.2-compatible Morpher handling for smoother animation on slower systems
2007.02.17 [1.0.0] initial release
<<<
!!!!!Code
***/
//{{{
version.extensions.AnimationEffectsPlugin= {major: 3, minor: 1, revision: 1, date: new Date(2008,1,7)};
config.macros.animate = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var id=new Date().getTime()+Math.random().toString(); // globally unique ID (GUID)
		if (params[0] && (params[0].toUpperCase()=="DIV"||params[0].toUpperCase()=="SPAN"))
			var nodetype=params.shift().toUpperCase(); // optional param to force DIV/SPAN
		var src=params.shift(); if (!src) src="="; // content is first parameter (if no params, animate container)
		if (src.substr(0,1)=="=") { // content=DOM element... use "=here" or "=" (without ID) for current container
			var target=place;
			if (src.length>1 && src.substr(1).toUpperCase()!='HERE') target=document.getElementById(src.substr(1));
			if (!target) return; // couldn't locate target element... do nothing.
			var nodetype=nodetype||target.nodeName.toUpperCase();
		} else { // use content from tiddler or "inline" param
			if (src.substr(0,1)=="@") src=store.getTiddlerText(src.substr(1)); // "@TiddlerName"
			var nodetype=nodetype||"span";
			var target=createTiddlyElement(place,nodetype);
			wikify(src,target);
		}
		if (params[0]) switch(params[0].toUpperCase()) {
			case "SAVE":
				var s=params[1]; if (!s) return; // must specify style attribute
				if (s.substr(0,1)=="+") s=s.substr(1); // ignore leading "+" (if any)
				var w=(params[2]!=undefined && config.options.chkAnimate)?parseInt(params[2]):0; // wait time before saving
				if (!target.savedStyle) target.savedStyle={};
				if (target.savedStyle[s]!==undefined) return; // value already saved... do nothing.
				if (!w) { target.savedStyle[s]=target.style[s]; return; } // save style immediately... done.
				target.id=target.id||id; // use existing ID if target has one, otherwise assign GUID
				var fn='var e=document.getElementById("'+target.id+'"); \
					if(e&&e.savedStyle["'+s+'"]==undefined) \
					e.savedStyle["'+s+'"]=e.style["'+s+'"]';
				setTimeout(fn,w); return; // timer is set... done.
			case "SET":
				var s=params[1]; if (!s) return; // must specify style attribute
				if (s.substr(0,1)=="+") s=s.substr(1); // ignore leading "+" (if any)
				var v=params[2]!=undefined?params[2]:""; // value to set
				var w=(params[3]!=undefined && config.options.chkAnimate)?parseInt(params[3]):0; // wait time before setting
				if (!w) { target.style[s]=v; return; } // set style immediately... done.
				target.id=target.id||id; // use existing ID if target has one, otherwise assign GUID
				var fn='var e=document.getElementById("'+target.id+'");if(e)e.style["'+s+'"]="'+v+'"';
				setTimeout(fn,w); return; // timer is set... done.
			case "RESET":
				var s=params[1]; if (!s) return; // must specify style attribute
				if (s.substr(0,1)=="+") s=s.substr(1); // ignore leading "+" (if any)
				var w=(params[2]!=undefined && config.options.chkAnimate)?parseInt(params[2]):0; // wait time before reset
				if (!w && target.savedStyle && (s in target.savedStyle))
					{ target.style[s]=target.savedStyle[s]; target.savedStyle[s]=undefined; return; } // reset style immediately
				target.id=target.id||id; // use existing ID if target has one, otherwise assign GUID
				var fn='var e=document.getElementById("'+target.id+'"); \
					if(e&&e.savedStyle&&("'+s+'" in e.savedStyle)) \
					e.style["'+s+'"]=e.savedStyle["'+s+'"]; e.savedStyle["'+s+'"]=undefined';
				setTimeout(fn,w); return; // timer is set... done.
			case "ADD":
				var add=true; // fall-through for further processing
			case "REMOVE":
				var c=params[1]; if (!c) return; // must specify a classname
				if (c.substr(0,1)=="+") c=c.substr(1); // ignore leading "+" (if any)
				var w=(params[2]!=undefined && config.options.chkAnimate)?parseInt(params[2]):0; // wait time before setting
				if (!w) { (add?addClass:removeClass)(target,c); return; } // add class immediately... done.
				target.id=target.id||id; // use existing ID if target has one, otherwise assign GUID
				var fn='var e=document.getElementById("'+target.id+'");if(e)'+(add?'addClass':'removeClass')+'(e,"'+c+'")';
				setTimeout(fn,w); return; // timer is set... done.
		}

		// remove old containers before RE-animating, unless combining effects (using "+style" param)
		if (params[0] && params[0].substr(0,1)!="+") cleanup(target);
		function cleanup(here) { // recursively finds all animation containers
			if (here.childNodes) for (var n=0; n<here.childNodes.length; n++)
				if (here.childNodes[n].className=="animationContainer") cleanup(here.childNodes[n]);
			if (here.className=="animationContainer") { // move content up a level and remove container
				var e=here.firstChild;
				while (e) { var next=e.nextSibling; here.parentNode.insertBefore(e,here); e=next; }
				removeNode(here);
			}
		}
		// create animation outer "clipping" container and inner "formatting" container
		var outer=createTiddlyElement(null,nodetype,null,"animationContainer");
		outer.style.overflow="hidden";
		var inner=createTiddlyElement(outer,nodetype,id,"animationContainer");
		inner.style.position="relative"; inner.style.lineHeight="100%";
		target.insertBefore(outer,target.firstChild);

		// move content elements into the inner container
		var e=target.firstChild.nextSibling;
		while (e) { var next=e.nextSibling; inner.insertBefore(e,null); e=next; }

		// params and defaults for morph
		inner.OriginalType=target.nodeName.toUpperCase(); // SPAN or DIV
		inner.What=params[0]?params[0]:'left';
		if (inner.What.substr(0,1)=="+") inner.What=inner.What.substr(1); // trim off "+" prefix (if any)
		inner.Format=params[1]!=undefined?params[1]:'%0%';
		inner.Start=params[2]!=undefined?parseInt(params[2]):100;
		inner.Stop=params[3]!=undefined?parseInt(params[3]):0;
		inner.Wait=params[4]!=undefined?parseInt(params[4]):0;
		inner.Duration=params[5]!=undefined?parseInt(params[5]):2000;
		inner.Cycle=params[6]!=undefined?parseInt(params[6]):1
		inner.Pause=params[7]!=undefined?parseInt(params[7]):0;

		if (!config.options.chkAnimate) { // if not animating
			if (inner.Cycle && (inner.Cycle % 2)) inner.Start=inner.Stop; // odd # of cycles: apply ending value
			inner.style.display=inner.OriginalType!="DIV"?"inline":"block"; // restore original display style
			var outer=inner.parentNode; if (outer && outer.parentNode) // remove outer clipping container
				{ outer.parentNode.insertBefore(inner,outer); removeNode(outer); }
		}
		inner.style[inner.What]=inner.Format.format([inner.Start]); // set initial style value
		if (inner.What=="fontSize" && inner.Start<=0)  inner.style.display="none"; // hide text if initial size is 0

		if (config.options.chkAnimate) setTimeout("config.macros.animate.morph('"+inner.id+"')",inner.Wait); // ANIMATE!
	},
//}}}
//{{{
	// animation 'tick' handler (timer callback)
	morph: function(id) {
		var inner=document.getElementById(id); if (!inner) return; 
		var p = [{style: inner.What, start: inner.Start, end: inner.Stop, template: inner.Format}];
		var c = function(inner,p) { // reverse and re-animate until cycle count==0 (use -1 for continuous looping)
			if (inner.Cycle==0 || inner.Cycle==1) {
				 // finished animation... discard outer container but keep inner container to display final style(s)
				inner.style.display=inner.OriginalType!="DIV"?"inline":"block"; // restore original display style
				if (p[0].style=="fontSize" && p[0].end<=0) inner.style.display="none"; // hide text if final size=0
				var outer=inner.parentNode; if (outer && outer.parentNode) // remove outer clipping container
					{ outer.parentNode.insertBefore(inner,outer); removeNode(outer); }
			}
			else { // reverse-and-repeat 
	 			inner.Cycle--; var t=inner.Start; inner.Start=inner.Stop; inner.Stop=t;
				setTimeout("config.macros.animate.morph('"+inner.id+"')",inner.Pause);
			}
		};
		inner.style.display=inner.nodeName.toUpperCase()!="DIV"?"inline":"block"; // show starting content
		anim.startAnimating(new Morpher(inner,inner.Duration,p,c));
	}
};
//}}}
//{{{
// for backward-compatibility with retired [[ZoomTextPlugin]]
config.macros.zoomText = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		// convert old params to new params and invoke new handler
		var Text=params[0]!=undefined?params[0]:"";
		if (Text.substr(0,1)=="@") Text=store.getTiddlerText(Text.substr(1));
		var Wait=params[1]!=undefined?parseInt(params[1]):0;
		var Start=params[2]!=undefined?parseInt(params[2]):1;
		var Stop=params[3]!=undefined?parseInt(params[3]):100;
		var Duration=params[4]!=undefined?parseInt(params[4]):config.animDuration;
		var Cycle=params[5]!=undefined?parseInt(params[5]):0
		var Pause=params[6]!=undefined?parseInt(params[6]):0;
		var newParams=[Text,"fontSize","%0%",Start,Stop,Wait,Duration,Cycle,Pause];
		var newParamString=["[["+Text+"]]","fontSize","%0%",Start,Stop,Wait,Duration,Cycle,Pause].join(" ");
		return config.macros.animate.handler(place,macroName,newParams,wikifier,newParamString,tiddler)
	}
}
//}}}