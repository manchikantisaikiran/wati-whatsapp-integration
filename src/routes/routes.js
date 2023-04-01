import { auth } from "../middlewares/auth.js";
import express from 'express';

export const router = express.Router();
import { setLoggedinUserLogic, setPartnerData, setUserSessionData, userSessionList } from '../helpers/global-state.js';
import axios from "axios";
import logger from "../config/logger.js";


// API TO STORE LOGGED IN USERS DATA
router.post('/store-loggedin-users', auth, async (req, res, next) => {
    try {

        // let customersResponse = await axios.get(`${process.env.SIMPLIFYBASEURL}/dashboard/user/customers`, {
        //     headers: {
        //         Authorization: req.token,
        //         'Content-Type': 'application/json'
        //     }
        // });

        // const customersData = customersResponse.data.data
        // const companiesIdList = customersData.map((customer)=>customer.customerId);

        // setUserSessionData(req.body.userId, req.body.partnerId, req.body.sessionToken, companiesIdList);
        // logger.debug(`usersessionlist = ${JSON.stringify(userSessionList)}`)
        // setPartnerData(req.body.partnerId, req.token, req.body.userId);

        const result = await setLoggedinUserLogic(req.body.userId, req.body.partnerId, req.token);
        logger.debug(`from store loggedin users API ${JSON.stringify(result)}`);
        res.status(200).send(result);
    } catch (e) {
        console.log('error:' + e);
        next({ err: e, logMessage: 'Error occured while storing login user details' })
    }
})