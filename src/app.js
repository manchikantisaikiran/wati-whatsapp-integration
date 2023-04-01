import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv'
dotenv.config()

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


app.use(router);
app.use(watiRouter);
app.use(errorHandler);

export default app;