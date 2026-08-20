/*
 * Copyright 2006 Sun Microsystems, Inc.  All rights reserved.
 * You may not modify, use, reproduce, or distribute this
 * software except in compliance with the terms of the License at:
 *
 *   http://developer.sun.com/berkeley_license.html
 *
 * $Id: script.js,v 1.1 2006/10/27 21:12:38 basler Exp $
 */


/* =============================================================================
   Blueprints AJAX Components -- AutoCompleteComponent Functions
   ========================================================================== */  

dojo.require("dojo.io.*");


/**
 * Define our component container object (if necessary).
 */
if (bpui_undefined("autocomplete", bpui)) {

  bpui.autocomplete = {


    /**
     * Associative array of comonents on the current page, keyed by
     * the DOM id of the target input element.
     */
    components : new Object(),


    /**
     * Localizable messages in the default language.  Treat this variable
     * as an associative array keyed by a message identifier.  Robust
     * applications will dynamically replace these messages with a localized
     * version based on the locale of the current user.
     */
    messages : new Object(),


    /**
     * Holder for state information for the component that currently has focus.
     * This would need to be turned into an array if it were possible to have
     * more than one Auto Complete Text Field component with focus at the
     * same time.
     */
    state : new Object(),


    /**
     * The version number of this script.
     */
    version : {
      major: 0,
      minor: 1,
      patch: 0,
      flag: "",
      toString: function() {
        with (bpui.autocomplete.version) {
          return major + "." + minor + "." + patch + flag;
        }
      }
    }

  }


}


// Initialize the localizable messages for this component
bpui.autocomplete.messages["bindError"] = "An error occurred performing an asynchronous request";


/* -------------------------- Global Event Handlers ------------------------- */


/**
 * Return a closure that will handle the user choosing a particular item
 * for the specified component.
 *
 * @param component Component on which to process this event
 * @param value Value that was selected
 */
bpui.autocomplete._choose = function(component, value) {

  return function() {
    component.stop();
    component.onchoose(value);
    return false;
  };

}


/**
 * Return a closure that will process an error response for the
 * specified component.
 *
 * @param component Component on which to process this event
 */
bpui.autocomplete._error = function(component) {

  return function(type, err) {
    component.error(type, err);
  };

}


/**
 * Return a closure that will process an asynchronous response
 * for the specified component.
 *
 * @param component Component on which to process this event
 */
bpui.autocomplete._load = function(component) {

  return function(type, data, event) {
    if (event.readyState == 4) {
      component._clear();
      if (event.status == 200) {
        component.menu.style.visibility = "visible";
        var children = null;
        var items = data.getElementsByTagName("item");
        if ((items != null) && (items.length > 0)) {
          for (loop = 0; loop < items.length; loop++) {
            children = items[loop].childNodes;
            if ((children != null) && (children.length > 0)) {
              component._append(children[0].nodeValue);
            }
          }
        }
      }
    }
  };

}


/**
 * Return a closure that will stop asynchronous processing for the
 * specified component.
 *
 * @param component Component on which to process this event
 */
bpui.autocomplete._stop = function(component) {

  return function() {
    component._clear();
    component.menu.style.visibility = "hidden";
  };

}


/* -------------------------- Component Class ------------------------------- */


/**
 * "bpui.autocomplete.Component" is a JavaScript object that represents
 * a single instance of an Auto Complete Text Field component on a page.
 * It exposes public methods for interesting events that may be hooked
 * (via the DOJO event system) for wiring with other components on the
 * same page.
 *
 * Constructor parameters:
 * @param _target   The <input type="text"> element rendered for this component
 * @param _menu     The <div> element rendered for this component
 * @param _method   Method binding expression passed to the server to retrieve
 *                  values that match the current prefix
 * @param _callback URL for our asynchronous completion method callbacks
 * @param _onchooseCode  Optional JavaScript function to execute when the user
 *                       selects a particular item, or null if none
 *                       (the selected item will be passed to this function
 *                       as the only parameter)
 * @param _ondisplayCode Optional JavaScript function to execute when the
 *                       server offers a completion choice (the item proposed
 *                       by the server will be passed to this function as the
 *                       only parameter, and the value returned by this function
 *                       will be what is displayed for in the choice list)
 */

