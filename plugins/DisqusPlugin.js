/***
|Author |Yakov Litvin|
|Version|0.3.0|
* incompatible with 0.0.1 (mode param was removed, other params were renamed)
* todo: move defaults to ~config
* optionally: allow to display comments automatically for all tiddlers that match the filter in config (see bimlas.github.io/tw5-disqus/)
<<disqus thread:"another test page">>
<<disqus thread:"second test page">>
***/
//{{{

config.macros.disqus = {
	mountThread: function(container, shouldSubstituteContainer, forumName, threadId, threadUrl) {
		// adapted from github.com/bimlas/tw5-disqus/blob/master/plugins/disqus/macro/comments.js
		const loaderScriptId = "DISQUS-LOADER"
		const currentLoaderScript = document.getElementById(loaderScriptId)
		if(currentLoaderScript !== null) (document.head || document.body).removeChild(currentLoaderScript)

		// D script updates the first element with this id on load and ignores others
		const commentsElementId = "disqus_thread"
		const threadDivClass = "disqus_thread" // not needed really
		const $prevCommentsElement = jQuery("#" + commentsElementId)
		if($prevCommentsElement[0]) { // maybe use while instead
			const oldUrl = $prevCommentsElement.data("thread").url
			const oldId = $prevCommentsElement.data("thread").id
			const btn = jQuery("<a class=button>show comments</a>")
			.data("thread", { url: oldUrl, id: oldId })
			btn.on("click", () => {
				// * forumName – pass via .data as well?
				config.macros.disqus.mountThread(btn, true, forumName, oldId, oldUrl)
			})
			$prevCommentsElement.replaceWith(btn)
		}
		const $thread = jQuery("<div></div>").addClass(threadDivClass).attr("id", commentsElementId)
			.data("thread", { url: threadUrl, id: threadId })
		shouldSubstituteContainer ? jQuery(container).replaceWith($thread) : $thread.appendTo(container)

		window.disqus_config = function () {
			// see more at https://help.disqus.com/customer/en/portal/articles/2158629
			if(threadUrl) this.page.url = threadUrl;
			this.page.identifier = threadId;
		}

		;(function() {
			const loaderScript = document.createElement('script');
			loaderScript.src = 'https://' + forumName + '.disqus.com/embed.js';
			loaderScript.id = loaderScriptId;
			loaderScript.setAttribute('data-timestamp', +new Date());
			(document.head || document.body).appendChild(loaderScript);
		})()		
	},
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		const isLocal = window.isLocal || function() { return (document.location.protocol == "file:") }
		if(isLocal()) return

		const pParams = paramString.parseParams("anon", null, true, false, true)
		// forum shortname, also known as disqus_shortname
		// TODO: add a config for the default value instead of a hardcoded value for my personal usage
		const forumShortname = getParam(pParams, "forum", "wys-2")
		// also known as disqus_identifier
		// TODO: deduce default from tiddler.title instead
		const threadId = getParam(pParams, "thread", "first test page")
		// used for permalinking purposes, also known as disqus_url
		// TODO: deduce default from tiddler.title and TW permalink functionality
		const url = getParam(pParams, "url", "")

		this.mountThread(place, false, forumShortname, threadId, url)
	}
};
//}}}