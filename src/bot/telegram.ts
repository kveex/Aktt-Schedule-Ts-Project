import type { ApiClientOptions } from "grammy";
import { ProxyAgent, fetch as undiciFetch } from "undici";

const DEFAULT_API_ROOT = "https://api.telegram.org";

function readEnv(name: string): string | undefined {
    const value = process.env[name]?.trim();
    return value ? value : undefined;
}

function normalizeApiRoot(value: string): string {
    return value.replace(/\/+$/, "");
}

/**
 * Адрес Telegram Bot API. Если задан BOT_API_ROOT (reverse-proxy/релей),
 * возвращается он, иначе официальный api.telegram.org.
 */
export function telegramApiRoot(): string {
    const configured = readEnv("BOT_API_ROOT");
    return configured ? normalizeApiRoot(configured) : DEFAULT_API_ROOT;
}

let proxyDispatcher: ProxyAgent | undefined;

interface AbortSignalLike {
    readonly aborted: boolean;
    addEventListener(type: "abort", listener: () => void, options?: { once?: boolean }): void;
}

/**
 * grammy в Node берёт AbortController из пакета abort-controller (полифилл),
 * а undici принимает только «нативный» AbortSignal — при необходимости
 * пересоздаём сигнал, сохраняя семантику отмены.
 */
function toNativeSignal(signal: AbortSignalLike): AbortSignal {
    if (signal instanceof AbortSignal) {
        return signal;
    }

    const controller = new AbortController();

    if (signal.aborted) {
        controller.abort();
    } else {
        signal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    return controller.signal;
}

/**
 * fetch, который ходит в Telegram либо напрямую, либо через HTTP(S)-прокси
 * из BOT_PROXY_URL. Если переменная не задана — обычный глобальный fetch.
 */
export function telegramFetch(): typeof fetch {
    const proxyUrl = readEnv("BOT_PROXY_URL");

    if (!proxyUrl) {
        return fetch;
    }

    proxyDispatcher ??= new ProxyAgent(proxyUrl);

    return ((input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
        const options: Record<string, unknown> = { ...init, dispatcher: proxyDispatcher };

        if (init?.signal) {
            options.signal = toNativeSignal(init.signal);
        }

        return undiciFetch(
            input as unknown as Parameters<typeof undiciFetch>[0],
            options as Parameters<typeof undiciFetch>[1]
        );
    }) as unknown as typeof fetch;
}

/**
 * Опции клиента grammy. Собираются только из заданных переменных окружения,
 * чтобы при их отсутствии поведение бота не менялось.
 */
export function telegramClientOptions(): ApiClientOptions {
    const options: ApiClientOptions = {};

    const apiRoot = readEnv("BOT_API_ROOT");
    if (apiRoot) {
        options.apiRoot = normalizeApiRoot(apiRoot);
    }

    if (readEnv("BOT_PROXY_URL")) {
        options.fetch = telegramFetch();
    }

    return options;
}

/**
 * URL файла Telegram (скачивание документов идёт не через методы API,
 * а по отдельному пути /file/bot<token>/<file_path>).
 */
export function telegramFileUrl(filePath: string): string {
    return `${telegramApiRoot()}/file/bot${process.env.BOT_TOKEN}/${filePath}`;
}
