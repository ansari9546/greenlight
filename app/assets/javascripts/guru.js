$(document).on('turbolinks:load', function(){

    $("#getGuruDetails").on("show.bs.modal", function(e){
        $("#guruUrlEmpty, #guruCodeEmpty").css("display", "none");
        guruDetailsHandler.getGuruDetails();
    });

    $("#guruCallModal").on("show.bs.modal", function(e){
        $("#cancelCall").css("display", "block");
        $("#openNewTab, #CloseModal").css("display", "none");
        $("#cancelCall").removeAttr("disabled");
    });

    $("#setGuruDetails").click(function(){
        let guruUrl = $("#guruUrl").val();
        let guruCode = $("#guruCode").val();
        if(guruCode != "" && (guruCode.length < 5 || guruCode.length > 10)){
            $("#guruCodeEmpty").css("display", "block");
            console.log("guruCodeEmpty")
            return;
        }
        if(!!guruUrl){
            guruDetailsHandler.testGuruUrl(guruUrl)
            .then((response) => {
                guruDetailsHandler.saveGuruDetails(guruUrl, guruCode);
            })
            .catch((error) => {
                //display error
                // guruDetailsHandler.showFlash("msg");
                console.log("error in testing url", error )
                $("#guruUrlEmpty").css("display", "block");
            });
        }else{
            guruUrl = `https://hype.onescreensolutions.com`
            guruDetailsHandler.saveGuruDetails(guruUrl, guruCode, true);
        }
    });

    $("#guruBtn, .guruUsername").click(function(e){
        //call API here
        $(".guru-dropdown-item, .no-guru-div").remove();
        $("#guruListsDivSpinner").css("display", "block");
        guruDetailsHandler.getDetails((guruDetails) => {
            //call Get api here
            guruCallHelper.getGuruLists(guruDetails.guruUrl, guruDetails.guruCode);
        });
    });


});

