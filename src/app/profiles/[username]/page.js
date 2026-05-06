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

export default function Page({ params }) {
    return <ProfilePage params={params} />;
}
