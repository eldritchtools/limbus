import EgoTooltip from "./EgoTooltip";
import GeneralTooltip from "./GeneralTooltip";
import GiftTooltip from "./GiftTooltip";
import IdentityTooltip from "./IdentityTooltip";
import StatusTooltip from "./StatusTooltip";

export default function AllTooltips() {
    return <>
        <GiftTooltip />
        <StatusTooltip />
        <IdentityTooltip />
        <EgoTooltip />
        <GeneralTooltip />
    </>;
}