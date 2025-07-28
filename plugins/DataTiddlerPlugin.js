/***
|''Name:''|DataTiddlerPlugin|
|''Version:''|1.0.7 (2012-04-19)|
|''Summary:''|Enhance your tiddlers with structured data (such as strings, booleans, numbers, or even arrays and compound objects) that can be easily accessed and modified through named fields (in JavaScript code).|
|''Source:''|http://tiddlywiki.abego-software.de/#DataTiddlerPlugin|
|''Twitter:''|[[@abego|https://twitter.com/#!/abego]]|
|''Author:''|UdoBorkowski (ub [at] abego-software [dot] de)|
|''License:''|[[BSD open source license|http://www.abego-software.de/legal/apl-v10.html]]|
!Description
Enhance your tiddlers with structured data (such as strings, booleans, numbers, or even arrays and compound objects) that can be easily accessed and modified through named fields (in JavaScript code).

Such tiddler data can be used in various applications. E.g. you may create tables that collect data from various tiddlers.

''//Example: "Table with all December Expenses"//''
{{{
<<forEachTiddler
    where
        'tiddler.tags.contains("expense") && tiddler.data("month") == "Dec"'
    write
        '"|[["+tiddler.title+"]]|"+tiddler.data("descr")+"| "+tiddler.data("amount")+"|\n"'
>>
}}}
//(This assumes that expenses are stored in tiddlers tagged with "expense".)//
<<forEachTiddler
    where
        'tiddler.tags.contains("expense") && tiddler.data("month") == "Dec"'
    write
        '"|[["+tiddler.title+"]]|"+tiddler.data("descr")+"| "+tiddler.data("amount")+"|\n"'
>>
For other examples see DataTiddlerExamples.




''Access and Modify Tiddler Data''

You can "attach" data to every tiddler by assigning a JavaScript value (such as a string, boolean, number, or even arrays and compound objects) to named fields.

These values can be accessed and modified through the following Tiddler methods:
|!Method|!Example|!Description|
|{{{data(field)}}}|{{{t.data("age")}}}|Returns the value of the given data field of the tiddler. When no such field is defined or its value is undefined {{{undefined}}} is returned.|
|{{{data(field,defaultValue)}}}|{{{t.data("isVIP",false)}}}|Returns the value of the given data field of the tiddler. When no such field is defined or its value is undefined the defaultValue is returned.|
|{{{data()}}}|{{{t.data()}}}|Returns the data object of the tiddler, with a property for every field. The properties of the returned data object may only be read and not be modified. To modify the data use DataTiddler.setData(...) or the corresponding Tiddler method.|
|{{{setData(field,value)}}}|{{{t.setData("age",42)}}}|Sets the value of the given data field of the tiddler to the value. When the value is {{{undefined}}} the field is removed.|
|{{{setData(field,value,defaultValue)}}}|{{{t.setData("isVIP",flag,false)}}}|Sets the value of the given data field of the tiddler to the value. When the value is equal to the defaultValue no value is set (and the field is removed).|

Alternatively you may use the following functions to access and modify the data. In this case the tiddler argument is either a tiddler or the name of a tiddler.
|!Method|!Description|
|{{{DataTiddler.getData(tiddler,field)}}}|Returns the value of the given data field of the tiddler. When no such field is defined or its value is undefined {{{undefined}}} is returned.|
|{{{DataTiddler.getData(tiddler,field,defaultValue)}}}|Returns the value of the given data field of the tiddler. When no such field is defined or its value is undefined the defaultValue is returned.|
|{{{DataTiddler.getDataObject(tiddler)}}}|Returns the data object of the tiddler, with a property for every field. The properties of the returned data object may only be read and not be modified. To modify the data use DataTiddler.setData(...) or the corresponding Tiddler method.|
|{{{DataTiddler.setData(tiddler,field,value)}}}|Sets the value of the given data field of the tiddler to the value. When the value is {{{undefined}}} the field is removed.|
|{{{DataTiddler.setData(tiddler,field,value,defaultValue)}}}|Sets the value of the given data field of the tiddler to the value. When the value is equal to the defaultValue no value is set (and the field is removed).|
//(For details on the various functions see the detailed comments in the source code.)//


''Data Representation in a Tiddler''

The data of a tiddler is stored as plain text in the tiddler's content/text, inside a "data" section that is framed by a {{{<data>...</data>}}} block. Inside the data section the information is stored in the [[JSON format|http://www.crockford.com/JSON/index.html]].

//''Data Section Example:''//
{{{
<data>{"isVIP":true,"user":"John Brown","age":34}</data>
}}}

The data section is not displayed when viewing the tiddler (see also "The showData Macro").

Beside the data section a tiddler may have all kind of other content.

Typically you will not access the data section text directly but use the methods given above. Nevertheless you may retrieve the text of the data section's content through the {{{DataTiddler.getDataText(tiddler)}}} function.


''Saving Changes''

The "setData" methods respect the "ForceMinorUpdate" and "AutoSave" configuration values. I.e. when "ForceMinorUpdate" is true changing a value using setData will not affect the "modifier" and "modified" attributes. With "AutoSave" set to true every setData will directly save the changes after a setData.


''Notifications''

No notifications are sent when a tiddler's data value is changed through the "setData" methods.

''Escape Data Section''
In case that you want to use the text {{{<data>}}} or {{{</data>}}} in a tiddler text you must prefix the text with a tilde ('~'). Otherwise it may be wrongly considered as the data section. The tiddler text {{{~<data>}}} is displayed as {{{<data>}}}.


''The showData Macro''

By default the data of a tiddler (that is stored in the {{{<data>...</data>}}} section of the tiddler) is not displayed. If you want to display this data you may used the {{{<<showData ...>>}}} macro:

''Syntax:''
|>|{{{<<}}}''showData '' [''JSON''] [//tiddlerName//] {{{>>}}}|
|''JSON''|By default the data is rendered as a table with a "Name" and "Value" column. When defining ''JSON'' the data is rendered in JSON format|
|//tiddlerName//|Defines the tiddler holding the data to be displayed. When no tiddler is given the tiddler containing the showData macro is used. When the tiddler name contains spaces you must quote the name (or use the {{{[[...]]}}} syntax.)|
|>|~~Syntax formatting: Keywords in ''bold'', optional parts in [...]. 'or' means that exactly one of the two alternatives must exist.~~|
!Source Code
***/
/***
This plugin's source code is compressed (and hidden).
Use this [[link|http://tiddlywiki.abego-software.de/archive/DataTiddlerPlugin/1.0.7/DataTiddlerPlugin-1.0.7-src.js]] to get the readable source code.
***/
///%
if(!version.extensions.DataTiddlerPlugin){version.extensions.DataTiddlerPlugin={major:1,minor:0,revision:7,date:new Date(2012,3,19),type:"plugin",source:"http://tiddlywiki.abego-software.de/#DataTiddlerPlugin"};if(!window.story){window.story=window}if(!TiddlyWiki.prototype.getTiddler){TiddlyWiki.prototype.getTiddler=function(b){var a=this.tiddlers[b];return(a!==undefined&&a instanceof Tiddler)?a:null}}function DataTiddler(){}DataTiddler={stringify:null,parse:null};window.DataTiddler=DataTiddler;DataTiddler.getData=function(c,d,a){var b=(typeof c=="string")?store.getTiddler(c):c;if(!(b instanceof Tiddler)){throw"Tiddler expected. Got "+c}return DataTiddler.getTiddlerDataValue(b,d,a)};DataTiddler.setData=function(c,e,d,a){var b=(typeof c=="string")?store.getTiddler(c):c;if(!(b instanceof Tiddler)){throw"Tiddler expected. Got "+c+"("+b+")"}DataTiddler.setTiddlerDataValue(b,e,d,a)};DataTiddler.getDataObject=function(b){var a=(typeof b=="string")?store.getTiddler(b):b;if(!(a instanceof Tiddler)){throw"Tiddler expected. Got "+b}return DataTiddler.getTiddlerDataObject(a)};DataTiddler.getDataText=function(b){var a=(typeof b=="string")?store.getTiddler(b):b;if(!(a instanceof Tiddler)){throw"Tiddler expected. Got "+b}return DataTiddler.readDataSectionText(a)};DataTiddler.extendJSONError=function(a){if(a.name=="JSONError"){a.toString=function(){return a.name+": "+a.message+" ("+a.text+")"}}return a};DataTiddler.getTiddlerDataObject=function(a){if(a.dataObject===undefined){var b=DataTiddler.readData(a);a.dataObject=(b)?b:{}}return a.dataObject};DataTiddler.getTiddlerDataValue=function(b,d,a){var c=DataTiddler.getTiddlerDataObject(b)[d];return(c===undefined)?a:c};DataTiddler.setTiddlerDataValue=function(c,f,e,a){var d=DataTiddler.getTiddlerDataObject(c);var b=d[f];if(e==a){if(b!==undefined){delete d[f];DataTiddler.save(c)}return}d[f]=e;DataTiddler.save(c)};DataTiddler.readDataSectionText=function(a){var b=DataTiddler.getDataTiddlerMatches(a);if(b===null||!b[2]){return null}return b[2]};DataTiddler.readData=function(b){var c=DataTiddler.readDataSectionText(b);try{return c?DataTiddler.parse(c):null}catch(a){throw DataTiddler.extendJSONError(a)}};DataTiddler.getDataTextOfTiddler=function(a){var b=DataTiddler.getTiddlerDataObject(a);return DataTiddler.stringify(b)};DataTiddler.indexOfNonEscapedText=function(c,a,d){var b=c.indexOf(a,d);while((b>0)&&(c[b-1]=="~")){b=c.indexOf(a,b+1)}return b};DataTiddler.getDataSectionInfo=function(e){var a="<data>{";var f="}</data>";var d=DataTiddler.indexOfNonEscapedText(e,a,0);if(d<0){return null}var c=e.indexOf(f,d);if(c<0){return null}var b;while((b=e.indexOf(f,c+1))>=0){c=b}return{prefixEnd:d,dataStart:d+(a.length)-1,dataEnd:c,suffixStart:c+(f.length)}};DataTiddler.getDataTiddlerMatches=function(a){var f=a.text;var e=DataTiddler.getDataSectionInfo(f);if(!e){return null}var c=f.substr(0,e.prefixEnd);var b=f.substr(e.dataStart,e.dataEnd-e.dataStart+1);var d=f.substr(e.suffixStart);return[f,c,b,d]};DataTiddler.save=function(a){var e=DataTiddler.getDataTiddlerMatches(a);var d;var f;if(e===null){d=a.text;f=""}else{d=e[1];f=e[3]}var b=DataTiddler.getDataTextOfTiddler(a);var c=(b!==null)?d+"<data>"+b+"</data>"+f:d+f;if(c!=a.text){a.isDataTiddlerChange=true;a.set(a.title,c,config.options.txtUserName,config.options.chkForceMinorUpdate?undefined:new Date(),a.tags);delete a.isDataTiddlerChange;store.dirty=true;if(config.options.chkAutoSave){saveChanges()}}};DataTiddler.MyTiddlerChangedFunction=function(){if(this.dataObject&&!this.isDataTiddlerChange){delete this.dataObject}DataTiddler.originalTiddlerChangedFunction.apply(this,arguments)};config.formatters.push({name:"data-escape",match:"~<\\/?data>",handler:function(a){a.outputText(a.output,a.matchStart+1,a.nextMatch)}});config.formatters.push({name:"data",match:"<data>",handler:function(a){var b=DataTiddler.getDataSectionInfo(a.source);if(b&&b.prefixEnd==a.matchStart){a.nextMatch=b.suffixStart}else{a.outputText(a.output,a.matchStart,a.nextMatch)}}});DataTiddler.originalTiddlerChangedFunction=Tiddler.prototype.changed;Tiddler.prototype.changed=DataTiddler.MyTiddlerChangedFunction;Tiddler.prototype.data=function(b,a){return(b)?DataTiddler.getTiddlerDataValue(this,b,a):DataTiddler.getTiddlerDataObject(this)};Tiddler.prototype.setData=function(c,b,a){DataTiddler.setTiddlerDataValue(this,c,b,a)};config.macros.showData={label:"showData",prompt:"Display the values stored in the data section of the tiddler"};config.macros.showData.handler=function(a,g,h){var c=0;var d=false;if((c<h.length)&&h[c]=="JSON"){c++;d=true}var b=story.findContainingTiddler(a).getAttribute("tiddler");if(c<h.length){b=h[c];c++}try{if(d){this.renderDataInJSONFormat(a,b)}else{this.renderDataAsTable(a,b)}}catch(f){this.createErrorElement(a,f)}};config.macros.showData.renderDataInJSONFormat=function(a,b){var c=DataTiddler.getDataText(b);if(c){createTiddlyElement(a,"pre",null,null,c)}};config.macros.showData.renderDataAsTable=function(a,b){var f="|!Name|!Value|\n";var e=DataTiddler.getDataObject(b);if(e){for(var c in e){var d=e[c];f+="|"+c+"|"+DataTiddler.stringify(d)+"|\n"}}wikify(f,a)};config.macros.showData.createErrorElement=function(a,b){var c=(b.description)?b.description:b.toString();return createTiddlyElement(a,"span",null,"showDataError","<<showData ...>>: "+c)};setStylesheet(".showDataError{color: #ffffff;background-color: #880000;}","showData")}var JSON={copyright:"(c)2005 JSON.org",license:"http://www.crockford.com/JSON/license.html",stringify:function(c){var b=[];function f(a){b[b.length]=a}function d(a){var j,h=undefined,e,g;switch(typeof a){case"object":if(a){if(a instanceof Array){f("[");e=b.length;for(h=0;h<a.length;h+=1){g=a[h];if(typeof g!="undefined"&&typeof g!="function"){if(e<b.length){f(",")}d(g)}}f("]");return}else{if(typeof a.toString!="undefined"){f("{");e=b.length;for(h in a){g=a[h];if(a.hasOwnProperty(h)&&typeof g!="undefined"&&typeof g!="function"){if(e<b.length){f(",")}d(h);f(":");d(g)}}return f("}")}}}f("null");return;case"number":f(isFinite(a)?+a:"null");return;case"string":e=a.length;f('"');for(h=0;h<e;h+=1){j=a.charAt(h);if(j>=" "){if(j=="\\"||j=='"'){f("\\")}f(j)}else{switch(j){case"\b":f("\\b");break;case"\f":f("\\f");break;case"\n":f("\\n");break;case"\r":f("\\r");break;case"\t":f("\\t");break;default:j=j.charCodeAt();f("\\u00"+Math.floor(j/16).toString(16)+(j%16).toString(16))}}}f('"');return;case"boolean":f(String(a));return;default:f("null");return}}d(c);return b.join("")},parse:function(text){var p=/^\s*(([,:{}\[\]])|"(\\.|[^\x00-\x1f"\\])*"|-?\d+(\.\d*)?([eE][+-]?\d+)?|true|false|null)\s*/,token=undefined,operator=undefined;function error(m,t){throw {name:"JSONError",message:m,text:t||operator||token}}function next(b){if(b&&b!=operator){error("Expected '"+b+"'")}if(text){var t=p.exec(text);if(t){if(t[2]){token=null;operator=t[2]}else{operator=null;try{token=eval(t[1])}catch(e){error("Bad token",t[1])}}text=text.substring(t[0].length)}else{error("Unrecognized token",text)}}else{token=operator=undefined}}function val(){var k,o;switch(operator){case"{":next("{");o={};if(operator!="}"){for(;;){if(operator||typeof token!="string"){error("Missing key")}k=token;next();next(":");o[k]=val();if(operator!=","){break}next(",")}}next("}");return o;case"[":next("[");o=[];if(operator!="]"){for(;;){o.push(val());if(operator!=","){break}next(",")}}next("]");return o;default:if(operator!==null){error("Missing value")}k=token;next();return k}}next();return val()}};DataTiddler.format="JSON";DataTiddler.stringify=JSON.stringify;DataTiddler.parse=JSON.parse;
//%/
