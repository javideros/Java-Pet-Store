/*
 * Copyright 2006 Sun Microsystems, Inc.  All rights reserved.
 * You may not modify, use, reproduce, or distribute this
 * software except in compliance with the terms of the License at:
 *
 *   http://developer.sun.com/berkeley_license.html
 *
 * $Id: script.js,v 1.2 2006/05/30 15:58:08 basler Exp $
 */


/* =============================================================================
   Blueprints AJAX Components -- Common JavaScript Functions
   ========================================================================== */  


/**
 * Alias for the top-level global object in the host environment
 * (the "window" object in a browser).
 */
var bpui_global = this; // typeof window == 'undefined' ? this : window;


/**
 * Return true if the specified name is undefined in the specified scope.
 *
 * @param name Variable name to be checked
 * @param scope Object within which to check for this name (if not specified,
 *  "bpui_global" is checked)
 */
function bpui_undefined(name, scope) {
  if (!scope) {
    scope = bpui_global;
  }
  return typeof scope[name] == "undefined";
}


/**
 * The root variable of nearly all of our public API.
 */
var bpui;
if (bpui_undefined("bpui")) {
  bpui = { };
}


/**
 * The version number of this script.
 */
bpui.version = {
  major: 0,
  minor: 1,
  patch: 0,
  flag: "",
  toString: function() {
    with (bpui.version) {
      return major + "." + minor + "." + patch + flag;
    }
  }
}


/**
 * Create a <script> element to load the specified JavaScript
 * resource dynamically.
 *
 * WARNING - this method can ONLY be successfully called from
 * top level JavaScript code.  Calling it from within a method
 * will not be effective.
 *
 * @param url URL of the JavaScript resource to be loaded
 */
bpui.load = function(url) {
  document.write('<script type="text/javascript" src="' + url + '"></script>');
}

/**
 * function that returns the context root of the page's URL
 */
bpui.getContextRoot = function() {
    var urlArray=window.location.toString().split("/", 4);
    return "/" + urlArray[3];
}

/**
 * variable that holds the context root of the page's URL
 */
bpui.contextRoot = bpui.getContextRoot();

/**
 * helper function to get a URI that has the context root.
 */
bpui.attachRootToPath = function(baseString) {
    return bpui.contextRoot + "/" +  baseString;
} 

