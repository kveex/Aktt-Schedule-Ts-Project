import express from 'express'
import cors from 'cors'
import { AkttBot } from '../bot/bot';
import {subscribeToNotifications} from "../api/notification";

const WEBHOOK_PATH = '/api/webhook';

export default async function serverStart(server_url: string) {
    const app = express();
    const port = process.env.PORT || 8080;
    let webhookInFlight = false;

    app.use(cors());
    app.use(express.text({ type: '*/*' }));

    app.post(WEBHOOK_PATH, async ()=>{
        if (webhookInFlight) {
            // res.status(202).send('IGNORED');
            return;
        }

        webhookInFlight = true;
        // res.send('RECEIVED');

        try {
            await AkttBot.sendScheduleForSubscribed();
        } finally {
            webhookInFlight = false;
        }
    })

    app.listen(port, ()=>{
        subscribeToNotifications(`${server_url}${WEBHOOK_PATH}`);
        console.log('Сервер запущен на порту', port);
    })
}
