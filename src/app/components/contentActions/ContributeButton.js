import ActionTemplate from "./ActionTemplate";
import { ContributeSolid } from "./Symbols";
import { useAuth } from "../database/authProvider";

export default function ContributeButton({ collectionId, type = "button", iconSize }) {
    const { user } = useAuth();

    return <ActionTemplate type={type} href={`/collections/${collectionId}/contribute`} disabled={!user}>
        <ContributeSolid text={"Contribute"} size={iconSize} />
    </ActionTemplate>
}
