/***
|Name        |EncryptDecryptBookmarkletPlugin|
|Description |Plugin adapted from https://qiita.com/useiichi/items/0786199ee61443df3af5.|
|Source      |https://github.com/wangyenshu/EncryptDecryptBookmarkletPlugin/blob/main/EncryptDecryptBookmarkletPlugin.js|
|Version     |1.0|
|Author      |Yanshu Wang with the help of AI|
|License     |MIT|
|~CoreVersion|2.x|
|Type        |plugin|
!!!!!Documentation
Use the {{{<<EncryptDecryptBookmarklet>>}}} macro to display a button that launches the encryption/decryption tool.
The tool will open in a new pop-up window, allowing you to encrypt and decrypt text using a passphrase.
<<EncryptDecryptBookmarklet>>
!!!!!Code
***/
//{{{
config.macros.EncryptDecryptBookmarklet = {
    handler: function(place, macroName, params, wikifier, paramString, tiddler) {
        // Create a button element
        var button = document.createElement("button");
        button.innerText = "Encrypt/Decrypt Tool"; // Text displayed on the button
        button.title = "Click to open the AES encryption/decryption tool"; // Tooltip

        // Add some basic styling classes for consistency with TiddlyWiki buttons
        // Assuming 'tiddlyLink' and 'button' classes exist and provide styling.
        button.className = "tiddlyLink button";

        button.onclick = function() {
            var w = window.open('','Links','scrollbars,resizable,width=640,height=550');
            if (!w) { // Check if pop-up was blocked
                alert("Pop-up blocked! Please allow pop-ups for this site to use the AES tool.");
                return;
            }

            // Construct the HTML content for the new window.
            // All double quotes within the HTML string must be escaped as \"
            var htmlContent = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"/><script src=\"https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/core.js\"></script><script src=\"https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/sha1.js\"></script><script src=\"https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/hmac.js\"></script><script src=\"https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/enc-base64.js\"></script><script src=\"https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/cipher-core.js\"></script><script src=\"https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/aes.js\"></script><script src=\"https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/pbkdf2.js\"></script><script type=\"text/javascript\">function encrypt(){var encypt_text=document.getElementById(\"encypt-text\").value;var pass=CryptoJS.enc.Utf8.parse(document.getElementById(\"encrypt-password\").value);var salt=CryptoJS.lib.WordArray.random(128/8);var key=CryptoJS.PBKDF2(pass,salt,{keySize:256/32,iterations:100});var iv=CryptoJS.lib.WordArray.random(128/8);var options={iv:iv,mode:CryptoJS.mode.CBC,padding:CryptoJS.pad.Pkcs7};var encrypted=CryptoJS.AES.encrypt(encypt_text,key,options);document.getElementById(\"transitmessage\").value=salt.toString()+iv.toString()+encrypted.toString();}function decrypt(){document.getElementById(\"decrypted\").value=\"\";var transitmessage=document.getElementById(\"transitmessage\").value;var salt=CryptoJS.enc.Hex.parse(transitmessage.substr(0,32));var iv=CryptoJS.enc.Hex.parse(transitmessage.substr(32,32));var encrypted=transitmessage.substring(64);var pass=CryptoJS.enc.Utf8.parse(document.getElementById(\"decrypt-password\").value);var key=CryptoJS.PBKDF2(pass,salt,{keySize:256/32,iterations:100});var options={iv:iv,mode:CryptoJS.mode.CBC,padding:CryptoJS.pad.Pkcs7};var decrypted=CryptoJS.AES.decrypt(encrypted,key,options);document.getElementById(\"decrypted\").value=decrypted.toString(CryptoJS.enc.Utf8);}</script></head><body><label for=\"encypt-text\">Text to encrypt:</label><br /><textarea id=\"encypt-text\" rows=\"8\" cols=\"85\">Hello</textarea><br />&nbsp;↓&nbsp;<label for=\"encrypt-password\">Encryption Password:</label><br />&nbsp;↓&nbsp;<input id=\"encrypt-password\" type=\"text\" size=\"80\" value=\"password\" /><br />&nbsp;↓&nbsp;<input id=\"encrypt\" type=\"button\" value=\"Encrypt\" onclick=\"encrypt()\" /><br /><label for=\"transitmessage\">Ciphertext:</label><br /><textarea id=\"transitmessage\" rows=\"4\" cols=\"85\"></textarea><br />&nbsp;↓&nbsp;<label for=\"decrypt-password\">Decryption Password:</label><br />&nbsp;↓&nbsp;<input id=\"decrypt-password\" type=\"text\" size=\"80\" value=\"password\" /><br />&nbsp;↓&nbsp;<input id=\"decrypt\" type=\"button\" value=\"Decrypt\" onclick=\"decrypt()\" /><br /><label for=\"decrypted\">Decrypted Plaintext:</label><br /><textarea id=\"decrypted\" rows=\"8\" cols=\"85\"></textarea></body></html>";

            w.document.write(htmlContent);
            w.document.close(); // Important to close the document stream after writing content
            return false; // Prevent default link action (though not a link here, good practice)
        };

        // Append the button to the place where the macro is called
        place.appendChild(button);
    }
};
//}}}