export default class CompaniesList {
    companyId;
    companyName;
    contactList;

    constructor(companyId, companyName, contactList) {
        this.companyId = companyId;
        this.companyName = companyName;
        this.contactList = contactList;
    }

    get companyId() {
        return this.companyId;
    }

    get companyName() {
        return this.companyName;
    }

    get contactList() {
        return this.contactList;
    }

}