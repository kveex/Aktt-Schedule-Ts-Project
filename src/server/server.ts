import express, {Request,Response} from 'express'
import cors from 'cors'
import { parseDate } from '../util/helper';
import { ApiCommunicator } from '../api';
import { AkttBot } from '../bot/bot';
import {Schedule} from "../lesson/types";
import {prettifySchedule} from "../lesson/helper";
import {ScheduleSubscription} from "../bot/database/types";
import {getScheduleSubscriptions} from "../bot/database/schedule_subscriptions";
import {AkttBotContext} from "../bot/constants";
import {Bot} from "grammy";

const WEBHOOK_PATH = '/api/webhook';

export default async function serverStart(server_url: string) {
    const app = express();
    const port = process.env.PORT || 8080;
    let webhookInFlight = false;

    app.use(cors());
    app.use(express.text({ type: '*/*' }));

    app.post(WEBHOOK_PATH, async (req: Request, res: Response)=>{
        if (webhookInFlight) {
            res.status(202).send('IGNORED');
            return;
        }

        webhookInFlight = true;
        res.send('RECEIVED');

        try {
            const date: Date = parseDate(req.body)
            await AkttBot.sendScheduleForSubscribed();
        } finally {
            webhookInFlight = false;
        }
    })

    app.listen(port, ()=>{
        ApiCommunicator.subscribeHook(`${server_url}${WEBHOOK_PATH}`);
        console.log('Сервер запущен на порту', port);
    })
}
