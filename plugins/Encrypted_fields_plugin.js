/***
|Location|http://visualtw.ouvaton.org/VisualTW.html|
|Version|1.0.1|
|Requires|~TW2.2.x|
|Browsers|Firefox 2.0.x, IE 6.0+, others|
!Description:
Three macros to protect tiddler fields :
* __viewEncrypted macro__ : prompt for the password (if not set or bad) and then display the field content.
* __editEncrypted macro__ : prompt for the password (if not set) and then edit the field content.
* __setPassword macro__: display a button to prompt field password
Notes :
*''protected fields are stored encrypted with RC4 algorithm'' (so, even if you hack TW html code, the content is protected).
* password is field specific (//text field password// is different from //another field password//).
* passwords live until page is left or reloaded.
* obviously, protected fields are not searchable.
!Demo:
On [[homepage|http://visualtw.ouvaton.org/VisualTW.html]], see [[EncryptedField example]]
!Usage:
*call {{{editEncrypted}}} macro instead of usual {{{edit}}} macro in EditTemplate or another edit template. Parameters are :
**{{{fieldName}}}. Can be "text" or any other field name (''NB'': TW field names are always lowercase).
**{{{numberOfRows}}} (optional) for the text editor.
*call {{{viewEncrypted}}} instead of usual {{{view}}} macro in ViewTemplate or another view template. Parameters are :
**{{{fieldName}}}. It can be "text" or any other field name (''NB'': TW field names are always lowercase)
**{{{displayType}}} (optional). It can be //link//, //wikified// or //date// as in standard view macro.
*call {{{setPassword}}} in SideBarOptions or in any other tiddler. Parameters are :
**{{{fieldName}}} (optional) on which this password will be applied.
Notes : 
*The <<setPassword>> button is shown when no password has been set for a field, or if the current password doesn't match its encrypted content.
*In <<toolbar fields>>, field content is seen encrypted.
!Installation:
#Import [[Encrypted fields plugin]] from [[homepage|http://visualtw.ouvaton.org/VisualTW.html]] (tagged as systemConfig)
#Adapt your templates (EditTemplate, ViewTemplate, or others) to your needs.
!FAQ
!!How to change the password ?
#edit the tiddler(s) where you want to change the password (ie edit mode).
#change the passwords using <<setPassword>>.
#save the tiddler(s). Their fields are protected with a new password.
!!Can I use several passwords ?
* use different fields. Each one has its own password.
* or change the password only for a subset of tiddlers as seen above.
!Note
This plugin is [[open source|License]] as [[TiddlyWiki]]. You use it at your own risks. Encrypted data might be lost if you lose your password or in case of bug.
***/
//{{{

config.macros.viewEncrypted = {
	handler : function(place,macroName,params,wikifier,paramString,tiddler) {
		config.macros.setPassword.callDecrypted(place,macroName,params,tiddler,this.standardView);
	},
	standardView : function(place, params, tiddler, value) { //extracted from the standard config.macros.view.handler
		switch(params[1]) {
			case undefined :
			case null :
				highlightify(value,place,highlightHack,tiddler);
				break;
			case "link":
				createTiddlyLink(place,value,true);
				break;
			case "wikified":
				wikify(value,place,highlightHack,tiddler);
				break;
			case "date":
				value = Date.convertFromYYYYMMDDHHMM(value);
				createTiddlyText(place,value.formatString(params[2] ? params[2] : config.views.wikified.dateFormat));
				break;
		}
	}
}
config.macros.editEncrypted = {
	handler : function(place,macroName,params,wikifier,paramString,tiddler) {
		config.macros.setPassword.callDecrypted(place,macroName,params,tiddler,this.standardEdit);
	},
	standardEdit : function(place, params, tiddler, value) {  //extracted from the standard config.macros.edit.handler
		var field = params[0];
		var rows = params[1];
		if (field) {
			story.setDirty(tiddler.title,true);
			if(field != "text" && !rows) {
				var e = createTiddlyElement(null,"input");
				if(tiddler.isReadOnly())
					e.setAttribute("readOnly","readOnly");
				e.setAttribute("editEncrypted",field);
				e.setAttribute("type","text");
				e.value = value;
				e.setAttribute("size","40");
				e.setAttribute("autocomplete","off");
				place.appendChild(e);
			} else {
				var wrapper1 = createTiddlyElement(null,"fieldset",null,"fieldsetFix");
				var wrapper2 = createTiddlyElement(wrapper1,"div");
				var e = createTiddlyElement(wrapper2,"textarea");
				if(tiddler.isReadOnly())
					e.setAttribute("readOnly","readOnly");
				e.value = value;
				var rows = rows ? rows : 10;
				var lines = value .match(/\n/mg);
				var maxLines = Math.max(parseInt(config.options.txtMaxEditRows),5);
				if(lines != null && lines.length > rows)
					rows = lines.length + 5;
				rows = Math.min(rows,maxLines);
				e.setAttribute("rows",rows);
				e.setAttribute("editEncrypted",field);
				place.appendChild(wrapper1);
			}
		}
	},
	gather : function(e, field){
		if (config.passwords[field])
			return "cryptoMXPrefix@"+Crypto.cryptomx.encrypt(config.passwords[field],e.value);
		else
			return e.value;
	} 
}

