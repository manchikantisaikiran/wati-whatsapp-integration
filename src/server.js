import app from './app.js';
import { Server } from 'socket.io';
import logger from './config/logger.js';
import { addActiveSessionToUser, partnerList, removeActiveSessionFromUser, userSessionList } from './helpers/global-state.js';

const port = process.env.PORT;

const server = app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});

const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

io.on('connection', (socket) => {

    
    logger.info(`A User Connected to the socket with User Name: ${socket.handshake.query.userName}(${socket.handshake.query.userId}) socketId: ${socket.id}`)
    addActiveSessionToUser(socket.handshake.query.userId, socket.id);

    socket.on('disconnect', () => {
        removeActiveSessionFromUser(socket.handshake.query.userId, socket.id);
        logger.info(`A User disconncted to the socket with User Name: ${socket.handshake.query.userName}(${socket.handshake.query.userId}) socketId: ${socket.id}`)
    })
})

//webhook
app.post('/', (req, res) => {
    logger.info(`Webhook message: ${JSON.stringify(req.body)}`);
    const matchedCustomerList = [];
    partnerList.forEach((partner) => {
        partner.contactsList.forEach(contact => {
            if(contact.watiNumber == req.body.waId){
                if(!matchedCustomerList.includes(contact.customerId)){
                    matchedCustomerList.push(contact.customerId)
                }
            }
        })
    })

    userSessionList.forEach((session)=>{
        session.companiesIdList.forEach((companyId)=>{
            if(matchedCustomerList.includes(companyId)){
                session.socketIdList.forEach((socketId)=>{
                    logger.debug('emmiting message to socket');
                    io.to(socketId).emit('message', req.body);
                })
            }
        })
    })


    res.sendStatus(200);
});