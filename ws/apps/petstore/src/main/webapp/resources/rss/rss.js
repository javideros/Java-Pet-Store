
        dojo.require("dojo.io.*");
        dojo.require("dojo.widget.*");
        dojo.require("dojo.widget.FloatingPane");
	dojo.require("dojo.widget.ContentPane");
	dojo.require("dojo.widget.SplitContainer");
	dojo.require("dojo.widget.LayoutContainer");
	dojo.require("dojo.widget.ResizeHandle");
	dojo.require("dojo.widget.Tree");
        
        var rssWState = "out";
        
        function Subscriber() {
            this.update = function (uriid) {
                var wgt = dojo.widget.getWidgetById(uriid);
                try {
                    getRSSfromURI(uriid, "rssContent")
                } catch (E) {};
            };
        }
        dojo.addOnLoad(function() {
            var eventSub = new Subscriber();
            var selectionTopic = dojo.event.topic.getTopic("treeSelected");
            selectionTopic.subscribe(eventSub, "update");
        });
        
        function getRSSfromURI (uri, nodeId) {
            var node = document.getElementById(nodeId);
            var encodedURI = encodeURI("dynamic/bpui_rssfeedhandler/getRssfeed?url="+uri);
            var bindArgs = {
                url: encodedURI,
                load: function (type, data, evt) {
                    node.innerHTML = data;
                    },
                error: function (t, e) {
                    dj_debug("ERROR : " + e.message);
                    }
                }
            dojo.io.bind(bindArgs);
            return false;
        }
        
        function rssToggle() {
            var rw = document.getElementById("rssWindow");
            var wd = dojo.widget.getWidgetById("wdrss");
            if (wd.windowState == "minimized") {
                rssWState = "in";
                wd.restoreWindow();
            } else {
                if (rssWState == "out") {
                    rssWState = "in";
                    dojo.fx.html.fadeIn(rw, 500);
                } else {
                    rssWState = "out";
                    dojo.fx.html.fadeOut(rw, 500);
                }
            }
        }