const guruCallHelper = {

    callStatusMap: {
        HYPE_INVITE_STATUS_PENDING: 0,
        HYPE_INVITE_STATUS_DISPLAYED: 1,
        HYPE_INVITE_STATUS_ACCEPTED: 2,
        HYPE_INVITE_STATUS_REJECTED: 3,
        HYPE_INVITE_STATUS_TIMEOUT: 4,
        HYPE_INVITE_STATUS_JOINING: 5,
        HYPE_INVITE_STATUS_JOINED: 6,
        HYPE_INVITE_STATUS_CANCELED: 7,
        HYPE_INVITE_STATUS_NOANSWER: 8,
      },

    guruDetails: {},

    guruUrlDetails: {},

    cancelClick: false,

    getGuruLists: (guruUrl, guruCode) => {
        let payload = {
            url: url = `${guruUrl}/api/v1/user/hype/roles?role=1&guruCode=${guruCode}`,
            type: `GET`,
            headers: { "Content-Type": "application/json" }
        };
        guruCallHelper.guruUrlDetails.guruUrl = guruUrl;
        guruCallHelper.guruUrlDetails.guruCode = guruCode;
        guruCallHelper.cancelClick = false;
        webserviceCall.webserviceHelper(payload)
        .then((response) =>{
            $("#guruListsDivSpinner").css("display", "none");
            $(".guru-dropdown-item, .no-guru-div").remove();
            guruCallHelper.guruDetails = response.data.authToken;
            guruCallHelper.guruListsUI(response.data.data);
        })
        .catch((error) => {
            $("#guruListsDivSpinner").css("display", "none");
            console.log('error found', error);
            $(".guru-dropdown-item, .no-guru-div").remove();let noGuruUI = `<div class=" no-guru-div">
            <p class="guru-dropdown-p" style="text-align: center;">No Guru Found</p>
        </div>`;
            $("#guruListsDiv").append(noGuruUI);
        });

    },

    guruListsUI : (guruList) => {
        if(guruList.length == 0){
            //show no guru found
            let noGuruUI = `<div class=" no-guru-div">
                <p class="guru-dropdown-p" style="text-align: center;">No Guru Found</p>
            </div>`
            $("#guruListsDiv").append(noGuruUI);
        }else{
            for(let index = 0; index < guruList.length; index++){
                $("#guruListsDiv").append(guruCallHelper.singleGuruUI(guruList[index], index +1));
            }
        }
    },

    singleGuruUI : (data, guruCount) => {
        return `<div class="dropdown-item guru-dropdown-item">
                    <div class="guru-name-div">
                    <span class="guru-name-count">
                        <span>GURU ${guruCount}</span>
                        <span class="guru-lang-span">( ${AVAILABLE_LANGUAGE[data.language]} )</span>
                        <span class="guru-name-actual" title=${data.username}>${data.username}</span>
                    </div>
                    <div class="guru-i-div">
                        <a title="Video Call" class="guru-anchor-tag" onclick="guruCallHelper.startGuruCall(${data.id}, ${false}, '${data.username}');">
                            <span style="font-size:17px;"> 
                                <i class="guru-dropdown-i fas fa-video"></i>
                            </span>
                        </a>
                        <a title="Audio Call" class="guru-anchor-tag" onclick="guruCallHelper.startGuruCall(${data.id}, ${true}, '${data.username}');">
                            <span style="font-size:17px;">
                                <i class="guru-dropdown-i fas fa-headphones"></i>
                            </span>
                        </a>
                    </div>
                </div>`
    },

    startGuruCall: (guruId, isAudioCall, guruName) => {
        let meetingSubType = `1_0`;
        if(isAudioCall){
            meetingSubType = `1_1`;
        }
        let  participantObjsArray = [{ id: guruId + "", type: 1 }];
        let timeStamp = Math.floor(new Date().getTime() / 1000);
        let meetingType = 0;
        let formData = {
            participantObjsArray: JSON.stringify(participantObjsArray),
            meetingType: meetingType + "",
            meetingSubType: meetingSubType,
            timeStamp: timeStamp + ""
        };
        guruCallHelper.cancelClick = false;
        guruCallHelper.guruUrlDetails.meetingSubType = meetingSubType;
        //show model
        $("#guruName").text(guruName);
        $("#guruCallStatus").text(getLocalizedString('guru.GURU_STR_3'));
        $("#guruCallModal").modal('show');
        $("#cancelCall").removeAttr("disabled");
        let payload = {
            url: `${guruCallHelper.guruUrlDetails.guruUrl}/api/v1.3/user/${guruCallHelper.guruDetails.userId}/meetings/invite`,
            type: `POST`,
            headers: {
                "Content-Type": "application/json",
                "x-access-token": guruCallHelper.guruDetails.token
            },
            body: formData
        };

        webserviceCall.webserviceHelper(payload)
        .then((response) =>{
            console.log('Success in call connected', response);
            if (response && response.status == 200) {
                if (response.data && response.data.statusCode == 0) {
                    //set reference id here in 
                    guruCallHelper.guruDetails.referenceId = response.data.data.referenceId;
                    //poll call status
                    guruCallHelper.pollCallStatus(response.data.data)
                  return;
                }
              }
              guruCallHelper.errorConnectedCall(response);
        })
        .catch((error) => {
            console.log('error found', error);
            guruCallHelper.errorConnectedCall(response);
            //no guru found
        });
    },

    errorConnectedCall: (error) => {
        // show error status
        //disable button
        $("#cancelCall").attr("disabled", true);
        $("#guruCallStatus").text(getLocalizedString('guru.GURU_STR_7'));
        setTimeout(() => {
            $("#cancelCall").removeAttr("disabled");
            $("#guruCallModal").modal('hide')
          }, 1000);
    },

    updateCallStatus: (newStatus, successCallback, errorCallback) => {
        let payload = {
            url: `${guruCallHelper.guruUrlDetails.guruUrl}/api/v1/user/${guruCallHelper.guruDetails.userId}/meetings/invite/${guruCallHelper.guruDetails.referenceId}`,
            type: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": guruCallHelper.guruDetails.token,
              },
              body: { status: newStatus },
        };
        webserviceCall.webserviceHelper(payload)
        .then((response) =>{
            console.log('Success in call connected', response);
            if (response && response.status == 200) {
                if (response.data && response.data.statusCode == 0) {
                    // guruCallHelper.guruDetails.referenceId = response.data.data.referenceId
                    successCallback(response.data);
                  return;
                }
              }
              errorCallback(response);
        })
        .catch((error) => {
            console.log('error found', error);
            errorCallback(response);
            //no guru found
        });
    },

    onCancelClick(){
        guruCallHelper.cancelClick = true;
        $("#cancelCall").attr("disabled", true);
        $("#guruCallStatus").text(getLocalizedString('guru.GURU_STR_25'));
        //change status to disconnecting
        guruCallHelper.updateCallStatus(guruCallHelper.callStatusMap.HYPE_INVITE_STATUS_CANCELED, function(callback){
            setTimeout(() => {
                $("#cancelCall").removeAttr("disabled");//GURU_STR_5
                $("#guruCallModal").modal('hide');
            }, 1000);
        }, function(error){
            setTimeout(() => {
                $("#cancelCall").removeAttr("disabled");//GURU_STR_5
                $("#guruCallModal").modal('hide');
            }, 1000);
        });
    },

    pollCallStatus(data){
        if(!guruCallHelper.guruDetails.referenceId){
            // return error;
            // hide call modal
        }
        let payload= {
            url: `${guruCallHelper.guruUrlDetails.guruUrl}/api/v1/user/${guruCallHelper.guruDetails.userId}/meetings/invite/${guruCallHelper.guruDetails.referenceId}`,
            type: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": guruCallHelper.guruDetails.token,
              },
        };
        webserviceCall.webserviceHelper(payload)
        .then((response) =>{
            console.log('Success in call connected', response);
            if (response && response.status == 200) {
                if (response.data && response.data.statusCode == 0) {
                    guruCallHelper.successCB(response.data);
                    return;
                }
              }
              guruCallHelper.errorConnectedCall(response);
        })
        .catch((error) => {
            console.log('error found', error);
            guruCallHelper.errorConnectedCall(error);
            //no guru found
        });
    },

    successCB(data){
        if(guruCallHelper.cancelClick == true){
            return;
        }
        let meetingId = data.data.meetingId;
        let callStatus = data.data.callStatus;
        let inviterStatus = data.data.inviterStatus;
        if (callStatus == guruCallHelper.callStatusMap.HYPE_INVITE_STATUS_DISPLAYED) {
            //set call status displayed
            $("#guruCallStatus").text(getLocalizedString('guru.GURU_STR_4'));
        }
        // if call status accepted
        if (callStatus == guruCallHelper.callStatusMap.HYPE_INVITE_STATUS_ACCEPTED) {
            //REDIRECT TO HYPE
            $("#cancelCall").attr("disabled", true);//GURU_STR_5
            $("#guruCallStatus").text(getLocalizedString('guru.GURU_STR_5'));
            //show call status accepted
            guruCallHelper.updateCallStatus(
                guruCallHelper.callStatusMap.HYPE_INVITE_STATUS_JOINING,
              () => {
                  setTimeout(() => {
                    $("#cancelCall").removeAttr("disabled");
                    //create href and also open new tab and test
                    //open new tab or display click model here
                    let meetingUrl = `${guruCallHelper.guruUrlDetails.guruUrl}/guest.html?username=&roomId=${data.data.meetingId}&participantEmail=&meetingSubType=${guruCallHelper.guruUrlDetails.meetingSubType}#guestUser`;
                    guruCallHelper.openGuruNewTab(meetingUrl);
                  }, 1000);
                  return;
              },
              () => {
                  $("#guruCallStatus").text(getLocalizedString('guru.GURU_STR_7'));
                  setTimeout(() => {
                    $("#cancelCall").removeAttr("disabled");//GURU_STR_5
                    $("#guruCallModal").modal('hide');
                  }, 1000);
                  return;
              }
            );
            return;
          }

          if (callStatus == guruCallHelper.callStatusMap.HYPE_INVITE_STATUS_REJECTED) {
            self.cancelBtnDisable = true;
            //show call status rejected
            $("#cancelCall").attr("disabled", true);//GURU_STR_5
            $("#guruCallStatus").text(getLocalizedString('guru.GURU_STR_6'));
            setTimeout(() => {
                $("#cancelCall").removeAttr("disabled");//GURU_STR_5
                $("#guruCallModal").modal('hide');
              //hide call model
            }, 1000);
            return;
          }

          if (
            callStatus == guruCallHelper.callStatusMap.HYPE_INVITE_STATUS_TIMEOUT ||
            callStatus == guruCallHelper.callStatusMap.HYPE_INVITE_STATUS_CANCELED ||
            inviterStatus == guruCallHelper.callStatusMap.HYPE_INVITE_STATUS_CANCELED
          ) {
            $("#cancelCall").attr("disabled", true);//GURU_STR_5
            $("#guruCallStatus").text(getLocalizedString('guru.GURU_STR_7'));
            setTimeout(() => {
                $("#cancelCall").removeAttr("disabled");//GURU_STR_5
                $("#guruCallModal").modal('hide');
            }, 1000);
            return;
          }

          setTimeout(() => {
            guruCallHelper.pollCallStatus(data);
          }, 3000);
    },
    openGuruNewTab(meetingUrl){
        $( "#guruHref" ).empty();
        //here set url to href
        document.getElementById('openNewTab').href = meetingUrl;
        let x = window.open(meetingUrl, "_blank");
        console.log(x);
        if (!x) {
        //show click model
            $("#cancelCall").css("display", "none");
            $("#openNewTab, #CloseModal").css("display", "block");
        } else {
            //hide model and reset
            $("#cancelCall").removeAttr("disabled");//GURU_STR_5
            $("#guruCallModal").modal('hide');
        }
    }
}


