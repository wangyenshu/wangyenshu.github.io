/***
|Name        |RSSReaderFeedrPlugin|
|Description |Read and render RSS feeds using feedr.|
|Source      |https://github.com/wangyenshu/RSSReaderFeedrPlugin/blob/main/RSSReaderFeedrPlugin.js|
|Version     |0.1|
|Author      |Yanshu Wang|
|License     |MIT|
|~CoreVersion|2.x|
|Type        |plugin|
!!!!!Documentation
The first parameter is the feed url, the second parameter is the template for displaying.
By default, it uses the server https://www.feedrapp.info. For selfhosting, see https://feedrapp.info/hosting.
{{{
<<rssReader "http://feeds.feedburner.com/premiumpixels" "<li><a href='{url}'>[{author}@{date}] {title}</a><br/>{teaserImage}{shortBodyPlain}</li>">>
}}}
<<rssReader "http://feeds.feedburner.com/premiumpixels" "<li><a href='{url}'>[{author}@{date}] {title}</a><br/>{teaserImage}{shortBodyPlain}</li>">>
!!!!!Credit
https://github.com/sdepold/feedrapp
!!!!!Code
***/
//{{{
config.macros.rssReader = {
    dateFormat: "MMM DD, YYYY",
    handler: function(place, macroName, params, wikifier, paramString, tiddler) {
        // Get the feed URL (first parameter) or default.
        var feedURL = params[0] || "http://feeds.feedburner.com/premiumpixels";
        // Get the entry template (second parameter) or default.
        var entryTemplate = params[1] || "<li><a href='{url}'>[{author}@{date}] {title}</a><br/>{teaserImage}{shortBodyPlain}</li>";
        
        // Create a container for the RSS feed.
        var container = document.createElement("div");
        container.id = "rssReaderContainer_" + new Date().getTime();
        container.style.margin = "10px";
        container.style.padding = "10px";
        container.style.border = "1px solid #ccc";
        place.appendChild(container);
        
        // Utility: Load a script dynamically.
        function loadScript(src, id, callback) {
            if (!document.getElementById(id)) {
                var script = document.createElement("script");
                script.id = id;
                script.src = src;
                script.onload = callback;
                document.head.appendChild(script);
            } else {
                callback();
            }
        }
        
        // Load jQuery 1.6.4, then Moment.js 2.8.4, then jquery.rss plugin.
        loadScript("https://code.jquery.com/jquery-1.6.4.min.js", "jquery_1.6.4", function() {
            loadScript("https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.4/moment.min.js", "moment_2.8.4", function() {
                loadScript("https://cdnjs.cloudflare.com/ajax/libs/jquery-rss/4.3.0/jquery.rss.min.js", "jquery_rss", function() {
                    // Give jquery.rss a short delay to ensure it has attached.
                    setTimeout(function() {
                        $(container).rss(feedURL, {
                            entryTemplate: entryTemplate,
                            ssl: true,
                            limit: 10,
                            dateFormat: config.macros.rssReader.dateFormat
                        });
                    }, 100);
                });
            });
        });
    }
};
//}}}