config.macros.setPassword = {
        handler : function(place,macroName,params,wikifier,paramString,tiddler) {
		var field = params[0];
		var macro = params[1];
		var param1 = params[2];
		var param2 = params[3];
		var btn = createTiddlyButton(place,(field ? field : "set") +" password", "enter a password for this field",this.onClickSetPassword);
		if (field) btn.setAttribute("field",field);
		if (macro) btn.setAttribute("macro",macro);
		if (tiddler) btn.setAttribute("tiddler",tiddler.title);
		if (param1) btn.setAttribute("param1",param1);
		if (param2) btn.setAttribute("param2",param2);
        },
        onClickSetPassword:function(){
		var field= this.getAttribute("field");
		field = field ? field : prompt("field name");
		var macro= this.getAttribute("macro");
		var title = this.getAttribute("tiddler");
		var param1 = this.getAttribute("param1");
		var param2 = this.getAttribute("param2");
		if (field) {
	        	config.passwords[field]=prompt("enter a password for "+field,config.passwords[field] ? config.passwords[field] : "" );
			if (title && macro) {
				var parent = this.parentNode;
				while (parent.childNodes.length>0) parent.removeChild(parent.firstChild);
				config.macros[macro].handler(parent, macro, [field,param1,param2],null,null, store.getTiddler(title));
			}
		}
		return false;
        },
		callDecrypted: function(place,macroName,params,tiddler, callBack){
			var field = params[0];
			if (field) {
				var value = store.getValue(tiddler,field);
				value = value ? value : "";
				var isEncrypted = (value.substr(0,15)=="cryptoMXPrefix@");
				var isPasswordSet = config.passwords[field] ? true : false;
				var decrypt = (isEncrypted && isPasswordSet) ? Crypto.cryptomx.decrypt(config.passwords[field],value.substr(15)): null;
				var isDecrypted = (decrypt!=null);
				var isFalsePassword = (isEncrypted && isPasswordSet && !isDecrypted);
				if (!isPasswordSet||isFalsePassword) config.macros.setPassword.handler(place,null,[field,macroName, params[1], params[2]], null, null, tiddler);
				if (!isEncrypted) createTiddlyText(place, this.messages.NotProtected);
				if (isEncrypted && !isPasswordSet) createTiddlyText(place, this.messages.Protected);
				if (isFalsePassword) createTiddlyText(place, this.messages.badPassword);
				if (isDecrypted) value=decrypt;
				if (!isEncrypted) callBack(place, params, tiddler, value);		
				if (isDecrypted) callBack(place, params, tiddler, decrypt);
			}
		},
		messages : {
			badPassword : "(bad password)",
			Protected :"(password protected field)",
			NotProtected :"(this field is not yet encrypted)"
		}
}

