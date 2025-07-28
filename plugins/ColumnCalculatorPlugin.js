/***
|Name|ColumnCalculatorPlugin|
|Source|http://www.TiddlyTools.com/#ColumnCalculatorPlugin|
|Version|0.6.2|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|calculate values from table cells in a column|
|Status| ALPHA - USE AT YOUR OWN RISK |
!!!Usage
<<<
{{{<<columncalc function startrow endrow>>}}}
where:
*''function'' is a keyword that specifies the type of calculation to perform:
** ''total'' or ''sum'' or //no param//<br>adds up values for cells above it in the column
** ''count''<br>number of non-empty cells in column
** ''average'' or ''avg''<br>average of cells in column (i.e., total/count)
* ''all'' (optional)<br>normally, only cells containing numbers or timestamps (hh:mm:ss) are included in the calculations.  The ''all'' keyword allows text or empty cells to be processed as if they contained a "0".
* ''startrow'',''endrow'' (optional)<br>specifies a ONE-based range of rows for limiting the calculation.  Use negative numbers to specify an offset from the current row (e.g., {{{<<calc sum 3 5>>}}} adds up rows 3, 4 and 5, while {{{<<calc sum 1 -1>>}}} adds up all numbers in the column excluding the current row (i.e., the same as the default if no startrow/endrow params are specified)
<<<
!!!Examples
<<<
''with numeric values...''
{{{
| foo| 3.2 |
| bar| 1.1 |
| baz| 2.9 |
| gronk| 4.3 |
| snork| non-number |
| count| <<columncalc count all 1 -1>> |
| total| <<columncalc sum all 1 -2>> |
| avg| <<columncalc average all 1 -3>> |
}}}
| foo| 3.2 |
| bar| 1.1 |
| baz| 2.9 |
| gronk| 4.3 |
| snork| non-number |
| count| <<columncalc count all 1 -1>> |
| total| <<columncalc sum all 1 -2>> |
| avg| <<columncalc average all 1 -3>> |

''with time-formatted values (hh:mm:ss)...''
{{{
| foo| 00:22:15 |
| bar| 00:03:30 |
| baz| 00:01:45 |
| count| <<columncalc count 1 -1>> |
| total| <<columncalc sum 1 -2>> |
| avg| <<columncalc average 1 -3>> |
}}}
| foo| 00:22:15 |
| bar| 00:03:30 |
| baz| 00:01:45 |
| count| <<columncalc count 1 -1>> |
| total| <<columncalc sum 1 -2>> |
| avg| <<columncalc average 1 -3>> |
<<<
!!!Revisions
<<<
2009.02.05 [0.6.2] added 'all' param to include empty/text rows in calculations.
2007.10.26 [0.6.1] in handler(), using '.textContent' instead of '.innerHTML' when reading values from table cells.  This allows use of values that are transcluded from slices in other tiddlers using the {{{<<tiddler 'TiddlerName::slicename'>>}}} syntax.
2007.06.29 [0.6.0] added support for handling values in hh:mm:ss format
2007.04.02 [0.5.0] started
<<<
!!!!!Code
***/
//{{{
version.extensions.ColumnCalculatorPlugin= {major: 0, minor: 6, revision: 1, date: new Date(2007,10,26)};
config.macros.columncalc= {
	handler:
	function(place,macroName,params,wikifier,paramString,tiddler) {

		if (place.parentNode.nodeName.toLowerCase()!='tr') return false; // not in a table
		var tbody=place.parentNode.parentNode;
		var row=tbody.childNodes.length-1; // current row #
		var col=place.parentNode.childNodes.length-1; // current column #

		var fn=params.shift();
		var allCells=(params[0]&&params[0].toLowerCase()=='all');
		if (allCells) params.shift();
		var startrow=0; var endrow=row-1;
		if (params[0]) var startrow=params.shift();
		if (startrow<0) startrow=1*startrow+row; else startrow=startrow-1;
		if (params[0]) var endrow=params.shift();
		if (endrow<0) endrow=1*endrow+row; else endrow=endrow-1;

		var count=total=0;
		for (r=startrow; r<=endrow; r++) {
			var cell=tbody.childNodes[r].childNodes[col].textContent;
			if (!cell) cell=tbody.childNodes[r].childNodes[col].innerHTML; // fallback for older browsers
			var val=cell; var hms=cell.split(':');
			if (hms.length==3) { // an hh:mm:ss time value
				var val=(hms[0]||0)*3600+(hms[1]||0)*60+(hms[2]||0)*1;
				var showTime=true; // use time formatting for results...
			}
			else if (cell.length && !isNaN(cell)) // a numeric value
				var val=eval(cell);
			else if (allCells) // an non-numeric cell (when 'all' is used)
				var val=0;
			if (!isNaN(val)) { total+=val; count++; }
		}
		switch (fn) {
			case 'count':
				var result=count;
				break;
			case 'average':
			case 'avg':
				var result=Math.floor(total/count*100)/100; // truncate to two decimal places
				break;
			case 'total':
			case 'sum':
			default:
				var result=total;
				break;
		}
		if (showTime && fn!='count') {
			var h=Math.floor(result/3600);
			var m=Math.floor((result-h*3600)/60);
			var s=Math.floor((result-h*3600-m*60)*100)/100; // truncate to two decimal places
			result=(h<10?'0':'')+h+':'+(m<10?'0':'')+m+':'+(s<10?'0':'')+s;
		}
		createTiddlyText(place,result);
	}
}
//}}}