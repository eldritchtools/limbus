import ActionTemplate from "./ActionTemplate";
import { CommentSolid } from "./Symbols";

import { typePageMapping } from "@/app/lib/constants";

export default function CommentButton({ targetType, targetId, count, type = "button", iconSize, shortText = false }) {
    const text = shortText ? `${count}` : count === 1 ? "1 Comment" : `${count} Comments`;

    return <ActionTemplate type={type} href={`/${typePageMapping[targetType] ?? targetType}/${targetId}#comments`}>
        <CommentSolid text={text} size={iconSize} />
    </ActionTemplate>
}
