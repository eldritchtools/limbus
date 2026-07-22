import { revalidateTag } from "next/cache";

export async function POST(req) {
    const { id } = await req.json();

    revalidateTag(`build:${id}`);

    return Response.json({ success: true });
}