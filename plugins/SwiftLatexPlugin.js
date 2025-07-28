/***
|Name|SwiftLatexPlugin|
|Source|https://github.com/wangyenshu/SwiftLatexPlugin/blob/main/SwiftLatexPlugin.js|
|Author|Yanshu Wang|
|Version|0.1|
|Type|plugin|
|Description|A TiddlyWiki Classic plugin to compile latex using swiftlatex.|
|License|MIT|

!Usage
Put the js and wasm files downloaded from https://github.com/SwiftLaTeX/SwiftLaTeX/releases in the root folder.
{{{
<<PdfTeX script:\documentclass{article}\begin{document}\section{Hello, World!}\end{document}>>
<<PdfTeX tid:Document>>
<<XeTeX script:\documentclass{article}\begin{document}\section{Hello, XeTeX!}\end{document}>>
<<XeTeX tid:Document>>
}}}
Notice that due to restrictions of ace editor, you can only use use one of these two macros. For example, once you have used PdfTex macro, running another macro will still use PdfTex Engine.
!Demo
<<PdfTeX>>
!Todo
- Support multiple ace editor and using PdfTeX and XeTeX in the same page.
- Support custom image path and bibtex path
- Support input of multiple lines

!Credit
https://www.swiftlatex.com/
***/
//{{{
config.macros.PdfTeX = {
    handler: function(place, macroName, params, wikifier, paramString, tiddler) {
        // Parse parameters "script" and "tid"
        var p = paramString.parseParams("script tid", null, true)[0] || {};
        var scriptContent;
        if (p.tid && p.tid.length) {
            // Load LaTeX source from the specified tiddler.
            scriptContent = store.getTiddlerText(p.tid[0]) || "";
        } else if (p.script && p.script.length) {
            scriptContent = p.script.join(" ");
        } else {
            scriptContent = "\\documentclass{article}\n\\begin{document}\n\\section{Hello, World!}\nHello, PdfTeX!\n\\end{document}";
        }
            
        // Create the UI container with unique IDs.
        var container = document.createElement("div");
        container.innerHTML = ""
          + "<div id='pdftex_container' style='margin:10px; padding:10px; border:1px solid #ccc;'>"
          + "  <h3>PdfTeX Editor</h3>"
          + "  <div id='pdftex_editor' style='width:100%; height:400px; background-color:#272822;'>" + scriptContent + "</div>"
          + "  <br><button id='pdftex_compilebtn' disabled>Initializing</button>"
          + "  <br><h4>Engine Log:</h4>"
          + "  <pre id='pdftex_log' style='white-space: pre-wrap; font-family: monospace; padding:10px; background-color:#EBEEF1; border:1px solid #ccc; width:80%; height:150px; overflow-y:auto;'></pre>"
          + "  <br><div id='pdftex_pdfbox'></div>"
          + "</div>";
        place.appendChild(container);
            
        // Load Ace Editor from CDN if not already loaded.
        if (!document.getElementById("ace_script")) {
            var aceScript = document.createElement("script");
            aceScript.id = "ace_script";
            aceScript.src = "https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.14/ace.js";
            document.head.appendChild(aceScript);
        }
            
        // Load PdfTeXEngine.js if not already loaded.
        if (!document.getElementById("pdflatex_script")) {
            var pdfScript = document.createElement("script");
            pdfScript.id = "pdflatex_script";
            pdfScript.src = "PdfTeXEngine.js"; // Adjust path as needed.
            document.body.appendChild(pdfScript);
        }
            
        // Utility: wait until a condition is met.
        function waitFor(conditionFunc, callback, interval) {
            interval = interval || 100;
            if (conditionFunc()) {
                callback();
            } else {
                setTimeout(function(){ waitFor(conditionFunc, callback, interval); }, interval);
            }
        }
            
        // Wait for both Ace and PdfTeXEngine to be loaded.
        waitFor(function(){ 
            return (typeof ace !== "undefined") && 
                   (typeof PdfTeXEngine !== "undefined"); 
        }, initEngine);
            
        function initEngine(){
            // Initialize Ace Editor on the "pdftex_editor" element.
            var editor = ace.edit("pdftex_editor");
            editor.setTheme("ace/theme/monokai");
            editor.session.setMode("ace/mode/latex");
            editor.session.setUseWrapMode(true);
            editor.setFontSize(18);
                
            var pdftexCompileBtn = document.getElementById("pdftex_compilebtn");
            var pdftexLog = document.getElementById("pdftex_log");
            var pdftexPdfBox = document.getElementById("pdftex_pdfbox");
                
            // Create an instance of PdfTeXEngine.
            var engine = new PdfTeXEngine();
                
            async function init() {
                await engine.loadEngine();
                pdftexCompileBtn.innerHTML = "Compile";
                pdftexCompileBtn.disabled = false;
            }
            
            async function compile() {
                if(!engine.isReady()){
                    console.log("Engine not ready yet");
                    return;
                }
                pdftexCompileBtn.disabled = true;
                pdftexCompileBtn.innerHTML = "Compiling...";

                /*    
                try {
                    // Optionally, fetch an image asset.
                    let downloadReq = await fetch("assets/troll.jpg");
                    let imageBlob = await downloadReq.arrayBuffer();
                    engine.writeMemFSFile("troll.jpg", new Uint8Array(imageBlob));
                } catch(e) {
                    console.warn("Could not load image: ", e);
                }
                */
                    
                engine.writeMemFSFile("main.tex", editor.getValue());
                engine.setEngineMainFile("main.tex");
                    
                let r = await engine.compileLaTeX();
                pdftexLog.innerHTML = r.log;
                pdftexCompileBtn.innerHTML = "Compile";
                pdftexCompileBtn.disabled = false;
                if (r.status === 0) {
                    const pdfblob = new Blob([r.pdf], { type: "application/pdf" });
                    const objectURL = URL.createObjectURL(pdfblob);
                    pdftexPdfBox.innerHTML = `<embed src="${objectURL}" width="100%" height="400px" type="application/pdf">`;
                    setTimeout(function(){ URL.revokeObjectURL(objectURL); }, 30000);
                }
            }
            
            pdftexCompileBtn.addEventListener("click", compile);
            init();
        }
    }
};

