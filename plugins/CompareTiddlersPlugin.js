/***
|Name|CompareTiddlersPlugin|
|Source|http://www.TiddlyTools.com/#CompareTiddlersPlugin|
|Version|1.1.0|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|show color-coded differences between two selected tiddlers|
!!!!!Usage
<<<
Display a form that lets you select and compare any two tiddlers:
{{{
<<compareTiddlers>>
}}}
To filter the lists of tiddlers by tags, include an optional tagvalue (or tag expression) parameter:
{{{
<<compareTiddlers "tagValue">>
   OR
<<compareTiddlers "boolean tag expression">> (requires MatchTagsPlugin)
}}}
<<<
!!!!!Example
<<<
{{{<<compareTiddlers>>}}}
{{smallform small{<<compareTiddlers>>}}}
<<<
!!!!!Revisions
<<<
2009.07.25 [1.1.0] added optional tag filter param
2007.10.15 [1.0.0] converted from inline script to true plugin
2006.12.27 [0.0.0] inline script.  {{{diff()}}} and {{{diffString()}}} functions written by Bradley Meck.
<<<
!!!!!Code
***/
//{{{
version.extensions.CompareTiddlersPlugin= {major: 1, minor: 1, revision: 0, date: new Date(2009,7,25)};
//}}}
//{{{
config.shadowTiddlers.CompareTiddlers='<<compareTiddlers>>';
//}}}
/***
//{{{
!html
<form><!--
--><input type=hidden name=filter value=''><!--
--><select name=list1 size=1 style='width:30%'
	onchange='config.macros.compareTiddlers.pick(this,this.form.view1,this.form.edit1,this.form.text1)'></select><!--
--><input type=button name=view1 style='width:10%' value='view' disabled
	onclick='if (this.form.list1.value.length)
		story.displayTiddler(story.findContainingTiddler(this),this.form.list1.value)'><!--
--><input type=button name=edit1 style='width:10%' value='edit' disabled
	onclick='if (this.form.list1.value.length)
		story.displayTiddler(story.findContainingTiddler(this),this.form.list1.value,DEFAULT_EDIT_TEMPLATE)'><!--
--><select name=list2 size=1 style='width:30%'
	onchange='config.macros.compareTiddlers.pick(this,this.form.view2,this.form.edit2,this.form.text2)'></select><!--
--><input type=button name=view2 style='width:10%' value='view' disabled
	onclick='if (this.form.list2.value.length)
		story.displayTiddler(story.findContainingTiddler(this),this.form.list2.value)'><!--
--><input type=button name=edit2 style='width:10%' value='edit' disabled
	onclick='if (this.form.list2.value.length)
		story.displayTiddler(story.findContainingTiddler(this),this.form.list2.value,DEFAULT_EDIT_TEMPLATE)'><br><!--
--><nobr><!--
--><textarea name=text1 style='width:49.5%;display:none' rows='10' readonly></textarea><!--
--><textarea name=text2 style='width:49.5%;display:none' rows='10' readonly></textarea><!--
--></nobr><!--
--><div style='float:left'><!--
-->Additions are shown in <span style='color:green'>GREEN</span>, <!--
-->deletions are shown in <span style='color:red'>RED</span><!--
--></div><!--
--><div style='text-align:right'><!--
--><input type=button name=compare style='width:10%' value='compare' disabled
	onclick='config.macros.compareTiddlers.compare(this.form,this.form.nextSibling)'><!--
--><input type=button name=done style='width:10%' value='done' disabled
	onclick='config.macros.compareTiddlers.reset(this.form,this.form.nextSibling)'><!--
--></div><!--
--></form><div class='compareTiddlersResults'>contents to be replaced by results of comparison</div>
!end
//}}}
***/
//{{{
config.macros.compareTiddlers= {
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		setStylesheet(this.css,'CompareTiddlersStyles');
		var out=createTiddlyElement(place,'span');
		out.innerHTML=store.getTiddlerText('CompareTiddlersPlugin##html');
		var form=out.getElementsByTagName('form')[0];
		var target=form.nextSibling;
		this.reset(form,target,params[0]);
	},
	css: '.compareTiddlersResults \
		{ display:none;clear:both;margin-top:1em;border:1px solid;-moz-border-radius:1em;-webkit-border-radius:1em;padding:1em;white-space:normal; }',
	reset: function(f,target,filter) {
		if (f.filter.value.length) var filter=f.filter.value;
		if (filter) var tids=store.filterTiddlers('[tag['+filter+']]')
		else var tids=store.getTiddlers('title','excludeLists');
		f.text1.style.display='none'; f.text1.value='';
		while (f.list1.options[0]) f.list1.options[0]=null; 
		f.list1.options[0]=new Option('select a tiddler...','',false,false);
		for (i=0; i<tids.length; i++)
			f.list1.options[f.list1.length]=new Option(tids[i].title,tids[i].title,false,false);
		f.text2.style.display='none'; f.text2.value='';
		while (f.list2.options[0]) f.list2.options[0]=null; 
		f.list2.options[0]=new Option('select a tiddler...','',false,false);
		for (i=0; i<tids.length; i++)
			f.list2.options[f.list2.length]=new Option(tids[i].title,tids[i].title,false,false);
		f.view1.disabled=f.view2.disabled=f.edit1.disabled=f.edit2.disabled=f.compare.disabled=f.done.disabled=true;
		f.filter.value=filter;
		target.style.display='none';
		removeChildren(target);
	},
	pick: function(list,view,edit,text) {
		var f=list.form;
		view.disabled=edit.disabled=f.done.disabled=!list.value.length;
		f.compare.disabled=!f.list1.value.length||!f.list2.value.length;
		if (!list.value.length) return;
		f.text1.style.display=f.text2.style.display='inline';
		text.value=store.getTiddlerText(list.value);
	},
	compare: function(f,target) {
		if (!f.list1.value.length) { f.list1.focus(); return alert('select a tiddler'); }
		var t1=store.getTiddlerText(f.list1.value); if (!t1) { displayMessage(f.list1.value+' not found');return false; }
		if (!f.list2.value.length) { f.list2.focus(); return alert('select a tiddler'); }
		var t2=store.getTiddlerText(f.list2.value); if (!t2) { displayMessage(f.list2.value+' not found');return false; }
		var out=this.diffString(t1,t2); if (!out || !out.length) out='no differences';
		removeChildren(target);
		target.innerHTML=out;
		target.style.display='block';
		f.done.disabled=false;
	},
