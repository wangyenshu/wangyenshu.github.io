/***
|Name|CookieManagerPluginConfig|
|Source|http://www.TiddlyTools.com/#CookieManagerPluginConfig|
|Requires|CookieManagerPlugin|
|Description|custom settings for [[CookieManagerPlugin]]|
!!!!!Browser Cookie Configuration:
***/
// // <<option chkAllowBrowserCookies>> store ~TiddlyWiki option settings using private browser cookies
// // <<option chkMonitorBrowserCookies>> monitor browser cookie activity (shows a message whenever a cookie is updated)
//{{{
// default settings:
config.options.chkAllowBrowserCookies=true;	// if FALSE, this blocks *all* cookies
config.options.chkMonitorBrowserCookies=false;
//}}}

// // Individual cookie names can be prevented from being created, modified, or deleted in your browser's stored cookies by adding them to the {{{config.macros.cookieManager.blockedCookies}}} array: 
//{{{
var bc=config.macros.cookieManager.blockedCookies; // abbreviation
bc.push("txtMainTab");			// TiddlyWiki:  SideBarTabs
bc.push("txtTOCSortBy");		// TiddlyTools: TableOfContentsPlugin
bc.push("txtCatalogTab");		// TiddlyTools: CatalogTabs
//}}}
// // You can also define a javascript test function that determines whether or not any particular cookie name should be blocked or allowed.  The following function should return FALSE if the browser cookie should be blocked, or TRUE if changes to the cookie should be allowed:
//{{{
config.macros.cookieManager.allowBrowserCookie=function(name) {
	// add tests based on specific cookie names and runtime conditions
	return true;
}
//}}}