config.passwords = [];

Story.prototype.previousGatherSaveEditEncrypted = Story.prototype.previousGatherSaveEditEncrypted ? Story.prototype.previousGatherSaveEditEncrypted : Story.prototype.gatherSaveFields; // to avoid looping if this line is called several times
Story.prototype.gatherSaveFields = function(e,fields){
	if(e && e.getAttribute) {
		var f = e.getAttribute("editEncrypted");
		if(f){
			fields[f] = config.macros.editEncrypted.gather(e,f);
		}
		this.previousGatherSaveEditEncrypted(e, fields);
	}
};

//}}}

/***
Cryptomx code from http://cryptomx.sourceforge.net
***/
//{{{
Crypto.cryptomx = {
	dg :'',
	makeArray: function(n) {
		for (var i=1; i<=n; i++) {
			this[i]=0
		}
		return this
	},
	rc4: function(key, text) {
		var i, x, y, t, x2;
		this.status("rc4")
		s=this.makeArray(0);
		
		for (i=0; i<256; i++) {
			s[i]=i
		}
		y=0
		for (x=0; x<256; x++) {
			y=(key.charCodeAt(x % key.length) + s[x] + y) % 256
			t=s[x]; s[x]=s[y]; s[y]=t
		}
		x=0;  y=0;
		var z=""
		for (x=0; x<text.length; x++) {
			x2=x % 256
			y=( s[x2] + y) % 256
			t=s[x2]; s[x2]=s[y]; s[y]=t
			z+= String.fromCharCode((text.charCodeAt(x) ^ s[(s[x2] + s[y]) % 256]))
		}
		return z
	},
	badd: function(a,b) { // binary add
		var r=''
		var c=0
		while(a || b) {
			c=this.chop(a)+this.chop(b)+c
			a=a.slice(0,-1); b=b.slice(0,-1)
			if(c & 1) {
				r="1"+r
			} else {
				r="0"+r
			}
			c>>=1
		}
		if(c) {r="1"+r}
		return r
	},
	chop:function(a) {
		if(a.length) {
			return parseInt(a.charAt(a.length-1))
		} else {
			return 0
		}
	},
	bsub:function(a,b) { // binary subtract
		var r=''
		var c=0
		while(a) {
			c=this.chop(a)-this.chop(b)-c
			a=a.slice(0,-1); b=b.slice(0,-1)
			if(c==0) {
				r="0"+r
			}
			if(c == 1) {
				r="1"+r
				c=0
			}
			if(c == -1) {
				r="1"+r
				c=1
			}
			if(c==-2) {
				r="0"+r
				c=1
			}
		}
		if(b || c) {return ''}
		return this.bnorm(r)
	},
	bnorm:function(r) { // trim off leading 0s
		var i=r.indexOf('1')
		if(i == -1) {
			return '0'
		} else {
			return r.substr(i)
		}
	},
	bmul:function(a,b) { // binary multiply
		var r=''; var p=''
		while(a) {
			if(this.chop(a) == '1') {
				r=this.badd(r,b+p)
			}
			a=a.slice(0,-1)
			p+='0'
		}
		return r;
	},
	bmod:function(a,m) { // binary modulo
		return this.bdiv(a,m).mod
	},
	bdiv:function(a,m) { // binary divide & modulo
		// this.q = quotient this.mod=remainder
		var lm=m.length, al=a.length
		var p='',d
		this.q=''
		for(n=0; n<al; n++) {
			p=p+a.charAt(n);
			if(p.length<lm || (d=this.bsub(p,m)) == '') {
				this.q+='0'
			} else {
				if(this.q.charAt(0)=='0') {
					this.q='1'
				} else {
					this.q+="1"
				}
				p=d
			}
		}
		this.mod=this.bnorm(p)
		return this
	},
	bmodexp:function(x,y,m) { // binary modular exponentiation
		var r='1'
		this.status("bmodexp "+x+" "+y+" "+m)
		
		while(y) {
			if(this.chop(y) == 1) {
				r=this.bmod(this.bmul(r,x),m)
			}
			y=y.slice(0,y.length-1)
			x=this.bmod(this.bmul(x,x),m)
		}
		return this.bnorm(r)
	},
	modexp:function(x,y,m) { // modular exponentiation
		// convert packed bits (text) into strings of 0s and 1s
		return this.b2t(this.bmodexp(this.t2b(x),this.t2b(y),this.t2b(m)))
	},
	i2b: function(i) { // convert integer to binary
		var r=''
		while(i) {
			if(i & 1) { r="1"+r} else {r="0"+r}
			i>>=1;
		}
		return r? r:'0'
	},
	t2b:function(s) {
		var r=''
		if(s=='') {return '0'}
		while(s.length) {
			var i=s.charCodeAt(0)
			s=s.substr(1)
			for(n=0; n<8; n++) {
				r=((i & 1)? '1':'0') + r
				i>>=1;
			}
		}
		return this.bnorm(r)
	},
	b2t:function(b) {
		var r=''; var v=0; var m=1
		while(b.length) {
			v|=this.chop(b)*m
			b=b.slice(0,-1)
			m<<=1
			if(m==256 || b=='') {
				r+=String.fromCharCode(v)
				v=0; m=1
			}
		}
		return r
	},
	b64s:'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"',
	textToBase64:function(t) {
		this.status("t 2 b64")
		var r=''; var m=0; var a=0; var tl=t.length-1; var c
		for(n=0; n<=tl; n++) {
			c=t.charCodeAt(n)
			r+=this.b64s.charAt((c << m | a) & 63)
			a = c >> (6-m)
			m+=2
			if(m==6 || n==tl) {
				r+=this.b64s.charAt(a)
				if((n%45)==44) {r+="\n"}
				m=0
				a=0
			}
		}
		return r
	},
	base64ToText:function(t) {
		this.status("b64 2 t")
		var r=''; var m=0; var a=0; var c
		for(n=0; n<t.length; n++) {
			c=this.b64s.indexOf(t.charAt(n))
			if(c >= 0) {
				if(m) {
					r+=String.fromCharCode((c << (8-m))&255 | a)
				}
				a = c >> m
				m+=2
				if(m==8) { m=0 }
			}
		}
		return r
	},

	rand:function(n) {  return Math.floor(Math.random() * n) },
	rstring:function(s,l) {
		var r=""
		var sl=s.length
		while(l>0) {
			l=l-1;
			r+=s.charAt(rand(sl))
		}
		//status("rstring "+r)
		return r
	},
	key2:function(k) {
		var l=k.length
		var kl=l
		var r=''
		while(l--) {
			r+=k.charAt((l*3)%kl)
		}
		return r
	},
	rsaEncrypt:function(keylen,key,mod,text) {
		// I read that rc4 with keys larger than 256 bytes doesn't significantly
		// increase the level of rc4 encryption because it's sbuffer is 256 bytes
		// makes sense to me, but what do i know...

		this.status("encrypt")
		if(text.length >= keylen) {
			var sessionkey=this.rc4(rstring(text,keylen),rstring(text,keylen))

			// session key must be less than mod, so mod it
			sessionkey=this.b2t(bmod(t2b(sessionkey),t2b(mod)))
			alert("sessionkey="+sessionkey)

			// return the rsa encoded key and the encrypted text
			// i'm double encrypting because it would seem to me to
			// lessen known-plaintext attacks, but what do i know
			return this.modexp(sessionkey,key,mod) +
			this.rc4(this.key2(sessionkey),this.rc4(sessionkey,text))
		} else {

			// don't need a session key
			return this.modexp(text,key,mod)
		}
	},
	rsaDecrypt:function(keylen,key,mod,text) {
		this.status("decrypt")
		if(text.length <= keylen) {
			return this.modexp(text,key,mod)
		} else {

			// sessionkey is first keylen bytes
			var sessionkey=text.substr(0,keylen)
			text=text.substr(keylen)

			// un-rsa the session key
			sessionkey=this.modexp(sessionkey,key,mod)
			alert("sessionkey="+sessionkey)

			// double decrypt the text
			return this.rc4(sessionkey,this.rc4(this.key2(sessionkey,text),text))
		}
	},
	trim2:function(d) { return d.substr(0,d.lastIndexOf('1')+1) },
	bgcd:function(u,v) { // return greatest common divisor
		// algorythm from http://algo.inria.fr/banderier/Seminar/Vallee/index.html
		var d, t
		while(1) {
			d=this.bsub(v,u)
			//alert(v+" - "+u+" = "+d)
			if(d=='0') {return u}
			if(d) {
				if(d.substr(-1)=='0') {
					v=d.substr(0,d.lastIndexOf('1')+1) // v=(v-u)/2^val2(v-u)
				} else v=d
			} else {
				t=v; v=u; u=t // swap u and v
			}
		}
	},

	isPrime:function(p) {
		var n,p1,p12,t
		p1=this.bsub(p,'1')
		t=p1.length-p1.lastIndexOf('1')
		p12=this.trim2(p1)
		for(n=0; n<2; n+=this.mrtest(p,p1,p12,t)) {
			if(n<0) return 0
		}
		return 1
	},
	mrtest:function(p,p1,p12,t) {
		// Miller-Rabin test from forum.swathmore.edu/dr.math/
		var n,a,u
		a='1'+this.rstring('01',Math.floor(p.length/2)) // random a
		//alert("mrtest "+p+", "+p1+", "+a+"-"+p12)
		u=this.bmodexp(a,p12,p)
		if(u=='1') {return 1}
		for(n=0;n<t;n++) {
			u=this.bmod(this.bmul(u,u),p)
			//dg+=u+" "
			if(u=='1') return -100
			if(u==p1) return 1
		}
		return -100
	},
	pfactors:'11100011001110101111000110001101',
	// this number is 3*5*7*11*13*17*19*23*29*31*37
	prime:function(bits) {
		// return a prime number of bits length
		var p='1'+this.rstring('001',bits-2)+'1'
		while( ! this.isPrime(p)) {
			p=badd(p,'10'); // add 2
		}
		alert("p is "+p)
		return p
	},
	genkey:function(bits) {
		q=prime(bits)
		do {
			p=q
			q=prime(bits)
		} while(bgcd(p,q)!='1')
		p1q1=this.bmul(this.bsub(p,'1'),this.bsub(q,'1'))
		// now we need a d, e,  and an n so that:
		//  p1q1*n-1=de  -> bmod(bsub(bmul(d,e),'1'),p1q1)='0'
		// or more specifically an n so that d & p1q1 are rel prime and factor e
		n='1'+this.rstring('001',Math.floor(bits/3)+2)
		alert('n is '+n)
		factorMe=this.badd(this.bmul(p1q1,n),'1')
		alert('factor is '+factorMe)
		//e=bgcd(factorMe,p1q1)
		//alert('bgcd='+e)
		e='1'
		// is this always 1?
		//r=bdiv(factorMe,e)
		//alert('r='+r.q+" "+r.mod)
		//if(r.mod != '0') {alert('Mod Error!')}
		//factorMe=r.q
		d=this.bgcd(factorMe,'11100011001110101111000110001101')
		alert('d='+d)
		if(d == '1' && e == '1') {alert('Factoring failed '+factorMe+' p='+p+' q='+q)}
		e=this.bmul(e,d)
		r=this.bdiv(factorMe,d)
		d=r.q
		if(r.mod != '0') {alert('Mod Error 2!')}

		this.mod=this.b2t(bmul(p,q))
		this.pub=this.b2t(e)
		this.priv=this.b2t(d)
	},
	status:function(a) { },//alert(a)}
	encrypt:function(key,text) {
		return this.textToBase64(this.rc4(key,"check:"+text));
	},
	decrypt:function(key,text){
		var uncrypt = this.rc4(key,this.base64ToText(text));
		return (uncrypt.substr(0,6)=="check:") ? uncrypt.substr(6) : null;
	}
}

//}}}