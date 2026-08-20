/*
 * Copyright 2006 Sun Microsystems, Inc.  All rights reserved.
 * You may not modify, use, reproduce, or distribute this
 * software except in compliance with the terms of the License at:
 *
 *   http://developer.sun.com/berkeley_license.html
 *
 * $Id: script.js,v 1.1 2006/10/31 17:52:11 basler Exp $
 */

dojo.require("dojo.io.*");

/**
 * Define our component container object (if necessary).
 */
if (bpui_undefined("rating", bpui)) {

  var componentsObject = new Object();
  bpui.rating = {
    /**
     * Localizable messages in the default language.  Treat this variable
     * as an associative array keyed by a message identifier.  Robust
     * applications will dynamically replace these messages with a localized
     * version based on the locale of the current user.
     */
    messages : new Object(),


    /**
     * Holder for state information for the various component instances.
     * Treat this variable as an associative array with clientId as key
     * and bpui.rating.Instance objects as values.
     */
    state : componentsObject,

    /**
     * An alias for the state property
     */
    components : componentsObject,

    /**
     * The version number of this script.
     */
    version : {
      major: 0,
      minor: 1,
      patch: 0,
      flag: "",
      toString: function() {
        with (bpui.rating.version) {
          return major + "." + minor + "." + patch + flag;
        }
      }
    },

    /**
    * The defaults object
    */
    defaults : null,

    /**
    * The unparameterized URL to send AJAX requests to
    */
    unparameterizedUrl : null,

    /**
    * The value of window.onload before we modify it.
    */
    windowOnload : null
  }
}

//information about an image used in a rating widget
bpui.rating.ImageInfo = function(hoverText, imageSources, width, height) {
    this.hoverText = hoverText;
    this.imageSources = imageSources;
    this.width = width;
    this.height = height;
}

//shallow copy an ImageInfo
bpui.rating.shallowCopyImageInfo = function(imageInfo) {
    return new bpui.rating.ImageInfo(imageInfo.hoverText, imageInfo.imageSources, imageInfo.width, imageInfo.height);
}

//default info shared by all rating widgets
bpui.rating.DefaultInfo = function() {
    this.imageInfos = new Array();
    this.imageInfos["star"] = null;
    this.imageInfos["notInterested"] = null;
    this.imageInfos["clear"] = null;
    this.imageInfos["modeToggle"] = null;
    this.gradeAcknowledgedText = null;
    this.normalModeAcknowledgedText = null;
    this.averageModeAcknowledgedText = null;
    this.normalModeText = null;
    this.averageModeText = null;
}

bpui.rating.preloadDefaultImages = function(defaultInfo) {
    for (key in defaultInfo.imageInfos) {
        var imageInfo = defaultInfo.imageInfos[key];
        if (imageInfo == null) {
            continue;
        }
        var imageSources = imageInfo.imageSources;
        var width = imageInfo.width;
        var height = imageInfo.height;
        var image = new Image(width, height);
        for (var i = 0; i < imageSources.length; i++) {
            image.src = imageSources[i];
        }
    }
}

bpui.rating.preloadCustomImages = function(imageInfos) {
    if (imageInfos == null) {
        return;
    }
    for (var i = 0; imageInfos.starImageInfos != null && i < imageInfos.starImageInfos.length; i++) {
        bpui.rating.preloadCustomImage(imageInfos.starImageInfos[i]);
    }
    if (imageInfos.otherImageInfos == null) {
        return;
    }
    for (key in imageInfos.otherImageInfos) {
        bpui.rating.preloadCustomImage(imageInfos.otherImageInfos[key]);
    }
}

bpui.rating.preloadCustomImage = function(imageInfo) {
    if (imageInfo == null) {
        return;
    }
    var image;
    if (imageInfo.width != null && imageInfo.height != null) {
        image = new Image(imageInfo.width, imageInfo.height);
    }
    else {
        image = new Image();
    }
    for (var i = 0; imageInfo.imageSources != null && i < imageInfo.imageSources.length; i++) {
        image.src = imageInfo.imageSources[i];
    }
}

