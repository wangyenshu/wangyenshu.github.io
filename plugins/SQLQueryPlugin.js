/***
|''Name:''|SQLQueryPlugin|
|''Version:''|0.1|
|''Source''|http://jackparke.googlepages.com/jtw.html#SQLQueryPlugin ([[del.icio.us|http://del.icio.us/post?url=http://jackparke.googlepages.com/jtw.html%23SQLQueryPlugin]])|
|''Author:''|[[Jack]]|

!Description
Query a SQL database (defined in [[SQLConfig]]) and display results in a tiddler. See [[SQLExamples]].
See http://www.connectionstrings.com for connection strings examples.

!Usage
{{{<<SQLQuery sql:"SELECT * FROM Products">>}}}

!Advanced Usage
{{{<<SQLQuery sql:"SELECT * FROM Products" connection:pubs rowstart:"*" colsep:"," rowend:{{\n}} headerstart:!>>}}}

!Configuration
Define all database connection strings (ADO) in the [[SQLConfig]] tiddler.
Example:
{{{
Northwind: DRIVER={SQL Server};SERVER=(local);DATABASE=Northwind;
pubs: DRIVER={SQL Server};SERVER=(local);DATABASE=pubs;
CompanyContacts: DRIVER={SQL Server};SERVER=MyCompanyServer;DATABASE=Contacts;UID=sa;pwd=admin;
}}}
!Code
***/
//{{{
version.extensions.SQLQuery= {major: 0, minor: 1, revision: 0, date: new Date("Aug 23, 2007")};

config.macros.SQLQuery= {};
//config.shadowTiddlers.SQLConfig = 'Connection1: DRIVER={SQL Server};SERVER=(local);DATABASE=Northwind;';
config.macros.SQLQuery.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
 var parameters = paramString.parseParams('name',null,true);
 var pSQL = parameters[0]['sql']?parameters[0]['sql'][0]:-1;
 if (!pSQL) return false;
 var Connection = parameters[0]['connection']?parameters[0]['connection'][0]:'Connection1';
 var SQLConnection = store.getTiddlerText('SQLConfig::' + Connection)
 if (!SQLConnection) return wikify('Please configure this connection \'' + Connection + '\' in [[SQLConfig]]!', place, null, tiddler);
 var RowStart = parameters[0]['rowstart']?parameters[0]['rowstart'][0]:'|';
 var ColSep = parameters[0]['colsep']?parameters[0]['colsep'][0]:'|';
 var RowEnd = parameters[0]['rowend']?parameters[0]['rowend'][0]:'|\n';
 var HeaderStart = parameters[0]['headerstart']?parameters[0]['headerstart'][0]:'!~';
 try {
  var strResult = sql_DBQuery(SQLConnection, pSQL, RowStart, ColSep, RowEnd, HeaderStart, 'No results')
  wikify(strResult,place, null, tiddler)
 } catch (err) {
  wikify('Error ' + err.message,place, null, tiddler)
 }
}
function sql_DBQuery(ConnStr, SQL, RowStart, ColSep, RowEnd, HeaderStart, NoData) {
 var Conn = new ActiveXObject('ADODB.Connection');
 Conn.open(ConnStr);
 var RS = Conn.execute(SQL);
 var strOut='';
 if (!RS.eof) {
  strOut += RowStart;
  for (var i=0; i < RS.Fields.Count; i++) {
     strOut += HeaderStart + RS.Fields(i).name.toString() + (i<RS.Fields.Count-1?ColSep:'');
  }
  strOut += RowEnd;
  while (!RS.eof) {
    strOut += RowStart;
    for (var i=0; i < RS.Fields.Count; i++) {
       strOut += RS.Fields(i).Value.toString() + (i<RS.Fields.Count-1?ColSep:'');
    }
    strOut += RowEnd;
    RS.MoveNext
  }
 } else {
  strOut = NoData;
 }
 return strOut;
 RS.close()
 Conn.close()
}
//}}}