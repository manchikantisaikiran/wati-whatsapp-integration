import { formatContactsList } from "../helpers/global-state.js";

export default class PartnerList {
    partnerId;
    partnerWatiKey;
    partnerWhatsappNumber;
    contactsList;

    constructor(partnerId, partnerWatiKey, partnerWhatsappNumber, contactsList) {
        this.partnerId = partnerId;
        this.partnerWatiKey = `Bearer ${partnerWatiKey}`;
        this.partnerWhatsappNumber = partnerWhatsappNumber;
        this.contactsList = formatContactsList(contactsList);
    }

    get partnerId() {
        return this.partnerId;
    }

    get partnerWatiKey() {
        return this.partnerWatiKey;
    }

    get partnerWhatsappNumber() {
        return this.partnerWhatsappNumber;
    }

    get contactsList() {
        return this.contactsList;
    }

    // set companies(companiesList) {
    //     this.companies = companiesList;
    // }

}