//grouping of ImageInfo objects for a particular rating widget
bpui.rating.ImageInfos = function(starCount) {
    this.starImageInfos = new Array();
    this.starImageInfos[0] = null;  //to get 1-based indexing
    for (var i = 1; i <= starCount; i++) {
        this.starImageInfos[i] = null;
    }
    this.otherImageInfos = new Array();
    this.otherImageInfos["notInterested"] = null;
    this.otherImageInfos["clear"] = null;
    this.otherImageInfos["modeToggle"] = null;
}

//"which" can be "notInterested", "clear", or "modeToggle"
bpui.rating.setCustomHoverTexts = function(which, hoverTexts) {
    var anImageInfo = this.imageInfos.otherImageInfos[which];
    if (anImageInfo == null) {
        anImageInfo = bpui.rating.shallowCopyImageInfo(bpui.rating.defaults.imageInfos[which]); //get a copy
        this.imageInfos.otherImageInfos[which] = anImageInfo; //add the copy to the imageInfos for the current Instance
    }
    anImageInfo.hoverText = hoverTexts;
}

bpui.rating.setStarCustomHoverTexts = function(hoverTexts) {
    for (var i = 0; i < hoverTexts.length && i < this.imageInfos.starImageInfos.length - 1; i++) {
        var anImageInfo = this.imageInfos.starImageInfos[i + 1];
        if (anImageInfo == null) {
            anImageInfo = bpui.rating.shallowCopyImageInfo(bpui.rating.defaults.imageInfos["star"]); //get a copy
            this.imageInfos.starImageInfos[i + 1] = anImageInfo; //add the copy to the imageInfos for the current Instance
        }
        if (hoverTexts[i] == null) {
            anImageInfo.hoverText = null;
        }
        else {
            anImageInfo.hoverText = new Array(hoverTexts[i]);  //set the hover text on anImageInfo
        }
    }
}


//information about a whole rating widget
bpui.rating.Instance = function(clientId, starCount, inAverageMode, grade, averageGrade, gradeBinding, averageGradeBinding) {
    bpui.rating.state[clientId] = this;
    this.clientId = clientId;
    this.imageInfos = new bpui.rating.ImageInfos(starCount);
    this.starCount = starCount;
    this.inAverageMode = inAverageMode;
    this.grade = grade;
    this.averageGrade = averageGrade;
    this.currentText = null;
    this.gradeAcknowledgedText = null;
    this.normalModeAcknowledgedText = null;
    this.averageModeAcknowledgedText = null;
    this.normalModeText = null;
    this.averageModeText = null;
    this.clicked = false;
    this.mousedover = false;
    this.gradeReadOnly = false;
    this.modeReadOnly = false;
    this.onGrade = null;
    this.onModeToggle = null;
    this.onMouse = null;
    //useAjaxOnGrade is used to determine if an ajax request should be sent when the user assigns a grade
    //-1 means send an ajax request only if the new grade is different from the existing grade
    //0 means do not send an ajax request
    //1 means send an ajax request
    this.useAjaxOnGrade = -1;
    //useAjaxOnModeToggle is used to determine if an ajax request should be sent when the user toggles the mode
    //true means send an ajax request
    //false means do not send an ajax request
    this.useAjaxOnModeToggle = false;
    this.bindings = new Array();
    this.bindings["grade"] = gradeBinding;
    this.bindings["averageGrade"] = averageGradeBinding;
    this.bindings["normalModeText"] = null;
    this.bindings["averageModeText"] = null;
    this.bindings["gradeReadOnly"] = null;
    this.bindings["inAverageMode"] = null;
    this.setStarCustomHoverTexts = bpui.rating.setStarCustomHoverTexts;
    this.setCustomHoverTexts = bpui.rating.setCustomHoverTexts;
}

