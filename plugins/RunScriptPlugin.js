/***
|Name|RunScriptPlugin|
|Source|https://github.com/wangyenshu/RunScriptPlugin/blob/main/RunScriptPlugin.js|
|Author|Yanshu Wang|
|Version|0.1|
|Type|plugin|
|Description|A TiddlyWiki Classic plugin to run multiple programming language.|
|License|MIT|

!Usage
{{{
<<BrythonScript script:print('Hello world!')>>
<<BrythonScript tid:TiddlerName>>
<<PyodideScript script:print('Hello world!')>>
<<PyodideScript tid:TiddlerName>>
<<runcppscript script:#include <iostream>using namespace std;int main() {    cout << "Hello, World!" << endl;    return 0;}>>
<<runcppscript tid:TiddlerName>>
<<runwebrscript script:fit <- lm(mpg ~ am, data=mtcars); summary(fit)>>
<<runwebrscript tid:TiddlerName>>
}}}
Edit pathlib in [[RunScriptPluginConfig]].

!Demo
<<BrythonScript tid:Brython_Example_HelloBrython>>
<<PyodideScript tid:Pyodide_Example_Fibonacci>>
<<runcppscript>>
<<runwebrscript>>
!Todo
Add input method.
Implement a similar plugin for 
- basic https://github.com/google/wwwbasic
- php https://phpjs.hertzen.com/
- tex https://manuels.github.io/texlive.js/
-       p5  p5.js
-       C#
-	SQL	SQL.js	https://sql.js.org/
-	Go	GopherJS	https://github.com/gopherjs/gopherjs
-	Delphi/Object Pascal
-	Visual Basic	
-	Fortran	
-	Scratch	
-	Rust
-	Ruby	Opal	https://opalrb.com/
-	Lua
-	Perl	
-	Haskell
-	OCaml	BuckleScript	https://bucklescript.github.io/
-	Scala	Scala.js	https://www.scala-js.org/
-	Kotlin	Kotlin/JS	https://kotlinlang.org/docs/reference/js-overview.html
-	Swift	SwiftWasm	https://swiftwasm.org/
-	Racket
-	Scheme	BiwaScheme	https://github.com/biwascheme/biwascheme
-	Tcl
-	Erlang
-	Elixir	Nerves	https://nerves-project.org/
-	Clojure	ClojureScript	https://clojurescript.org/
-	F#	Fable	https://fable.io/
-	D	
-	VHDL
-	Verilog	EDA Playground	https://www.edaplayground.com/
-	COBOL
-	ActionScript
-	Ada
-	ALGOL
-	LISP
-	Bash	ShellJS	https://github.com/shelljs/shelljs
-	BCPL
-	Crystal	
-	Forth	
!Credit
https://brython.info
https://pyodide.org
https://docs.r-wasm.org/webr/latest/
https://github.com/felixhao28/JSCPP
***/
//{{{
config.macros.BrythonScript = {
    handler: function(place, macroName, params, wikifier, paramString, tiddler) {
        // Parse parameters "script:" and "tid:".
        var paramsObj = paramString.parseParams("script tid", null, true)[0] || {};
        var defaultScript = "";
        if (paramsObj.tid && paramsObj.tid.length) {
            // Load Python code from the specified tiddler.
            defaultScript = store.getTiddlerText(paramsObj.tid[0]) || "";
        } else if (paramsObj.script && paramsObj.script.length) {
            defaultScript = paramsObj.script.join(" ");
        } else {
            defaultScript = "Write your Python code here...";
        }
        
        // Create the container for the Brython Script.
        var container = document.createElement("div");
        container.innerHTML = `
            <div id="brythonScriptContainer">
                <textarea id="brythonCodeInput" class="brythonCodeArea" rows="10" cols="60" placeholder="Write your Python code here...">${defaultScript}</textarea>
                <div><button id="executeBrythonCode">Run Code</button></div>
            </div>
        `;
        place.appendChild(container);
        
        // Dynamically load Brython scripts.
        var brythonScript = document.createElement("script");
        brythonScript.src = config.options.txtBrythonjsPath;
        brythonScript.onload = function() {
            var brythonStdlibScript = document.createElement("script");
            brythonStdlibScript.src = config.options.txtBrythonStdLibjsPath;
            brythonStdlibScript.onload = function() {
                // Initialize Brython after the standard library is loaded.
                brython({debug: 1});
            };
            document.body.appendChild(brythonStdlibScript);
        };
        document.body.appendChild(brythonScript);
        
        // Once Brython is loaded, set up the event listener on the button.
        brythonScript.onload = function() {
            document.getElementById("executeBrythonCode").addEventListener("click", function() {
                var pythonCode = document.getElementById("brythonCodeInput").value;
                try {
                    if (typeof __BRYTHON__ !== 'undefined') {
                        __BRYTHON__.runPythonSource(pythonCode);
                    } else {
                        alert("Brython is not ready yet.");
                    }
                } catch (e) {
                    alert("Execution error: " + e.message);
                }
            });
        };
    }
};

