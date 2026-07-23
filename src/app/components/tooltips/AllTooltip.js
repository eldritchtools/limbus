import DistributionTooltip from "./DistributionTooltip";
import EgoTooltip from "./EgoTooltip";
import EncounterTooltip from "./EncounterTooltip";
import GeneralTooltip from "./GeneralTooltip";
import GiftTooltip from "./GiftTooltip";
import IdentityTooltip from "./IdentityTooltip";
import { MarkdownTooltip } from "./MarkdownTooltip";
import RatingHelpTooltip from "./RatingHelpTooltip";
import RatingTooltip from "./RatingTooltip";
import SkillTooltip from "./SkillTooltip";
import StatusTooltip from "./StatusTooltip";
import TeamCodeTooltip from "./TeamCodeTooltip";
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
        <EncounterTooltip />
        <RatingTooltip />
        <RatingHelpTooltip />
        <TeamCodeTooltip />
        <SkillTooltip />
        <DistributionTooltip />
    </>;
}