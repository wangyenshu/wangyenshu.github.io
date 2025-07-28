/***
|Name|HoverMenuPlugin|
|Created by|SaqImtiaz|
|Location|http://tw.lewcid.org/#HoverMenuPlugin|
|Version|1.11|
|Requires|~TW2.x|
!Description:
Provides a hovering menu on the edge of the screen for commonly used commands, that scrolls with the page.

!Demo:
Observe the hovering menu on the right edge of the screen.

!Installation:
Copy the contents of this tiddler to your TW, tag with systemConfig, save and reload your TW.
To customize your HoverMenu, edit the HoverMenu shadow tiddler.

To customize whether the menu sticks to the right or left edge of the screen, and its start position, edit the HoverMenu configuration settings part of the code below. It's well documented, so don't be scared!

The menu has an id of hoverMenu, in case you want to style the buttons in it using css.

!Notes:
Since the default HoverMenu contains buttons for toggling the side bar and jumping to the top of the screen and to open tiddlers, the ToggleSideBarMacro, JumpMacro and the JumpToTopMacro are included in this tiddler, so you dont need to install them separately. Having them installed separately as well could lead to complications.

If you dont intend to use these three macros at all, feel free to remove those sections of code in this tiddler.

!To Do:
* rework code to allow multiple hovering menus in different positions, horizontal etc.
* incorporate code for keyboard shortcuts that correspond to the buttons in the hovermenu

!History:
*03-08-06, ver 1.1.2: compatibility fix with SelectThemePlugin
*03-08-06,  ver 1.11: fixed error with button tooltips
*27-07-06, ver 1.1 : added JumpMacro to hoverMenu
*23-07-06

!Code
***/

/***
start HoverMenu plugin code
***/
//{{{
config.hoverMenu={};
//}}}

/***
HoverMenu configuration settings
***/
//{{{
config.hoverMenu.settings={
               align: 'right',    //align menu to right or left side of screen, possible values are 'right' and 'left'               
               x: 1,              // horizontal distance of menu from side of screen, increase to your liking.
               y: 158            //vertical distance of menu from top of screen at start, increase or decrease to your liking
               };
//}}}

//{{{
//continue HoverMenu plugin code
config.hoverMenu.handler=function()
{              
               if (!document.getElementById("hoverMenu"))
               {
               var theMenu = createTiddlyElement(document.getElementById("contentWrapper"), "div","hoverMenu");
               theMenu.setAttribute("refresh","content");
               theMenu.setAttribute("tiddler","HoverMenu");
               var menuContent = store.getTiddlerText("HoverMenu");
               wikify(menuContent,theMenu);
              }

	       var Xloc = this.settings.x;
	       Yloc =this.settings.y;
	       var ns = (navigator.appName.indexOf("Netscape") != -1);
	       function SetMenu(id)
                        {
		        var GetElements=document.getElementById?document.getElementById(id):document.all?document.all[id]:document.layers[id];
		        if(document.layers)GetElements.style=GetElements;
		        GetElements.sP=function(x,y){this.style[config.hoverMenu.settings.align]=x +"px";this.style.top=y +"px";};
		        GetElements.x = Xloc;
		        GetElements.y = findScrollY();
		        GetElements.y += Yloc;
		        return GetElements;
	                }
               window.LoCate_XY=function()
                        {
		        var pY =  findScrollY();
                        ftlObj.y += (pY + Yloc - ftlObj.y)/15;
		        ftlObj.sP(ftlObj.x, ftlObj.y);
		        setTimeout("LoCate_XY()", 10);
	                }
               ftlObj = SetMenu("hoverMenu");
	       LoCate_XY();
};

window.old_lewcid_hovermenu_restart = restart;
restart = function()
{
               window.old_lewcid_hovermenu_restart();
               config.hoverMenu.handler();
};

setStylesheet(
"#hoverMenu .imgLink, #hoverMenu .imgLink:hover {border:none; padding:0px; float:right; margin-bottom:2px; margin-top:0px;}\n"+
"#hoverMenu  .button, #hoverMenu  .tiddlyLink {border:none; font-weight:bold; background:#18f; color:#FFF; padding:0 5px; float:right; margin-bottom:4px;}\n"+
"#hoverMenu .button:hover, #hoverMenu .tiddlyLink:hover {font-weight:bold; border:none; color:#fff; background:#000; padding:0 5px; float:right; margin-bottom:4px;}\n"+
"#hoverMenu .button {width:100%; text-align:center}"+
"#hoverMenu { position:absolute; width:7px;}\n"+
"\n","hoverMenuStyles");


config.macros.renameButton={};
config.macros.renameButton.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{

               if (place.lastChild.tagName!="BR")
                     {
                      place.lastChild.firstChild.data = params[0];
                      if (params[1]) {place.lastChild.title = params[1];}
                     }
};

config.shadowTiddlers["HoverMenu"]="<<top>>\n<<toggleSideBar>><<renameButton '>' >>\n<<jump j '' top>>\n<<saveChanges>><<renameButton s 'Save TiddlyWiki'>>\n<<newTiddler>><<renameButton n>>\n";
//}}}
//end HoverMenu plugin code

