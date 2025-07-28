/***
|Name|AutoOpenTiddlersPlugin|
|Created by|SaqImtiaz|
|Location|http://tw.lewcid.org/#AutoOpenTiddlersPlugin|
|Version|0.21|
|Requires|~TW2.x|
!!!Description:
Open a user defined number of recent tiddlers automatically when the TW loads.
You can also specify a tag and only load tiddlers that have that tag.
To change the number of tiddlers automatically opened, or define a tag to use, ed the config.autoOpenTiddlers part of the code below.

!!!To Do
*add an option to exclude tiddlers with a particular tag

!!!Code
***/
//{{{
//edit this section to change the default settings
config.autoOpenTiddlers = 
{
          count: 1,   //number of tiddlers opened.
          tag: 'blog' //change if you want to open tiddlers with a specific tag, eg: 'DefaultTiddlers'
}


config.autoOpenTiddlers.handler = function()
{
          if (this.tag == undefined)
             var newTiddlers = store.getTiddlers("modified");
          else
             var newTiddlers = store.getTaggedTiddlers(this.tag,"modified");
          var newTiddlers = newTiddlers.reverse();
           var max = Math.min(this.count,newTiddlers.length-1);
          for (var i=max; i>=0; i--)
               { story.displayTiddler(null,newTiddlers[i].title);} 
}

window.old_lewcid_autoOpenTiddlers_restart = restart;
restart = function ()
{
        window.old_lewcid_autoOpenTiddlers_restart();
        config.autoOpenTiddlers.handler();
}
//}}}