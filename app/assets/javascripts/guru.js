$(document).on('turbolinks:load', function(){

    $("#getGuruDetails").on("show.bs.modal", function(e){
        guruDetailsHandler.getGuruDetails();
    });

    $("#setGuruDetails").click(function(){
        let guruUrl = $("#guruUrl").val();
        let guruCode = $("#guruCode").val();
        if(!!guruUrl){
            guruDetailsHandler.testGuruUrl(guruUrl)
            .then((response) => {
                guruDetailsHandler.saveGuruDetails(guruUrl, guruCode);
            })
            .catch((error) => {
                //display error
                // guruDetailsHandler.showFlash("msg");
            });
        }else{
            guruUrl = `https://hype.onescreensolutions.com`
            guruDetailsHandler.saveGuruDetails(guruUrl, guruCode);
        }
    });

    $("#guruBtn").click(function(e){
        //call API here
        // guruDetailsHandler.getDetails((guruDetails) => {
        //     //call Get api here
        // });
        guruCallHelper.getGuruLists(`https://hype.onescreensolutions.com`, `112233`);
    });


});

const guruCallHelper = {
    guruDetails: {},

    guruUrlDetails: {},

    getGuruLists: (guruUrl, guruCode) => {
        let payload = {
            url: url = `${guruUrl}/api/v1/user/hype/roles?role=1&guruCode=${guruCode}`,
            type: `GET`,
            headers: { "Content-Type": "application/json" }
        };
        guruCallHelper.guruUrlDetails.guruUrl = guruUrl;
        guruCallHelper.guruUrlDetails.guruCode = guruCode;
        webserviceCall.webserviceHelper(payload)
        .then((response) =>{
            $(".guru-dropdown-item, .no-guru-div").remove()
            guruCallHelper.guruDetails = response.data.authToken;
            guruCallHelper.guruListsUI(response.data.data);
        })
        .catch((error) => {
            console.log('error found', error);
            //no guru found
        });

    },

    guruListsUI : (guruList) => {
        if(guruList.length == 0){
            //show no guru found
            let noGuruUI = `<div class=" no-guru-div">
                <p class="guru-dropdown-p" style="text-align: center;">No Guru Found</p>
            </div>`
            $(".dropdown-min-width").append(noGuruUI);
        }else{
            for(let index = 0; index < guruList.length; index++){
                $(".dropdown-min-width").append(guruCallHelper.singleGuruUI(guruList[index]));
            }
        }
    },

    singleGuruUI : (data) => {
        return `<div class="dropdown-item guru-dropdown-item">
                    <div class="col-lg-8 guru-name-div">
                    <p class="guru-dropdown-p">${data.username}</p>
                    </div>
                    <div class="col-lg-4 guru-i-div">
                    <a title="Video Call" onclick="guruCallHelper.startGuruCall(${data.id}, ${false});">
                        <i class="guru-dropdown-i fas fa-video"></i>
                    </a>
                    <a title="Audio Call" onclick="guruCallHelper.startGuruCall(${data.id}, ${true});">
                        <i class="guru-dropdown-i fas fa-headphones"></i>
                    </a>
                    </div>
                </div>`
    },

    startGuruCall: (guruId, isAudioCall) => {
        let meetingSubType = `1-1`;
        if(isAudioCall){
            meetingSubType = `1_0`;
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
        let payload = {
            url: `${guruCallHelper.guruUrlDetails.guruUrl}/api/v1.3/user/${guruId}/meetings/invite`,
            method: `POST`,
            headers: {
                "Content-Type": "application/json",
                "x-access-token": guruCallHelper.guruDetails.token
            },
            body: formData
        };

        webserviceCall.webserviceHelper(payload)
        .then((response) =>{
            onsole.log('error found', response);
        })
        .catch((error) => {
            console.log('error found', error);
            //no guru found
        });
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
            callback({guruUrl:`https://hype.onescreensolutions.com`, guruCode:``})
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

    saveGuruDetails(guruUrl, guruCode) {
        $.post( `/b/setGuru`, { guruUrl: guruUrl, guruCode: guruCode },
        function(response){
            console.log('response', response);
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