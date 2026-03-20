import { ASSETS_ROOT } from "@/app/paths";
import Image from "next/image";

export default function Icon({ path, style = {} }) {
    return <Image src={`${ASSETS_ROOT}/icons/${path}.png`} alt={path} title={path} style={style} />
}