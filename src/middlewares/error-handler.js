import logger from "../config/logger.js";

export function errorHandler(err, req, res, next) {

    if (res.headersSent) {
        return next(error)
    }

    if(err?.response?.status == 401){
        res.status(400).send({status: err.status, message: 'Unauthorized'});
        return;
    }

    res.status(500).send(err);
}