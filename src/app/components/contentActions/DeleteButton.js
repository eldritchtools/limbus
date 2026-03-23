import ActionTemplate from "./ActionTemplate";
import { DeleteSolid } from "./Symbols";
import { useModal } from "../modals/ModalProvider";

export default function DeleteButton({ targetType, targetId, title = "", type = "button", iconSize }) {
    const { openDeleteContentModal } = useModal();

    return <ActionTemplate type={type} onClick={() => openDeleteContentModal(targetType, targetId, title)}>
        <DeleteSolid text={"Delete"} size={iconSize} />
    </ActionTemplate>
}
