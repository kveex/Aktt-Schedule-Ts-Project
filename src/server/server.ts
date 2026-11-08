import express from 'express'
import cors from 'cors'
import { AkttBot } from '../bot/bot';
import {subscribeToNotifications} from "../api/notification";
import {ScheduleUpdate} from "../api/types";

const WEBHOOK_PATH = '/api/webhook';

export default async function serverStart(server_url: string) {
    const app = express();
    const port = process.env.PORT || 8080;
    let webhookInFlight = false;

    app.use(cors());
    app.use(express.json());

    app.post(WEBHOOK_PATH, async (req, res) => {
        if (webhookInFlight) {
            return res.status(429).json({ error: "Too Many Requests, webhook is already processing" });
        }

        webhookInFlight = true;
        const update: ScheduleUpdate = req.body;

        try {
            if (!update || typeof update !== 'object') {
                console.warn("Получен невалидный body:", req.body);
                return res.status(400).json({ error: "Invalid JSON body" });
            }

            if (update.event === "SCHEDULE_UPDATE") {
                await AkttBot.sendScheduleForSubscribed();
                res.status(200).json({ status: "ok" });

            } else if (update.event === "WEBHOOK_TEST") {
                console.log("Вебхук бота протестирован");
                res.status(200).json({ status: "ok", message: "Test received" });

            } else {
                console.warn(`Неизвестное событие: ${update.event}. Payload:`, req.body);
                res.status(400).json({ error: `Unknown event type: ${update.event}` });
            }
        } catch (error) {
            console.error("Ошибка при обработке вебхука:", error);
            res.status(500).json({ error: "Internal Server Error" });
        } finally {
            webhookInFlight = false;
        }
    });

    app.listen(port, ()=>{
        subscribeToNotifications(`${server_url}${WEBHOOK_PATH}`);
        console.log('Сервер запущен на порту', port);
    })
}
