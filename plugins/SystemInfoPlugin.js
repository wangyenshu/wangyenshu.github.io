/***
|Name|SystemInfoPlugin|
|Source|http://www.TiddlyTools.com/#SystemInfoPlugin|
|Version|1.7.1|
|Author|Eric Shulman|
|License|http://www.TiddlyTools.com/#LegalStatements|
|~CoreVersion|2.1|
|Type|plugin|
|Description|view system internal data and settings|
~TidIDE (//prounounced "Tie Dyed"//) - ''Tid''dlyWiki ''I''ntegrated ''D''evelopment ''E''nvironment - tools for ~TiddlyWiki authors and editors.  

You can use the {{{<<systemInfo>>}}} control panel to view a variety of system internal data and functions, and view/modify ''all'' of ~TiddlyWiki's internal config.option.* settings.  NOTE: Non-default config.options are stored in cookies and are retrieved whenever the TW document is loaded into a browser; however, ''core TW functions and custom-defined plugins can explicitly ignore or reset any locally-stored cookie values and use their own, internally-defined values'' instead.  As a result, changes to these may be completely ignored, or may only have an effect during the current TW document "session" (i.e., until the TW document is reloaded), even though a persistent cookie value has been saved.
!!!!!Usage/Example
<<<
{{{<<systemInfo>>}}}
{{smallform{<<systemInfo>>}}}
<<<
!!!!!Revisions
<<<
''2007.10.31 [1.7.1]'' code reduction: when filling globals droplist, instead of using a large, static "global exclusion list", simply skip global *functions*, while still listing all other global properties, including key TW internal objects such as "config".
''2007.09.09 [1.7.0]'' split from TidIDEPlugin
|please see [[TidIDEPluginInfo]] for additional revision details|
''2006.04.15 [0.5.0]'' Initial ALPHA release. Converted from inline script.
<<<
!!!!!Code
***/
//{{{
version.extensions.SystemInfoPlugin= {major: 1, minor: 7, revision: 1, date: new Date(2006,10,31)};
config.shadowTiddlers.SystemInfo="<<systemInfo>>";
config.macros.systemInfo = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var span=createTiddlyElement(place,"span")
		span.innerHTML=this.html;
		this.getsys(span.getElementsByTagName("form")[0]); // initialize form
	},
	getsys: function(f) {
		f.sysview.value="";

		// OPTIONS
		while (f.sys_opts.options.length > 1) { f.sys_opts.options[1]=null; } // clear list
		f.config_view.value="";  // clear edit field
		var cookies = { };
		if (document.cookie != "") {
			var p = document.cookie.split("; ");
			for (var i=0; i < p.length; i++) {
				var pos=p[i].indexOf("=");
				if (pos==-1)
					cookies[p[i]]="";
				else
					cookies[p[i].substr(0,pos)]=unescape(p[i].slice(pos+1));
			}
		}
		var c=1;
		var opt=new Array(); for (var i in config.options) opt.push(i); opt.sort();
		for(var i=0; i<opt.length; i++) {
			if ((opt[i].substr(0,3)=="txt")||(opt[i].substr(0,3)=="chk")) {
				var txt = (opt[i].substr(0,3)=="chk"?("["+(config.options[opt[i]]?"x":"_")+"] "):"")+opt[i]+(cookies[opt[i]]?" (cookie)":"");
				var val = config.options[opt[i]];
				f.sys_opts.options[c++]=new Option(txt,val,false,false);
			}
		}

		// STYLESHEETS
		while (f.sys_styles.options.length > 1) { f.sys_styles.options[1]=null; } // clear list
		var c=1;
		var styles=document.getElementsByTagName("style");
		for(var i=0; i < styles.length; i++) {
			var id=styles[i].getAttribute("id"); if (!id) id="(default)";
			var txt=id;
			var val="/* stylesheet:"+txt+" */\n"+styles[i].innerHTML;
			f.sys_styles.options[c++]=new Option(txt,val,false,false);
		}

		// SHADOWS
		while (f.sys_shadows.options.length > 1) { f.sys_shadows.options[1]=null; } // clear list
		var c=1;
		for(var s in config.shadowTiddlers) f.sys_shadows.options[c++]=new Option(s,config.shadowTiddlers[s],false,false);

		// NOTIFICATIONS
		while (f.sys_notify.options.length > 1) { f.sys_notify.options[1]=null; } // clear list
		var c=1;
		for (var i=0; i<store.namedNotifications.length; i++) {
			var n = store.namedNotifications[i];
			var fn = n.notify.toString();
			fn = fn.substring(fn.indexOf("function ")+9,fn.indexOf("{")-1);
			var txt=(n.name?n.name:"any change")+"="+fn;
			var val="/* notify: "+txt+" */\n"+n.notify.toString();
			f.sys_notify.options[c++]=new Option(txt,val,false,false);
		}

		// MACROS
		while (f.sys_macros.options.length > 1) { f.sys_macros.options[1]=null; } // clear list
		var c=1;
		var macros=new Array(); for (var m in config.macros) macros.push(m); macros.sort();
		for(var i=0; i < macros.length; i++)
			f.sys_macros.options[c++]=new Option(macros[i],this.showObject(config.macros[macros[i]]),false,false);

		// COMMANDS
		while (f.sys_commands.options.length > 1) { f.sys_commands.options[1]=null; } // clear list
		var c=1;
		for(var cmd in config.commands)
			f.sys_commands.options[c++]=new Option(cmd,this.showObject(config.commands[cmd]),false,false);

		// FORMATTERS
		while (f.sys_formatters.options.length > 1) { f.sys_formatters.options[1]=null; } // clear list
		var c=1;
		for(var i=0; i < config.formatters.length; i++)
			f.sys_formatters.options[c++]=new Option(config.formatters[i].name,this.showObject(config.formatters[i]),false,false);

		// PARAMIFIERS
		while (f.sys_params.options.length > 1) { f.sys_params.options[1]=null; } // clear list
		var c=1;
		for(var param in config.paramifiers)
			f.sys_params.options[c++]=new Option(param,this.showObject(config.paramifiers[param]),false,false);

		// GLOBALS
		//global variables and functions (excluding most DOM and ~TiddyWiki core definitions)://
		while (f.sys_globals.options.length > 1) { f.sys_globals.options[1]=null; } // clear list
		if (config.browser.isIE) return; // BYPASS - 8/16/2006 // DON'T LIST GLOBALS IN IE... throws object error - WFFL
		try {
			var c=1;
			for (var v in window) if ((typeof window[v])!='function') {
				var t=window[v];
				if ((typeof window[v])=='object') {
					var t='';
					for (var p in window[v]) {
						t+=((typeof window[v][p])!='function')?('['+typeof window[v][p]+'] '+p):p;
						t+=((typeof window[v][p])!='function')?('='+window[v][p]):'';
						t+='\n';
					}
				}
				f.sys_globals.options[c++]=new Option(((typeof window[v])!='function')?('['+typeof window[v]+'] '+v):v,t,false,false);
			}	
		}
		catch(e) { ; }
	},
	setsys: function(f) {
		if (f.sys_opts.selectedIndex==0) return; // heading - do nothing
		var name=f.sys_opts.options[f.sys_opts.selectedIndex].text.replace(/\[[Xx_]\] /,'').replace(/ \(cookie\)/,'')
		var value=f.config_view.value;
		config.options[name]=value;
		saveOptionCookie(name);
		f.sys_opts.options[f.sys_opts.selectedIndex].value=value;
		return;
	},
	showObject: function(o) { // generate formatted output for displaying object references
		var t="";
		for (var p in o) {
			if (typeof o[p]=="function") {
				t+="- - - - - - - - - - "+p+" - - - - - - - - - -\n";
				t+=o[p].toString();
				t+="\n- - - - - - - - - - END: "+p+" - - - - - - - - - -\n";
			}
			else
				t+='['+typeof o[p]+'] '+p+": "+o[p]+"\n";
		}
		return t;
	},
	html: "\
	<form style='display:inline;margin:0;padding:0;'> \
		<!-- configurable options --> \
		<table style='width:100%;border:0;padding:0;margin:0'><tr style='border:0;padding:0;margin:0'> \
		<td style='width:30%;border:0;padding:0;margin:0'> \
			<select size=1 name='sys_opts' style='width:100%;' \
				onchange='this.form.config_view.value=this.value'> \
				<option value=\"\">config.options.*</option> \
			</select> \
		</td><td style='width:50%;border:0;padding:0;margin:0;'> \
			<input type=text name='config_view' size=60 style='width:99%;' value=''> \
		</td><td style='width:20%;white-space:nowrap;border:0;padding:0;margin:0;'> \
			<input type=button style='width:50%;' value='set option' title='save this TiddlyWiki option value' \
				onclick='config.macros.systemInfo.setsys(this.form);config.macros.systemInfo.getsys(this.form);'><!-- \
			--><input type=button style='width:50%;' value='refresh' title='retrieve current options and system values' \
				onclick='this.form.sysview.style.display=\"none\"; config.macros.systemInfo.getsys(this.form);'> \
		</td></tr><tr style='border:0;padding:0;margin:0'><td colspan=3 \
				style='white-space:nowrap;width:100%;border:0;padding:0;margin:0'> \
			<!-- system objects --> \
			<select size=1  name='sys_styles' style='width:25%;' \
				onchange='this.form.sysview.style.display=\"block\"; this.form.sysview.value=this.value'> \
				<option value=\"\">stylesheets...</option> \
			</select><select size=1  name='sys_shadows' style='width:25%;' \
				onchange='this.form.sysview.style.display=\"block\"; this.form.sysview.value=this.value'> \
				<option value=\"\">shadows...</option> \
			</select><select size=1  name='sys_notify' style='width:25%;' \
				onchange='this.form.sysview.style.display=\"block\"; this.form.sysview.value=this.value'> \
				<option value=\"\">notifications...</option> \
			</select><select size=1  name='sys_globals' style='width:25%;' \
				onchange='this.form.sysview.style.display=\"block\"; this.form.sysview.value=this.value'> \
				<option value=\"\">globals...</option> \
			</select><br><select size=1  name='sys_macros' style='width:25%;' \
				onchange='this.form.sysview.style.display=\"block\"; this.form.sysview.value=this.value'> \
				<option value=\"\">macros...</option> \
			</select><select size=1  name='sys_commands' style='width:25%;' \
				onchange='this.form.sysview.style.display=\"block\"; this.form.sysview.value=this.value'> \
				<option value=\"\">commands...</option> \
			</select><select size=1  name='sys_formatters' style='width:25%;' \
				onchange='this.form.sysview.style.display=\"block\"; this.form.sysview.value=this.value'> \
				<option value=\"\">formatters...</option> \
			</select><select size=1  name='sys_params' style='width:25%;' \
				onchange='this.form.sysview.style.display=\"block\"; this.form.sysview.value=this.value'> \
				<option value=\"\">paramifiers...</option> \
			</select> \
			<!-- system value display area --> \
			<span style='white-space:normal;'><textarea id='sysview' name=sysview cols=60 rows=12 \
				onfocus='this.select()' style='width:99.5%;height:16em;display:none'></textarea></span> \
		</td></tr></table> \
	</form>"
}
//}}}