const guruDetailsHandler = {

    getGuruDetails(){
        guruDetailsHandler.getDetails((guruDetails) => {
            $("#guruUrl").val(guruDetails.guruUrl);
            $("#guruCode").val(guruDetails.guruCode);
        });
    },

    getDetails(callback){
        let payload = {
            url: `/b/getGuru`,
            type: `GET`,
            headers: { "Content-Type": "application/json" }
        }
        webserviceCall.webserviceHelper(payload)
        .then((response) =>{
            console.log('response', response);
            callback(response.data.guruDetails);
        })
        .catch((error) => {
            console.log('error', error);
            callback({guruUrl:`https://hype.onescreensolutions.com`, guruCode:`112233`})
        });
    },

    showFlash(){
        let payload = {
            url: `/b/flash`,
            type: `GET`,
            headers: { "Content-Type": "application/json" }
        }
        webserviceCall.webserviceHelper(payload)
        .then((response) =>{
            
        })
        .catch((error) => {
            console.log('error', error);
        });
    },

    saveGuruDetails(guruUrl, guruCode, isdefaultURL = false) {
        $.post( `/b/setGuru`, { guruUrl: guruUrl, guruCode: guruCode },
        function(response){
            console.log('response', response);
            let alertMsg = getLocalizedString('guru.GURU_STR_41');
            if(isdefaultURL){
                alertMsg = getLocalizedString('guru.GURU_STR_42');
            }
            showAlert(alertMsg);
            $("#getGuruDetails").modal('hide');
        });
    },

    testGuruUrl(guruUrl){
        let payload = {
            url: `${guruUrl}/testConnection`,
            type: `POST`,
            headers: { "Content-Type": "application/json" }
        }
        return new Promise((resolve, reject) => {
            webserviceCall.webserviceHelper(payload)
            .then((response) =>{
                console.log('response', response);
                if(response.status == 200){
                    resolve(true);
                }else{
                    reject(false);
                }
            })
            .catch((error) => {
                console.log('error', error);
                reject(false);
            });
        });
    }

};

const showFlash = {
    showFlash(msg){
        let payload = {
            url: `/b/admins/flash`,
            type: `GET`,
            headers: { "Content-Type": "application/json" },
            body: msg
        }
        webserviceCall.webserviceHelper(payload)
        .then((response) =>{
            console.log('response', response);
            // $("#guruUrl").val(response.data.guruDetails.guruUrl);
            // $("#guruCode").val(response.data.guruDetails.guruCode);
        })
        .catch((error) => {
            console.log('error', error);
        });
    }
}

hideAlert = () => {
    $("#successAlert").css("display", "none");
}

showAlert = (alertText, isDanger = false) => {
    console.log("isDanger", isDanger);
    $("#alertDiv").text(alertText);
    $("#successAlert").removeClass('alert-danger').addClass('alert-success')
    if(isDanger){
        $("#successAlert").addClass('alert-danger').removeClass('alert-success');
    }
    $("#successAlert").css('display', 'flex');
}

var AVAILABLE_LANGUAGE  = {
	"lang_en": "English",
	"lang_ur": "اردو",
	"lang_zh": "中文",
	"lang_es": "Español",
	"lang_ko": "한국어"
};