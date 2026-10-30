import 'dotenv/config'
import serverStart from './server/server';
import { AkttBot } from './bot/bot';
import {databaseInit} from "./bot/database/client";
import {login, register} from "./api/auth";

async function bootstrap() {
    if (process.env.API_ADDRESS === undefined || process.env.API_ADDRESS === '') throw new Error("Адрес AKTT API не указан!");
    if (process.env.SERVER_ADDRESS === undefined || process.env.SERVER_ADDRESS === '') throw new Error("Адрес данного сервера не указан!");
    if (process.env.SUPABASE_KEY === undefined || process.env.SUPABASE_KEY === '') throw new Error("Secret role ключ для supabase не указан!");
    if (process.env.SUPABASE_URL === undefined || process.env.SUPABASE_URL === '') throw new Error("URL для supabase не указан!");
    if (process.env.BOT_TOKEN === undefined || process.env.BOT_TOKEN === '') throw new Error("Токен телеграм бота не указан!");
    if (process.env.BOT_API_LOGIN === undefined || process.env.BOT_API_LOGIN === '') throw new Error("Логин для служебного аккаунта бота в AKTT API не указан!");
    if (process.env.BOT_API_PASSWORD === undefined || process.env.BOT_API_PASSWORD === '') throw new Error("Пароль для служебного аккаунта бота в AKTT API не указан!");

    databaseInit(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

    await register(process.env.BOT_API_LOGIN, process.env.BOT_API_PASSWORD);
    await login(process.env.BOT_API_LOGIN, process.env.BOT_API_PASSWORD);

    await serverStart(process.env.SERVER_ADDRESS);

    AkttBot.initialize(process.env.BOT_TOKEN);
}

bootstrap();
