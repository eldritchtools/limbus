import DataLoader from "../DataLoader";
import GiftInteractive from "./GiftInteractive";
import GiftIcon from "../icons/GiftIcon";

function GiftMain({ id, gift, enhanceRank = 0, scale = 1, text = false, includeTooltip = true, expandable = true, forceTagStrips, forceTriggersEffects }) {
    let iconProps = {};
    if (forceTagStrips !== undefined) iconProps.forceTagStrips = forceTagStrips;

    const render = text ? gift.names[enhanceRank] : <GiftIcon gift={gift} enhanceRank={enhanceRank} scale={scale} {...iconProps} />

    return <GiftInteractive id={id} enhanceRank={enhanceRank} includeTooltip={includeTooltip} expandable={expandable} forceTriggersEffects={forceTriggersEffects}>
        {render}
    </GiftInteractive>
}

export default function Gift({ id, gift = null, ...props }) {
    if (gift) {
        return <GiftMain id={id ?? gift?.id} gift={gift} {...props} />
    } else {
        return <DataLoader file="gifts" type="Gift" id={id}>
            {gift => <GiftMain id={id} gift={gift} {...props} />}
        </DataLoader>
    }
}