bpui.rating.modifyDisplay = function(clientId, code, isMouseOver) {
    var ratingInstance = bpui.rating.state[clientId];

    var displayingAvg = false;
    if (code == -2 && isMouseOver) {
        displayingAvg = !ratingInstance.inAverageMode;
    }
    else {
        //test whether we're mousing out
        displayingAvg = (!isMouseOver ? ratingInstance.inAverageMode : false);
    }
    
    var displayingGrade = code; //the grade we are showing
    //test whether we're mousing out
    if (!isMouseOver) {
        displayingGrade = ratingInstance.inAverageMode ? ratingInstance.averageGrade : ratingInstance.grade;
    }
    else if (code == -2) {
        displayingGrade = displayingAvg ? ratingInstance.averageGrade : ratingInstance.grade;
    }
    
    var image = null;
    var imageInfo = null;
    var text = null;

    //modeToggle image
    image = window.document.getElementById(clientId + "_modeToggleImage");
    if (typeof image != "undefined" && image != null) {
        imageInfo = ratingInstance.imageInfos.otherImageInfos["modeToggle"];
        if (imageInfo == null) {
            imageInfo = bpui.rating.defaults.imageInfos["modeToggle"];
        }
        if (imageInfo != null) {
            if (displayingAvg) {
                image.src = imageInfo.imageSources[1];
            }
            else {
                image.src = imageInfo.imageSources[0];
            }
            if (code == -2 && isMouseOver && imageInfo.hoverText != null) {
                text = (displayingAvg ? imageInfo.hoverText[1] : imageInfo.hoverText[0]);
            }
        }
    }

    //not interested image
    image = window.document.getElementById(clientId + "_notInterestedImage");
    if (typeof image != "undefined" && image != null) {
        imageInfo = ratingInstance.imageInfos.otherImageInfos["notInterested"];
        if (imageInfo == null) {
            imageInfo = bpui.rating.defaults.imageInfos["notInterested"];
        }
        if (imageInfo != null) {
            if (displayingGrade == -1) {
                image.src = imageInfo.imageSources[1];
            }
            else {
                image.src = imageInfo.imageSources[0];
            }
            if (code == -1 && isMouseOver && imageInfo.hoverText != null) {
                text = imageInfo.hoverText[0];
            }
        }
    }

    //clear image
    image = window.document.getElementById(clientId + "_clearImage");
    if (typeof image != "undefined" && image != null) {
        imageInfo = ratingInstance.imageInfos.otherImageInfos["clear"];
        if (imageInfo == null) {
            imageInfo = bpui.rating.defaults.imageInfos["clear"];
        }
        if (imageInfo != null) {
            if (code == 0 && isMouseOver) {
                image.src = imageInfo.imageSources[1];
                if (imageInfo.hoverText != null) {
                    text = imageInfo.hoverText[0];
                }
            }
            else {
                image.src = imageInfo.imageSources[0];
            }
        }
    }

    //star images
    for (var i = 1; i <= ratingInstance.starCount; i++) {
        image = window.document.getElementById(clientId + "_starImage" + i);
        if (typeof image == "undefined" || image == null) {
            break;
        }
        imageInfo = ratingInstance.imageInfos.starImageInfos[i];
        var textCandidate = null;
        if (imageInfo == null) {
            imageInfo = bpui.rating.defaults.imageInfos["star"];
            if (imageInfo != null && imageInfo.hoverText != null) {
                textCandidate = imageInfo.hoverText[i];
            }
        }
        else if (imageInfo.hoverText != null) {
            textCandidate = imageInfo.hoverText[0];
        }

        var diff = displayingGrade - i;
        if (isMouseOver && code != -2 && diff == 0) {
            text = textCandidate;
        }

        //show correct image based on diff
        if (imageInfo != null) {
            if (diff < (0 -.5)) {  //diff is -0.6 and lower
              image.src = imageInfo.imageSources[3];  //show empty star
            }
            else if (diff < 0) {  //diff is between -0.5 and -0.1
              if (displayingAvg) {
                image.src = imageInfo.imageSources[2];  //show avg half star
              }
              else {
                image.src = imageInfo.imageSources[3];  //show empty star
              }
            }
            //diff is 0 and higher
            else if (displayingAvg) {
              image.src = imageInfo.imageSources[1];  //show avg full star
            }
            else {
              image.src = imageInfo.imageSources[0]; //show me full star
            }
        }
    }

    if (!isMouseOver) {
        if (ratingInstance.inAverageMode) {
            text = (ratingInstance.averageModeText != null ? ratingInstance.averageModeText : bpui.rating.defaults.averageModeText);
        }
        else {
            text = (ratingInstance.normalModeText != null ? ratingInstance.normalModeText : bpui.rating.defaults.normalModeText);
        }
    }

    var textElement = window.document.getElementById(clientId + "_text");
    if (typeof textElement != "undefined" && textElement != null) {
        if (text != null && (text.replace(/^\s+/g, '').replace(/\s+$/g, '') == "" )) {
            text = null;
        }
        textElement.innerHTML = (text == null ? "&nbsp;" : text);
        ratingInstance.currentText = textElement.innerHTML;
    }
}

