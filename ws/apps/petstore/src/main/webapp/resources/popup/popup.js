bpui.popup=new Object();
bpui.popup.timerObject="";
bpui.popup.req="";


// This is an exposed function to hide the popup and/or cancel to showing of the popup
bpui.popup.hide=function(jsfCompName) {
    // hide popup
    dojo.byId("bpui_popup" + jsfCompName).style.visibility='hidden';
    // clear timeout in the case user is just moving mouse over page
    bpui.popup.clearTimer();
}


// This is an exposed function to clear the timer of the popup in the mouseout event handler
// if the showing of the popup is required
bpui.popup.clearTimer=function() {
    // clear timeout in the case user is just moving mouse over page
    clearTimeout(bpui.popup.timerObject);
}

    
// This is an exposed function to show and position the popup
bpui.popup.show=function(jsfCompName, eventx, paramx) {
    // find quadrant and x,y of popup
    ajax=bpui.popup[jsfCompName];
    ajax.clientTargetX=eventx.clientX;
    ajax.clientTargetY=eventx.clientY;        

    // take into account window scrolling for accurate popup position
    var xx=0;
    var yy=0;
    if (!eventx) var eventx=window.event;
    if (eventx.pageX || eventx.pageY){
        xx=eventx.pageX;
        yy=eventx.pageY;
    } else if (eventx.clientX || eventx.clientY) {
        xx=eventx.clientX + document.body.scrollLeft;
        yy=eventx.clientY + document.body.scrollTop;        
    }
    ajax.targetX=xx;
    ajax.targetY=yy;


    // set timeout to 1 second so popup is flashing when user is moving mouse over page
    bpui.popup.timerObject=setTimeout("bpui.popup.showInternal(bpui.popup['" + jsfCompName + "'], '" + paramx + "')", ajax.delay);
}    


// This function is called after initial timeout that represents the delay    
bpui.popup.showInternal=function(ajax, paramx) {
    // calculate arrow and border image location
    var bindArgs = {
        url: ajax.serviceURL + escape(paramx),
        mimetype: "text/xml",
        load: ajax.ajaxReturnFunction
    };

    // dispatch the request
    bpui.popup.req=dojo.io.bind(bindArgs);        

    bpui.popup.setImageLocation(ajax);
    // show popup before AJAX call
    if(ajax.display != "after") {
        dojo.byId("bpui_popup" + ajax.componentId).style.visibility='visible';
    }
}


// may create function to create the component closure
bpui.popup.createPopupObject=function(componentId, serverArray, dataArray, serviceURL, retFunction, display, delay, color, width, height) {
    this.componentId=componentId;
    this.serverArray=serverArray;
    this.dataArray=dataArray;
    this.serviceURL=serviceURL;
    this.clientTargetX=0;
    this.clientTargetY=0;                
    this.targetX=0;
    this.targetY=0;     
    this.retFunction=retFunction;
    this.display=display;
    this.delay=delay;
    this.color=color;
    this.width=width;
    this.height=height;

    // setup return function. can't use prototype method of assigning to use less memory, because dojo callback seems to reset "this"
    this.ajaxReturnFunction=function(type, data, evt) {

        if(evt.readyState == 4) {
            if(evt.status == 200) {
                if(!retFunction) {

                    var resultx = data.getElementsByTagName("response")[0];

                    for(ii=0; ii < serverArray.length; ii++) {
                        // check to see if the element to be updated is an image
                        if(dataArray[ii].toLowerCase( ).indexOf("img") >= 0 || dataArray[ii].toLowerCase( ).indexOf("image") >= 0) {
                            // image so update src
                            dojo.byId(dataArray[ii]).src=resultx.getElementsByTagName(serverArray[ii])[0].childNodes[0].nodeValue;
                        } else if(dataArray[ii].toLowerCase( ).indexOf("link") >= 0 || dataArray[ii].toLowerCase( ).indexOf("href") >= 0) {
                            // link so update href
                            dojo.byId(dataArray[ii]).href=resultx.getElementsByTagName(serverArray[ii])[0].childNodes[0].nodeValue;
                        } else {
                            // data, replace text
                            //dojo.byId(dataArray[ii]).firstChild.nodeValue=resultx.getElementsByTagName(serverArray[ii])[0].childNodes[0].nodeValue;
                            // us innerHTML so an html string can be returned by the service and display properly
                            dojo.byId(dataArray[ii]).innerHTML=resultx.getElementsByTagName(serverArray[ii])[0].childNodes[0].nodeValue;
                        }
                    }
                } else {
                    // call custom returnFunction
                    var retFuncx=eval(retFunction);
                    retFuncx(type, data, evt);
                }

            // show popup after data retrieved 
            if(display == "after") {
                dojo.byId("bpui_popup" + componentId).style.visibility='visible';
            }

            } else if(evt.status == 204) {
                alert("204 return");
            }
        }
    }
}