config.macros.PyodideScript = {
    handler: function(place, macroName, params, wikifier, paramString, tiddler) {
        // Parse parameters "script:" and "tid:"
        var p = paramString.parseParams("script tid", null, true)[0] || {};
        var defaultScript = "";

        if (p.tid && p.tid.length) {
            // Load Python code from the specified tiddler
            defaultScript = store.getTiddlerText(p.tid[0]) || "";
        } else if (p.script && p.script.length) {
            defaultScript = p.script.join(" ");
        }

        // Create the UI container
        const container = document.createElement("div");
        container.innerHTML = `
            <div id="pyodideContainer">
                <!-- Input Window Box for Python code -->
                <div style="margin-bottom: 10px;">
                    <label for="pythonInput" style="font-weight: bold;">Enter Python Code:</label><br>
                    <textarea id="pythonInput" class="pythonTextarea" rows="10" cols="60" placeholder="Write your Python code here...">${defaultScript}</textarea>
                </div>
                <!-- Button to Run Code -->
                <div>
                    <button id="runCode">Run Code</button>
                </div>
                <!-- Output Window Box -->
                <div id="logOutput" style="white-space: pre-wrap; font-family: monospace; padding: 10px; background-color: #EBEEF1; margin-top: 10px; width: 470px; height: 150px; overflow-y: auto; border: 1px solid black;"></div>
            </div>
        `;
        place.appendChild(container);

        // Dynamically load Pyodide script
        const pyodideScript = document.createElement("script");
        pyodideScript.src = config.options.txtPyodidejsPath;
        pyodideScript.onload = async function() {
            // Initialize Pyodide when the script has loaded.
            let pyodide = await loadPyodide();

            // Get reference to the log output div
            const logOutputDiv = document.getElementById("logOutput");
            let outputLines = [];
            const maxLines = 10;

            // Override Python's built-in input function to prompt the user
            const originalInput = pyodide.pyimport("builtins").input;
            pyodide.pyimport("builtins").input = function(prompt) {
                const userInput = window.prompt(prompt);
                if (userInput === null) {
                    throw new Error("User cancelled the prompt.");
                }
                return userInput;
            };

            // Override the print function in Python to capture output
            const originalPrint = pyodide.pyimport("builtins").print;
            pyodide.pyimport("builtins").print = function(...args) {
                const output = args.join(" ") + "\n";
                if (outputLines.length >= maxLines) {
                    outputLines.shift();
                }
                outputLines.push(output);
                logOutputDiv.textContent = outputLines.join('');
            };

            // Evaluate Python code when the "Run Code" button is clicked
            document.getElementById("runCode").addEventListener("click", async function() {
                const pythonInput = document.getElementById("pythonInput").value.trim();
                if (!pythonInput) {
                    alert("Please enter Python code before running.");
                    return;
                }
                logOutputDiv.textContent = ""; // Clear previous output
                try {
                    await pyodide.runPythonAsync(pythonInput);
                } catch (e) {
                    logOutputDiv.textContent = "Error: " + e.message;
                }
            });
        };
        document.body.appendChild(pyodideScript);
    }
};

config.macros.runcppscript = {
    handler: function(place, macroName, params, wikifier, paramString, tiddler) {
        // Parse parameters "script:" and "tid:".
        var p = paramString.parseParams("script tid", null, true)[0] || {};
        var scriptContent;
        if (p.tid && p.tid.length) {
            // Load C++ source from the specified tiddler.
            scriptContent = store.getTiddlerText(p.tid[0]) || "";
        } else if (p.script && p.script.length) {
            // Use the provided script parameter.
            scriptContent = p.script.join(" ");
        } else {
            // Default C++ source code.
            scriptContent = "#include <iostream> using namespace std; int main() { cout << \"Hello, World!\" << endl; return 0; }";
        }
        
        // Create the container for the C++ Script.
        const container = document.createElement("div");
        container.innerHTML = `
            <h3>Enter your C++ code:</h3>
            <textarea id="cppCodeInput" class="cppCodeArea" rows="10" cols="60" placeholder="Write your C++ code here...">${scriptContent}</textarea>
            <div><button id="executeCppCode">Run Code</button></div>
            <div>
                <h3>Output:</h3>
                <pre id="cppOutput" class="cppOutputArea" style="white-space: pre-wrap; font-family: monospace; padding: 10px; background-color: #EBEEF1; margin-top: 10px; width: 470px; height: 35px; overflow-y: auto; border: 1px solid black;"></pre>
            </div>
        `;
        place.appendChild(container);

        // Dynamically load the JSCPP library.
        const jsCppScript = document.createElement("script");
        jsCppScript.src = config.options.txtJSCPPjsPath;
        jsCppScript.onload = function() {
            if (typeof JSCPP !== 'undefined') {
                console.log("JSCPP library loaded successfully!");
            } else {
                alert("Failed to load JSCPP library.");
            }
        };
        document.body.appendChild(jsCppScript);

        // Set up the button to run the C++ code when clicked.
        document.getElementById("executeCppCode").addEventListener("click", function() {
            const cppCode = document.getElementById("cppCodeInput").value;  // Get the C++ code from the textarea.
            const outputBox = document.getElementById("cppOutput");  // Get the output box.

            // Custom configuration for JSCPP.
            const configObj = {
                maxTimeout: 5000,
                debug: false,
                unsigned_overflow: 'warn',
                stdio: {
                    write: function(s) {
                        outputBox.textContent += s;
                    }
                }
            };

            try {
                if (typeof JSCPP !== 'undefined') {
                    // Compile and execute the C++ code.
                    JSCPP.run(cppCode, "", configObj, function(result) {
                        outputBox.textContent = result;
                    });
                } else {
                    alert("JSCPP library is not ready yet.");
                }
            } catch (e) {
                outputBox.textContent = "Execution error: " + e.message;
            }
        });
    }
};