//Start ToggleSideBarMacro code
//{{{
config.macros.toggleSideBar={};

config.macros.toggleSideBar.settings={
         styleHide :  "#sidebar { display: none;}\n"+"#contentWrapper #displayArea { margin-right: 1em;}\n"+"",
         styleShow : " ",
         arrow1: "«",
         arrow2: "»"
};

config.macros.toggleSideBar.handler=function (place,macroName,params,wikifier,paramString,tiddler)
{
          var tooltip= params[1]||'toggle sidebar';
          var mode = (params[2] && params[2]=="hide")? "hide":"show";
          if (!params[2])
              mode = "hide";
          var arrow = (mode == "hide")? this.settings.arrow1:this.settings.arrow2;
          var label= (params[0]&&params[0]!='.')?params[0]+" "+arrow:arrow;
          var theBtn = createTiddlyButton(place,label,tooltip,this.onToggleSideBar,"button HideSideBarButton");
          if (mode == "hide")
             { 
             (document.getElementById("sidebar")).setAttribute("toggle","hide");
              setStylesheet(this.settings.styleHide,"ToggleSideBarStyles");
             }
};

config.macros.toggleSideBar.onToggleSideBar = function(){
          var sidebar = document.getElementById("sidebar");
          var settings = config.macros.toggleSideBar.settings;
          if (sidebar.getAttribute("toggle")=='hide')
             {
              setStylesheet(settings.styleShow,"ToggleSideBarStyles");
              sidebar.setAttribute("toggle","show");
              this.firstChild.data= (this.firstChild.data).replace(settings.arrow1,settings.arrow2);
              }
          else
              {    
               setStylesheet(settings.styleHide,"ToggleSideBarStyles");
               sidebar.setAttribute("toggle","hide");
               this.firstChild.data= (this.firstChild.data).replace(settings.arrow2,settings.arrow1);
              }

     return false;
}

setStylesheet(".HideSideBarButton .button {font-weight:bold; padding: 0 5px;}\n","ToggleSideBarButtonStyles");
//}}}
//end ToggleSideBarMacro code

//start JumpToTopMacro code
//{{{
config.macros.top={};
config.macros.top.handler=function(place,macroName)
{
               createTiddlyButton(place,"^","jump to top",this.onclick);
}
config.macros.top.onclick=function()
{
               window.scrollTo(0,0);
};

config.commands.top =
{
               text:" ^ ",
               tooltip:"jump to top"
};

config.commands.top.handler = function(event,src,title)
{
               window.scrollTo(0,0);
}
//}}}
//end JumpToStartMacro code

//start JumpMacro code
//{{{
config.macros.jump= {};
config.macros.jump.handler = function (place,macroName,params,wikifier,paramString,tiddler)
{
        var label = (params[0] && params[0]!=".")? params[0]: 'jump';
        var tooltip = (params[1] && params[1]!=".")? params[1]: 'jump to an open tiddler';
        var top = (params[2] && params[2]=='top') ? true: false;        

        var btn =createTiddlyButton(place,label,tooltip,this.onclick);
        if (top==true)
              btn.setAttribute("top","true")
}

config.macros.jump.onclick = function(e)
{
        if (!e) var e = window.event;
        var theTarget = resolveTarget(e);
        var top = theTarget.getAttribute("top");
	var popup = Popup.create(this);
	if(popup)
		{
                 if(top=="true")
                                {createTiddlyButton(createTiddlyElement(popup,"li"),'Top ↑','Top of TW',config.macros.jump.top);
                                 createTiddlyElement(popup,"hr");}
		
		story.forEachTiddler(function(title,element) {
			createTiddlyLink(createTiddlyElement(popup,"li"),title,true);
			});
                }
	Popup.show(popup,false);
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
	return false;
}

config.macros.jump.top = function()
{
       window.scrollTo(0,0);
}
//}}}
//end JumpMacro code

//utility functions
//{{{
Popup.show = function(unused,slowly)
{
	var curr = Popup.stack[Popup.stack.length-1];
	var rootLeft = findPosX(curr.root);
	var rootTop = findPosY(curr.root);
	var rootHeight = curr.root.offsetHeight;
	var popupLeft = rootLeft;
	var popupTop = rootTop + rootHeight;
	var popupWidth = curr.popup.offsetWidth;
	var winWidth = findWindowWidth();
        if (isChild(curr.root,'hoverMenu'))
              var x = config.hoverMenu.settings.x;
        else
              var x = 0;
	if(popupLeft + popupWidth+x > winWidth)
		popupLeft = winWidth - popupWidth -x;
        if (isChild(curr.root,'hoverMenu'))
  	        {curr.popup.style.right = x + "px";}
        else
                curr.popup.style.left = popupLeft + "px";
	curr.popup.style.top = popupTop + "px";
	curr.popup.style.display = "block";
	addClass(curr.root,"highlight");
	if(config.options.chkAnimate)
		anim.startAnimating(new Scroller(curr.popup,slowly));
	else
		window.scrollTo(0,ensureVisible(curr.popup));
}

window.isChild = function(e,parentId) {
        while (e != null) {
                var parent = document.getElementById(parentId);
                if (parent == e) return true;
                e = e.parentNode;
                }
        return false;
};
//}}}


