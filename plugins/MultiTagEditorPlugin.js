/***
|''Name:''|MultiTagEditorPlugin|
|''Version:''|0.2.0 (Dec 29, 2006)|
|''Source:''|http://ido-xp.tiddlyspot.com/#MultiTagEditorPlugin|
|''Author:''|Ido Magal (idoXatXidomagalXdotXcom)|
|''Licence:''|[[BSD open source license]]|
|''CoreVersion:''|2.1.0|
|''Browser:''|??|

!Description
This plugin enables the addition and deletion of tags from sets of tiddlers.

!Installation instructions
*Create a new tiddler in your wiki and copy the contents of this tiddler into it.  Name it the same and tag it with "systemConfig".
*Save and reload your wiki.
*Use it here [[MultiTagEditor]].

!Revision history
* v0.2.0 (Dec 29, 2006)
** Added Selection column that allows excluding tiddlers.
* v0.1.0 (Dec 27, 2006)
** First draft.

!To Do
* Clean up text strings.
* Figure out how to store selection so it isn't reset after every action.
* Prettify layout.

!Code
***/
//{{{

merge(config.shadowTiddlers,
{
	MultiTagEditor:[
	"<<MTE>>",
	""
	].join("\n")
});

config.macros.MTE =
{
	AddToListLabel : "Add to List",
	AddToListPrompt : "Add Tiddlers to the List",
	listViewTemplate :
	{
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Title', field: 'title', tiddlerLink: 'title', title: "Title", type: 'TiddlerLink'},
			{name: 'Snippet', field: 'text', title: "Snippet", type: 'String'},
			{name: 'Tags', field: 'tags', title: "Tags", type: 'Tags'}
			],
		rowClasses: [
			],
		actions: [
			//{caption: "More actions...", name: ''},
			//{caption: "Remove selected tiddlers from list", name: 'delete'}
			]
	},
	tiddlers : [],
	HomeSection : [],
	ListViewSection : [],
	AddToListSection : [],
	
	handler : function( place, macroName, params, wikifier, paramString, tiddler )
	{
		this.HomeSection = place;
		var newsection = createTiddlyElement( null, "div", null, "MTE_AddTag" );
		createTiddlyText(newsection, "Tiddler Tags to edit: ");
		var input = createTiddlyElement( null, "input", null, "txtOptionInput" );
		input.type = "text";
		input.size = 50;
		newsection.appendChild( input );
		newsection.inputBox = input;
		createTiddlyButton( newsection, this.AddToListLabel, this.AddToListPrompt, this.onAddToList, null, null, null );
		createTiddlyButton( newsection, "Clear List", this.addtoListPrompt, this.onClear, null, null, null );
		createTiddlyElement( newsection, "br" );
		createTiddlyElement( newsection, "br" );
		this.AddToListSection = newsection;
	        this.HomeSection.appendChild( newsection );

		newsection = createTiddlyElement( null, "div", null, "MTE_addtag" );
		createTiddlyButton( newsection, "Add Tag", "Add tag to all listed tiddlers", this.onAddTag, null, null, null );
		var input = createTiddlyElement( null, "input", null, "txtOptionInput" );
		input.type = "text";
		input.size = 50;
		newsection.appendChild( input );
		newsection.inputBox = input;
		createTiddlyElement( newsection, "br" );
		this.AddTagSection = newsection;
	        this.HomeSection.appendChild( newsection );

		newsection = createTiddlyElement( null, "div", null, "MTE_removetag" );
		createTiddlyButton( newsection, "Remove Tag", "Remove tag from all listed tiddlers", this.onRemoveTag, null, null, null );
		var input = createTiddlyElement( null, "input", null, "txtOptionInput" );
		input.type = "text";
		input.size = 50;
		newsection.appendChild( input );
		newsection.inputBox = input;
		createTiddlyElement( newsection, "br" );
		this.RemoveTagSection = newsection;
	        this.HomeSection.appendChild( newsection );

		this.ListViewSection = createTiddlyElement( null, "div", null, "MTE_listview" );
		this.HomeSection.appendChild( this.ListViewSection );
		ListView.create( this.ListViewSection, this.tiddlers, this.listViewTemplate, null );

	},


	ResetListView : function()
	{
		ListView.forEachSelector( config.macros.MTE.ListViewSection, function( e, rowName )
		{
			if( e.checked )
			{
				var title = e.getAttribute( "rowName" );
				var tiddler = config.macros.MTE.tiddlers.findByField( "title", title );
				tiddler.Selected = 1;
			}
		});
		config.macros.MTE.HomeSection.removeChild( config.macros.MTE.ListViewSection );
		config.macros.MTE.ListViewSection = createTiddlyElement( null, "div", null, "MTE_listview" );
		config.macros.MTE.HomeSection.appendChild( config.macros.MTE.ListViewSection );
		ListView.create( config.macros.MTE.ListViewSection, config.macros.MTE.tiddlers, config.macros.MTE.listViewTemplate, config.macros.MTE.onSelectCommand);
	},

	onAddToList : function()
	{
		store.forEachTiddler( function ( title, tiddler )
		{
			var tags = config.macros.MTE.AddToListSection.inputBox.value.readBracketedList();
			if (( tiddler.tags.containsAll( tags ))  && ( config.macros.MTE.tiddlers.findByField( "title", title ) == null ))
			{
				var t = store.getTiddlerSlices( title, ["Name", "Description", "Version", "CoreVersion", "Date", "Source", "Author", "License", "Browsers"] );
				t.title = title;
				t.tiddler = tiddler;
				t.text = tiddler.text.substr(0,50);
				t.tags = tiddler.tags;
				config.macros.MTE.tiddlers.push(t);
			}
		});
		config.macros.MTE.ResetListView();
	},

	onClear : function()
	{
		config.macros.MTE.tiddlers = [];
		config.macros.MTE.ResetListView();
	},

	onAddTag : function( e )
	{
		var selectedRows = [];
		ListView.forEachSelector(config.macros.MTE.ListViewSection, function( e, rowName )
		{
			if( e.checked )
				selectedRows.push( e.getAttribute( "rowName" ));
		});
		var tag = config.macros.MTE.AddTagSection.inputBox.value;
		for(t=0; t < config.macros.MTE.tiddlers.length; t++)
		{
			if ( selectedRows.indexOf( config.macros.MTE.tiddlers[t].title ) != -1 )
				store.setTiddlerTag( config.macros.MTE.tiddlers[t].title, true, tag);
		}
		config.macros.MTE.ResetListView();
	},

	onRemoveTag : function( e )
	{
		var selectedRows = [];
		ListView.forEachSelector(config.macros.MTE.ListViewSection, function( e, rowName )
		{
			if( e.checked )
				selectedRows.push( e.getAttribute( "rowName" ));
		});
		var tag = config.macros.MTE.RemoveTagSection.inputBox.value;
		for(t=0; t < config.macros.MTE.tiddlers.length; t++)
		{
			if ( selectedRows.indexOf( config.macros.MTE.tiddlers[t].title ) != -1 )
				store.setTiddlerTag( config.macros.MTE.tiddlers[t].title, false, tag);
		}
		config.macros.MTE.ResetListView();
	}

};
//}}}