config.macros.runwebrscript = {
    handler: function(place, macroName, params, wikifier, paramString, tiddler) {
        // Parse parameters "script:" and "tid:".
        var p = paramString.parseParams("script tid", null, true)[0] || {};
        var scriptContent = "";
        if(p.tid && p.tid.length) {
            // Load R code from the specified tiddler.
            scriptContent = store.getTiddlerText(p.tid[0]) || "";
        } else if(p.script && p.script.length) {
            scriptContent = p.script.join(" ");
        } else {
            scriptContent = "fit <- lm(mpg ~ am, data=mtcars); summary(fit)";
        }
        
        // Create container for the webR interface.
        var container = document.createElement("div");
        container.innerHTML = `
            <h3>Enter your R code:</h3>
            <textarea id="rCodeInput" rows="10" cols="60" placeholder="Write your R code here..." style="background-color:#f4f4f4;">${scriptContent}</textarea>
            <div><button id="runRButton" disabled>Loading webR...</button></div>
            <div>
                <h3>Output:</h3>
                <pre id="rOutput" style="white-space: pre-wrap; font-family: monospace; padding:10px; background-color:#EBEEF1; border:1px solid black; width:470px; height:150px; overflow-y:auto;"></pre>
            </div>
            <canvas id="rCanvas" width="1008" height="1008" style="display:none; margin:auto; width:700px;"></canvas>
        `;
        place.appendChild(container);
        
        // Dynamically load webR from its CDN (or local path if configured)
        var webrPath = config.options.txtwebrjsPath || "https://webr.r-wasm.org/latest/webr.mjs";
        var scriptEl = document.createElement("script");
        scriptEl.type = "module";
        scriptEl.innerHTML = `
            import { WebR } from "${webrPath}";
            // Initialize webR and expose it globally.
            const webR = new WebR();
            await webR.init();
            // Set the device to use the canvas for graphics.
            await webR.evalRVoid('options(device=webr::canvas)');
            // Create a shelter to capture output.
            const shelter = await new webR.Shelter();
            // Enable the Run button.
            document.getElementById("runRButton").disabled = false;
            document.getElementById("runRButton").innerText = "Run Code";
            
            // Function to run R code.
            async function runRCode() {
                document.getElementById("rCanvas").style.display = "none";
                const code = document.getElementById("rCodeInput").value;
                const result = await shelter.captureR(code, {
                    withAutoprint: true,
                    captureStreams: true,
                    captureConditions: false
                });
                try {
                    const out = result.output.filter(evt => evt.type === 'stdout' || evt.type === 'stderr')
                                              .map(evt => evt.data)
                                              .join('\\n');
                    document.getElementById("rOutput").innerText = out;
                } finally {
                    shelter.purge();
                }
            }
            document.getElementById("runRButton").addEventListener("click", runRCode);
            
            // Async loop to handle canvas events (optional)
            (async () => {
                for (;;) {
                    const output = await webR.read();
                    if (output.type === 'canvas') {
                        const canvas = document.getElementById('rCanvas');
                        if (output.data.event === 'canvasNewPage') {
                            canvas.style.display = 'block';
                            canvas.getContext('2d').clearRect(0, 0, 1008, 1008);
                        }
                        if (output.data.event === 'canvasImage') {
                            canvas.getContext('2d').drawImage(output.data.image, 0, 0);
                        }
                    }
                }
            })();
        `;
        document.body.appendChild(scriptEl);
    }
};
//}}}