//}}}
//{{{
	diffString: function( o, n ) {
		// This function was written by Bradley Meck
		// returns difference between old and new text, color-formatted additions and deletions
		if (o==n) return ""; // simple check, saves time if true
		var error = 5;
		var reg = new RegExp( "\\n|(?:.{0,"+error+"})", "g" );
		var oarr = o.match( reg ); // dices text into chunks
		var narr = n.match( reg );
		var out = this.diff(oarr,narr); // compare the word arrays
		var str = ""; // construct output
		for (i=0; i<out.length; i++) {
			switch (out[i].change) {
				case "ADDED":
					str+="<span style='color:green'>";
					str+=narr.slice(out[i].index,out[i].index+out[i].length).join("");
					str+="</span> ";
					break;
				case "DELETED":
					str+="<span style='color:red'>";
					str+=oarr.slice(out[i].index,out[i].index+out[i].length).join("");
					str+="</span> ";
					break;
				default:
					str+="<span>";
					str+=oarr.slice(out[i].index,out[i].index+out[i].length).join("");
					str+="</span> ";
					break;
			}	
		}
		return str;
	},
	diff: function( oldArray, newArray ) {
		// This function was written by Bradley Meck
		// finds the differences between one set of objects and another.
		// The objects do not need to be Strings.  It outputs an array of objects with the properties value and change.
		// This function is pretty hefty but appears to be rather light for a diff and tops out at O(N^2) for absolute worst cast scenario.
		var newElementHash = { };
		for( var i = 0; i < newArray.length; i++ ) {
			if( ! newElementHash [ newArray [ i ] ] ) {
				newElementHash [ newArray [ i ] ] = [ ];
			}
			newElementHash [ newArray [ i ] ].push( i );
		}
		var substringTable = [ ];
		for( var i = 0; i < oldArray.length; i++ ) {
			if(newElementHash [ oldArray [ i ] ] ) {
				var locations = newElementHash [ oldArray [ i ] ] ;
				for( var j = 0; j < locations.length; j++){
					var length = 1;
					while( i + length < oldArray.length && locations [ j ] + length < newArray.length
						&& oldArray [ i + length ] == newArray [ locations [ j ] + length ] ){
						length++;
					}
					substringTable.push( {
						oldArrayIndex : i,
						newArrayIndex : locations [ j ],
						matchLength : length
					} );
				}
			}
		}
		substringTable.sort( function( a, b ) {
			if ( a.matchLength > b.matchLength /* a is less than b by some ordering criterion */ ) {
				return -1;
			}
			if ( a.matchLength < b.matchLength /* a is greater than b by the ordering criterion */ ) {
				return 1;
			}
			// a must be equal to b
			return 0
		} );
		//displayMessage( substringTable.toSource( ) );
		for( var i = 0; i < substringTable.length; i++) {
			for( var j = 0; j < i; j++) {
				var oldDelta = substringTable [ i ].oldArrayIndex + substringTable [ i ].matchLength - 1 - substringTable [ j ].oldArrayIndex;
				var newDelta = substringTable [ i ].newArrayIndex + substringTable [ i ].matchLength - 1 - substringTable [ j ].newArrayIndex;
				//displayMessage( "oldDelta ::: " + oldDelta );
				//displayMessage( "newDelta ::: " + newDelta );
				//displayMessage( "matchLength ::: " + substringTable [ j ].matchLength );
				if( ( oldDelta >= 0 && oldDelta <= substringTable [ j ].matchLength )
				|| ( newDelta >= 0 && newDelta <= substringTable [ j ].matchLength )
				|| ( oldDelta < 0 && newDelta > 0 )
				|| ( oldDelta > 0 && newDelta < 0 ) ) {
					substringTable.splice( i, 1 );
					i--;
					break;
				}
			}
		}
		//displayMessage( substringTable.toSource(  ) );
		substringTable.sort( function( a, b ) {
			if ( a.oldArrayIndex < b.oldArrayIndex /* a is less than b by some ordering criterion */ ) {
				return -1;
			}
			if ( a.oldArrayIndex > b.oldArrayIndex /* a is greater than b by the ordering criterion */ ) {
				return 1;
			}
			// a must be equal to b
			return 0
		} );
		//displayMessage( substringTable.toSource( ) );
		var oldArrayIndex = 0;
		var newArrayIndex = 0;
		var results = [ ];
		for( var i = 0; i < substringTable.length; i++ ) {
			if( oldArrayIndex != substringTable [ i ].oldArrayIndex ) {
				results.push( {
					change : "DELETED",
					length : substringTable [ i ].oldArrayIndex - oldArrayIndex,
					index : oldArrayIndex
				} );
			}
			if( newArrayIndex != substringTable [ i ].newArrayIndex ) {
				results.push( {
					change : "ADDED",
					length : substringTable [ i ].newArrayIndex - newArrayIndex,
					index : newArrayIndex
				} );
			}
			results.push( {
				change : "STAYED",
				length : substringTable [ i ].matchLength,
				index : substringTable [ i ].oldArrayIndex
			} );
			oldArrayIndex = substringTable [ i ].oldArrayIndex + substringTable [ i ].matchLength;
			newArrayIndex = substringTable [ i ].newArrayIndex + substringTable [ i ].matchLength;
		}
		if( oldArrayIndex != oldArray.length ) {
			results.push( {
				change : "DELETED",
				length : oldArray.length - oldArrayIndex,
				index : oldArrayIndex
			} );
		}
		if( newArrayIndex != newArray.length ) {
			results.push( {
				change : "ADDED",
				length : newArray.length - newArrayIndex,
				index : newArrayIndex
			} );
		}
		return results;
	}
}
//}}}