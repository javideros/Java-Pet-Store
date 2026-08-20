    dojo.require("dojo.io.*");
    dojo.require("dojo.io.IframeIO");
    var req;

    bpui.fileupload=new Object();
    bpui.fileupload.progressComplete=new Object();
    
    bpui.fileupload.submitForm=function(formId, retMimeType, retFunction, progBarDivName, fileUploadURL) {

        // check to see if progressBar specified
        if(progBarDivName != "") {
            // fire progress bar submit
            bpui.fileupload.progressComplete[progBarDivName].progressBarSubmit();
        }

        var bindArgs = {
            url: fileUploadURL,
            formNode: document.getElementById(formId),
            handle: bpui.fileupload.uploadFileDataFinal(formId, retMimeType, retFunction, progBarDivName, fileUploadURL)
        };

        // dispatch the request
        req=dojo.io.bind(bindArgs);              
        return false;
    }
    
    
    bpui.fileupload.defaultRetFunction=function(type, data, evt) {
        // handle default response here
        var resultx = data.getElementsByTagName("response")[0];

        if(resultx) {
            // resultx is not set for IE, could be some problem in dojo.iframe, node upload
            alert("Default AJAX Return Function Call" + '\n' +
                "Message: " + resultx.getElementsByTagName("message")[0].childNodes[0].nodeValue + '\n' + 
                "Status Code: " + resultx.getElementsByTagName("status")[0].childNodes[0].nodeValue + '\n' + 
                "Raw Duration Time (milliseconds): " + resultx.getElementsByTagName("duration")[0].childNodes[0].nodeValue + '\n' + 
                "Duration Time String: " + resultx.getElementsByTagName("duration_string")[0].childNodes[0].nodeValue + '\n' + 
                "Start Date/Time: " + resultx.getElementsByTagName("start_date")[0].childNodes[0].nodeValue + '\n' + 
                "End Date/Time: " + resultx.getElementsByTagName("end_date")[0].childNodes[0].nodeValue + '\n' + 
                "Byte Size of Upload: " + resultx.getElementsByTagName("upload_size")[0].childNodes[0].nodeValue);
        }
    }
    
    

    // *******************************************************
    // progress bar general functions
    // *******************************************************

    // this is the return function closure for the ajax fileupload call
    // it allows the "complete" call on the progressBar, if one is used
    bpui.fileupload.uploadFileDataFinal=function(formId, retMimeType, retFunction, progBarDivName, fileUploadURL) {
        function uploadFinal(type, data, evt) {
            var bindArgs = {
                url: fileUploadURL + "Final",
                mimetype:   retMimeType,
                handle: bpui.fileupload.uploadFileData(progBarDivName, retFunction)
            };

            // dispatch the request
            req=dojo.io.bind(bindArgs);
        }
        return uploadFinal;
    }


    // this is the return function closure for the ajax fileupload call
    // it allows the "complete" call on the progressBar, if one is used
    bpui.fileupload.uploadFileData=function(progBarDivName, retFunction) {
        function defaultGeneralReturn(type, data, evt) {
            // call the complete function for return
            if(bpui.fileupload.progressComplete[progBarDivName]) {
                bpui.fileupload.progressComplete[progBarDivName].complete();
            }
            // call either custom or default returnFunction
            var retFuncx=eval(retFunction);
            retFuncx(type, data, evt);
        }
        return defaultGeneralReturn;
    }
    
    
    
    
    

    bpui.fileupload.progressComp=function(bottonNamex, progBarDivNamex, pgSizex, statusURLx) {
        this.pollTimeout;
        this.uploadComplete=0;
        this.buttonName=bottonNamex;
        this.progBarDivName=progBarDivNamex;
        this.pgSize=pgSizex;
        this.statusURL=statusURLx

        this.complete=function() {
            this.uploadComplete=1;
            clearTimeout(this.pollTimeout);
            var idiv = dojo.byId(this.progBarDivName);
            idiv.innerHTML = "<span class=\"bpui_fileupload_pb_title\">Status:</span><span class=\"bpui_fileupload_pb_status\">Upload Completed</span>";
            if(this.buttonName != "") {
                dojo.byId(this.buttonName).disabled=false;
            }
        }

        this.progressBarSubmit=function() {
            // setup load not complete
            this.uploadComplete=0;
            if(this.buttonName != "") {
                dojo.byId(this.buttonName).disabled=true;
            }
            bpui.fileupload.PollProgressBar(bpui.fileupload.progressComplete[this.progBarDivName].processProgressRequest, this.statusURL);

            // create the html for progress bar
            bpui.fileupload.createProgressBar(this.progBarDivName, this.pgSize);    
            bpui.fileupload.showProgress("0", this.progBarDivName, "Starting Upload", this.pgSize);
        }
    }


    bpui.fileupload.progressReturnFunction=function(bottonName, progBarDivName, pgSize) {
        // callback function for intial request to schedule a task
        function processProgressRequest(type, data, evt) {
            if (evt.readyState == 4) {
                if (evt.status == 200) {
                    // make sure upload isn't already complete
                    if(bpui.fileupload.progressComplete[progBarDivName].uploadComplete == 0) {
                        var resultx=data.getElementsByTagName("response")[0];
                        var status=resultx.getElementsByTagName("status")[0].childNodes[0].nodeValue;
                        // show percent
                        var percentage=resultx.getElementsByTagName("percent_complete")[0].childNodes[0].nodeValue;

                        // check to see if status complete, but upload still running
                        // this can happen on multiple big uploads where the session status is left over
                        // from a previous upload, so show upload in progress message.
                        if(status == "Upload Completed" || status == "No Status" || status == "ERROR" ) {
                            status="Starting Upload"
                            percentage=0;
                        }
                        bpui.fileupload.showProgress(percentage, progBarDivName, status, pgSize);
                        // re-poll after 1.5 seconds
                        bpui.fileupload.progressComplete[progBarDivName].pollTimeout=setTimeout("bpui.fileupload.PollProgressBar(bpui.fileupload.progressComplete['" + progBarDivName + "'].processProgressRequest, bpui.fileupload.progressComplete['" + progBarDivName + "'].statusURL)", 1500);
                    }
                }
            }
        }
        return processProgressRequest;
      }


    // function to perform AJAX call
    bpui.fileupload.PollProgressBar=function(retFunction, statusURL) {
        // call status function
        var bindArgs = {
            url: statusURL,
            mimetype: "text/xml",
            handle: retFunction
        };

        // dispatch the request
        dojo.io.bind(bindArgs);     
    }
    
    
    // function to show the current percentage
    bpui.fileupload.showProgress=function(percentage, progBarDivName, status, pgSize) {
        // show progess bar
        dojo.byId(progBarDivName).style.display="inline";
        // make sure that the completed message, isn't alreay showing
        if(dojo.byId(progBarDivName + "TaskId")) {
            
            // update status message
            dojo.byId(progBarDivName + "TaskId").innerHTML = "<span class=\"bpui_fileupload_pb_title\">Status:</span><span class=\"bpui_fileupload_pb_status\">" + status + "</span>";
            
            var increment = 100/pgSize;
            var percentageText = "";
            if (percentage < 10) {
                percentageText = "&nbsp;" + percentage;
            } else {
                percentageText = percentage;
            }
            
            var centerCell=dojo.byId(progBarDivName + pgSize/2);
            centerCell.innerHTML = "<span class=\"bpui_fileupload_pb_progressText\">" + percentageText + "%</span>";
            var tableText = "";
            for (x = 0; x < pgSize; x++) {
                var cell = dojo.byId(progBarDivName + x);
                if ((cell)) {
                    if(percentage/x < increment) {
                        cell.className="bpui_fileupload_pb_notCompleted";
                    } else {
                        cell.className="bpui_fileupload_pb_completed";
                    }      
                }
            }
        }
    }

    
    // create the progress bar
    bpui.fileupload.createProgressBar=function(progBarDivName, pgSize) {
        var tableText = "";
        for (x = 0; x < pgSize; x++) {
            //tableText += "<td id=\"" + progBarDivName + x + "\" width=\"10\" height=\"10\" class=\"bpui_fileupload_pb_notCompleted\"/>\n";
            tableText += "<td id=\"" + progBarDivName + x + "\" class=\"bpui_fileupload_pb_notCompleted\"/>\n";
        }
        var idiv = dojo.byId(progBarDivName);
        idiv.style.display="none";
        // no events should be attached to element, so should not leak memory
        idiv.innerHTML = "<div id=\"" + progBarDivName + "TaskId\"></div><table class=\"bpui_fileupload_pb_progressBar\" cellspacing=\"0\" cellpadding=\"0\"><tr>\n" + tableText + "\n</tr></table>";
    }


    