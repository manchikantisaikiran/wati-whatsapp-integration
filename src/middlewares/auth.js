// const jwt = require("jsonwebtoken")
// const User = require("../models/user")

import axios from "axios";
import { partnerList } from "../helpers/global-state.js";

export const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization');

        const tokenResponse = await axios.get(`${process.env.SIMPLIFYBASEURL}/auth/tokenValidate`, {
            headers: {
                Authorization: token
            }
        });

        if (tokenResponse.status !== 200)
            throw new Error();

        req.token = token;
        req.partnerId = req.query.partnerId;
        next()
    } catch (e) {
        console.log(e);
        res.status(401).send({ error: 'please Autenticate' });
    }
}