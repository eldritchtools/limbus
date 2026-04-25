import { useData } from "../DataProvider";
import GiftIcon from "../icons/GiftIcon";
import { useModal } from "../modals/ModalProvider";
import { getGiftTooltipProps } from "../tooltips/GiftTooltip";

function GiftMain({ id, gift, enhanceRank = 0, scale = 1, text = false, includeTooltip = true, expandable = true }) {
    const { openGiftModal } = useModal();
    const canHover = useMemo(() => window.matchMedia("(hover: hover)").matches, []);

    let props = {};
    if (includeTooltip && (!expandable || canHover)) {
        props = { ...props, ...getGiftTooltipProps(id ?? gift?.id, enhanceRank, expandable) };
    }

    if (expandable) {
        props.onClick = () => openGiftModal({ gift, enhanceRank });
    }

    if (text) {
        return <span {...props}>{gift.names[enhanceRank]}</span>;
    } else {
        return <span {...props}><GiftIcon gift={gift} enhanceRank={enhanceRank} scale={scale} /></span>;
    }
}

function GiftFetch({ id, ...props }) {
    const [gifts, giftsLoading] = useData("gifts");

    if (giftsLoading) {
        return null;
    } else if (!(id in gifts)) {
        console.warn(`Gift ${id} not found.`);

        if (text ?? false) return <span>Gift not found</span>;
        else return <GiftIcon id={id} />
    } else {
        return <GiftMain id={id} gift={gifts[id]} {...props} />
    }
}

export default function Gift({ id, gift = null, ...props }) {
    if (gift) {
        return <GiftMain id={id ?? gift?.id} gift={gift} {...props} />
    } else {
        return <GiftFetch id={id} {...props} />
    }
}