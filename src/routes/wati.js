import fetch from "node-fetch";
import express from 'express';
import axios from 'axios';
import multer from 'multer';
import { auth } from '../middlewares/auth.js'
import logger from "../config/logger.js";
import fs from 'fs'

export const watiRouter = express.Router();
import { partnerList, setLoggedinUserLogic, setPartnerData, userSessionList } from '../helpers/global-state.js';

// API TO GET CONTACTS LIST
watiRouter.get('/contact-list', auth, async (req, res, next) => {
    try {
        const currentPartner = partnerList.find((partner) => partner.partnerId == req.query.partnerId);
        if (!currentPartner) {
            const result = await setLoggedinUserLogic(req.query.userId, req.query.partnerId, req.token);
            if (!result.data.isWhatsappEnabled) {
                res.status(200).send(result);
                return;
            }
        }

        const filteredList = await getContactListLogic(req);
        console.log(filteredList);
        res.status(200).send({ contact_list: filteredList });

    } catch (e) {
        console.log('error:' + e);
        next(e)
    }
})


function getContactListLogic(req) {
    return new Promise(async (resolve, reject) => {
        try {
            const currentPartner = partnerList.find((partner) => partner.partnerId == req.query.partnerId);
            const currentSession = userSessionList.find(userSession => userSession.userId == req.query.userId)
            const result = await axios.get(process.env.WATIBASEURL + '/getContacts?pageSize=2147483647', {
                headers: {
                    Authorization: currentPartner.partnerWatiKey,
                    'Content-Type': 'application/json'
                }
            });
            let filteredList = [];

            const filterContactList = [];

            currentPartner.contactsList.forEach((contact) => {
                result.data.contact_list.forEach(watiContact => {
                    if (watiContact.phone == contact.watiNumber) {
                        const obj = {
                            ...watiContact,
                            customerId: contact.customerId
                        };
                        filterContactList.push(obj);
                    }
                });
            })

            filteredList = filterContactList.filter(obj => {
                if (currentSession.companiesIdList.includes(obj.customerId)) {
                    return true;
                }
            });
            resolve(filteredList);
        } catch (e) {
            reject(e);
        }
    })
}







// API TO GET WHATSAPP MESSAGES BY A NUMBER
watiRouter.post('/get-messages-by-whatsapp', auth, async (req, res, next) => {
    try {
        const currentPartner = partnerList.find((partner) => partner.partnerId == req.partnerId);
        const result = await axios.get(`${process.env.WATIBASEURL}/getMessages/${req.body.number}?pageSize=2147483647`, {
            headers: {
                Authorization: currentPartner.partnerWatiKey,
                'Content-Type': 'application/json'
            }
        })
        res.status(200).send(result.data);
    } catch (e) {
        console.log('error:' + e);
        next({ err: e, logMessage: error.response })
    }
})

// API TO ADD A NEW CONTACT
watiRouter.post('/add-contact', auth, async (req, res, next) => {
    const currentPartner = partnerList.find((partner) => partner.partnerId == req.partnerId);
    const url = `${process.env.WATIBASEURL}/addContact/:number`;

    const body = { customParams: [{ name: req.body.name, value: req.body.number }], name: req.body.name }

    try {
        const result = await axios.post(url.replace(':number', req.body.number), body, {
            headers: {
                Authorization: currentPartner.partnerWatiKey,
                'Content-Type': 'application/json'
            }
        })

        const templateMessageCallResponse = await axios.post(`${process.env.WATIBASEURL}/sendTemplateMessage?whatsappNumber=${req.body.number}`, {
            parameters: [{ name: 'name', value: 'value' }],
            broadcast_name: 'test_icde',
            template_name: 'test_icde'
        }, {
            headers: {
                Authorization: currentPartner.partnerWatiKey,
                'Content-Type': 'application/json'
            }
        })

        res.status(201).send(templateMessageCallResponse.data);
    } catch (e) {
        console.log('error:' + e);
        next({ err: e, logMessage: error.response })
    }
})

// API TO SEND MESSAGES TO A NUMBER
watiRouter.post('/send-message-to-whatsapp', auth, async (req, res, next) => {
    const currentPartner = partnerList.find((partner) => partner.partnerId == req.partnerId);
    try {
        const result = await axios.post(`${process.env.WATIBASEURL}/sendSessionMessage/${req.body.number}?messageText=${req.body.messageText}`, {}, {
            headers: {
                Authorization: currentPartner.partnerWatiKey,
                'Content-Type': 'application/json'
            }
        })
        res.status(200).send(result.data);
    } catch (e) {
        console.log('error:' + e);
        next({ err: e, logMessage: error.response })
    }
})

const upload = multer();
import FormData from "form-data";
import { resolve } from "path";

// save file
watiRouter.post('/save-file', auth, upload.single('file'), (req, res, next) => {
    const url = `${process.env.WATIBASEURL}/sendSessionFile/:number`;
    const currentPartner = partnerList.find((partner) => partner.partnerId == req.partnerId);
    try {
        const dataBuffer = Buffer.from(req.body.file, 'base64');
        // Assuming 'filename' is the desired filename for the converted file
        fs.writeFile(req.body.filename, dataBuffer, async (err) => {
            if (err) {
                console.log(err, 'err')
                throw err;
            }
            // Create a FormData object to send the file
            const formData = new FormData();
            formData.append('file', fs.createReadStream(req.body.filename), req.body.filename);
            // Send the file to the third-party server using axios
            const result = await axios.post(url.replace(':number', req.body.number) + `?caption=${req.body.filename}`, formData, {
                headers: {
                    Authorization: currentPartner.partnerWatiKey,
                    // 'content-type': 'multipart/form-data'
                }
            })
            res.status(200).send(result.data);
        });
    } catch (e) {
        console.log('error:' + e);
        next({ err: e, logMessage: error.response })
    }


    // const dataBuffer = Buffer.from(req.body.file, 'base64');
    // fs.writeFile(req.body.filename, dataBuffer, (err) => {
    //     if (err) {
    //         console.log(err, 'err')
    //         throw err;
    //     }

    //     // Create a FormData object to send the file
    //     const formData = new FormData();
    //     formData.append('file', fs.createReadStream(req.body.filename), req.body.filename);

    //     // Send the file to the third-party server using Axios
    //     axios.post(url.replace(':number', req.body.number) + `?caption=${req.body.filename}`, formData, { })
    //         .then(response => {
    //             // console.log(response.data);
    //             res.status(200).send();
    //         })
    //         .catch(error => {
    //             console.error(error);
    //             res.status(500).send('Something went wrong');
    //         });
    // });


})

// API TO DOWNLOAD A DOCUMENT
watiRouter.post('/download-whatsapp', auth, async (req, res, next) => {
    const url = `${process.env.WATIBASEURL}/getMedia`;
    const currentPartner = partnerList.find((partner) => partner.partnerId == req.partnerId);
    try {
        const options = {
            method: 'GET',
            headers: {
                Authorization: currentPartner.partnerWatiKey
            }
        };
        const response = await fetch(url + `?fileName=${req.body.filePath}`, options);
        const buffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);
        const string = String.fromCharCode.apply(null, uint8Array);
        const base64String = btoa(string);
        res.json({ data: base64String });
    } catch (e) {
        console.log('error:' + e);
        next(e);

    }

})