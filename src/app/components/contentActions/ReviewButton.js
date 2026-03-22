import ActionTemplate from "./ActionTemplate";
import { ReviewSolid } from "./Symbols";
import { useAuth } from "../database/authProvider";

export default function ReviewButton({ collectionId, type = "button", iconSize }) {
    const { user } = useAuth();

    return <ActionTemplate type={type} href={`/collections/${collectionId}/review`} disabled={!user}>
        <ReviewSolid text={"Review Submissions"} size={iconSize} />
    </ActionTemplate>
}
