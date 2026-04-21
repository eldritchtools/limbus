import EgoTooltip from "./EgoTooltip";
import GeneralTooltip from "./GeneralTooltip";
import GiftTooltip from "./GiftTooltip";
import IdentityTooltip from "./IdentityTooltip";
import { MarkdownTooltip } from "./MarkdownTooltip";
import StatusTooltip from "./StatusTooltip";
import { ThemePackTooltip } from "./ThemePackTooltip";
import TimerTooltip from "./TimerTooltip";

export default function AllTooltips() {
    return <>
        <GiftTooltip />
        <StatusTooltip />
        <IdentityTooltip />
        <EgoTooltip />
        <GeneralTooltip />
        <MarkdownTooltip />
        <ThemePackTooltip />
        <TimerTooltip />
    </>;
}