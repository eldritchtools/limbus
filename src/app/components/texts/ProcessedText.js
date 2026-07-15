import { fetchData } from "../DataFetcherServer";
import ProcessedTextClient from "./ProcessedTextClient";
import ProcessedTextMain from "./ProcessedTextMain";

async function ProcessedTextServer(props) {
    const [statuses, skillTags] = await Promise.all([
        fetchData("statuses"),
        fetchData("skill_tags")
    ])

    return <ProcessedTextMain statuses={statuses} skillTags={skillTags} {...props} />
}

export default function ProcessedText({ serverText, ...props }) {
    if(serverText) return <ProcessedTextServer {...props} />
    else return <ProcessedTextClient {...props} />
}
