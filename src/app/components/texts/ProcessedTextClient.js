"use client";

import { useData } from "../DataProvider";
import ProcessedTextMain from "./ProcessedTextMain";

export default function ProcessedTextClient(props) {
    const [statuses, statusesLoading] = useData("statuses");
    const [skillTags, skillTagsLoading] = useData("skill_tags");

    return <ProcessedTextMain
        statuses={statusesLoading ? {} : statuses}
        skillTags={skillTagsLoading ? {} : skillTags}
        {...props}
    />
}