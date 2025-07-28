/***
|Name|TaskTimerPluginConfig|
|Source|http://www.TiddlyTools.com/#TaskTimerPluginConfig|
|Documentation|http://www.TiddlyTools.com/#TaskTimerPluginInfo|
|Version|1.3.0|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|formats other optional settings for TaskTimerPlugin|
***/
//{{{
// default target tiddler title (when 'ask' option is used)
config.macros.taskTimer.defTarget="ActivityReport";

// table heading (when creating **new** target tiddlers only)
config.macros.taskTimer.defHeader="|//Date//|//Description//|//Started//|//Stopped//|//Elapsed//|\n";

// note: double-backslash-en, also datestamp is %4 (for backward compatibility)
config.macros.taskTimer.format="|%4|%0|%1|%2|%3|\\n";

// date stamp format (used with %4, above)
config.macros.taskTimer.datestampFormat="YYYY-0MM-0DD";

// default description text - note: do not use empty string (e.g., "")
config.macros.taskTimer.defText=" ";

// format for target tiddler title (when "today" option is used)
// otherwise, value is superceded by CalendarPlugin, DatePlugin, DatePluginConfig,
// or format from <<newJournal>> macro embedded in SideBarOptions
config.macros.taskTimer.todayFormat="0MM/0DD/YYYY";

// marker for locating 'insertion point' in target tiddler
config.macros.taskTimer.marker="/%"+"tasktimer"+"%/"; //

// default tag (when creating **new** target tiddlers only)
config.macros.taskTimer.tag="task";
//}}}