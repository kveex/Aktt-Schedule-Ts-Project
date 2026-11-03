import {User} from "./types";
import {db, Tables} from "./client";

export async function saveAnnouncement(user: User, text: string): Promise<void> {
    const client = db();

    const { error } = await client
        .from(Tables.ANNOUNCEMENTS)
        .insert({user_id: user.id, text: text});

    if (error) {
        throw error;
    }
}