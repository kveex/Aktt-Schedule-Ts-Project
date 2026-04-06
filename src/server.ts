import { subscribeHook } from './api';
import express, {Request,Response} from 'express'
import cors from 'cors'
import { sendSchedule } from '.';

const WEBHOOK_PATH = '/api/webhook'

export default async function serverStart(api_url: string, server_url: string){
    const app = express()
    const port = process.env.PORT || 8080
    let webhookInFlight = false

    app.use(cors())
    app.use(express.text({ type: '*/*' }))

    app.post(WEBHOOK_PATH, async (_req: Request, res: Response)=>{
        if (webhookInFlight) {
            res.status(202).send('IGNORED')
            return
        }

        webhookInFlight = true
        res.send('RECEIVED')

        try {
            await sendSchedule()
        } finally {
            webhookInFlight = false
        }
    })

    app.listen(port, ()=>{
        subscribeHook(api_url, `${server_url}${WEBHOOK_PATH}`)
        console.log('server start')
    })
}
