import ProfilePage from "./ProfilePage";

export async function generateMetadata({ params }) {
    const { username } = await params;
    return {
        title: `${username}'s Profile`,
        description: "View a user's profile and content",
        alternates: {
            canonical: `/profiles/${username}`
        }
    };
}

export default async function Page({ params, searchParams }) {
    const sp = await searchParams;
    return <ProfilePage params={params} sp_tab={sp.tab} sp_page={sp.page ? Number(sp.page) : undefined} />;
}
