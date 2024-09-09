/*
 * Cordova Prompt Plugin
 * Copyright (c) Paul Panserrieu, Zenexity 2011
 * MIT Licensed
 */

function Prompt() {

}

Prompt.prototype.show = function(title, okCallback, cancelCallback, okButtonTitle, cancelButtonTitle, showTextField) { 

    var defaults = {
        title : title,
        okButtonTitle : (okButtonTitle || "Ok"),
        cancelButtonTitle : (cancelButtonTitle || "Cancel"),
        showTextField: (showTextField || null)
    };

    var key = 'f' + this.callbackIdx++;
    window.plugins.Prompt.callbackMap[key] = {
        okCallback: function(msg) {
            if (okCallback && typeof okCallback === 'function') {
                okCallback(msg);
            }
            delete window.plugins.Prompt.callbackMap[key];
        },
        cancelCallback: function() {
            if (cancelCallback && typeof cancelCallback === 'function') {
                cancelCallback();
            }
            delete window.plugins.Prompt.callbackMap[key];
        }
    };
    var callback = 'window.plugins.Prompt.callbackMap.' + key;
    Cordova.exec("Prompt.show", callback, defaults);
};

Prompt.prototype.callbackMap = {};
Prompt.prototype.callbackIdx = 0;

Cordova.addConstructor(function() {
    if(!window.plugins) {
        window.plugins = {};
    }
    window.plugins.Prompt = new Prompt();
});
