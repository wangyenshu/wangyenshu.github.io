/***
|Name|DeleteAllTaggedPlugin|
|Source|http://ido-xp.tiddlyspot.com/#DeleteAllTaggedPlugin|
|Version|1.0|

An adaptation of DeleteDoneTasks (Simon Baird) by Ido Magal
To use this insert {{{<<deleteAllTagged>>}}} into the desired tiddler.

/***
Example usage:
{{{<<deleteAllTagged>>}}}
<<deleteAllTagged>>
***/
//{{{

config.macros.deleteAllTagged = {
	handler: function ( place,macroName,params,wikifier,paramString,tiddler ) {
		var buttonTitle = "Delete Tagged w/ '"+tiddler.title+"'";
		createTiddlyButton( place, buttonTitle, "Delete every tiddler tagged with '"+tiddler.title+"'", this.deleteAllTagged( tiddler.title ));
	},

	deleteAllTagged: function(tag) {
		return function() {
			var collected = [];
			store.forEachTiddler( function ( title,tiddler ) {
				if ( tiddler.tags.contains( tag ))
				{
					collected.push( title );
				}
			});
			if ( collected.length == 0 )
			{
				alert( "No tiddlers found tagged with '"+tag+"'." );
			}
			else
			{
				if ( confirm( "These tiddlers are tagged with '"+tag+"'\n'"
						+ collected.join( "', '" ) + "'\n\n\n"
						+ "Are you sure you want to delete these?" ))
				{
					for ( var i=0;i<collected.length;i++ )
					{
						store.deleteTiddler( collected[i] );
						displayMessage( "Deleted '"+collected[i]+"'" );
					}
				}
			}
		}
	}
};

//}}}