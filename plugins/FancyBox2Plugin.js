/***
|Name         |FancyBox2Plugin|
|Description  |Create image galleries (via a macro that uses the fancyBox library)|
|Version      |0.9.6|
|Source       |https://github.com/YakovL/TiddlyWiki_ImageGalleries/blob/master/FancyBox2Plugin.js|
|Documentation|https://yakovl.github.io/TiddlyWiki_ImageGalleries/#FancyBox2PluginInfo|
|Author       |Yakov Litvin|
|Licence      |[[BSD-like open source license|https://yakovl.github.io/TiddlyWiki_ImageGalleries/#%5B%5BYakov%20Litvin%20Public%20Licence%5D%5D]]|
***/
// // Here goes minified and hidden fancyBox v2.1.5 (from fancyapps.com, [[license|fancyapps.com/fancybox/#license]]) /%

(function(r,G,f,v){var J=f("html"),n=f(r),p=f(G),b=f.fancybox=function(){b.open.apply(this,arguments)},I=navigator.userAgent.match(/msie/i),B=null,s=G.createTouch!==v,t=function(a){return a&&a.hasOwnProperty&&a instanceof f},q=function(a){return a&&"string"===f.type(a)},E=function(a){return q(a)&&0<a.indexOf("%")},l=function(a,d){var e=parseInt(a,10)||0;d&&E(a)&&(e*=b.getViewport()[d]/100);return Math.ceil(e)},w=function(a,b){return l(a,b)+"px"};f.extend(b,{version:"2.1.5",defaults:{padding:15,margin:20,
width:800,height:600,minWidth:100,minHeight:100,maxWidth:9999,maxHeight:9999,pixelRatio:1,autoSize:!0,autoHeight:!1,autoWidth:!1,autoResize:!0,autoCenter:!s,fitToView:!0,aspectRatio:!1,topRatio:0.5,leftRatio:0.5,scrolling:"auto",wrapCSS:"",arrows:!0,closeBtn:!0,closeClick:!1,nextClick:!1,mouseWheel:!0,autoPlay:!1,playSpeed:3E3,preload:3,modal:!1,loop:!0,ajax:{dataType:"html",headers:{"X-fancyBox":!0}},iframe:{scrolling:"auto",preload:!0},swf:{wmode:"transparent",allowfullscreen:"true",allowscriptaccess:"always"},
keys:{next:{13:"left",34:"up",39:"left",40:"up"},prev:{8:"right",33:"down",37:"right",38:"down"},close:[27],play:[32],toggle:[70]},direction:{next:"left",prev:"right"},scrollOutside:!0,index:0,type:null,href:null,content:null,title:null,tpl:{wrap:'<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>',image:'<img class="fancybox-image" src="{href}" alt="" />',iframe:'<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen'+
(I?' allowtransparency="true"':"")+"></iframe>",error:'<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',closeBtn:'<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',next:'<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',prev:'<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'},openEffect:"fade",openSpeed:250,openEasing:"swing",openOpacity:!0,
openMethod:"zoomIn",closeEffect:"fade",closeSpeed:250,closeEasing:"swing",closeOpacity:!0,closeMethod:"zoomOut",nextEffect:"elastic",nextSpeed:250,nextEasing:"swing",nextMethod:"changeIn",prevEffect:"elastic",prevSpeed:250,prevEasing:"swing",prevMethod:"changeOut",helpers:{overlay:!0,title:!0},onCancel:f.noop,beforeLoad:f.noop,afterLoad:f.noop,beforeShow:f.noop,afterShow:f.noop,beforeChange:f.noop,beforeClose:f.noop,afterClose:f.noop},group:{},opts:{},previous:null,coming:null,current:null,isActive:!1,
isOpen:!1,isOpened:!1,wrap:null,skin:null,outer:null,inner:null,player:{timer:null,isActive:!1},ajaxLoad:null,imgPreload:null,transitions:{},helpers:{},open:function(a,d){if(a&&(f.isPlainObject(d)||(d={}),!1!==b.close(!0)))return f.isArray(a)||(a=t(a)?f(a).get():[a]),f.each(a,function(e,c){var k={},g,h,j,m,l;"object"===f.type(c)&&(c.nodeType&&(c=f(c)),t(c)?(k={href:c.data("fancybox-href")||c.attr("href"),title:c.data("fancybox-title")||c.attr("title"),isDom:!0,element:c},f.metadata&&f.extend(!0,k,
c.metadata())):k=c);g=d.href||k.href||(q(c)?c:null);h=d.title!==v?d.title:k.title||"";m=(j=d.content||k.content)?"html":d.type||k.type;!m&&k.isDom&&(m=c.data("fancybox-type"),m||(m=(m=c.prop("class").match(/fancybox\.(\w+)/))?m[1]:null));q(g)&&(m||(b.isImage(g)?m="image":b.isSWF(g)?m="swf":"#"===g.charAt(0)?m="inline":q(c)&&(m="html",j=c)),"ajax"===m&&(l=g.split(/\s+/,2),g=l.shift(),l=l.shift()));j||("inline"===m?g?j=f(q(g)?g.replace(/.*(?=#[^\s]+$)/,""):g):k.isDom&&(j=c):"html"===m?j=g:!m&&(!g&&
k.isDom)&&(m="inline",j=c));f.extend(k,{href:g,type:m,content:j,title:h,selector:l});a[e]=k}),b.opts=f.extend(!0,{},b.defaults,d),d.keys!==v&&(b.opts.keys=d.keys?f.extend({},b.defaults.keys,d.keys):!1),b.group=a,b._start(b.opts.index)},cancel:function(){var a=b.coming;a&&!1!==b.trigger("onCancel")&&(b.hideLoading(),b.ajaxLoad&&b.ajaxLoad.abort(),b.ajaxLoad=null,b.imgPreload&&(b.imgPreload.onload=b.imgPreload.onerror=null),a.wrap&&a.wrap.stop(!0,!0).trigger("onReset").remove(),b.coming=null,b.current||
b._afterZoomOut(a))},close:function(a){b.cancel();!1!==b.trigger("beforeClose")&&(b.unbindEvents(),b.isActive&&(!b.isOpen||!0===a?(f(".fancybox-wrap").stop(!0).trigger("onReset").remove(),b._afterZoomOut()):(b.isOpen=b.isOpened=!1,b.isClosing=!0,f(".fancybox-item, .fancybox-nav").remove(),b.wrap.stop(!0,!0).removeClass("fancybox-opened"),b.transitions[b.current.closeMethod]())))},play:function(a){var d=function(){clearTimeout(b.player.timer)},e=function(){d();b.current&&b.player.isActive&&(b.player.timer=
setTimeout(b.next,b.current.playSpeed))},c=function(){d();p.unbind(".player");b.player.isActive=!1;b.trigger("onPlayEnd")};if(!0===a||!b.player.isActive&&!1!==a){if(b.current&&(b.current.loop||b.current.index<b.group.length-1))b.player.isActive=!0,p.bind({"onCancel.player beforeClose.player":c,"onUpdate.player":e,"beforeLoad.player":d}),e(),b.trigger("onPlayStart")}else c()},next:function(a){var d=b.current;d&&(q(a)||(a=d.direction.next),b.jumpto(d.index+1,a,"next"))},prev:function(a){var d=b.current;
d&&(q(a)||(a=d.direction.prev),b.jumpto(d.index-1,a,"prev"))},jumpto:function(a,d,e){var c=b.current;c&&(a=l(a),b.direction=d||c.direction[a>=c.index?"next":"prev"],b.router=e||"jumpto",c.loop&&(0>a&&(a=c.group.length+a%c.group.length),a%=c.group.length),c.group[a]!==v&&(b.cancel(),b._start(a)))},reposition:function(a,d){var e=b.current,c=e?e.wrap:null,k;c&&(k=b._getPosition(d),a&&"scroll"===a.type?(delete k.position,c.stop(!0,!0).animate(k,200)):(c.css(k),e.pos=f.extend({},e.dim,k)))},update:function(a){var d=
a&&a.type,e=!d||"orientationchange"===d;e&&(clearTimeout(B),B=null);b.isOpen&&!B&&(B=setTimeout(function(){var c=b.current;c&&!b.isClosing&&(b.wrap.removeClass("fancybox-tmp"),(e||"load"===d||"resize"===d&&c.autoResize)&&b._setDimension(),"scroll"===d&&c.canShrink||b.reposition(a),b.trigger("onUpdate"),B=null)},e&&!s?0:300))},toggle:function(a){b.isOpen&&(b.current.fitToView="boolean"===f.type(a)?a:!b.current.fitToView,s&&(b.wrap.removeAttr("style").addClass("fancybox-tmp"),b.trigger("onUpdate")),
b.update())},hideLoading:function(){p.unbind(".loading");f("#fancybox-loading").remove()},showLoading:function(){var a,d;b.hideLoading();a=f('<div id="fancybox-loading"><div></div></div>').click(b.cancel).appendTo("body");p.bind("keydown.loading",function(a){if(27===(a.which||a.keyCode))a.preventDefault(),b.cancel()});b.defaults.fixed||(d=b.getViewport(),a.css({position:"absolute",top:0.5*d.h+d.y,left:0.5*d.w+d.x}))},getViewport:function(){var a=b.current&&b.current.locked||!1,d={x:n.scrollLeft(),
y:n.scrollTop()};a?(d.w=a[0].clientWidth,d.h=a[0].clientHeight):(d.w=s&&r.innerWidth?r.innerWidth:n.width(),d.h=s&&r.innerHeight?r.innerHeight:n.height());return d},unbindEvents:function(){b.wrap&&t(b.wrap)&&b.wrap.unbind(".fb");p.unbind(".fb");n.unbind(".fb")},bindEvents:function(){var a=b.current,d;a&&(n.bind("orientationchange.fb"+(s?"":" resize.fb")+(a.autoCenter&&!a.locked?" scroll.fb":""),b.update),(d=a.keys)&&p.bind("keydown.fb",function(e){var c=e.which||e.keyCode,k=e.target||e.srcElement;
if(27===c&&b.coming)return!1;!e.ctrlKey&&(!e.altKey&&!e.shiftKey&&!e.metaKey&&(!k||!k.type&&!f(k).is("[contenteditable]")))&&f.each(d,function(d,k){if(1<a.group.length&&k[c]!==v)return b[d](k[c]),e.preventDefault(),!1;if(-1<f.inArray(c,k))return b[d](),e.preventDefault(),!1})}),f.fn.mousewheel&&a.mouseWheel&&b.wrap.bind("mousewheel.fb",function(d,c,k,g){for(var h=f(d.target||null),j=!1;h.length&&!j&&!h.is(".fancybox-skin")&&!h.is(".fancybox-wrap");)j=h[0]&&!(h[0].style.overflow&&"hidden"===h[0].style.overflow)&&
(h[0].clientWidth&&h[0].scrollWidth>h[0].clientWidth||h[0].clientHeight&&h[0].scrollHeight>h[0].clientHeight),h=f(h).parent();if(0!==c&&!j&&1<b.group.length&&!a.canShrink){if(0<g||0<k)b.prev(0<g?"down":"left");else if(0>g||0>k)b.next(0>g?"up":"right");d.preventDefault()}}))},trigger:function(a,d){var e,c=d||b.coming||b.current;if(c){f.isFunction(c[a])&&(e=c[a].apply(c,Array.prototype.slice.call(arguments,1)));if(!1===e)return!1;c.helpers&&f.each(c.helpers,function(d,e){if(e&&b.helpers[d]&&f.isFunction(b.helpers[d][a]))b.helpers[d][a](f.extend(!0,
{},b.helpers[d].defaults,e),c)});p.trigger(a)}},isImage:function(a){return q(a)&&a.match(/(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg)((\?|#).*)?$)/i)},isSWF:function(a){return q(a)&&a.match(/\.(swf)((\?|#).*)?$/i)},_start:function(a){var d={},e,c;a=l(a);e=b.group[a]||null;if(!e)return!1;d=f.extend(!0,{},b.opts,e);e=d.margin;c=d.padding;"number"===f.type(e)&&(d.margin=[e,e,e,e]);"number"===f.type(c)&&(d.padding=[c,c,c,c]);d.modal&&f.extend(!0,d,{closeBtn:!1,closeClick:!1,nextClick:!1,arrows:!1,
mouseWheel:!1,keys:null,helpers:{overlay:{closeClick:!1}}});d.autoSize&&(d.autoWidth=d.autoHeight=!0);"auto"===d.width&&(d.autoWidth=!0);"auto"===d.height&&(d.autoHeight=!0);d.group=b.group;d.index=a;b.coming=d;if(!1===b.trigger("beforeLoad"))b.coming=null;else{c=d.type;e=d.href;if(!c)return b.coming=null,b.current&&b.router&&"jumpto"!==b.router?(b.current.index=a,b[b.router](b.direction)):!1;b.isActive=!0;if("image"===c||"swf"===c)d.autoHeight=d.autoWidth=!1,d.scrolling="visible";"image"===c&&(d.aspectRatio=
!0);"iframe"===c&&s&&(d.scrolling="scroll");d.wrap=f(d.tpl.wrap).addClass("fancybox-"+(s?"mobile":"desktop")+" fancybox-type-"+c+" fancybox-tmp "+d.wrapCSS).appendTo(d.parent||"body");f.extend(d,{skin:f(".fancybox-skin",d.wrap),outer:f(".fancybox-outer",d.wrap),inner:f(".fancybox-inner",d.wrap)});f.each(["Top","Right","Bottom","Left"],function(a,b){d.skin.css("padding"+b,w(d.padding[a]))});b.trigger("onReady");if("inline"===c||"html"===c){if(!d.content||!d.content.length)return b._error("content")}else if(!e)return b._error("href");
"image"===c?b._loadImage():"ajax"===c?b._loadAjax():"iframe"===c?b._loadIframe():b._afterLoad()}},_error:function(a){f.extend(b.coming,{type:"html",autoWidth:!0,autoHeight:!0,minWidth:0,minHeight:0,scrolling:"no",hasError:a,content:b.coming.tpl.error});b._afterLoad()},_loadImage:function(){var a=b.imgPreload=new Image;a.onload=function(){this.onload=this.onerror=null;b.coming.width=this.width/b.opts.pixelRatio;b.coming.height=this.height/b.opts.pixelRatio;b._afterLoad()};a.onerror=function(){this.onload=
this.onerror=null;b._error("image")};a.src=b.coming.href;!0!==a.complete&&b.showLoading()},_loadAjax:function(){var a=b.coming;b.showLoading();b.ajaxLoad=f.ajax(f.extend({},a.ajax,{url:a.href,error:function(a,e){b.coming&&"abort"!==e?b._error("ajax",a):b.hideLoading()},success:function(d,e){"success"===e&&(a.content=d,b._afterLoad())}}))},_loadIframe:function(){var a=b.coming,d=f(a.tpl.iframe.replace(/\{rnd\}/g,(new Date).getTime())).attr("scrolling",s?"auto":a.iframe.scrolling).attr("src",a.href);
f(a.wrap).bind("onReset",function(){try{f(this).find("iframe").hide().attr("src","//about:blank").end().empty()}catch(a){}});a.iframe.preload&&(b.showLoading(),d.one("load",function(){f(this).data("ready",1);s||f(this).bind("load.fb",b.update);f(this).parents(".fancybox-wrap").width("100%").removeClass("fancybox-tmp").show();b._afterLoad()}));a.content=d.appendTo(a.inner);a.iframe.preload||b._afterLoad()},_preloadImages:function(){var a=b.group,d=b.current,e=a.length,c=d.preload?Math.min(d.preload,
e-1):0,f,g;for(g=1;g<=c;g+=1)f=a[(d.index+g)%e],"image"===f.type&&f.href&&((new Image).src=f.href)},_afterLoad:function(){var a=b.coming,d=b.current,e,c,k,g,h;b.hideLoading();if(a&&!1!==b.isActive)if(!1===b.trigger("afterLoad",a,d))a.wrap.stop(!0).trigger("onReset").remove(),b.coming=null;else{d&&(b.trigger("beforeChange",d),d.wrap.stop(!0).removeClass("fancybox-opened").find(".fancybox-item, .fancybox-nav").remove());b.unbindEvents();e=a.content;c=a.type;k=a.scrolling;f.extend(b,{wrap:a.wrap,skin:a.skin,
outer:a.outer,inner:a.inner,current:a,previous:d});g=a.href;switch(c){case "inline":case "ajax":case "html":a.selector?e=f("<div>").html(e).find(a.selector):t(e)&&(e.data("fancybox-placeholder")||e.data("fancybox-placeholder",f('<div class="fancybox-placeholder"></div>').insertAfter(e).hide()),e=e.show().detach(),a.wrap.bind("onReset",function(){f(this).find(e).length&&e.hide().replaceAll(e.data("fancybox-placeholder")).data("fancybox-placeholder",!1)}));break;case "image":e=a.tpl.image.replace("{href}",
g);break;case "swf":e='<object id="fancybox-swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="'+g+'"></param>',h="",f.each(a.swf,function(a,b){e+='<param name="'+a+'" value="'+b+'"></param>';h+=" "+a+'="'+b+'"'}),e+='<embed src="'+g+'" type="application/x-shockwave-flash" width="100%" height="100%"'+h+"></embed></object>"}(!t(e)||!e.parent().is(a.inner))&&a.inner.append(e);b.trigger("beforeShow");a.inner.css("overflow","yes"===k?"scroll":
"no"===k?"hidden":k);b._setDimension();b.reposition();b.isOpen=!1;b.coming=null;b.bindEvents();if(b.isOpened){if(d.prevMethod)b.transitions[d.prevMethod]()}else f(".fancybox-wrap").not(a.wrap).stop(!0).trigger("onReset").remove();b.transitions[b.isOpened?a.nextMethod:a.openMethod]();b._preloadImages()}},_setDimension:function(){var a=b.getViewport(),d=0,e=!1,c=!1,e=b.wrap,k=b.skin,g=b.inner,h=b.current,c=h.width,j=h.height,m=h.minWidth,u=h.minHeight,n=h.maxWidth,p=h.maxHeight,s=h.scrolling,q=h.scrollOutside?
h.scrollbarWidth:0,x=h.margin,y=l(x[1]+x[3]),r=l(x[0]+x[2]),v,z,t,C,A,F,B,D,H;e.add(k).add(g).width("auto").height("auto").removeClass("fancybox-tmp");x=l(k.outerWidth(!0)-k.width());v=l(k.outerHeight(!0)-k.height());z=y+x;t=r+v;C=E(c)?(a.w-z)*l(c)/100:c;A=E(j)?(a.h-t)*l(j)/100:j;if("iframe"===h.type){if(H=h.content,h.autoHeight&&1===H.data("ready"))try{H[0].contentWindow.document.location&&(g.width(C).height(9999),F=H.contents().find("body"),q&&F.css("overflow-x","hidden"),A=F.outerHeight(!0))}catch(G){}}else if(h.autoWidth||
h.autoHeight)g.addClass("fancybox-tmp"),h.autoWidth||g.width(C),h.autoHeight||g.height(A),h.autoWidth&&(C=g.width()),h.autoHeight&&(A=g.height()),g.removeClass("fancybox-tmp");c=l(C);j=l(A);D=C/A;m=l(E(m)?l(m,"w")-z:m);n=l(E(n)?l(n,"w")-z:n);u=l(E(u)?l(u,"h")-t:u);p=l(E(p)?l(p,"h")-t:p);F=n;B=p;h.fitToView&&(n=Math.min(a.w-z,n),p=Math.min(a.h-t,p));z=a.w-y;r=a.h-r;h.aspectRatio?(c>n&&(c=n,j=l(c/D)),j>p&&(j=p,c=l(j*D)),c<m&&(c=m,j=l(c/D)),j<u&&(j=u,c=l(j*D))):(c=Math.max(m,Math.min(c,n)),h.autoHeight&&
"iframe"!==h.type&&(g.width(c),j=g.height()),j=Math.max(u,Math.min(j,p)));if(h.fitToView)if(g.width(c).height(j),e.width(c+x),a=e.width(),y=e.height(),h.aspectRatio)for(;(a>z||y>r)&&(c>m&&j>u)&&!(19<d++);)j=Math.max(u,Math.min(p,j-10)),c=l(j*D),c<m&&(c=m,j=l(c/D)),c>n&&(c=n,j=l(c/D)),g.width(c).height(j),e.width(c+x),a=e.width(),y=e.height();else c=Math.max(m,Math.min(c,c-(a-z))),j=Math.max(u,Math.min(j,j-(y-r)));q&&("auto"===s&&j<A&&c+x+q<z)&&(c+=q);g.width(c).height(j);e.width(c+x);a=e.width();
y=e.height();e=(a>z||y>r)&&c>m&&j>u;c=h.aspectRatio?c<F&&j<B&&c<C&&j<A:(c<F||j<B)&&(c<C||j<A);f.extend(h,{dim:{width:w(a),height:w(y)},origWidth:C,origHeight:A,canShrink:e,canExpand:c,wPadding:x,hPadding:v,wrapSpace:y-k.outerHeight(!0),skinSpace:k.height()-j});!H&&(h.autoHeight&&j>u&&j<p&&!c)&&g.height("auto")},_getPosition:function(a){var d=b.current,e=b.getViewport(),c=d.margin,f=b.wrap.width()+c[1]+c[3],g=b.wrap.height()+c[0]+c[2],c={position:"absolute",top:c[0],left:c[3]};d.autoCenter&&d.fixed&&
!a&&g<=e.h&&f<=e.w?c.position="fixed":d.locked||(c.top+=e.y,c.left+=e.x);c.top=w(Math.max(c.top,c.top+(e.h-g)*d.topRatio));c.left=w(Math.max(c.left,c.left+(e.w-f)*d.leftRatio));return c},_afterZoomIn:function(){var a=b.current;a&&(b.isOpen=b.isOpened=!0,b.wrap.css("overflow","visible").addClass("fancybox-opened"),b.update(),(a.closeClick||a.nextClick&&1<b.group.length)&&b.inner.css("cursor","pointer").bind("click.fb",function(d){!f(d.target).is("a")&&!f(d.target).parent().is("a")&&(d.preventDefault(),
b[a.closeClick?"close":"next"]())}),a.closeBtn&&f(a.tpl.closeBtn).appendTo(b.skin).bind("click.fb",function(a){a.preventDefault();b.close()}),a.arrows&&1<b.group.length&&((a.loop||0<a.index)&&f(a.tpl.prev).appendTo(b.outer).bind("click.fb",b.prev),(a.loop||a.index<b.group.length-1)&&f(a.tpl.next).appendTo(b.outer).bind("click.fb",b.next)),b.trigger("afterShow"),!a.loop&&a.index===a.group.length-1?b.play(!1):b.opts.autoPlay&&!b.player.isActive&&(b.opts.autoPlay=!1,b.play()))},_afterZoomOut:function(a){a=
a||b.current;f(".fancybox-wrap").trigger("onReset").remove();f.extend(b,{group:{},opts:{},router:!1,current:null,isActive:!1,isOpened:!1,isOpen:!1,isClosing:!1,wrap:null,skin:null,outer:null,inner:null});b.trigger("afterClose",a)}});b.transitions={getOrigPosition:function(){var a=b.current,d=a.element,e=a.orig,c={},f=50,g=50,h=a.hPadding,j=a.wPadding,m=b.getViewport();!e&&(a.isDom&&d.is(":visible"))&&(e=d.find("img:first"),e.length||(e=d));t(e)?(c=e.offset(),e.is("img")&&(f=e.outerWidth(),g=e.outerHeight())):
(c.top=m.y+(m.h-g)*a.topRatio,c.left=m.x+(m.w-f)*a.leftRatio);if("fixed"===b.wrap.css("position")||a.locked)c.top-=m.y,c.left-=m.x;return c={top:w(c.top-h*a.topRatio),left:w(c.left-j*a.leftRatio),width:w(f+j),height:w(g+h)}},step:function(a,d){var e,c,f=d.prop;c=b.current;var g=c.wrapSpace,h=c.skinSpace;if("width"===f||"height"===f)e=d.end===d.start?1:(a-d.start)/(d.end-d.start),b.isClosing&&(e=1-e),c="width"===f?c.wPadding:c.hPadding,c=a-c,b.skin[f](l("width"===f?c:c-g*e)),b.inner[f](l("width"===
f?c:c-g*e-h*e))},zoomIn:function(){var a=b.current,d=a.pos,e=a.openEffect,c="elastic"===e,k=f.extend({opacity:1},d);delete k.position;c?(d=this.getOrigPosition(),a.openOpacity&&(d.opacity=0.1)):"fade"===e&&(d.opacity=0.1);b.wrap.css(d).animate(k,{duration:"none"===e?0:a.openSpeed,easing:a.openEasing,step:c?this.step:null,complete:b._afterZoomIn})},zoomOut:function(){var a=b.current,d=a.closeEffect,e="elastic"===d,c={opacity:0.1};e&&(c=this.getOrigPosition(),a.closeOpacity&&(c.opacity=0.1));b.wrap.animate(c,
{duration:"none"===d?0:a.closeSpeed,easing:a.closeEasing,step:e?this.step:null,complete:b._afterZoomOut})},changeIn:function(){var a=b.current,d=a.nextEffect,e=a.pos,c={opacity:1},f=b.direction,g;e.opacity=0.1;"elastic"===d&&(g="down"===f||"up"===f?"top":"left","down"===f||"right"===f?(e[g]=w(l(e[g])-200),c[g]="+=200px"):(e[g]=w(l(e[g])+200),c[g]="-=200px"));"none"===d?b._afterZoomIn():b.wrap.css(e).animate(c,{duration:a.nextSpeed,easing:a.nextEasing,complete:b._afterZoomIn})},changeOut:function(){var a=
b.previous,d=a.prevEffect,e={opacity:0.1},c=b.direction;"elastic"===d&&(e["down"===c||"up"===c?"top":"left"]=("up"===c||"left"===c?"-":"+")+"=200px");a.wrap.animate(e,{duration:"none"===d?0:a.prevSpeed,easing:a.prevEasing,complete:function(){f(this).trigger("onReset").remove()}})}};b.helpers.overlay={defaults:{closeClick:!0,speedOut:200,showEarly:!0,css:{},locked:!s,fixed:!0},overlay:null,fixed:!1,el:f("html"),create:function(a){a=f.extend({},this.defaults,a);this.overlay&&this.close();this.overlay=
f('<div class="fancybox-overlay"></div>').appendTo(b.coming?b.coming.parent:a.parent);this.fixed=!1;a.fixed&&b.defaults.fixed&&(this.overlay.addClass("fancybox-overlay-fixed"),this.fixed=!0)},open:function(a){var d=this;a=f.extend({},this.defaults,a);this.overlay?this.overlay.unbind(".overlay").width("auto").height("auto"):this.create(a);this.fixed||(n.bind("resize.overlay",f.proxy(this.update,this)),this.update());a.closeClick&&this.overlay.bind("click.overlay",function(a){if(f(a.target).hasClass("fancybox-overlay"))return b.isActive?
b.close():d.close(),!1});this.overlay.css(a.css).show()},close:function(){var a,b;n.unbind("resize.overlay");this.el.hasClass("fancybox-lock")&&(f(".fancybox-margin").removeClass("fancybox-margin"),a=n.scrollTop(),b=n.scrollLeft(),this.el.removeClass("fancybox-lock"),n.scrollTop(a).scrollLeft(b));f(".fancybox-overlay").remove().hide();f.extend(this,{overlay:null,fixed:!1})},update:function(){var a="100%",b;this.overlay.width(a).height("100%");I?(b=Math.max(G.documentElement.offsetWidth,G.body.offsetWidth),
p.width()>b&&(a=p.width())):p.width()>n.width()&&(a=p.width());this.overlay.width(a).height(p.height())},onReady:function(a,b){var e=this.overlay;f(".fancybox-overlay").stop(!0,!0);e||this.create(a);a.locked&&(this.fixed&&b.fixed)&&(e||(this.margin=p.height()>n.height()?f("html").css("margin-right").replace("px",""):!1),b.locked=this.overlay.append(b.wrap),b.fixed=!1);!0===a.showEarly&&this.beforeShow.apply(this,arguments)},beforeShow:function(a,b){var e,c;b.locked&&(!1!==this.margin&&(f("*").filter(function(){return"fixed"===
f(this).css("position")&&!f(this).hasClass("fancybox-overlay")&&!f(this).hasClass("fancybox-wrap")}).addClass("fancybox-margin"),this.el.addClass("fancybox-margin")),e=n.scrollTop(),c=n.scrollLeft(),this.el.addClass("fancybox-lock"),n.scrollTop(e).scrollLeft(c));this.open(a)},onUpdate:function(){this.fixed||this.update()},afterClose:function(a){this.overlay&&!b.coming&&this.overlay.fadeOut(a.speedOut,f.proxy(this.close,this))}};b.helpers.title={defaults:{type:"float",position:"bottom"},beforeShow:function(a){var d=
b.current,e=d.title,c=a.type;f.isFunction(e)&&(e=e.call(d.element,d));if(q(e)&&""!==f.trim(e)){d=f('<div class="fancybox-title fancybox-title-'+c+'-wrap">'+e+"</div>");switch(c){case "inside":c=b.skin;break;case "outside":c=b.wrap;break;case "over":c=b.inner;break;default:c=b.skin,d.appendTo("body"),I&&d.width(d.width()),d.wrapInner('<span class="child"></span>'),b.current.margin[2]+=Math.abs(l(d.css("margin-bottom")))}d["top"===a.position?"prependTo":"appendTo"](c)}}};f.fn.fancybox=function(a){var d,
e=f(this),c=this.selector||"",k=function(g){var h=f(this).blur(),j=d,k,l;!g.ctrlKey&&(!g.altKey&&!g.shiftKey&&!g.metaKey)&&!h.is(".fancybox-wrap")&&(k=a.groupAttr||"data-fancybox-group",l=h.attr(k),l||(k="rel",l=h.get(0)[k]),l&&(""!==l&&"nofollow"!==l)&&(h=c.length?f(c):e,h=h.filter("["+k+'="'+l+'"]'),j=h.index(this)),a.index=j,!1!==b.open(h,a)&&g.preventDefault())};a=a||{};d=a.index||0;!c||!1===a.live?e.unbind("click.fb-start").bind("click.fb-start",k):p.undelegate(c,"click.fb-start").delegate(c+
":not('.fancybox-item, .fancybox-nav')","click.fb-start",k);this.filter("[data-fancybox-start=1]").trigger("click");return this};p.ready(function(){var a,d;f.scrollbarWidth===v&&(f.scrollbarWidth=function(){var a=f('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo("body"),b=a.children(),b=b.innerWidth()-b.height(99).innerWidth();a.remove();return b});if(f.support.fixedPosition===v){a=f.support;d=f('<div style="position:fixed;top:20px;"></div>').appendTo("body");var e=20===
d[0].offsetTop||15===d[0].offsetTop;d.remove();a.fixedPosition=e}f.extend(b.defaults,{scrollbarWidth:f.scrollbarWidth(),fixed:f.support.fixedPosition,parent:f("body")});a=f(r).width();J.addClass("fancybox-lock-test");d=f(r).width();J.removeClass("fancybox-lock-test");f("<style type='text/css'>.fancybox-margin{margin-right:"+(d-a)+"px;}</style>").appendTo("head")})})(window,document,jQuery);
// %/
//{{{
// set CSS without changing StyleSheet
var css = store.getTiddlerText("FancyBox2Plugin##StyleSheetFancyBox"),
    shadowName = "StyleSheetFancyBox";
commentRegExp = /\/%%%(.*?)%%%\//g;
css = css.replace(commentRegExp, '/*$1*/');
config.shadowTiddlers[shadowName] = "/*{{{*/\n" + css.substring(4, css.length - 4) + "\n/*}}}*/";
store.addNotification(shadowName, refreshStyles);

// define the macro
config.macros.fancyBox = {};
config.macros.fancyBox.handler = function(place, macroName, params, wikifier, paramString, tiddler) {

	// build a gallery id based on the "hash" of the macro text
	var macroTWcode = wikifier.source.substring(wikifier.matchStart, wikifier.nextMatch),
	    galleryId = macroTWcode.replace(/['"<>\n]/g, "");

	// parse params, build the images' data
	var pParams = paramString.parseParams("image", null, true, false, true),
	    imagesData = [], i, j,
	    images = pParams[0]["image"],
	    forEachImageParams = { "thumb":1, "title":1, "label":1 },
	    align  = getParam(pParams, "align", ""),
	    inline = getParam(pParams, "inline", paramString.match(/\sinline(\s|$)/gm)),
	    float  = getParam(pParams, "float", ""),
	    folder = getParam(pParams, "folder", ""),
	    thumbFolder = getParam(pParams, "thumbFolder", folder),
	    config = getParam(pParams, "config", ""),
	    userGalleryId = getParam(pParams, "galleryId", "");
//# either parse the folder param here or introduce a global txtGalleriesFolder param or both
	galleryId = userGalleryId || galleryId;

	// get global params that define styles for each image/wrapper
	var imagesParamRegExp   =   /images-([\w\-]+)/,
	    wrappersParamRegExp = /wrappers-([\w\-]+)/,
	    removeDashes = function(str) {
		    return str.replace(/-(\w)/g, function($0, $1){ return $1.toUpperCase() });
	    },
	    p, match,
	    imagesParams   = {},
	    wrappersParams = {};
	for(p in pParams[0]) {
		if(match = imagesParamRegExp.exec(p))
			imagesParams[removeDashes(match[1])] = pParams[0][p][0];
		if(match = wrappersParamRegExp.exec(p))
			wrappersParams[removeDashes(match[1])] = pParams[0][p][0];
	}

	// parse fancyBox params from config
	try{ config = eval("(function(){return " + config + "})()") } catch(e) { config="" }

	if(!images) {
		createTiddlyError(place, "wrong macro usage (click here for details)",
			'there should be at least one "image" argument (first anonymous params are also considered as "image"s)');
		return;
	}
	// find the index of the first image param; see if all the "image"s go next
	for(i = 1; i < pParams.length; i++)
		if(pParams[i].name == "image")
			break;
	var allImageParamsGoOneByOne = true;
	for(j = 0; j < images.length; j++)
		if(pParams[i + j].name != "image") {
			allImageParamsGoOneByOne = false;
			break;
		}

	var feiParam, feipValues;
	if(allImageParamsGoOneByOne) {
		for(i = 0; i < images.length; i++)
			imagesData.push({ link: images[i] });

		for(feiParam in forEachImageParams)
			if(feipValues = pParams[0][feiParam])
				for(i = 0; i < feipValues.length; i++)
					if(imagesData[i])
						imagesData[i][feiParam] = feipValues[i];
	} else
		for(j = 0; i < pParams.length; i++) { // i is not reset by intent
			if(pParams[i].name == "image")
				imagesData[j++] = { link: pParams[i].value };

			for(feiParam in forEachImageParams)
				if(pParams[i].name == feiParam)
					imagesData[j - 1][feiParam] = pParams[i].value;
		}

	// create the images, wrappers and other stuff
	var imagesHolder = createTiddlyElement(place, "div", null, "gallery");
	if(inline)
		imagesHolder.style.display = "inline-block";
	if(align)
		imagesHolder.align = align;
	if(float) {
		imagesHolder.style.display = "inline-block";
// doesn't work properly yet
// see the successful solution among tests
		imagesHolder.style.float = float;
	}

	var getFullPath = function(file, folder) {
		if(!folder) return file;
		return folder + "/" + file;
	}
	var imageHolder, image, link, title;
	for(i = 0; i < imagesData.length; i++)
	{
		link = getFullPath(imagesData[i].link, folder);

		imageHolder = createTiddlyElement(imagesHolder, "a", null, "fancybox");
		// work as a gallery, if there's more then one image:
		if(imagesData.length > 1 || userGalleryId)
			imageHolder.setAttribute("data-fancybox-group", galleryId);
		// add href, this is important for proper size setting and images not being hidden:
		imageHolder.setAttribute("href", link);
		title = imagesData[i].label || imagesData[i].title;
		if(title) imageHolder.title = title;

		// "thumbnail" image path or custom html ("html: myHTML")
		var thumb = imagesData[i].thumb,
			htmlMatch = thumb ? /^html:((?:.|\n)+)/mg.exec(thumb) : null,
			html = htmlMatch ? htmlMatch[1] : "";

		if(html) imageHolder.innerHTML = html;
		else {
			image = createTiddlyElement(imageHolder, "img");
			image.src = thumb ? getFullPath(thumb, thumbFolder) : link;

			var setThisHere = function(element, property, value) {
				if(property == "class")
					element.classList.add(value)
				else
					element.style[property] = value;
			};
			for(p in imagesParams)
				setThisHere(image, p, imagesParams[p]);
			for(p in wrappersParams)
				setThisHere(imageHolder, p, wrappersParams[p]);
		}
	}

	// activate fancyBox
	if(imagesData.length > 1 || userGalleryId)
		jQuery('a[data-fancybox-group="' + galleryId + '"]').fancybox(config);
	else
		jQuery(imageHolder).fancybox(config);
};
//}}}
/***
!!!StyleSheetFancyBox
{{{
/%%% ~my additions %%%/
.gallery .fancybox img		{ max-width: 24%; margin-left: 0.5%; margin-right: 0.5%; }

/%%% hacks to fight the StyleSheetColors' a:hover {background-color:[[ColorPalette::PrimaryMid]]; rule (part of a rule): %%%/

.fancybox:hover,
a[class~="fancybox-prev"]:hover,
a[class~="fancybox-next"]:hover	{ background-color:inherit; }
a[class~="fancybox-close"]:hover { background-color: rgba(255, 255, 255, 0); }

/%%%! fancyBox v2.1.5 fancyapps.com | fancyapps.com/fancybox/#license %%%/
/%%% YL modifications: all images were converted to base64 and inserted here %%%/
.fancybox-wrap,
.fancybox-skin,
.fancybox-outer,
.fancybox-inner,
.fancybox-image,
.fancybox-wrap iframe,
.fancybox-wrap object,
.fancybox-nav,
.fancybox-nav span,
.fancybox-tmp
{
    padding: 0;
    margin: 0;
    border: 0;
    outline: none;
    vertical-align: top;
}

.fancybox-wrap {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 8020;
}

.fancybox-skin {
    position: relative;
    background: #f9f9f9;
    color: #444;
    text-shadow: none;
    -webkit-border-radius: 4px;
        -moz-border-radius: 4px;
            border-radius: 4px;
}

.fancybox-opened {
    z-index: 8030;
}

.fancybox-opened .fancybox-skin {
    -webkit-box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        -moz-box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.fancybox-outer, .fancybox-inner {
    position: relative;
}

.fancybox-inner {
    overflow: hidden;
}

.fancybox-type-iframe .fancybox-inner {
    -webkit-overflow-scrolling: touch;
}

.fancybox-error {
    color: #444;
    font: 14px/20px "Helvetica Neue",Helvetica,Arial,sans-serif;
    margin: 0;
    padding: 15px;
    white-space: nowrap;
}

.fancybox-image, .fancybox-iframe {
    display: block;
    width: 100%;
    height: 100%;
}

.fancybox-image {
    max-width: 100%;
    max-height: 100%;
}

#fancybox-loading, .fancybox-close, .fancybox-prev span, .fancybox-next span {
    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAACYCAMAAACoAftQAAAAvVBMVEUAAAAAAAAAAAAODg4AAAAAAAAAAADNzc0BAQHZ2dkDAwMHBwcAAADf398CAgI/Pz8BAQEAAACCgoIcHBzl5eUAAAC/v7/x8fEGBgZnZ2cAAADs7OwGBgb4+Pg/Pz/Jycmenp5nZ2f39/eDg4MAAADQ0ND4+Piurq7a2tr8/Pzs7OwAAAD5+fn9/f3e3t4AAAD///9OTk7BwcE1NTWsrKyNjY2cnJx6enpdXV1oaGgsLCy6uroiIiLOzs5BQUFt3PCNAAAAL3RSTlMAAQMIDRIZHSMnLTpESFNVXWlpbG15en+HiZCWoaGssrO2vsDFydPU3uL4+fr9/Ywv6xsAAAQVSURBVHhe7JZbc6JMGIQXAUOQEMi3uMYkrmopZgqs5ujZ//+zvpdNzMsMlli1N3uRvtCbpzo9I+nmhyqN9OO6GNQ6Ha1SG0mcrhskXe90rvKE6kbX7r9MF4vp2887nfBrqPW0xJemD4w32e7jHIj2602SbNZ7Qfgd0zJLtgKi2B0+tSsE3h8u0RX7HGGfHWrK9oiIbrK69SiQHxTliO5VWtP0rrNEemhoj6muaYqx2XuGyJrwbgUKohhb3hIFM6wCC7Zm4+M5Zs5fpKNiTYndEOUHDFRYCeADLvGiy7DtL7E5/12gJPacalPlqEc2eoFAdmCa2UOGyOhoUuQgwo7PxCwJMGXYGcQMlyCVX3DchCkGs3V6h0iFgyUSZsuS6QQLGaYDhueUHxhf3RpzOqB8dRMcz84lf5FS9A1Ngi2PQm8PF7RBZOnEyqFnSC/BKX6bHQmucpB13mRzCJtTsPUowlpl14if2JifUXcwgeqdA2OLn1C+PdsbzCKkW0a3KeKxbbAxF4FJ9EgAaXGqyFORAuLZNrkMZNoNKnNS9PE5dpltFofjB4PJXIAk5rP/HMu4Ukmm7XjEkwLfc2yT66tJk7lp2T2H1LMtk2wVVsWpcE0SlW4DbeLE/xG3eRvfQv7Fptw4KvpDNRKLt1/3rZty/xbjrPef1+5D018ITYttkiTrfAUsrmzK3RTIT/woHxH3DaZl9h2rRH2aX0ydaYb1BVK1zNdA32RvNn7DkVmmoyeVJvYBMcdl5Vg2/lW0zpSbUNIKT12KLV8wVjsmNvGW63feU3qj86veGQmAA1e5qzbStNZdmVTlRzzbSjG+4+t4u1iqjxxjR6pczaiNBCCVXoGx25X7mUNGgJBHM/QsXWp+dk4U5xJjX4EXSM7ACcCxnnnm2zI8rxVoFgMr/lUwUpyNPvYVx/eRfaUSQzkzLWxEOVhiwynCAd2GvCm/2bquBPEo+LxnDv0YXdyfFOHQP+8EV/kY0enSorxyitoLxxwiabDRqDImWF2JJVBIeVNEk2HgsDGn7vkhcPy67lMOiBGF4AGS3tX8yYqAfb5eF/kRiMPX4cDjEDLd8wezJT4lwtHrMHBtbg6V9oLhYDYLw3A2eSVbn0elSdMCecFg+Ee0Kq7dlftLXSCrRxNE8lzH7hp0Nu3qpHQty7Ztq2sabHvtpb/SLauisVTye1O+N2Ubbxhu2xSAq6x1UwoAWfum8P3Gu5ZNYaUA2jaFJYCofVPYOWnZFD4TcLpxU1ZAnN24KRnfxQ2bshEE/Vub8r0p35vi/t9eHRoBDMNQDJUvMLkOkDMM+8D7b9cR+kOKLPy4juojnQeAkWWVAyLLLINVdovj44N8LOqi/3Djxo0bN5ZvdbWJuwHhrw2ILYdqBwDT2fEEXtrZFmVcCWLiAAAAAElFTkSuQmCC");
}

#fancybox-loading {
    position: fixed;
    top: 50%;
    left: 50%;
    margin-top: -22px;
    margin-left: -22px;
    background-position: 0 -108px;
    opacity: 0.8;
    cursor: pointer;
    z-index: 8060;
}

#fancybox-loading div {
    width: 44px;
    height: 44px;
    background: url("data:image/gif;base64,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") center center no-repeat;
}

.fancybox-close {
    position: absolute;
    top: -18px;
    right: -18px;
    width: 36px;
    height: 36px;
    cursor: pointer;
    z-index: 8040;
}

.fancybox-nav {
    position: absolute;
    top: 0;
    width: 40%;
    height: 100%;
    cursor: pointer;
    text-decoration: none;
    background: transparent url("data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="); /%%% helps IE %%%/
    -webkit-tap-highlight-color: rgba(0,0,0,0);
    z-index: 8040;
}

.fancybox-prev {
    left: 0;
}

.fancybox-next {
    right: 0;
}

.fancybox-nav span {
    position: absolute;
    top: 50%;
    width: 36px;
    height: 34px;
    margin-top: -18px;
    cursor: pointer;
    z-index: 8040;
    visibility: hidden;
}

.fancybox-prev span {
    left: 10px;
    background-position: 0 -36px;
}

.fancybox-next span {
    right: 10px;
    background-position: 0 -72px;
}

.fancybox-nav:hover span {
    visibility: visible;
}

.fancybox-tmp {
    position: absolute;
    top: -99999px;
    left: -99999px;
    max-width: 99999px;
    max-height: 99999px;
    overflow: visible !important;
}

/%%% Overlay helper %%%/

.fancybox-lock {
    overflow: visible !important;
    width: auto;
}

.fancybox-lock body {
    overflow: hidden !important;
}

.fancybox-lock-test {
    overflow-y: hidden !important;
}

.fancybox-overlay {
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    display: none;
    z-index: 8010;
    background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpCMEM4NDgzQjlDRTNFMTExODE4NUVDOTdFQ0I0RDgxRSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpGREU5OEVCQzAzMjYxMUUyOTg5OURDMDlDRTJDMTc0RSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpGREU5OEVCQjAzMjYxMUUyOTg5OURDMDlDRTJDMTc0RSIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkIxQzg0ODNCOUNFM0UxMTE4MTg1RUM5N0VDQjREODFFIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkIwQzg0ODNCOUNFM0UxMTE4MTg1RUM5N0VDQjREODFFIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+s3YRAQAAABtJREFUeNpiFODh2cBABGBiIBKMKqSOQoAAAwBokQDs5F/8FAAAAABJRU5ErkJggg==");
}

.fancybox-overlay-fixed {
    position: fixed;
    bottom: 0;
    right: 0;
}

.fancybox-lock .fancybox-overlay {
    overflow: auto;
    overflow-y: scroll;
}

/%%% Title helper %%%/

.fancybox-title {
    visibility: hidden;
    font: normal 13px/20px "Helvetica Neue",Helvetica,Arial,sans-serif;
    position: relative;
    text-shadow: none;
    z-index: 8050;
}

.fancybox-opened .fancybox-title {
    visibility: visible;
}

.fancybox-title-float-wrap {
    position: absolute;
    bottom: 0;
    right: 50%;
    margin-bottom: -35px;
    z-index: 8050;
    text-align: center;
}

.fancybox-title-float-wrap .child {
    display: inline-block;
    margin-right: -100%;
    padding: 2px 20px;
    background: transparent; /%%% Fallback for web browsers that doesn't support RGBa %%%/
    background: rgba(0, 0, 0, 0.8);
    -webkit-border-radius: 15px;
        -moz-border-radius: 15px;
            border-radius: 15px;
    text-shadow: 0 1px 2px #222;
    color: #FFF;
    font-weight: bold;
    line-height: 24px;
    white-space: nowrap;
}

.fancybox-title-outside-wrap {
    position: relative;
    margin-top: 10px;
    color: #fff;
}

.fancybox-title-inside-wrap {
    padding-top: 10px;
}

.fancybox-title-over-wrap {
    position: absolute;
    bottom: 0;
    left: 0;
    color: #fff;
    padding: 10px;
    background: #000;
    background: rgba(0, 0, 0, .8);
}

/%%%Retina graphics!%%%/
@media only screen and (-webkit-min-device-pixel-ratio: 1.5),
        only screen and (min--moz-device-pixel-ratio: 1.5),
        only screen and (min-device-pixel-ratio: 1.5){

    #fancybox-loading, .fancybox-close, .fancybox-prev span, .fancybox-next span {
        background-image: url("data:image/png;base64,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");
        background-size: 44px 152px; /%%%The size of the normal image, half the size of the hi-res image%%%/
    }

    #fancybox-loading div {
        background-image: url("data:image/gif;base64,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");
        background-size: 24px 24px; /%%%The size of the normal image, half the size of the hi-res image%%%/
    }
}
}}}
!!!
***/
