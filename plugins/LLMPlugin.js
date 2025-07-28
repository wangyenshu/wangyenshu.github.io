/***
|Name        |LLMPlugin|
|Description |Displays an interface for llm.js to run a language model.|
|Source      |https://github.com/wangyenshu/LLMPlugin/blob/main/LLMPlugin.js|
|Version     |0.1|
|Author      |Yanshu Wang|
|License     |MIT|
|~CoreVersion|2.x|
|Type        |plugin|
!!!!!Documentation
Download llm.js release from https://github.com/rahuldshetty/llm.js/releases. Keep the folder structure. Set the path to llm.js in [[LLMPluginConfig]].
Use the {{{llmjs}}} macro (accepts optional parameters "prompt", "model", and "modelType"):
{{{
<<llmjs
  prompt:"def fibonacci(n):"
  model:"https://huggingface.co/RichardErkhov/bigcode_-_tiny_starcoder_py-gguf/resolve/main/tiny_starcoder_py.Q8_0.gguf"
  modelType:"GGUF_CPU"
>>
}}}
<<llmjs
  prompt:"def fibonacci(n):"
  model:"https://huggingface.co/RichardErkhov/bigcode_-_tiny_starcoder_py-gguf/resolve/main/tiny_starcoder_py.Q8_0.gguf"
  modelType:"GGUF_CPU"
>>
!!!!!Code
***/
//{{{
config.macros.llmjs = {
    handler: function(place, macroName, params, wikifier, paramString, tiddler) {
        // Parse parameters
        var p = paramString.parseParams()[0] || {};
        var initialPrompt = p.prompt ? p.prompt[0] : "def fibonacci(n):";
        var modelUrl = p.model ? p.model[0] : "https://huggingface.co/RichardErkhov/bigcode_-_tiny_starcoder_py-gguf/resolve/main/tiny_starcoder_py.Q8_0.gguf";
        var modelType = p.modelType ? p.modelType[0] : "GGUF_CPU";

        // Create a container for the LLM.js interface
        var container = document.createElement("div");
        container.innerHTML = `
            <style>
			  .llmInteraction {
				box-sizing: border-box;
				border: 1px solid black;
				width: 500px;
				border-radius: 10px;
				padding: 10px;

				font-family: monospace;
			  }
			</style>
            <h3>Enter Prompt for LLM:</h3>
            <textarea id="llmPromptInput" rows="4" class="llmInteraction" style="background-color:#f4f4f4;">${initialPrompt}</textarea>
            <div><button id="runLLMButton">Run Model</button></div>
            <div>
              <h3>Output:</h3>
              <pre id="llmOutput" class="llmInteraction" style="white-space: pre-wrap; background-color:#EBEEF1; height:150px; overflow-y:auto;"></pre>
            </div>
        `;
        place.appendChild(container);
        
        // Load llm.js from the configured path
        var llmjsPath = config.options.txtllmjsPath;
        if (!llmjsPath) {
            console.error("The path to llm.js is not set in config.options.txtllmjsPath.");
            return;
        }
        var scriptElement = document.createElement("script");
        scriptElement.src = llmjsPath;
        scriptElement.type = "module";
        scriptElement.onload = function() {
            // Within the module, import LLM and expose it globally
            // (We use an inline module script to do this.)
            var moduleCode = `
                import { LLM } from "${llmjsPath}";
                window.LLM = LLM;
            `;
            var inlineScript = document.createElement("script");
            inlineScript.type = "module";
            inlineScript.textContent = moduleCode;
            document.head.appendChild(inlineScript);
            
            // Delay setup to allow the inline module to execute and define window.LLM
            setTimeout(function(){
                if (typeof window.LLM === 'undefined') {
                    console.error("Failed to load LLM from the specified path:", llmjsPath);
                    return;
                }
                
                // State variable to track model load status
                let model_loaded = false;
                
                // Get references to UI elements
                const outputElem = document.getElementById("llmOutput");
                const promptInput = document.getElementById("llmPromptInput");
                const runButton = document.getElementById("runLLMButton");
                
                // Callback functions
                const on_loaded = () => { 
                    model_loaded = true; 
                    console.log("LLM model loaded");
                };
                const write_result = (text) => { 
                    outputElem.innerText += text + "\n"; 
                };
                const run_complete = () => { 
                    console.log("Model run complete");
                };
                
                // Configure the LLM instance using parameters from the macro
                const app = new window.LLM(
                    modelType,
                    modelUrl,
                    on_loaded,
                    write_result,
                    run_complete
                );
                
                // Download and load the model using a web worker
                app.load_worker();
                
                // Function to run the model using the current prompt
                async function runModel() {
                    if (!model_loaded) {
                        outputElem.innerText += "Model not loaded yet. Please wait...\n";
                        return;
                    }
                    // Clear previous output
                    outputElem.innerText = "";
                    // Run the model with the prompt from the input
                    const promptText = promptInput.value;
                    await app.run({ prompt: promptText, top_k: 1 });
                }
                
                // Attach the event listener to the run button
                runButton.addEventListener("click", runModel);
                
                // Optionally, trigger a run automatically once the model loads
                const checkInterval = setInterval(() => {
                    if(model_loaded) {
                        runModel();
                        clearInterval(checkInterval);
                    } else {
                        console.log("Waiting for model to load...");
                    }
                }, 5000);
            }, 500); // Adjust delay as needed
        };
        scriptElement.onerror = function() {
            console.error("Error loading llm.js from the specified path:", llmjsPath);
        };
        document.body.appendChild(scriptElement);
    }
};
//}}}