// This function is an unforunate requirement of IE to show png-24 transparent images
bpui.popup.loadOnce=function(contextRoot, componentId) {
    if(navigator.appName == "Microsoft Internet Explorer") {
        // set images for ie so it will be transparent
        document.getElementById("bpui_topcapimgid" + componentId).src=contextRoot + "/META-INF/popup/images/ie_transparency.png";
        document.getElementById("bpui_bottomcapimgid" + componentId).src=contextRoot + "/META-INF/popup/images/ie_transparency.png";
        document.getElementById("bpui_arrowleftdownid" + componentId).src=contextRoot + "/META-INF/popup/images/ie_transparency.png";
        document.getElementById("bpui_arrowleftupid" + componentId).src=contextRoot + "/META-INF/popup/images/ie_transparency.png";
        document.getElementById("bpui_arrowrightdownid" + componentId).src=contextRoot + "/META-INF/popup/images/ie_transparency.png";
        document.getElementById("bpui_arrowrightupid" + componentId).src=contextRoot + "/META-INF/popup/images/ie_transparency.png";
    }
}  
    

// function to compute location of popup and where/which arrow to show
bpui.popup.setImageLocation=function(ajax) {
    // find which quadrant
    // get screen size for quadrant calc
    var sxx=bpui.popup.getWindowWidth()/2;
    var syy=bpui.popup.getWindowHeight()/2;
    var xx=0;
    var yy=0;
    var axx=0;
    var ayy=0;
    var quadrant="";

    popupArrowId="bpui_popupArrow" + ajax.componentId;
    popupArrowLD="bpui_arrowleftdownid" + ajax.componentId;
    popupArrowLU="bpui_arrowleftupid" + ajax.componentId;
    popupArrowRD="bpui_arrowrightdownid" + ajax.componentId;
    popupArrowRU="bpui_arrowrightupid" + ajax.componentId;
    popupId="bpui_popup" + ajax.componentId;


    if(ajax.clientTargetX < sxx && ajax.clientTargetY < syy) {
        // quadrant 1
        quadrant="quadrant 1";

        if(ajax.color == "none") {
            // position the popup
            xx=ajax.targetX + 10;
            yy=ajax.targetY - 30;
        } else {
            // has arrow, so display and position
            dojo.byId(popupArrowLD).style.display="inline";
            dojo.byId(popupArrowLU).style.display="none";
            dojo.byId(popupArrowRD).style.display="none";
            dojo.byId(popupArrowRU).style.display="none";

            // position the popup
            xx=ajax.targetX + 75;
            yy=ajax.targetY - 10;

            // position arrow within the popup
            axx=-73;
        }

        /*
        if(ajax.clientTargetY < 50 && ajax.clientTargetY != ajax.targetY) {
            // need to account for page scolling with the link right at the top
            ayy=5;
        } else if(yy > 0) {
            ayy=45;
        }
        */

        dojo.byId(popupId).style.left=xx + "px";
        dojo.byId(popupId).style.top=yy + "px";

        // position arrow within the popup
        dojo.byId(popupArrowId).style.left=axx + "px";            

        ayy=30
        dojo.byId(popupArrowId).style.top=ayy + "px";

    } else if(ajax.clientTargetX < sxx && ajax.clientTargetY > syy) { 
        // quadrant 2
        quadrant="quadrant 2";

        if(ajax.color == "none") {
            // position the popup
            xx=ajax.targetX + 10;
            yy=ajax.targetY - (ajax.height - 30);
        } else {
            // has arrow, so display and position
            dojo.byId(popupArrowLD).style.display="none";
            dojo.byId(popupArrowLU).style.display="inline";
            dojo.byId(popupArrowRD).style.display="none";
            dojo.byId(popupArrowRU).style.display="none";

            // position the popup
            xx=ajax.targetX + 75;
            yy=ajax.targetY - (ajax.height - 40);

            // position arrow within the popup
            axx=-73;
        }

        if(yy < 0) {
            yy=0;
        }
        dojo.byId(popupId).style.left=xx + "px";
        dojo.byId(popupId).style.top=yy + "px";

        // position arrow within the popup
        dojo.byId(popupArrowId).style.left=axx + "px";
        ayy=100;
        /*
        if(yy > 0) {
        ayy=40;
        } else {
        // pull pack to try and match cursor
        ayy=ajax.targetY - 150;
        if(ayy < 5) ayy=5;
        }
        */
        dojo.byId(popupArrowId).style.top=ayy + "px";

    } else if(ajax.clientTargetX > sxx && ajax.clientTargetY < syy) { 
        // quadrant 3
        quadrant="quadrant 3";

        if(ajax.color == "none") {
            // position the popup
            xx=ajax.targetX - (ajax.width + 20);
            yy=ajax.targetY - 30;
        } else {
            dojo.byId(popupArrowLD).style.display="none";
            dojo.byId(popupArrowLU).style.display="none";
            dojo.byId(popupArrowRD).style.display="inline";
            dojo.byId(popupArrowRU).style.display="none";

            // position the popup
            xx=ajax.targetX - (ajax.width + 75);
            yy=ajax.targetY - 10;

            if(ajax.color == "bubble") {
                // position arrow within the popup for bubble
                axx=ajax.width - 9;
            } else {
                // position arrow within the popup for the squares
                axx=ajax.width - 9;
            }
        }

        dojo.byId(popupId).style.left=xx + "px";
        dojo.byId(popupId).style.top=yy + "px";

        // position arrow within the popup
        dojo.byId(popupArrowId).style.left=axx + "px";
        ayy=30;
        dojo.byId(popupArrowId).style.top=ayy + "px";

    } else if(ajax.clientTargetX > sxx && ajax.clientTargetY > syy) { 
        // quadrant 4
        quadrant="quadrant 4";

        if(ajax.color == "none") {
            // position the popup
            xx=ajax.targetX - (ajax.width + 20);
            yy=ajax.targetY - (ajax.height - 30);
        } else {
            dojo.byId(popupArrowLD).style.display="none";
            dojo.byId(popupArrowLU).style.display="none";
            dojo.byId(popupArrowRD).style.display="none";
            dojo.byId(popupArrowRU).style.display="inline";

            // position the popup
            xx=ajax.targetX - (ajax.width + 75);
            yy=ajax.targetY - (ajax.height - 40);

            if(ajax.color == "bubble") {
                // position arrow within the popup for bubble
                axx=ajax.width - 9;
            } else {
                // position arrow within the popup for the squares
                axx=ajax.width - 9;
            }
        }

        if(yy < 0) {
            yy=0;
        }
        dojo.byId(popupId).style.left=xx + "px";
        dojo.byId(popupId).style.top=yy + "px";

        // position arrow within the popup
        dojo.byId(popupArrowId).style.left=axx + "px";
        ayy=100;

        /*
        if(yy > 0) {
            ayy=40;
        } else {
            // pull pack to try and match cursor
            ayy=ajax.targetY - 150;
            if(ayy < 5) ayy=5;
        }
        */
        dojo.byId(popupArrowId).style.top=ayy + "px";
    }

    //dojo.byId("test").firstChild.nodeValue=quadrant + " - scroll x,y = " + sxx + "," + syy;
    //dojo.byId("test1").firstChild.nodeValue="actual target x,y=" + ajax.targetX + "," + ajax.targetY + 
    //" - xx,yy=" +  xx + "," + yy + 
    //" - axx,ayy=" + axx + "," + ayy;
    //dojo.byId("test2").firstChild.nodeValue="clientTarget x,y=" + ajax.clientTargetX  + "," + ajax.clientTargetY;
    //dojo.byId("test3").firstChild.nodeValue="comp color=" + ajax.color + "  width=" + ajax.width;
}


bpui.popup.getWindowHeight=function() {
    var height=0;
	if(typeof(window.innerWidth) == 'number' ) {
	    height=window.innerHeight;
	} else if(document.documentElement && document.documentElement.clientHeight) {
	    height=document.documentElement.clientHeight;
	} else if(document.body && document.body.clientHeight) {
	    height=document.body.clientHeight;
	}
    return height;
}    


bpui.popup.getWindowWidth=function() {
    var width=0;
	if(typeof(window.innerWidth ) == 'number') {
	    width=window.innerWidth;
	} else if(document.documentElement && document.documentElement.clientWidth) {
	    width=document.documentElement.clientWidth;
	} else if(document.body && document.body.clientWidth) {
	    width=document.body.clientWidth;
	}
    return width;
}    
