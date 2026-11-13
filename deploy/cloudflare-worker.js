// Cloudflare Worker — релей к Telegram Bot API.
//
// Зачем: с серверов в РФ соединение с api.telegram.org сбрасывается (DPI).
// Воркер живёт на Cloudflare (вне РФ) и просто проксирует запросы к
// https://api.telegram.org, так что бот может обращаться к Telegram.
//
// Безопасность: воркер не является открытым прокси. Первый сегмент пути
// должен совпадать с секретом из переменной окружения SECRET_PATH, иначе 404.
//
// Пример: BOT_API_ROOT = https://<worker>.workers.dev/<SECRET_PATH>
//   запрос  https://<worker>.workers.dev/<SECRET_PATH>/bot<token>/getMe
//   уходит  https://api.telegram.org/bot<token>/getMe

const TELEGRAM_ORIGIN = "https://api.telegram.org";
const ALLOWED_METHODS = ["GET", "POST"];

export default {
    async fetch(request, env) {
        const secret = env.SECRET_PATH;

        if (!secret) {
            return new Response("Релей не настроен: не задан SECRET_PATH", { status: 500 });
        }

        if (!ALLOWED_METHODS.includes(request.method)) {
            return new Response("Method Not Allowed", { status: 405 });
        }

        const url = new URL(request.url);
        const prefix = `/${secret}`;

        if (url.pathname !== prefix && !url.pathname.startsWith(`${prefix}/`)) {
            return new Response("Not Found", { status: 404 });
        }

        const upstreamPath = url.pathname.slice(prefix.length) || "/";
        const upstreamUrl = `${TELEGRAM_ORIGIN}${upstreamPath}${url.search}`;

        const headers = new Headers(request.headers);
        headers.delete("host");
        headers.delete("content-length");

        const init = {
            method: request.method,
            headers,
            redirect: "follow"
        };

        // У GET не может быть тела, у POST — может (в т.ч. FormData при загрузке файлов).
        if (request.method === "POST") {
            init.body = request.body;
        }

        return fetch(upstreamUrl, init);
    }
};