bpui.autocomplete.Component = function(_target, _menu, _method, _callback,
                                       _onchooseCode, _ondisplayCode) {


    /* ------------------------- Initialization ----------------------------- */


    // Register ourselves with the complete list of components
    bpui.autocomplete.components[_target.id] = this;


    /* ----------------------------- Public Fields -------------------------- */


    /**
     * The <input type="text"> element for this component's text field.
     */
    this.target = _target;


    /**
     * The <div> element for this component's dynamically constructed menu.
     */
    this.menu = _menu;


    /**
     * The method binding expression to pass back to the server to retrieve
     * the matching completion choices.
     */
    this.method = _method;


    /**
     * URL for our asynchronous completion callbacks.
     */
    this.callback = _callback;


    /**
     * Optional JavaScript function to execute when the user selects a
     * particular value, or null if none.  The value selected by the user
     * will be passed to this function as the only parameter.
     */
    this.onchooseCode = _onchooseCode;


    /**
     * Optional JavaScript function to execute when the server offers a
     * completion choice, or null if none.  The value proposed by the
     * server will be passed to this function as the only parameter,
     * and the return value from this function will be what is actually
     * added to the choices list.
     */
    this.ondisplayCode = _ondisplayCode;


    /**
     * Flag indicating that we have started performing asynchronous callbacks
     * for this component (because it received focus), but have not yet stopped
     * doing so (because we lost focus).
     */
    this.started = false;


    /* ----------------------------- Support Functions ---------------------- */


    /**
     * Append the specified value (possibly modified by a
     * user specified ondisplay function) to the completions list.
     *
     * @param value The new value to be added
     */
    this._append = function(value) {

      var item = document.createElement("div");
      this.menu.appendChild(item);
      var link = document.createElement("a");
      link.className = "popupItem";
      link.href = "#";
      link.onclick = bpui.autocomplete._choose(this, value);
      link.appendChild(document.createTextNode(this.ondisplay(value)));
      item.appendChild(link);

    }


    /**
     * Clear any existing completion items from the menu <div>.
     */
    this._clear = function() {

      if (this.menu) {
        for (loop = this.menu.childNodes.length - 1; loop >= 0; loop--) {
          this.menu.removeChild(this.menu.childNodes[loop]);
        }
      }

    }


    /**
     * Perform an asynchronous callback to the server to get the
     * relevant set of choices.  When received, repopulate our items list.
     */
    this._callback = function() {

      // Accumulate the callback URL
      var holder = this.callback;
      var params = this.parameters();
      var first = true;
      for (param in params) {
        if (first) {
          holder += "?";
          first = false;
        } else {
          holder += "&";
        }
        holder += param + "=" + escape(params[param]);
      }

      // Perform the asynchronous callback
      var bindArgs = {
        url:      holder,
        mimetype: "text/xml",
        error:    bpui.autocomplete._error(this),
        load:     bpui.autocomplete._load(this)
      };
      dojo.io.bind(bindArgs);

    }


    /**
     * Calculate and return the width we should use for the
     * completion choices list.
     */
    this._width = function() {

      var element = this.target;
      if (element.clientWidth && element.offsetWidth && element.clientWidth <element.offsetWidth) {
          return element.clientWidth; /* some mozillas (like 1.4.1) return bogus clientWidth so ensure it's in range */
      } else if (element.offsetWidth) {
          return element.offsetWidth;
      } else if (element.width) {
          return element.width;
      } else {
          return 0;
      }

    }


    /**
     * Calculate and return the X coordinate at which we should
     * draw the completion choices list.
     */
    this._x = function() {

      var element = this.target;
      var x = 0;
      while (element) {
        if (element.offsetParent) {
          x += element.offsetLeft;
        } else if (element.x) {
          x += element.x;
        }
        element = element.offsetParent;
      }
      return x;

    }


    /**
     * Calculate and return the Y coordinate at which we should
     * draw the completion choices list.
     */
    this._y = function() {

      var element = this.target;
      var y = 0;
      while (element) {
        if (element.offsetParent) {
          y += element.offsetTop;
        } else if (element.y) {
          y += element.y;
        }
        element = element.offsetParent;
      }
      return y;

    }


    /* ------------------------------ Public Events ------------------------- */


    /**
     * Continue performing asynchronous callbacks for this component,
     * if we currently have focus.
     */
    this.again = function() {

      if (this.started) {
        this._callback();
      }

    }


    /**
     * Process the failure of an asynchronous request.
     *
     * @param type Event type ("error")
     * @param err  Low-level error object
     */
    this.error = function(type, err) {

      window.status = bpui.autocomplete.messages["bindError"] + ": " + err;

    }


    /**
     * Event called each time the user selects a value from the
     * completion choices list.  The default implementation calls
     * through to the onchoose function passed to our constructor
     * (if any).  If there is no such function, it simply sets the
     * value of the target input element.
     *
     * @param value Completion choice selected by the user
     */
    this.onchoose = function(value) {

      if (this.onchooseCode) {
        this.onchooseCode(value);
      } else {
        this.target.value = value;
      }

    }


    /**
     * Event called each time the server offers a completion choice.
     * The default implementation calls through to the ondisplay function
     * passed to our constructor (if any) and returns the value returned
     * by that function.  If there is no ondisplay function, the specified
     * value is returned unchanged.
     *
     * @param value Completion choice returned by the server
     *
     * @return The possibly modified completion choice to add to the list
     */
    this.ondisplay = function(value) {

      if (this.ondisplayCode) {
        return this.ondisplayCode(value);
      } else {
        return value;
      }

    }


    /**
     * Return an associative array of the parameter name/value pairs to be
     * included on asynchronous callbacks for this component.  The default
     * implementation passes back the value of the "method" passed in to our
     * constructor, plus the "prefix" from the current value of our textfield.
     *
     * Advanced users can decorate the value returned by this method to
     * send additional values to your server side handlers
     *
     * @return The associative array of parameters to include
     */
    this.parameters = function() {

      var params = {
        method:   this.method,
        prefix:   escape(this.target.value)
      };
      return params;

    }


    /**
     * Start the autocompletion process, and begin asynchronous communication
     * with the host on each keystroke.
     */
    this.start = function() {

      // Calculate size and position of the menu <div> we will use
      // This must be done here, instead of in the constructor, because
      // the position of the input field might have moved from where it
      // was originally
      this.menu.style.left = this._x() + "px";
      this.menu.style.top = this._y() + this.target.offsetHeight + 2 + "px";
      var width = this._width();
      if (width > 0) {
        this.menu.style.width = width + "px";
      }

      // Note that we have started, and trigger the first asynchornous callback
      this.started = true;
      this._callback();

    }


    /**
     * Stop the autocompletion process, and terminate asynchronous
     * communication with the host on each keystroke.
     */
    this.stop = function() {

      this.started = false;
      var closure = bpui.autocomplete._stop(this);
      setTimeout(closure, 400);

    }


}
