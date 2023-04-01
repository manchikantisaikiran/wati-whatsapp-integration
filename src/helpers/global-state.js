import axios from "axios";
import logger from "../config/logger.js";
import PartnerList from "../types/partner-list.js";
import UserSessionList from "../types/user-session-list.js";

export const userSessionList = [];
export const partnerList = [];

// fetched partnerDetails From VSimplify to get the companies List
export let partnerDetails = [];

export async function setPartnerData(partnerId, token, userId) {
    const partner = partnerList.find(partner => partner.partnerId == partnerId);
    if (partner) {
        logger.info(`Partner Details already exist`);
    } else {
        try {
            const result = await axios.get(`${process.env.SIMPLIFYBASEURL}/customers/customersAssignedList/${userId}`, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'application/json'
                }
            });
            const partner = result.data.data;
            // partner.partnerId = partnerId; //as of now partner user is returning the id of partner admin
            // partner.customers = partner.customers.filter((obj, index, self) => index == self.findIndex(o => o.partnerId == partnerId));
            if (partner && partner.partnerId && partner.customers.length) {
                const partnerRecord = new PartnerList(partner.partnerId, partner.watiKey, `${partner.countryCode.slice(1)}${partner.watsappNumber}`, partner.customers);
                partnerList.push(partnerRecord);
                logger.info(`Partner Details Found with wati Details and updated the list ${JSON.stringify(partnerRecord)}`);
                return Promise.resolve(true);
            } else {
                logger.warn(`Partner Details Not Found with wati Details`);
                return Promise.resolve(false);
            }
        } catch (e) {
            logger.error("Something went wrong while fetching partner contacts");
            logger.error(e);
        }
    }
}

export function setUserSessionData(userId, partnerId, sessionToken, companiesIdList) {
    const userSession = new UserSessionList(userId, sessionToken, companiesIdList);
    userSessionList.push(userSession);
    logger.info(`User Details Captured Succesfully!`);
}

export function addActiveSessionToUser(userId, socketId) {
    let userSession = userSessionList.find(userSession => userSession.userId == userId);
    if (userSession) {
        logger.debug(JSON.stringify(userSession));
        userSession.socketIdList.push(socketId);
        logger.info(`A New session is added from the userId:${userId}`);
    } else {
        logger.error(`user not found to add a active session`);
    }
    logger.debug(JSON.stringify(userSessionList));
}

export function removeActiveSessionFromUser(userId, socketId) {
    const index = userSessionList.findIndex(userSession => userSession.userId == userId);
    if (index !== -1) {
        const socketIdIndex = userSessionList[index].socketIdList.findIndex(id => id == socketId);
        if (socketIdIndex != -1) {
            logger.debug(JSON.stringify())
            userSessionList[index].socketIdList.splice(socketIdIndex, 1);
            logger.info(`A New session is added from the userId:${userId}`);
        } else {
            logger.error(`Active session not found to disconnect the ended session`);
        }
    } else {
        logger.error(`user details not found to remove the active session from the user Session data`);
    }
    logger.debug(JSON.stringify(userSessionList));
}

export function formatContactsList(contactsList) {
    return contactsList.map((obj) => {
        // if(obj.countryCode.slice(1) == 1 && obj.mobileNumber == '853198720'){
        //     obj.countryCode = '+91'
        //     obj.mobileNumber = '8531987200'
        // }
        return {
            ...obj,
            watiNumber: `${obj.countryCode.slice(1)}${obj.mobileNumber}`
        }
    })
}


export async function setLoggedinUserLogic(userId, partnerId, token) {
    try {
        logger.debug('input params', userId, partnerId, token)
        const setPartnerDataStatus = await setPartnerData(partnerId, token, userId);
        logger.debug(`partner status ${setPartnerDataStatus}`)
        if (setPartnerDataStatus) {
            let customersResponse = await axios.get(`${process.env.SIMPLIFYBASEURL}/dashboard/user/customers`, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'application/json'
                }
            });

            const customersData = customersResponse.data.data
            const companiesIdList = customersData.map((customer) => customer.customerId);

            setUserSessionData(userId, partnerId, token, companiesIdList);
            return Promise.resolve({ data: { message: 'Partner details stored succesfully', isWhatsappEnabled: 1 } })
        } else {
            return Promise.resolve({ data: { message: 'Partner is not registered with wati!', isWhatsappEnabled: 0 } })
        }
    } catch (e) {
        logger.er(`from setLoggedinUserLogic ${e}`);
    }
}