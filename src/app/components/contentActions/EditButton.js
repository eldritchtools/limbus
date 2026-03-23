import ActionTemplate from "./ActionTemplate";
import { EditSolid } from "./Symbols";

import { typePageMapping } from "@/app/lib/constants";

export default function EditButton({ targetType, targetId, type = "button", iconSize }) {
    return <ActionTemplate type={type} href={`/${typePageMapping[targetType] ?? targetType}/${targetId}/edit`}>
        <EditSolid text={"Edit"} size={iconSize} />
    </ActionTemplate>
}
