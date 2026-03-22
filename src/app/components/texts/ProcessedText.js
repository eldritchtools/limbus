import { TextWithStatuses } from "@/app/lib/statusReplacement";

export default function ProcessedText({ text, enableTooltips = true, iconStyleOverride = {}, nameStyleOverride = {} }) {
    let str = text.replaceAll("<style=\"highlight\">", "").replaceAll("</style>", "");

    return <TextWithStatuses
        templateText={str} 
        includeTooltips={enableTooltips}
        iconStyleOverride={iconStyleOverride}
        nameStyleOverride={nameStyleOverride}
    />
}