config.macros.XeTeX = {
    handler: function(place, macroName, params, wikifier, paramString, tiddler) {
        // Parse parameters "script:" and "tid:".
        // If "tid:" is provided, load content from that tiddler.
        var p = paramString.parseParams("script tid", null, true)[0] || {};
        var scriptContent;
        if(p.tid && p.tid.length) {
            scriptContent = store.getTiddlerText(p.tid[0]) || "";
        } else if(p.script && p.script.length) {
            scriptContent = p.script.join(" ");
        } else {
            scriptContent = "%% Sample XeTeX document\n\\documentclass{article}\n\\begin{document}\nHello, XeTeX!\n\\end{document}";
        }
            
        // Create the UI container with unique IDs.
        var container = document.createElement("div");
        container.innerHTML = ""
          + "<div id='xetex_container' style='margin:10px; padding:10px; border:1px solid #ccc;'>"
          + "  <h3>XeTeX Editor</h3>"
          + "  <div id='xetex_editor' style='width:100%; height:400px; background-color:#272822; color:#F8F8F2;'>"
          + scriptContent + "</div>"
          + "  <br><button id='xetex_compilebtn' disabled>Initializing</button>"
          + "  <br><h4>Engine Log:</h4>"
          + "  <pre id='xetex_console' style='white-space: pre-wrap; font-family: monospace; padding:10px; background-color:#EBEEF1; border:1px solid #ccc; width:80%; height:150px; overflow-y:auto;'></pre>"
          + "  <br><div id='xetex_pdfbox'></div>"
          + "</div>";
        place.appendChild(container);
            
        // Load Ace Editor from CDN if not already loaded.
        if (!document.getElementById("ace_script")) {
            var aceScript = document.createElement("script");
            aceScript.id = "ace_script";
            aceScript.src = "https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.14/ace.js";
            document.head.appendChild(aceScript);
        }
            
        // Load XeTeXEngine.js if not already loaded.
        if (!document.getElementById("xetex_engine_script")) {
            var xetexScript = document.createElement("script");
            xetexScript.id = "xetex_engine_script";
            xetexScript.src = "XeTeXEngine.js"; // Adjust path as needed.
            document.body.appendChild(xetexScript);
        }
        // Load DvipdfmxEngine.js if not already loaded.
        if (!document.getElementById("dvipdfmx_script")) {
            var dvipdfmxScript = document.createElement("script");
            dvipdfmxScript.id = "dvipdfmx_script";
            dvipdfmxScript.src = "DvipdfmxEngine.js"; // Adjust path as needed.
            document.body.appendChild(dvipdfmxScript);
        }
            
        // Utility: wait until a condition is met.
        function waitFor(conditionFunc, callback, interval) {
            interval = interval || 100;
            if (conditionFunc()) {
                callback();
            } else {
                setTimeout(function(){ waitFor(conditionFunc, callback, interval); }, interval);
            }
        }
            
        // Wait for Ace and both XeTeX engines to be loaded.
        waitFor(function(){ 
            return (typeof ace !== "undefined") && 
                   (typeof XeTeXEngine !== "undefined") && 
                   (typeof DvipdfmxEngine !== "undefined"); 
        }, initEngine);
            
        function initEngine(){
            // Initialize Ace Editor on the "xetex_editor" element.
            var editor = ace.edit("xetex_editor");
            editor.setTheme("ace/theme/monokai");
            editor.session.setMode("ace/mode/latex");
            editor.session.setUseWrapMode(true);
            editor.setFontSize(18);
                
            var xetexCompileBtn = document.getElementById("xetex_compilebtn");
            var xetexConsole = document.getElementById("xetex_console");
            var xetexPdfBox = document.getElementById("xetex_pdfbox");
                
            // Create engine instances.
            var xetexEn = new XeTeXEngine();
            var dvipdfmxEn = new DvipdfmxEngine();
                
            async function init() {
                await xetexEn.loadEngine();
                await dvipdfmxEn.loadEngine();
                xetexCompileBtn.innerHTML = "Compile";
                xetexCompileBtn.disabled = false;
            }
            
            async function compile() {
                if (!xetexEn.isReady() || !dvipdfmxEn.isReady()) {
                    console.log("Engine not ready yet");
                    return;
                }
                xetexCompileBtn.disabled = true;
                xetexCompileBtn.innerHTML = "Compiling...";
                    
                let imageDownloadReq, imageBlob, bibDownloadReq, bibBlob;
                /*
                try {
                    imageDownloadReq = await fetch('assets/troll.jpg');
                    imageBlob = await imageDownloadReq.arrayBuffer();
                    bibDownloadReq = await fetch('assets/sample-base.bib');
                    bibBlob = await bibDownloadReq.arrayBuffer();
                    xetexEn.writeMemFSFile("troll.jpg", new Uint8Array(imageBlob));
                    xetexEn.writeMemFSFile("sample-base.bib", new Uint8Array(bibBlob));
                } catch(e) {
                    console.warn("Asset download failed: ", e);
                }
                */    
                xetexEn.writeMemFSFile("main.tex", editor.getValue());
                xetexEn.setEngineMainFile("main.tex");
                    
                let r = await xetexEn.compileLaTeX();
                xetexConsole.innerHTML = r.log;
                xetexCompileBtn.innerHTML = "Compile";
                xetexCompileBtn.disabled = false;
                    
                if (r.status === 0) {
                    dvipdfmxEn.writeMemFSFile("main.xdv", r.pdf);
                    dvipdfmxEn.setEngineMainFile("main.xdv");
                    // Re-upload image if needed.
                    // dvipdfmxEn.writeMemFSFile("troll.jpg", new Uint8Array(imageBlob));
                    let r1 = await dvipdfmxEn.compilePDF();
                    const pdfblob = new Blob([r1.pdf], { type: "application/pdf" });
                    const objectURL = URL.createObjectURL(pdfblob);
                    xetexPdfBox.innerHTML = `<embed src="${objectURL}" width="100%" height="400px" type="application/pdf">`;
                    setTimeout(function(){ URL.revokeObjectURL(objectURL); }, 30000);
                }
            }
            
            xetexCompileBtn.addEventListener("click", compile);
            init();
        }
    }
};
//}}}