bpui.rating.modifyState = function(clientId, code) {
    var ratingInstance = bpui.rating.state[clientId];

    if (code == -2) {
        ratingInstance.inAverageMode = !ratingInstance.inAverageMode;

        var acknowledgedText = (ratingInstance.inAverageMode ? ratingInstance.averageModeAcknowledgedText : ratingInstance.normalModeAcknowledgedText);
        if (acknowledgedText == null) {
            acknowledgedText = (ratingInstance.inAverageMode ? bpui.rating.defaults.averageModeAcknowledgedText : bpui.rating.defaults.normalModeAcknowledgedText);
        }
        if (acknowledgedText != null) {
            var textElement = window.document.getElementById(clientId + "_text");
            if (typeof textElement != "undefined" && textElement != null) {
                if (acknowledgedText.replace(/^\s+/g, '').replace(/\s+$/g, '') == "" ) {
                    acknowledgedText = "&nbsp;"
                }
                textElement.innerHTML = acknowledgedText;
                ratingInstance.currentText = textElement.innerHTML;
            }
        }

        if (ratingInstance.onModeToggle != null) {
            ratingInstance.onModeToggle(ratingInstance);
        }

        if (ratingInstance.useAjaxOnModeToggle) {
            sendAjaxRequest(clientId, false);
        }
    }
    else {
        ratingInstance.inAverageMode = false;

        var previousGrade = ratingInstance.grade;
        ratingInstance.grade = code;

        var gradeAcknowledgedText = (ratingInstance.gradeAcknowledgedText != null ? ratingInstance.gradeAcknowledgedText : bpui.rating.defaults.gradeAcknowledgedText);
        if (gradeAcknowledgedText != null) {
            var textElement = window.document.getElementById(clientId + "_text");
            if (typeof textElement != "undefined" && textElement != null) {
                if (gradeAcknowledgedText.replace(/^\s+/g, '').replace(/\s+$/g, '') == "" ) {
                    gradeAcknowledgedText = "&nbsp;"
                }
                textElement.innerHTML = gradeAcknowledgedText;
                ratingInstance.currentText = textElement.innerHTML;
            }
        }

        if (ratingInstance.onGrade != null) {
            ratingInstance.onGrade(ratingInstance);
        }

        if (ratingInstance.useAjaxOnGrade == 1 || (ratingInstance.useAjaxOnGrade == -1 && ratingInstance.grade != previousGrade)) {
            sendAjaxRequest(clientId, true);
        }
    }
}

