/***
|Name|ContentTimelineMacro|
|Created by|Andre' de Carvalho|
|Date|12/04/2013|
|Location|http://acarvalho.tiddlyspace.com/#ContentTimelineMacro|
|Version|1.0.1|
|Type|Macro|
|Description|A TiddlyWiki Macro to show timelines (modified, created) for tiddlers tagged 'Content'|

!!Code
***/
{{{
version.extensions.ContentTimeline= {major: 1, minor: 0 , revision: 1, date: new Date(2013,4,12)};
}}}
{{{
config.macros.ContentTimeline={};
config.macros.ContentTimeline.dateFormat=config.macros.timeline.dateFormat;
config.macros.ContentTimeline.handler = function(place,macroName,params)
{
var field = params[0] ? params[0] : "modified";
var tiddlers = store.reverseLookup("tags","excludeLists",false,field);
var lastDay = "";
//var last = params[1] ? tiddlers.length-Math.min(tiddlers.length,parseInt(params[1])) : 0;
var count = params[1];
for(var t=tiddlers.length-1; t>=0; t--)
{
 var tiddler = tiddlers[t];
 if (!tiddler.isTagged("Content")) continue;
 
 count=count-1;
 if (count < 0) 
  {
   break;
  }
 var theDay = tiddler[field].convertToLocalYYYYMMDDHHMM().substr(0,8);
 if(theDay != lastDay)
  {
   var theDateList = document.createElement("ul");
   place.appendChild(theDateList);
   createTiddlyElement(theDateList,"li",null,"listTitle",tiddler[field].formatString(this.dateFormat));
   lastDay = theDay;
  }
 var theDateListItem = createTiddlyElement(theDateList,"li",null,"listLink");
 theDateListItem.appendChild(createTiddlyLink(place,tiddler.title,true));
 }
};
}}}
