export default class UserSessionList {
    userId;
    // partnerId; //
    sessionToken; //jwt token
    socketIdList;
    companiesIdList //customerId

    constructor(userId, sessionToken, companiesIdList) {
        this.userId = userId;
        // this.partnerId = partnerId;
        this.sessionToken = sessionToken;
        this.socketIdList = [];
        this.companiesIdList = companiesIdList;
    }


    get userId() {
        return this.userId;
    }

    // get partnerId() {
    //     return this.partnerId;
    // }

    get sessionToken() {
        return this.sessionToken;
    }

    get socketIdList() {
        return this.socketIdList;
    }

    get companiesIdList() {
        return this.companiesIdList;
    }

    set companiesList(value){
        this.companiesList = value;
    }
}