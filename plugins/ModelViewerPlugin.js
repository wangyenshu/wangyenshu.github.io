/***
|Name|ModelViewerPlugin|
|Source|https://github.com/wangyenshu/ModelViewerPlugin/blob/main/ModelViewerPlugin.js|
|Version|0.1|
|Author|Yanshu Wang|
|License|MIT|
|~CoreVersion|2.x|
|Type|plugin|
|Description|Displays a 3D model using the model‑viewer web component|
!!!!!Documentation
{{{
<<modelviewer src:"https://example.com/model.glb" alt:"3D Model" ar:"true" environmentImage:"https://example.com/env.hdr" poster:"https://example.com/poster.webp" shadowIntensity:"1" cameraControls:"true" touchAction:"pan-y" size:"200%,200%">>
}}}
Model downloaded from https://sketchfab.com/3d-models/low-poly-truck-car-drifter-f3750246b6564607afbefc61cb1683b1.
<<modelviewer src:"./assets/models/low-poly_truck_car_drifter.glb" alt:"3D Model Demo" ar:"true" shadowIntensity:"1" cameraControls:"true" touchAction:"pan-y" size:"200%,200%">>
!!!!!Credit
https://modelviewer.dev/
!!!!!Code
***/
//{{{
if(!version.extensions.ModelViewerPlugin) {
    version.extensions.ModelViewerPlugin = {major: 1, minor: 0, revision: 4, date: new Date()};
}

config.macros.modelviewer = {
    handler: function(place, macroName, params, wikifier, paramString, tiddler) {
        // Ensure the model-viewer JS is loaded
        if(!document.getElementById("model-viewer-script")) {
            var script = document.createElement("script");
            script.type = "module";
            script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js";
            script.id = "model-viewer-script";
            document.getElementsByTagName("head")[0].appendChild(script);
        }
        // Parse parameters using TiddlyWiki Classic's parseParams method.
        var p = paramString.parseParams("name", null, true)[0] || {};
        
        // Build attribute string for <model-viewer>
        var attr = "";
        if(p.src) { attr += ' src="' + p.src + '"'; }
        if(p.alt) { attr += ' alt="' + p.alt + '"'; }
        if(p.poster) { attr += ' poster="' + p.poster + '"'; }
        if(p.ar && p.ar.toString().toLowerCase() === "true") { attr += " ar"; }
        if(p.environmentImage) { attr += ' environment-image="' + p.environmentImage + '"'; }
        if(p.shadowIntensity) { attr += ' shadow-intensity="' + p.shadowIntensity + '"'; }
        if(p.cameraControls && p.cameraControls.toString().toLowerCase() === "true") { attr += " camera-controls"; }
        if(p.touchAction) { attr += ' touch-action="' + p.touchAction + '"'; }
        
        // Create a container with resize functionality
        var div = createTiddlyElement(place, "div");
        div.style.resize = "both";
        div.style.overflow = "auto";
        div.style.minWidth = "200px";
        div.style.minHeight = "200px";
        
        // If a size parameter is provided, apply it.
        if(p.size) {
            var dims = String(p.size).split(",");
            if(dims.length === 2) {
                div.style.width = dims[0].trim();
                div.style.height = dims[1].trim();
            }
        }
        
        // Insert the <model-viewer> element into the container
        div.innerHTML = "<model-viewer" + attr + "></model-viewer>";
    }
};
//}}}