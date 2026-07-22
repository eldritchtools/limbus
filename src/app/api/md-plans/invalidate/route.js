import { revalidateTag } from "next/cache";

export async function POST(req) {
    const { id } = await req.json();

    revalidateTag(`mdplan:${id}`);

    return Response.json({ success: true });
}