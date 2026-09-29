import crypto from "crypto";

import { deactivatePatreonAccount, syncPatreonAccount } from "@/app/database/patreon";

export async function POST(request) {
    const body = await request.text();

    const signature = request.headers.get("x-patreon-signature");
    const event = request.headers.get("x-patreon-event");

    if (!signature || !event)
        return new Response("Missing Patreon headers", { status: 400 });

    const expectedSignature = crypto
        .createHmac("md5", process.env.PATREON_WEBHOOK_SECRET)
        .update(body)
        .digest("hex");

    if (signature.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature)))
        return new Response("Invalid signature", { status: 401 });

    let payload;

    try {
        payload = JSON.parse(body);
    } catch {
        return new Response("Invalid JSON", { status: 400 });
    }

    const member = payload?.data;

    if (!member || member.type !== "member")
        return new Response("Invalid member payload", { status: 400 });

    const patreonUserId = member.relationships?.user?.data?.id;

    if (!patreonUserId)
        return new Response("Missing Patreon user ID", { status: 400 });

    try {
        if (event === "members:delete") {
            await deactivatePatreonAccount(patreonUserId);
        } else if (event === "members:create" || event === "members:update") {
            await syncPatreonAccount(
                patreonUserId,
                member.attributes?.full_name ?? null,
                member.attributes?.patron_status ?? null
            )
        }
    } catch (error) {
        console.error("Patreon sync failed:", error);
        return new Response("Database sync failed", { status: 500 });
    }

    return new Response("OK", { status: 200 });
}