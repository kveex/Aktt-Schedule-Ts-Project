import axios, {AxiosInstance} from "axios";

let authToken: string | null = null;

export function setAuthToken(token: string): void {
    authToken = token;
}

export const apiClient: AxiosInstance = axios.create({
    baseURL: buildApiBaseUrl(process.env.API_ADDRESS!, 1),
    timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }

    return config;
})

function buildApiBaseUrl(rawUrl: string, version: number): string {
    let parsedUrl: URL;

    try {
        parsedUrl = new URL(rawUrl);
    } catch (e) {
        throw new Error(`Некорректный API_URL: "${rawUrl}"`);
    }

    let cleanPath = parsedUrl.pathname.replace(/\/+$/, "");

    if (!cleanPath.includes("/api")) {
        cleanPath += "/api";
    }

    if (!/\/v\d+$/.test(cleanPath)) {
        cleanPath += `/v${version}`;
    }

    return `${parsedUrl.origin}${cleanPath}`;
}