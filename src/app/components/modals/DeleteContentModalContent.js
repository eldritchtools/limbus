import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteBuild } from "@/app/database/builds";
import { deleteCollection } from "@/app/database/collections";
import { isLocalId, localStores } from "@/app/database/localDB";
import { deleteMdPlan } from "@/app/database/mdPlans";
import { typePageMapping } from "@/app/lib/constants";

const targetMapping = {
    "build": { store: localStores["builds"], dbFunc: deleteBuild },
    "collection": { store: localStores["collections"], dbFunc: deleteCollection },
    "md_plan": { store: localStores["mdPlans"], dbFunc: deleteMdPlan }
}

export default function DeleteContentModalContent({ targetType, targetId, title, onClose }) {
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setDeleting(true);
        if (isLocalId(targetId)) {
            await targetMapping[targetType].store.remove(Number(targetId));
            onClose();
            router.push(`/my-profile`);
        } else {
            const data = await targetMapping[targetType].dbFunc(targetId);
            if (data && data.deleted) {
                onClose();
                router.push(`/${typePageMapping[targetType]}`);
            }
        }
        setDeleting(false);
    }

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
        <span>Are you sure you want to delete {title}?</span>
        <span>This is a non-recoverable action.</span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => handleDelete()} disabled={deleting}>Yes</button>
            <button onClick={() => onClose()}>No</button>
        </div>
    </div>
}
