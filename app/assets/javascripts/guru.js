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


});

const guruDetailsHandler = {

    getGuruDetails(){
        guruDetailsHandler.getDetails((guruDetails) => {
            $("#guruUrl").val(guruDetails.guruUrl);
            $("#guruCode").val(guruDetails.guruCode);
        });
        // let payload = {
        //     url: `/b/getGuru`,
        //     type: `GET`,
        //     headers: { "Content-Type": "application/json" }
        // }
        // webserviceCall.webserviceHelper(payload)
        // .then((response) =>{
        //     console.log('response', response);
            
        // })
        // .catch((error) => {
        //     console.log('error', error);
        // });
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