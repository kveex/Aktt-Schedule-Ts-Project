import 'dotenv/config'
import serverStart from './server/server';
import { ApiCommunicator } from './api';
import { AkttBot } from './bot/bot';
import { Database } from './bot/database';
import {databaseInit} from "./bot/database/client";

if (process.env.API_ADDRESS === undefined || process.env.API_ADDRESS === '') throw new Error("Адрес AKTT API не указан!");
if (process.env.SERVER_ADDRESS === undefined || process.env.SERVER_ADDRESS === '') throw new Error("Адрес данного сервера не указан!");
if (process.env.SUPABASE_KEY === undefined || process.env.SUPABASE_KEY === '') throw new Error("Secret role ключ для supabase не указан!");
if (process.env.SUPABASE_URL === undefined || process.env.SUPABASE_URL === '') throw new Error("URL для supabase не указан!");
if (process.env.BOT_TOKEN === undefined || process.env.BOT_TOKEN === '') throw new Error("Токен телеграм бота не указан!");

serverStart(process.env.SERVER_ADDRESS);
AkttBot.initialize(process.env.BOT_TOKEN);
Database.initialize(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
databaseInit(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
ApiCommunicator.initialise(process.env.API_ADDRESS);
