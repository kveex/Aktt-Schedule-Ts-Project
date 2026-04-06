import {SupabaseClient} from "@supabase/supabase-js";
import { Subgroup } from "../lesson/types";

export interface ScheduleSubscription {
    id: number,
    chat_id: number,
    group_name: string | null,
    teacher_name: string | null,
    subgroup: Subgroup
}

export async function getScheduleSubscriptions(client: SupabaseClient): Promise<ScheduleSubscription[]> {
    const {data} = await client.from("schedule_subscriptions").select();
    return data as ScheduleSubscription[]
}

