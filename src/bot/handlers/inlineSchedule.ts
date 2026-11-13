import {InlineQueryResultArticle} from "grammy/types";
import {AkttBotContext} from "../constants";
import {getListAll, getSchedule} from "../../api/schedule";
import {ScheduleRequest, TargetsLists} from "../../api/types";
import {prettifySchedule, subgroupToString} from "../../lesson/helper";
import {Schedule, ScheduleTarget, Subgroup} from "../../lesson/types";

const MIN_QUERY_LENGTH = 2;
const MAX_MESSAGE_LENGTH = 4096;
const LIST_CACHE_TTL_MS = 5 * 60 * 1000;
const SCHEDULE_CACHE_TTL_MS = 60 * 1000;
const INLINE_CACHE_TIME_SECONDS = 30;

interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

interface ScheduleCandidate {
    target: ScheduleTarget;
    value: string;
    subgroup: Subgroup;
}

let listCache: CacheEntry<TargetsLists> | null = null;
const scheduleCache = new Map<string, CacheEntry<Schedule | null>>();

async function getCachedListAll(): Promise<TargetsLists> {
    if (listCache && listCache.expiresAt > Date.now()) {
        return listCache.value;
    }

    const value = await getListAll();
    listCache = { value, expiresAt: Date.now() + LIST_CACHE_TTL_MS };
    return value;
}

async function getCachedSchedule(request: ScheduleRequest): Promise<Schedule | null> {
    const key = `${request.target}:${request.value}:${request.subgroup ?? ""}`;
    const cached = scheduleCache.get(key);

    if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
    }

    const value = await getSchedule(request);
    scheduleCache.set(key, { value, expiresAt: Date.now() + SCHEDULE_CACHE_TTL_MS });
    return value;
}

function findCandidates(query: string, lists: TargetsLists): ScheduleCandidate[] {
    const lowerQuery = query.toLocaleLowerCase();

    const groups = lists.groups
        .filter((group) => group.toLocaleLowerCase().includes(lowerQuery))
        .slice(0, 1);
    const teachers = lists.teachers
        .filter((teacher) => teacher.toLocaleLowerCase().includes(lowerQuery))
        .slice(0, 1);

    const candidates: ScheduleCandidate[] = [];

    for (const group of groups) {
        for (const subgroup of [Subgroup.FIRST, Subgroup.SECOND, Subgroup.BOTH]) {
            candidates.push({ target: "GROUP", value: group, subgroup });
        }
    }

    for (const teacher of teachers) {
        candidates.push({ target: "TEACHER", value: teacher, subgroup: Subgroup.BOTH });
    }

    return candidates;
}

function candidateTitle(candidate: ScheduleCandidate): string {
    return candidate.target === "GROUP"
        ? `Группа ${candidate.value} · ${subgroupToString(candidate.subgroup)}`
        : `Преподаватель ${candidate.value}`;
}

async function buildArticle(candidate: ScheduleCandidate, index: number): Promise<InlineQueryResultArticle | null> {
    const schedule = await getCachedSchedule({
        value: candidate.value,
        target: candidate.target,
        subgroup: candidate.subgroup
    });

    if (!schedule) {
        return null;
    }

    let text = prettifySchedule(schedule, candidate.target, candidate.value);
    if (text.length > MAX_MESSAGE_LENGTH) {
        text = text.slice(0, MAX_MESSAGE_LENGTH - 1) + "…";
    }

    return {
        type: "article",
        id: `s${index}`,
        title: candidateTitle(candidate),
        description: text.split("\n")[0] ?? "",
        input_message_content: { message_text: text }
    };
}

export async function handleInlineScheduleQuery(ctx: AkttBotContext): Promise<void> {
    const query = ctx.inlineQuery?.query.trim() ?? "";

    if (query.length < MIN_QUERY_LENGTH) {
        await ctx.answerInlineQuery([], { cache_time: INLINE_CACHE_TIME_SECONDS });
        return;
    }

    try {
        const lists = await getCachedListAll();
        const candidates = findCandidates(query, lists);

        const results: InlineQueryResultArticle[] = [];
        for (const candidate of candidates) {
            const article = await buildArticle(candidate, results.length);
            if (article) {
                results.push(article);
            }
        }

        await ctx.answerInlineQuery(results, { cache_time: INLINE_CACHE_TIME_SECONDS });
    } catch (error) {
        console.error("Ошибка при обработке inline-запроса расписания:", error);
        await ctx.answerInlineQuery([], { cache_time: 0 }).catch(() => undefined);
    }
}
