/***
|Name|BibRefMacro|
|Created by|Andre' de Carvalho|
|Location|http://acarvalho.tiddlyspace.com/#BibRefMacro|
|Version|1.0.0|
|Type|Macro|
|Description|A TiddlyWiki Macro to create links to anchors in a bibliography tiddler.|

!!Example
{{{<<BibRef "Parnas 1972">>}}}
<<BibRef "Parnas 1972">>
or
{{{<<BibRef Berard>>}}}
<<BibRef Berard>>

!!Installation
Import (or copy/paste) this tiddler into your document and tag it with "systemConfig". Change the wikify path to suit your bibliography page and anchor style ( I use SectionLinksPlugin ).

!!Code
***/
//{{{
version.extensions.BibRef= {major: 1, minor: 0 , revision: 0, date: new Date(2012,6,17)};
//Created by André de Carvalho
//}}}
//{{{
config.macros.BibRef = {};
config.macros.BibRef.handler= function(place,macroName,params) {
   var bref=params[0];
   wikify("[[["+bref+"]|BibliographyPage##"+bref+"]]",place)
};
//}}}
 