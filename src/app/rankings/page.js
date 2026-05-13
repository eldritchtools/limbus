import RankingsPage from "./RankingsPage";

export default async function Page({ searchParams }) {
    const params = await searchParams;
    return <RankingsPage
        tab={params.tab ?? undefined}
        username={params.username ? decodeURIComponent(params.username) : undefined}
    />;
}
