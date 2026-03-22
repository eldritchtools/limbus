import ActionTemplate from "./ActionTemplate";
import { CommentSolid } from "./Symbols";

export default function CommentButton({ targetPath, targetId, count, type = "button", iconSize, shortText = false }) {
    const text = shortText ? `${count}` : count === 1 ? "1 Comment" : `${count} Comments`;

    return <ActionTemplate type={type} href={`/${targetPath}/${targetId}#comments`}>
        <CommentSolid text={text} size={iconSize} />
    </ActionTemplate>
}
