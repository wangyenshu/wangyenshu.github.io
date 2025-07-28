/***
|Name|ImageMacro|
|Created by|Andre' de Carvalho|
|Location|http://acarvalho.tiddlyspace.com/#ImageMacro|
|Version|1.1.1|
|Date|2021 06 18|
|Type|Macro|
|Description|A TiddlyWiki Macro to create configurable links to images.|

/%
Version history :
1.1.1 2021 06 18 : Corrected documentation
1.1.0 2013 05 10 : handling null parameters
%/

!!Example
<<Image "FL" "200" "Coupling-root-level.png" "https://dl.dropbox.com/" "s/vfki4dkx343k4ut/" "?dl=1" "Root level allowed dependencies.">>
{{{
<<Image "FL" "200" "Coupling-root-level.png" "https://dl.dropbox.com/" "s/vfki4dkx343k4ut/" "?dl=1" "Root level allowed dependencies.">>
}}}




or

<<Image "FR" "200" "Coupling-root-level.png" "https://dl.dropbox.com/" "s/vfki4dkx343k4ut/" "?dl=1" "Root level allowed dependencies.">>
{{{
<<Image "FR" "200" "Coupling-root-level.png" "https://dl.dropbox.com/" "s/vfki4dkx343k4ut/" "?dl=1" "Root level allowed dependencies.">>
}}}

or

<<Image "" "" "Coupling-root-level.png" "https://dl.dropbox.com/" "s/vfki4dkx343k4ut/" "?dl=1" "Root level allowed dependencies.">>
{{{
<<Image "" "" "Coupling-root-level.png" "https://dl.dropbox.com/" "s/vfki4dkx343k4ut/" "?dl=1" "Root level allowed dependencies.">>
}}}

!!Installation
Import (or copy/paste) this tiddler into your document and tag it with "systemConfig".  For using size you need [[ImageSizePlugin|	http://www.TiddlyTools.com/#ImageSizePlugin]].

!!Code
***/
//{{{
version.extensions.Image= {major: 1, minor: 1 , revision: 1, date: new Date(2021,06,18)};
//Created by André de Carvalho
//}}}
//{{{
config.macros.Image = {};
config.macros.Image.handler= function(place,macroName,params) {
  /* Type : FL = float left, FR = float right, "" = no float */
   var type=params[0];
  /* Size : number = pixels (requires ImageSizePlugin), "" = no size */
   var size=params[1];
  /* Name : the name of the image file */
   var name=params[2];
  /* Path : the path of the image file (include end backslash) */
   var path = params[3];
  /* Prefix : optional prefix to be inserted between Path and FileName */
   var prefix = params[4];
  /* Postfix : optional postfix to be appended after FileName */
   var postfix = params[5];
  /* Caption : optional caption */
   var caption = params[6];

  var ini = "";
  var end = "";

  if (caption)
  {
    caption = "<br>@@padding:0.8em;@@@@color:#00f;^^"+caption+"^^@@";
  }
  else
  {
    caption = "";
  }

  switch(type)
  {
    case "FR":
      ini = "{{imgfloatright{[img";
      end = "]]"+caption+"}}}";
      break;
    case "FL":
      ini = "{{imgfloatleft{[img";
      end = "]]"+caption+"}}}";
      break;
    default:
      ini="[img";
      end = "]]";
  }

  if (size)
    ini = ini + "("+size+"px+,+)";

   ini = ini+"[";
   if (path)
     ini = ini+ path;
   if (prefix)
     ini = ini+ prefix;
   if (name)
     ini = ini+ name;
   if (postfix)
     ini = ini+ postfix;

   wikify(ini+end, place)
};
//}}}
 