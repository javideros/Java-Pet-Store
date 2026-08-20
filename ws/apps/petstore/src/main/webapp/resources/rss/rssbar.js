
dojo.require("dojo.io.*");
dojo.require("dojo.lfx.*");

var bpui;
if (typeof bpui == "undefined") {
	bpui = new Object();
}

bpui.RSS = function() {
    var jsonData = null;
    var rssItemNum = 0;
    var currentItem = 0;
    var itemIntervalMsec = 2000;
    var itemIntervalId = 0;
    var headTitle = null;
    var limitCharNum = 75;
    
    this.getRssInJson = function (method, uri, number, speed, title, link) {
        if (speed) {
            itemIntervalMsec = speed;
        }
        if (title) {
            headTitle = title;
        }
        if (link) {
            titleLink = link;
        } else {
            titleLink = uri;
        }
        rssItemNum = number;
        var encodedURI = encodeURI(method + "?style=json&itemCount="+number+"&url="+uri);
        var bindArgs = {
                    url: encodedURI,
                    mimetype: "text/json",
                    load: function (type, data, http) {
                        handleJsonRss(data);
                        for (var key in data.channel.item) {
                            dojo.debug("ITEM Title ", key, ":", data.channel.item[key].title);
                            dojo.debug("ITEM LInk ", key, ":", data.channel.item[key].link);
                        }
                    },
                    error: function (t, e) {
                        dojo.debug("ERROR : " + e.message);
                    }
        }
        dojo.io.bind(bindArgs);
        return false;
    }

    function handleJsonRss(json) {
        jsonData = json;
        // setting top title and link
        if (!headTitle) {
            headTitle = json.channel.title;
        }
        generateFeedView(decodeURL(headTitle), json.channel.link, "rss-channel");
        // setting items
        var decTitle = decodeURL(json.channel.item[0].title);
        var shortTitle = cutStringatWs(decTitle, limitCharNum) + " ...";
        generateHref(shortTitle, json.channel.item[0].link, "rss-item");
        var aNodes = document.getElementById("rss-item").getElementsByTagName("a");
        dojo.event.connect(aNodes[0], "onmouseover", "pauseCycle");
        dojo.event.connect(aNodes[0], "onmouseout", "resumeCycle");
        cycleRss();
    }

    /* public method to open a child window - may be blocked */
    this.openChild = function () {
        var childW = window.open("", "childW", "width=500,height=400,resizable=yes,scrollbars=yes");
        var decTitle = decodeURL(jsonData.channel.title);
        var content = "<h2><a href=" + jsonData.channel.link + " target='_blank'>"
            + decTitle + "</a></h2>";
        var i=0;
        content += "<ul>";
        for (i=0; i<rssItemNum; i++) {
            decTitle = decodeURL(jsonData.channel.item[i].title);
            content += "<li><a href=" + jsonData.channel.item[i].link + " target='_blank'>"
                + decTitle + "</a>";
            var desc = jsonData.channel.item[i].description;
            if (typeof desc != 'undefined') {
                content += "<p style='background-color:#FFEFD5;font-size:80%'>" + decodeURL(desc) + "</p>";
            }
            content += "</li>";
        }
        content += "</ul><br>";
        content += "<a href=" + jsonData.channel.link + " target='_blank'><i><b>...More on this site...</b></i>";
        childW.document.body.innerHTML = content;
    }

    function generateFeedView(title, site, nodeId) {
        var node = document.getElementById(nodeId);
        var aNode = document.createElement("a");
        aNode.setAttribute("href", titleLink);
        //aNode.setAttribute("onClick", "javascript:void(rss.openChild());");
        aNode.appendChild(document.createTextNode(title));
        if (node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }
        node.appendChild(aNode);
    }

    function generateHref (title, link, nodeId) {
        var node = document.getElementById(nodeId);
        var aNode = document.createElement("a");
        aNode.setAttribute("href", link);
        aNode.setAttribute("target", "_blank");
        aNode.appendChild(document.createTextNode(title));
        if (node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }
        node.appendChild(aNode);
    }

    function cycleRss () {
        itemIntervalId = setTimeout(replaceItem, itemIntervalMsec);
    }
    
    
    function replaceItem() {
        if (itemIntervalId) {
            clearTimeout(itemIntervalId);
        }
        // fadeout the current item and pop the next one in.
        var cItem = document.getElementById("rss-item");
        dojo.lfx.html.fadeOut(cItem.getElementsByTagName('a')[0], 500);
        var waitId = setTimeout(function(waitId) {
            clearTimeout(waitId);
            //cItem.removeChild(cItem.firstChild);
            if (currentItem < (rssItemNum -1)) {
                currentItem += 1;
            } else {
                currentItem = 0;
            }
            var decTitle = decodeURL(jsonData.channel.item[currentItem].title);
            var shortTitle = cutStringatWs(decTitle, limitCharNum) + " ...";
            generateHref(shortTitle, jsonData.channel.item[currentItem].link, "rss-item");
            // attach event for onmouseover(pause) and onmouseout(resume)
            var aNodes = cItem.getElementsByTagName("a");
            dojo.event.connect(aNodes[0], "onmouseover", "pauseCycle");
            dojo.event.connect(aNodes[0], "onmouseout", "resumeCycle");
            cycleRss();}, 500);
    }

    function pauseCycle(evt) {
        if (itemIntervalId) {
            clearTimeout(itemIntervalId);
        }
    }

    function resumeCycle (evt) {
        cycleRss();
    }

    /* Compatible function to java.net.URLDecoder.decode().
     * (decodeURI() is not compatible)
     */
    function decodeURL(str){
        var targetStr="";
        var s, tmpStr, unicode, f;
        // take a look at every char in the source str
        var i, j;
        for (i = 0; i < str.length; i++) {
            s = str.charAt(i);
            // handle WS, which is the most common char
            if (s == "+") {
                targetStr += " ";
            } else {
                if (s != "%") {
                    // Non-encoded char
                    targetStr += s;
                } else{
                    // encoding begin
                    unicode = 0;  // uncode representation
                    f = 1;  // flag to specify the escape sequence
                    while (true) {
                        tmpStr = "";
                        // get the two HEX chars and put that in the temp string. If no char, that is not a HEX.
                        for (j = 0; j < 2; j++ ) {
                            tmptmpStr = str.charAt(++i);
                            if (((tmptmpStr >= "0") && (tmptmpStr <= "9")) || 
                                ((tmptmpStr >= "a") && (tmptmpStr <= "f"))  || 
                                ((tmptmpStr >= "A") && (tmptmpStr <= "F"))) {
                                tmpStr += tmptmpStr;
                            } else {
                                --i;
                                break;
                            }
                        }
                        /* parse the HEX
                         * <= 0x7f  : Single byte
                         * >=0xc0 && <=0xdf  : Two bytes
                         * >=0xe0 && <=0xef  : Three bytes
                         * >=0xf0 && <=0xf7  : Four bytes
                         * >=0x80 && <=0xbf  : may not occur - just shift it
                         * <=1  : sequence terminated
                         */
                        var byte = parseInt(tmpStr, 16);
                        if (byte <= 0x7f) {unicode = byte; f = 1;}
                        if ((byte >= 0xc0) && (byte <= 0xdf)) {unicode = byte & 0x1f; f = 2;}
                        if ((byte >= 0xe0) && (byte <= 0xef)) {unicode = byte & 0x0f; f = 3;}
                        if ((byte >= 0xf0) && (byte <= 0xf7)) {unicode = byte & 0x07; f = 4;}
                        if ((byte >= 0x80) && (byte <= 0xbf)) {unicode = (unicode << 6) + (byte & 0x3f); --f;}
                        if (f <= 1) {
                            break;
                        }
                        if (str.charAt(i + 1) == "%") {
                            i++ ;
                        } else {
                            // Error. should not occur
                            break;
                        }
                    }
                targetStr += String.fromCharCode(unicode);
                }
            }
        }
        return targetStr;
    }

    /* Cut the string at the WS so that it's shorter than the limitCharNum.
     */
    function cutStringatWs(str, limitCharNum) {
	var tmpStr = str;
	var cnum = 0;
	while (true) {
	    cnum = tmpStr.lastIndexOf(" ");
	    // no occurance of WS
	    if (cnum < 0) {
		// if str is still longer than limit
		if (tmpStr.length >= limitCharNum) {
		    tmpStr = tmpStr.substring(0, limitCharNum);
		}
		break;
	    } else {
		tmpStr = tmpStr.substring(0, cnum);
		if (cnum <= limitCharNum) {
		    break;
		}
	    }
	}
	return tmpStr;
    }

}

