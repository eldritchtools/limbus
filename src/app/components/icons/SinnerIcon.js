import Image from "next/image";

import { sinnerIdMapping } from "@/app/lib/constants";
import { ASSETS_ROOT } from "@/app/paths";

function getSinnerIconSrc(num) {
    return `${ASSETS_ROOT}/sinners/${num}.png`;
}

export default function SinnerIcon({ num, style = {} }) {
    const name = sinnerIdMapping[num];
    return <Image src={getSinnerIconSrc(num)} alt={name} title={name} width={64} height={64} style={style} />
}
