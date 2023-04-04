import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv'
dotenv.config()
import expressWinston from 'express-winston';
import winston from 'winston';

import { watiRouter } from './routes/wati.js'
import { router } from './routes/routes.js'
import { errorHandler } from './middlewares/error-handler.js'

const app = express();

app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }))
app.use(cors({
    origin: '*',
    optionsSuccessStatus: 204
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.use(expressWinston.logger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'logs/combined.log' })
    ],
    format: winston.format.combine(winston.format.colorize(), winston.format.json()),
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
    expressFormat: true,
    colorize:false,
}))

app.use(router);
app.use(watiRouter);
app.use(errorHandler);

app.use(errorHandler)

export const errorLogger1 = expressWinston.errorLogger({
    format: winston.format.json(),
    transports:[
        new winston.transports.File({ filename: 'logs/error.log' })
    ],
    colorize:true,
})

export default app;