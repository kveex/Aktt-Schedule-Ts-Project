# Деплой бота в РФ: релей к Telegram

С серверов в РФ соединение с `api.telegram.org` сбрасывается (DPI-блок).
Нужна точка выхода за пределами РФ. Поддерживаются два режима, переключаются
через `.env`, код один и тот же:

- `BOT_API_ROOT` — адрес reverse-proxy/релея (рекомендуется, например Cloudflare Worker);
- `BOT_PROXY_URL` — HTTP(S)-прокси (`http://user:pass@host:port`).

Если обе переменные не заданы — бот работает как раньше, напрямую с Telegram.

## Вариант 1. Cloudflare Worker (без VPS)

### 1. Установить wrangler и войти

```bash
npx wrangler login
```

### 2. Задеплоить воркер

Из корня проекта:

```bash
npx wrangler deploy --config deploy/wrangler.toml
```

После деплоя wrangler покажет адрес вида
`https://aktt-telegram-relay.<сабдомен>.workers.dev`.

### 3. Задать секретный префикс

Придумайте длинную случайную строку и сохраните её как секрет:

```bash
# сгенерировать значение
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"

# сохранить его в воркере
npx wrangler secret put SECRET_PATH --config deploy/wrangler.toml
```

Без `SECRET_PATH` воркер отвечает `500`, с неверным путём — `404`,
поэтому он не работает как открытый прокси.

### 4. Прописать в `.env` бота

```env
BOT_API_ROOT=https://aktt-telegram-relay.<сабдомен>.workers.dev/<SECRET_PATH>
```

Проверка (подставьте свой токен и секрет):

```bash
curl "https://aktt-telegram-relay.<сабдомен>.workers.dev/<SECRET_PATH>/bot<TOKEN>/getMe"
# ожидается {"ok":true,"result":{...}}
```

## Вариант 2. HTTP(S)-прокси

На зарубежном сервере поднимите HTTP-прокси (3proxy, squid и т.п.) или
используйте готовый и укажите его в `.env`:

```env
BOT_PROXY_URL=http://user:password@proxy-host:3128
```

Поддерживаются только `http://` и `https://` (SOCKS не поддерживается).
Прокси используется и для методов API, и для скачивания файлов.

## Что делает код

- `src/bot/telegram.ts` — читает `BOT_API_ROOT`/`BOT_PROXY_URL` и строит
  опции клиента grammy и `fetch`; отдельно формирует URL файла Telegram.
- `src/bot/bot.ts` — передаёт опции в `new Bot(token, { client })`.
- `src/bot/conversations/scheduleConversations.ts` — скачивание PDF идёт
  через тот же релей/прокси.

## Возможные нюансы

- **Long polling через Cloudflare.** grammy опрашивает `getUpdates` с
  таймаутом 30 с. Если релей обрывает такие запросы, уменьшите таймаут:
  `bot.start({ timeout: 10 })` в `src/bot/bot.ts`.
- **Доступность Cloudflare из РФ** нестабильна. Если релей начнёт
  отваливаться, тот же `BOT_API_ROOT` можно переключить на собственный VPS
  с nginx/Caddy, не меняя код.
- **Доступ к `api.telegram.org` для AKTT API не нужен** — это отдельный
  сервис (`API_ADDRESS`), прокси на него не влияет.
