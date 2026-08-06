import { useSiteCustomization } from "../SiteCustomizationProvider";
import ChatWidget from "./ChatWidget";

import { useAuth } from "@/app/database/authProvider";

export default function ChatWrapper() {
    const { profile, loading } = useAuth();
    const { getCustomizationValue } = useSiteCustomization();

    if (loading || getCustomizationValue("hideChat")) return;

    return <ChatWidget username={profile?.username} />
}