import { useEffect, useState } from "react";

import { useAuth } from "@/app/database/authProvider";

export default function useRealtimeClientId() {
    const { user, loading } = useAuth();
    const [clientId, setClientId] = useState(null);

    useEffect(() => {
        if(clientId || loading) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if(user) setClientId(user.id);
        else {
            const stored = localStorage.getItem("realtimeClientId");
            if (stored) {
                setClientId(stored);
                return;
            }

            const id = crypto.randomUUID();
            localStorage.setItem("realtimeClientId", id);
            setClientId(id);
        }
    }, [user, clientId, loading]);

    return clientId;
}