bpui.rating.doMouse = function(clientId, code, isMouseOver) {
    var ratingInstance = bpui.rating.state[clientId];
    
    if ( (ratingInstance.gradeReadOnly && code != -2) || (ratingInstance.modeReadOnly && code == -2) ) {
        //return if either:
        //1. this is a mouse over, or
        //2. this is a mouse out, and the component is not considered in a "mousedover" state
        //(this occurs if we moused in to a grade control, but gradeReadOnly was true,
        //or if we moused into the modeToggle control, but modeReadOnly was true)
        if (isMouseOver || !ratingInstance.mousedover) {
            return;
        }
    }
    
    ratingInstance.mousedover = isMouseOver;

    ratingInstance.clicked = false;
    
    bpui.rating.modifyDisplay(clientId, code, isMouseOver);

    if (ratingInstance.onMouse != null) {
        var event = new Object();
        event.ratingInstance = ratingInstance;
        event.code = code;
        event.isMouseOver = isMouseOver;
        ratingInstance.onMouse(event);
    }
}

bpui.rating.doClick = function(clientId, code) {
    var ratingInstance = bpui.rating.state[clientId];
    
    if ( (ratingInstance.gradeReadOnly && code != -2) || (ratingInstance.modeReadOnly && code == -2) ) {
        return;
    }

    if (ratingInstance.clicked) {
        return;
    }
    
    bpui.rating.modifyState(clientId, code);
    
    ratingInstance.clicked = true;
}

function sendAjaxRequest(clientId, isGrade) {
    var ratingInstance = bpui.rating.state[clientId];

    if (isGrade && ratingInstance.bindings["grade"] == null) {
        var msg = bpui.rating.messages["unboundGrade"];
        window.status = msg;
        //alert(msg);
        return;
    }

    if (!isGrade && ratingInstance.bindings["inAverageMode"] == null) {
        var msg = bpui.rating.messages["unboundInAverageMode"];
        window.status = msg;
        //alert(msg);
        return;
    }

    var parameterizedUrl = bpui.rating.unparameterizedUrl + "?clientId=" + clientId + "&inAverageMode=" + ratingInstance.inAverageMode;
    if (isGrade) {
        parameterizedUrl += "&grade=" + ratingInstance.grade;
    }
    for (bindingKey in ratingInstance.bindings) {
        if (ratingInstance.bindings[bindingKey] != null) {
            parameterizedUrl += "&" + bindingKey + "Binding=" + escape(ratingInstance.bindings[bindingKey]);
        }
    }
    var bindArgs = {
        url:      parameterizedUrl,
        mimetype: "text/xml",
        error:    bpui.rating.processError,
        load:     bpui.rating.processLoad
    };
    dojo.io.bind(bindArgs);
}

/**
 * Process an asynchronous response when it is ready.
 *
 * @param type Event type ("load")
 * @param data Data returned with the response
 * @param event Low-level event object
 */
bpui.rating.processLoad = function(type, data, event) {
    if (event.readyState == 4) {
        if (event.status == 200) {
          bpui.rating.processResponse(data);
        }
    }
}

bpui.rating.processResponse = function(data) {
    //alert("in bpui.rating.processResponse");
    var clientIdNode = data.getElementsByTagName("clientId")[0];
    var clientId = clientIdNode.firstChild.nodeValue;
    var ratingInstance = bpui.rating.state[clientId];

    var nodeNames = new Array("averageGrade", "normalModeText", "averageModeText", "gradeReadOnly");
    for (var i = 0; i < nodeNames.length; i++) {
        var nodeName = nodeNames[i];
        var nodes = data.getElementsByTagName(nodeName);
        if (nodes != null && nodes.length > 0) {
            var node = nodes[0];
            if (node.firstChild != null) {
                var nodeValue = node.firstChild.nodeValue;
                ratingInstance[nodeName] = nodeValue;
            }
        }
    }

    //only modify display if component is "officially" not moused over
    //(when officially moused over, the display will be modified when the user mouses out)
    if (!ratingInstance.mousedover) {
        bpui.rating.modifyDisplay(clientId, null);
    }
}

/**
 * Process the failure of an asynchronous response.
 *
 * @param type Event type ("error")
 * @param errorObject Low-level error object
 */
bpui.rating.processError = function(type, errorObject) {
    window.status = bpui.rating.messages["bindError"] + ":  " + errorObject;
}