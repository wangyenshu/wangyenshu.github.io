/***
|Name|innerTW5Plugin|
|Source|https://github.com/wangyenshu/innerTW5Plugin/blob/main/innerTW5Plugin.js|
|Author|Yanshu Wang|
|Version|0.1|
|Type|plugin|
|Description|Embedded Tiddlywiki5 frame inside Tiddlywiki Classic, allowing users to use Tiddlywiki5 Plugins inside Tiddlywiki classic.|
|License|MIT|
!Usage
{{{
<<innerTW5Plugin tid:"innerTW5PluginDemo" tid:"innerTW5PluginMultiDemo" width:"80%" height:"400px">>
}}}
<<innerTW5Plugin tid:"innerTW5PluginDemo" tid:"innerTW5PluginMultiDemo" width:"80%" height:"400px">>
!Documentation
This macro will append the content inside the tiddler that the 'tid' parameter calls inside this place in [[TW5Sandbox]]
{{{
<!--~~ Ordinary tiddlers ~~-->
<script class="tiddlywiki-tiddler-store" type="application/json">[
]</script><div id="storeArea" 
}}}
in order. In the example, it will append the content in [[innerTW5PluginDemo]] then append the content in [[innerTW5PluginMultiDemo]] to that place in [[TW5Sandbox]] and display it in an iframe.
So the content should be in JSON format, see [[innerTW5PluginDemo]] for an example.
Edit the template TW5 in [[TW5Sandbox]].
The default tiddler for [[TW5Sandbox]] is configured as {{{TW5Sandbox}}}.
Example [[innerTW5PluginDemoD3]] shows how to use D3 plugin in TW5 in TWC.
This macro works for Firefox but not Chrome. Since Chrome does not support loading iframe of size greater than 2MB.

The following bookmarklet simplify the json editing:
{{{
javascript:w=window.open('','Links','scrollbars,resizable,width=640,height=550');w.document.write('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>TiddlyWiki Tiddler JSON Editor</title><style>body{font-family:\'Inter\',sans-serif;margin:0;padding:20px;min-height:100vh;display:flex;align-items:center;justify-content:center;background-color:#f0f0f0;}@media(max-width:768px){body{padding:10px;}.container{padding:15px;}.flex-buttons%20button{width:100%;min-width:unset;}.message-box-content{padding:15px;}}@media(min-width:769px){.container{max-width:800px;}}.container{background-color:#fff;padding:30px;border-radius:10px;box-shadow:0%204px%2015px%20rgba(0,0,0,.1);width:100%;box-sizing:border-box;}h1{text-align:center;margin-bottom:20px;}p{text-align:center;margin-bottom:20px;}textarea,input[type="text"]{width:100%;padding:8px;margin-bottom:10px;border:1px%20solid%20#ccc;border-radius:4px;box-sizing:border-box;}textarea{resize:vertical;}button{padding:10px%2015px;border:none;border-radius:5px;cursor:pointer;background-color:#007bff;color:white;margin-right:10px;}button:hover{background-color:#0056b3;}#fieldEditor,#jsonOutput,#messageBox{display:none;}#messageBox{position:fixed;top:0;left:0;right:0;bottom:0;background-color:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;}#messageBox>div{background-color:white;padding:20px;border-radius:8px;box-shadow:0%204px%2010px%20rgba(0,0,0,.2);max-width:400px;width:100%;text-align:center;}#messageText{margin-bottom:15px;}.flex-buttons{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:20px;}.flex-buttons%20button{flex:1;min-width:120px;}.field-group{margin-bottom:10px;}.border-top{border-top:1px%20solid%20#eee;padding-top:20px;margin-top:20px;}</style></head><body><div%20class="container"><h1>TiddlyWiki%20Tiddler%20JSON%20Editor</h1><p>Paste%20a%20tiddler\'s%20JSON%20below%20to%20edit%20its%20fields.<br>Modify%20the%20fields,%20then%20click%20"Generate%20JSON"%20to%20see%20the%20updated%20output.</p><div%20id="initialJsonInput"><label%20for="inputJson">Paste%20Tiddler%20JSON%20Here:</label><textarea%20id="inputJson"rows="10"placeholder=\'{\n%20%20%20%20"title":%20"My%20Example%20Tiddler",\n%20%20%20%20"text":%20"This%20is%20some%20example%20text%20for%20the%20tiddler.%20You%20can%20[[edit]]%20it.",\n%20%20%20%20"tags":%20"example%20demo",\n%20%20%20%20"created":%20"20250622100000000",\n%20%20%20%20"modified":%20"20250622100000000",\n%20%20%20%20"modifier":%20"TiddlyWikiUser",\n%20%20%20%20"type":%20"text/vnd.tiddlywiki",\n%20%20%20%20"customField1":%20"Custom%20Value%201",\n%20%20%20%20"anotherField":%20"Another%20custom%20value"\n}\'></textarea><button%20id="loadJsonButton"style="width:100%;">Load%20Tiddler</button></div><div%20id="fieldEditor"style="display:none;"><h2>Edit%20Tiddler%20Fields</h2><div%20id="field-container"></div><div%20class="border-top"><h3>Add%20New%20Field</h3><div%20style="display:flex;gap:10px;"><input%20type="text"id="newFieldName"style="flex-grow:1;"placeholder="Enter%20new%20field%20name%20(e.g.,%20\'my-custom-field\')"><button%20id="addNewFieldButton">Add%20Field</button></div></div><div%20class="flex-buttons"><button%20id="generateJsonButton">Generate%20JSON</button><button%20id="resetButton">Reset</button></div></div><div%20id="jsonOutput"style="display:none;"><h2>Generated%20Tiddler%20JSON</h2><pre%20id="jsonCode"style="background-color:#f9f9f9;padding:10px;border:1px%20solid%20#ddd;border-radius:4px;overflow:auto;max-height:200px;"></pre><button%20id="copyJsonButton"style="width:100%;margin-top:10px;">Copy%20JSON</button></div><div%20id="messageBox"style="position:fixed;top:0;left:0;right:0;bottom:0;background-color:rgba(0,0,0,.75);display:none;align-items:center;justify-content:center;"><div%20style="background-color:white;padding:20px;border-radius:8px;box-shadow:0%204px%2010px%20rgba(0,0,0,.2);max-width:400px;width:100%;text-align:center;"><p%20id="messageText"style="margin-bottom:15px;"></p><button%20id="messageBoxClose">OK</button></div></div></div><script>function%20showMessageBox(message){const%20messageBox=document.getElementById(\'messageBox\');const%20messageText=document.getElementById(\'messageText\');messageText.textContent=message;messageBox.style.display=\'flex\';}document.getElementById(\'messageBoxClose\').addEventListener(\'click\',()=>{(document.getElementById(\'messageBox\').style.display=\'none\');});const%20inputJsonTextarea=document.getElementById(\'inputJson\');const%20loadJsonButton=document.getElementById(\'loadJsonButton\');const%20fieldEditorDiv=document.getElementById(\'fieldEditor\');const%20initialJsonInputDiv=document.getElementById(\'initialJsonInput\');const%20fieldContainer=document.getElementById(\'field-container\');const%20generateJsonButton=document.getElementById(\'generateJsonButton\');const%20resetButton=document.getElementById(\'resetButton\');const%20jsonOutputDiv=document.getElementById(\'jsonOutput\');const%20jsonCodePre=document.getElementById(\'jsonCode\');const%20copyJsonButton=document.getElementById(\'copyJsonButton\');const%20newFieldNameInput=document.getElementById(\'newFieldName\');const%20addNewFieldButton=document.getElementById(\'addNewFieldButton\');let%20currentTiddlerData=null;const%20fieldInputs={};function%20createFieldInput(fieldName,fieldValue=\'\'){const%20fieldGroup=document.createElement(\'div\');fieldGroup.className=\'field-group\';const%20label=document.createElement(\'label\');label.textContent=fieldName;label.setAttribute(\'for\',`field-${fieldName}`);fieldGroup.appendChild(label);let%20inputElement;if(fieldName===\'text\'){inputElement=document.createElement(\'textarea\');inputElement.rows=8;}else{inputElement=document.createElement(\'input\');inputElement.type=\'text\';}inputElement.id=`field-${fieldName}`;inputElement.name=fieldName;inputElement.value=fieldValue;fieldGroup.appendChild(inputElement);fieldContainer.appendChild(fieldGroup);fieldInputs[fieldName]=inputElement;}function%20loadTiddlerFields(jsonString){try{currentTiddlerData=JSON.parse(jsonString);fieldContainer.innerHTML=\'\';for(const%20key%20in%20fieldInputs){delete%20fieldInputs[key];}const%20sortedFields=Object.keys(currentTiddlerData).sort((a,b)=>{if(a===\'title\')return-1;if(b===\'title\')return%201;if(a===\'text\')return-1;if(b===\'text\')return%201;return%20a.localeCompare(b);});sortedFields.forEach(fieldName=>{createFieldInput(fieldName,currentTiddlerData[fieldName]);});initialJsonInputDiv.style.display=\'none\';fieldEditorDiv.style.display=\'block\';jsonOutputDiv.style.display=\'none\';}catch(e){showMessageBox(\'Invalid%20JSON%20provided.%20Please%20check%20your%20input.\');console.error(\'JSON%20parsing%20error:\',e);}}loadJsonButton.addEventListener(\'click\',()=>{(json=inputJsonTextarea.value.trim());if(json){loadTiddlerFields(json);}else{showMessageBox(\'Please%20paste%20Tiddler%20JSON%20into%20the%20textarea%20first.\');}});addNewFieldButton.addEventListener(\'click\',()=>{(newFieldName=newFieldNameInput.value.trim());if(newFieldName){if(fieldInputs[newFieldName]){showMessageBox(`Field%20"${newFieldName}"%20already%20exists.`);}else{createFieldInput(newFieldName,\'\');newFieldNameInput.value=\'\';}}else{showMessageBox(\'Please%20enter%20a%20field%20name.\');}});generateJsonButton.addEventListener(\'click\',()=>{(updatedTiddlerData={});for(const%20fieldName%20in%20fieldInputs){if(fieldInputs.hasOwnProperty(fieldName)){updatedTiddlerData[fieldName]=fieldInputs[fieldName].value;}}try{(outputJsonString=JSON.stringify(updatedTiddlerData));jsonCodePre.textContent=outputJsonString;jsonOutputDiv.style.display=\'block\';}catch(e){showMessageBox(\'Error%20generating%20JSON%20from%20fields.%20Please%20check%20your%20field%20values.\');console.error(\'JSON%20stringify%20error:\',e);}});resetButton.addEventListener(\'click\',()=>{(initialJsonInputDiv.style.display=\'block\');fieldEditorDiv.style.display=\'none\';jsonOutputDiv.style.display=\'none\';inputJsonTextarea.value=inputJsonTextarea.placeholder;fieldContainer.innerHTML=\'\';currentTiddlerData=null;for(const%20key%20in%20fieldInputs){delete%20fieldInputs[key];}});document.addEventListener(\'DOMContentLoaded\',()=>{(inputJsonTextarea.value=inputJsonTextarea.placeholder);});copyJsonButton.addEventListener(\'click\',async()=>{(jsonText=jsonCodePre.textContent);if(jsonText){try{await%20navigator.clipboard.writeText(jsonText);showMessageBox(\'JSON%20copied%20to%20clipboard!\');}catch(err){showMessageBox(\'Failed%20to%20copy%20JSON%20to%20clipboard.%20Your%20browser%20might%20require%20user%20interaction%20or%20permissions%20to%20copy.\');console.error(\'Copy%20to%20clipboard%20failed:\',err);}}else{showMessageBox(\'No%20JSON%20to%20copy!\');}});</script></body></html>');
}}}
!Todo
Reduce the size of [[TW5Sandbox]].
Add a parameter to configure default tiddler in [[TW5Sandbox]].
!Credit
The example [[innerTW5PluginDemoD3]] use tiddlers in https://tiddlywiki.com/plugins/tiddlywiki/d3/.
***/
//{{{
config.macros.innerTW5Plugin = {
    handler: function(place, macroName, params, wikifier, paramString, tiddler) {
        // Parse parameters "tid", "width", and "height"
        var paramsObj = paramString.parseParams("tid width height", null, true)[0] || {};
        var tidList = paramsObj.tid || [];
        var iframeWidth = (paramsObj.width && paramsObj.width.length) ? paramsObj.width[0] : "100%";
        var iframeHeight = (paramsObj.height && paramsObj.height.length) ? paramsObj.height[0] : "600px";
        
        if(tidList.length === 0) {
            createTiddlyText(place, "No tiddler names provided");
            return;
        }
        
        // Retrieve the TW5Sandbox tiddler which contains the basic TW5 HTML template.
        var sandbox = store.getTiddlerText("TW5Sandbox");
        if(!sandbox) {
            createTiddlyText(place, "TW5Sandbox tiddler not found");
            return;
        }
        
        // Locate the insertion marker and the <script> tag that holds the JSON tiddler store.
        var marker = "<!--~~ Ordinary tiddlers ~~-->";
        var markerIndex = sandbox.indexOf(marker);
        if(markerIndex === -1) {
            createTiddlyText(place, "Insertion marker not found in TW5Sandbox");
            return;
        }
        var scriptTag = '<script class="tiddlywiki-tiddler-store" type="application/json">';
        var scriptStart = sandbox.indexOf(scriptTag, markerIndex);
        if(scriptStart === -1) {
            createTiddlyText(place, "Script tag not found in TW5Sandbox");
            return;
        }
        var scriptEnd = sandbox.indexOf("</script>", scriptStart);
        if(scriptEnd === -1) {
            createTiddlyText(place, "Script closing tag not found in TW5Sandbox");
            return;
        }
        
        // Extract the JSON content between the script tags.
        var jsonStart = sandbox.indexOf(">", scriptStart) + 1;
        var jsonContent = sandbox.substring(jsonStart, scriptEnd).trim();
        if(jsonContent.slice(-1) !== "]") {
            createTiddlyText(place, "Store JSON content not in expected format");
            return;
        }
        
        // Remove the closing bracket from the JSON array so we can append additional tiddler content.
        var newJsonContent = jsonContent.slice(0, -1).trim();
        
        // Loop over each tid parameter, fetch its content and append it.
        for(var i = 0; i < tidList.length; i++){
            var tContent = store.getTiddlerText(tidList[i]);
            if(!tContent) {
                createTiddlyText(place, "Tiddler '" + tidList[i] + "' not found");
                return;
            }
            // Add a comma separator if necessary.
            if(newJsonContent.length > 1) {
                newJsonContent += ",\n" + tContent;
            } else {
                newJsonContent += tContent;
            }
        }
        // Close the JSON array.
        newJsonContent += "]";
        
        // Rebuild the sandbox HTML with the updated JSON inserted.
        var newSandbox = sandbox.substring(0, jsonStart) + "\n" + newJsonContent + "\n" + sandbox.substring(scriptEnd);
        
        // Create a data URL for the modified HTML and create an iframe.
        var iframeSrc = "data:text/html;charset=utf-8," + encodeURIComponent(newSandbox);
        var iframe = document.createElement("iframe");
        iframe.style.width = iframeWidth;
        iframe.style.height = iframeHeight;
        iframe.src = iframeSrc;
        place.appendChild(iframe);
    }
};
//}}}