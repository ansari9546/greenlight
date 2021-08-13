
const webserviceCall = {

    CALL_TIMEOUT : 60000,

    webserviceHelper = (payload) => {
        return new Promise((resolve, reject) => {
            axios({
                method: payload.type,
                url: payload.url,
                headers: payload.headers,
                data: payload.body,
                timeout: webserviceCall.CALL_TIMEOUT
            }).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error)
            })
        })
    }

};