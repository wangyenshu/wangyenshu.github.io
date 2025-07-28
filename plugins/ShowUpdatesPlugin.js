/***
|Name|ShowUpdatesPlugin|
|Created by|SaqImtiaz|
|Version|0.2 |
|Requires|~TW2.x|
!!!Description:
Allows you to list tiddlers that have changed since the users last visit. You can list only all changed tiddlers, or filter them to only show tiddlers that have or do not have a specific tag. By default a simple list of the titles of changed tiddlers is created. However, using an extremely versatile syntax you can provide a custom template for the generated text.

!!!Examples: 
[[ShowUpdatesDocs]]

!!!Installation:
Copy the contents of this tiddler to your TW, tag with systemConfig, save and reload your TW.

!!!Syntax:
{{{<<showUpdates>>}}}
additional optional params:
{{{<showUpdates excludeTag:TagToExclude onlyTag:TagToList maxEntries:10 write:CustomWriteParameter >>}}}
excludeTag: ~TagToExclude
onlyTag: ~TagToList
maxEntries: max number of entries displayed when there are no updates. (default is 10, which can be changed in the config.macros.showUpdates.settings part of the code)
write: if a write parameter is not provided, an un-numbered list of the updates is generated. Alternatively, you can specify a custom 'template' for the text generated. The syntax for the write parameter is identical to that of the forEachTiddler macro. Additonal documentation on this syntax will be provided soon.
Some of the variables available in the write parameter are 'index', 'count' and 'lastVisit' where lastVisit is the date of the last visit in the format YYYYMMDDHHMM. Also areUpdates is a boolean that is true if there are new updates since the users last visit.

!!!To Do:
*refactor code to facilitate translations
*a streamlined version without the custom write parameter


!!!Code
***/
//{{{
window.lewcidLastVisit = '';
window.old_lewcid_whatsnew_restart = window.restart;
window.restart = function()
{
        if(config.options.txtLastVisit)
                 lewcidLastVisit= config.options.txtLastVisit;
        config.options.txtLastVisit = (new Date()).convertToYYYYMMDDHHMM();
        saveOptionCookie('txtLastVisit');
        window.old_lewcid_whatsnew_restart();
}

TiddlyWiki.prototype.lewcidGetTiddlers = function(field,excludeTag,includeTag,updatesOnly)
{
              var results = [];
              this.forEachTiddler(function(title,tiddler)
                      {
                      if(excludeTag == undefined || !tiddler.isTagged(excludeTag))
                                    if(includeTag == undefined ||  tiddler.isTagged(includeTag))
                                            if ( updatesOnly == false || tiddler.modified.convertToYYYYMMDDHHMM()>lewcidLastVisit)
                                                  results.push(tiddler);
                      });
              if(field)
                  results.sort(function (a,b) {if(a[field] == b[field]) return(0); else return (a[field] < b[field]) ? -1 : +1; });
              return results;
}

config.macros.showUpdates={};
config.macros.showUpdates.settings =
{
         maxEntries: 10  //max items to show, if there are no updates since last visit
}

config.macros.showUpdates.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
          var args = paramString.parseParams("list",null,true);
          var write = getParam(args, "write", undefined);
          var onlyTag = getParam(args, "onlyTag", undefined);
          var excludeTag = getParam(args, "excludeTag", undefined);
          var sortBy = "modified";
          var maxEntries = getParam(args,"maxEntries",this.settings.maxEntries);

          if (lewcidLastVisit) 
                {var tiddlers = store.lewcidGetTiddlers(sortBy,excludeTag,onlyTag,true);
                 var areUpdates = tiddlers.length>0? true:false;}

          if (!lewcidLastVisit)
               {var countLine = "!!Recent Updates:";
               var tiddlers = store.lewcidGetTiddlers(sortBy,excludeTag,onlyTag,false);
               var areUpdates = false;}
          else if (tiddlers.length == 0)
               {var countLine = "!!@@color:red;No new updates@@ since your last visit. @@color:#999;font-size:70%;" + (Date.convertFromYYYYMMDDHHMM(lewcidLastVisit)).formatString(" (DD/MM/YY)") + "@@\n!!Recent Updates:";
               var tiddlers = store.lewcidGetTiddlers(sortBy,excludeTag,onlyTag,false);}
          else
               {var countLine ="!!@@color:red;"+ tiddlers.length + "@@ new " + (tiddlers.length==1?"update":"updates") + " since your last visit: @@color:#999;font-size:70%;" + (Date.convertFromYYYYMMDDHHMM(lewcidLastVisit)).formatString(" (DD/MM/YY)") + "@@";}

          tiddlers = tiddlers.reverse();
          var lastVisit = lewcidLastVisit? lewcidLastVisit:undefined;
          var count = areUpdates == true? tiddlers.length : maxEntries;
          var sp = createTiddlyElement(place,"span","showUpdates");
          if (write==undefined)
                 {
                  wikify(countLine,sp);
                  var list = createTiddlyElement(sp,"ul");
                  for (var i = 0; i < count; i++)
                          {
                           var tiddler = tiddlers[i];
                           createTiddlyLink(createTiddlyElement(list,"li"), tiddler.title, true);
                          }
                 }
          else
                {
                 var list = '';
                 for (var index = 0; index < count; index++) {
                 var tiddler = tiddlers[index];
                 list += eval(write); }
                 wikify(list, sp);
                }
}
//}}}