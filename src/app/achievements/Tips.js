import { useFloorsPerPack } from "../components/dataHooks/mdFloors";
import { useData } from "../components/DataProvider";
import Gift from "../components/gifts/Gift";
import EgoIcon from "../components/icons/EgoIcon";
import IdentityIcon from "../components/icons/IdentityIcon";
import KeywordIcon from "../components/icons/KeywordIcon";
import SinnerIcon from "../components/icons/SinnerIcon";
import ThemePackIcon from "../components/icons/ThemePackIcon";
import ThemePackNameWithTooltip from "../components/objects/ThemePackNameWithTooltip";
import useLocalState from "../lib/useLocalState";

function TextTip({ tip }) {
    return <span style={{ whiteSpace: "pre-line" }}>{tip.text}</span>;
}

function TableTip({ tip, isSmall }) {
    const [giftsData, giftsLoading] = useData("gifts");
    const wrapping = tip.nowrap ? "pre" : "pre-line";

    const getCellComponent = (cell) => {
        if (typeof cell === "string") return <div style={{ whiteSpace: wrapping, padding: "0.1rem", textAlign: "center" }}>{cell}</div>;
        if (typeof cell === "object" && cell !== null && !Array.isArray(cell)) {
            if ("gifts" in cell && !giftsLoading) {
                const gifts = Object.values(giftsData).filter(gift => cell.gifts.includes(gift.names[0]))
                return <div style={{ display: "flex", flexDirection: "row", padding: "0.1rem", justifyContent: "center" }}>
                    {gifts.map((gift, i) => <Gift key={i} gift={gift} scale={isSmall ? .5 : 1} />)}
                </div>
            }
        }
        return null;
    }

    return <div style={{ display: "flex", alignSelf: "center", overflowX: "auto", maxWidth: "100%" }}>
        <table style={{ width: "fit-content", borderCollapse: "collapse" }}>
            <thead>
                <tr>
                    {tip.headers.map((header, i) => <th key={i} style={{ border: "1px #666 dotted" }}>{header}</th>)}
                </tr>
            </thead>
            <tbody>
                {tip.cells.map((row, i) => <tr key={i}>
                    {row.map((cell, i) => <td key={i} style={{ border: "1px #666 dotted" }}>
                        {getCellComponent(cell)}
                    </td>)}
                </tr>)}
            </tbody>
        </table>
    </div>;
}

function ShowGiftsTip({ tip, isSmall }) {
    const [mode, setMode] = useLocalState("achievementTipDifficultyMode", "normal");
    const [giftsData, giftsLoading] = useData("gifts");
    const floorsPerPack = useFloorsPerPack()

    const { general, exclusive } = useMemo(() =>
        Object.entries(giftsLoading ? {} : giftsData).reduce((acc, [_id, gift]) => {
            if (gift.vestige) return acc;
            if ("keyword" in tip && gift.keyword !== tip.keyword) return acc;
            if ("tier" in tip) {
                if (Array.isArray(tip.tier)) {
                    if (!tip.tier.includes(gift.tier)) return acc;
                } else {
                    if (tip.tier !== gift.tier) return acc;
                }
            }
            if ("fusion" in tip) {
                if (tip.fusion !== "any" && gift.fusion !== tip.fusion) return acc;
            } else {
                if (gift.fusion) return acc;
            }
            if ("themePack" in tip && tip.themePack && !("exclusiveTo" in gift)) return acc;
            if ("enhanceable" in tip && tip.enhanceable !== gift.enhanceable) return acc;
            if (gift.hidden) return acc;

            if ("exclusiveTo" in gift) {
                gift.exclusiveTo.forEach(source => {
                    if (source in floorsPerPack[mode]) floorsPerPack[mode][source].forEach(floor => {
                        if (!(floor in acc.exclusive)) acc.exclusive[floor] = {};
                        if (!(source in acc.exclusive[floor])) acc.exclusive[floor][source] = [];
                        acc.exclusive[floor][source].push(gift);
                    })
                });
            } else {
                if (gift.hardonly) {
                    if (mode === "hard") acc.general.push(gift);
                } else {
                    acc.general.push(gift)
                }
            }

            return acc;
        }, { general: [], exclusive: {} }),
        [giftsData, giftsLoading, floorsPerPack, tip, mode]
    );

    const giftsStyle = { display: "flex", flexDirection: "row", height: "fit-content", flexWrap: "wrap", padding: "0.5rem" };
    const centerStyle = { display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", border: "1px #666 dotted", padding: "0.5rem" };
    const constructGift = gift => <Gift key={gift.id} gift={gift} scale={isSmall ? 0.5 : 1} />

    const gridComponents = [];

    // General
    if (general.length > 0) {
        gridComponents.push(<div key={gridComponents.length} style={centerStyle}>{isSmall ? "Any" : "General"}</div>);
        gridComponents.push(<div key={gridComponents.length} style={{ border: "1px #666 dotted" }}>
            <div style={giftsStyle}>{general.map(constructGift)}</div>
        </div>);
    }

    function constructPackGiftsComponent(packGiftMapping) {
        return <div key={gridComponents.length}
            style={{
                display: "flex", flexDirection: "row", flexWrap: "wrap", alignItems: "center", alignContent: "flex-start",
                padding: "0.25rem", border: "1px #666 dotted", gap: "0.5rem"
            }}>
            {Object.entries(packGiftMapping).map(([pack, gifts], i) =>
                <div key={i} style={{ 
                    display: "flex", flexDirection: "column", textAlign: "center", border: "1px #777 dotted", borderRadius: "1rem", padding: "0.2rem" }}>
                    <div><ThemePackNameWithTooltip id={pack} /></div>
                    <div style={{ ...giftsStyle, justifyContent: "center" }}>{gifts.map(constructGift)}</div>
                </div>
            )}
        </div>
    }

    function insertFloorRow(floor, gifts) {
        gridComponents.push(<div key={gridComponents.length} style={centerStyle}>{isSmall ? `F${floor}` : `Floor ${floor}`}</div>);
        gridComponents.push(constructPackGiftsComponent(gifts));
    }

    // Floors 1-5
    ["1", "2", "3", "4", "5"].forEach(floor => {
        if (!(floor in exclusive)) return;
        insertFloorRow(floor, exclusive[floor]);
    })

    // Floor 6-10
    if ("6-10" in exclusive) {
        insertFloorRow("6-10", exclusive["6-10"]);
    }

    return <div style={{ display: "flex", flexDirection: "column" }}>
        {tip.keyword ? 
            <span style={{display: "flex", alignItems: "center", fontSize: "1.1rem"}}><KeywordIcon id={tip.keyword} /> {tip.keyword} Gifts</span> : 
            null
        }
        <div style={{display: "flex", gap: "1rem", paddingLeft: "0.5rem", margin: "0.5rem 0"}}>
            <span className="tab-header" style={{color: mode === "normal" ? "#4ade80" : "#166534"}} onClick={() => setMode("normal")}>Normal</span>
            <span className="tab-header" style={{color: mode === "hard" ? "#f87171" : "#7f1d1d"}} onClick={() => setMode("hard")}>Hard</span>
        </div>
        <div style={{ display: "grid", width: "100%", gridTemplateColumns: "auto 1fr", border: "1px #666 dotted" }}>
            {gridComponents}
        </div>
    </div>
}

function ShowGiftListTip({ tip, isSmall }) {
    const [giftsData, giftsLoading] = useData("gifts");

    const gifts = Object.values(giftsLoading ? {} : giftsData).filter(gift => tip.gifts.includes(gift.names[0]));

    return <div style={{ display: "flex", flexDirection: "row", width: "100%", height: "fit-content", justifyContent: "center", flexWrap: "wrap" }}>
        {gifts.map((gift, i) => <Gift key={i} gift={gift} scale={isSmall ? 0.5 : 1} />)}
    </div>
}

function ShowThemePacksTip({ tip, isSmall }) {
    const [themePacksData, themePacksLoading] = useData("md_theme_packs");

    const themePacks = [];
    if (!themePacksLoading) {
        if (tip.tag) themePacks.push(...Object.values(themePacksData).filter((themePack) => themePack.tags.includes(tip.tag)));
        if (tip.themePacks) themePacks.push(...tip.themePacks.map(id => themePacksData[id]));
    }

    return <div style={{ overflowX: "auto", alignSelf: "center", maxWidth: "100%" }}>
        <div style={{ width: "100%", display: "flex", gap: "0.2rem" }}>
            {themePacks.map((pack, i) => <ThemePackIcon key={i} themePack={pack} displayName={true} scale={isSmall ? 0.25 : .5} />)}
        </div>
    </div>
}

function ShowThemePacksByFloorTip({ tip }) {
    const [themePacksData, themePacksLoading] = useData("md_theme_packs");
    const { hard } = useFloorsPerPack();

    const themePacks = Object.entries(themePacksLoading ? {} : themePacksData).filter(([id, themePack]) => {
        if (tip.tag) return themePack.tags.includes(tip.tag);
        if (tip.themePacks) return tip.themePacks.includes(id);
        return true;
    });
    const packsByFloor = themePacks.reduce((acc, [id, pack]) => {
        if (id in hard) {
            hard[id].forEach(floor => {
                if (floor in acc) acc[floor].push(id);
                else acc[floor] = [id];
            })
        } else {
            if ("any" in acc) acc["any"].push(id);
            else acc["any"] = [id];
        }
        return acc;
    }, {});

    const centerStyle = { display: "flex", alignItems: "center", justifyContent: "center", border: "1px #666 dotted" };

    const components = [];
    ["any", "1", "2", "3", "4", "5", "6-10"].forEach(floor => {
        if (!(floor in packsByFloor)) return;
        if (floor === "any") components.push(<div key={components.length} style={centerStyle}>Any floor</div>);
        else components.push(<div key={components.length} style={centerStyle}>Floor {floor}</div>);

        components.push(<div key={components.length} style={{ ...centerStyle, display: "flex", flexDirection: "column", padding: "0.2rem" }}>
            {packsByFloor[floor].map(id => {
                if ("highlight" in tip && floor in tip.highlight && tip.highlight[floor].includes(id))
                    return <ThemePackNameWithTooltip key={id} id={id} style={{ fontWeight: "bold", color: "#4ade80" }} />
                else
                    return <ThemePackNameWithTooltip key={id} id={id} />
            })}
        </div>)
    })

    return <div style={{ ...centerStyle, border: "transparent" }}>
        <div style={{ display: "grid", textAlign: "center", width: "fit-content", gridTemplateColumns: "1fr 1fr" }} >
            {components}
        </div>
    </div>
}

function filterIdentities(tip, identitiesData) {
    return Object.values(identitiesData).filter(identity => {
        let filter = true;
        if ("keyword" in tip) {
            if (Array.isArray(tip.keyword)) filter &= tip.keyword.some(keyword => identity.skillKeywordList?.includes(keyword));
            else filter &= identity.skillKeywordList?.includes(tip.keyword);
        }
        if (!filter) return false;

        if ("faction" in tip) {
            if (Array.isArray(tip.faction)) filter &= tip.faction.some(faction => identity.tags.includes(faction));
            else filter &= identity.tags.includes(tip.faction);
        }
        if (!filter) return false

        if ("ids" in tip) {
            filter &= tip.ids.includes(identity.id);
        }
        return filter;
    })
}

function ShowIdentities({ tip, isSmall }) {
    const [identitiesData, identitiesLoading] = useData("identities");
    const identities = identitiesLoading ? [] : filterIdentities(tip, identitiesData);

    return <div style={{ overflowX: "auto", overflowY: "hidden", alignSelf: "center", maxWidth: "100%" }}>
        <div style={{ width: "100%", display: "flex" }}>
            {identities.map((identity, i) => <div key={i} style={{ border: "1px #666 dotted" }}>
                <IdentityIcon identity={identity} uptie={4} displayName={true} displayRarity={true} scale={isSmall ? 0.33 : .5} />
            </div>)}
        </div>
    </div>
}

function ShowIdentitiesBySinner({ tip, isSmall }) {
    const [identitiesData, identitiesLoading] = useData("identities");
    const identities = identitiesLoading ? [] : filterIdentities(tip, identitiesData);

    const start = {};
    if (tip.showAllSinners) {
        for (let i = 1; i <= 12; i++) start[i] = [];
    }

    const idsBySinner = identities.reduce((acc, identity) => {
        if (identity.sinnerId in acc) acc[identity.sinnerId].push(identity);
        else acc[identity.sinnerId] = [identity];
        return acc;
    }, start);

    const components = Object.entries(idsBySinner).sort((a, b) => a[0] - b[0]).map(([sinnerId, list]) =>
        <div key={sinnerId} style={{ display: "flex", alignItems: "center", width: isSmall ? "100%" : "480px", border: "1px #777 dotted" }}>
            <SinnerIcon num={sinnerId} style={{ width: "64px", height: "64px" }} />
            <div style={{ display: "flex", overflowX: "auto", overflowY: "hidden" }}>
                {list.reverse().map(identity => <div key={identity.id}>
                    <IdentityIcon identity={identity} uptie={4} displayName={true} displayRarity={true} scale={isSmall ? 0.33 : .5} />
                </div>)}
            </div>
        </div>
    );

    return <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, ${isSmall ? "100%" : "480px"})`, justifyContent: "center", width: "100%" }}>
        {components}
    </div>
}

function RefreshCostSummary({ isSmall }) {
    const arr = Array.from({ length: 10 }, (_, i) => i + 1);
    const style = { textAlign: "center", padding: "0.5rem", border: "1px #666 dotted" }
    let sum = 0;
    return <div style={{ display: "flex", alignSelf: "center", overflowX: "auto", maxWidth: "100%" }}>
        <table style={{ width: "fit-content", borderCollapse: "collapse" }}>
            <thead>
                <tr>
                    <th style={style}>Refreshes</th>
                    {arr.map((number, i) => <th key={i} style={style}>{number}</th>)}
                    <th style={style}>n</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th style={style}>Cost per refresh</th>
                    {arr.map((number, i) => <td key={i} style={style}>{15 * number}</td>)}
                    <td style={style}>15n</td>
                </tr>
                <tr>
                    <th style={style}>Total Cost</th>
                    {arr.map((number, i) => <td key={i} style={style}>{15 * ((number * (number + 1)) / 2)}</td>)}
                    <td style={style}>15(n(n+1)/2)</td>
                </tr>
                <tr>
                    <th style={style}><div style={{ display: "flex", justifyContent: "center" }}><Gift id={9188} scale={isSmall ? .6 : 1} /></div></th>
                    {arr.map((number, i) => {
                        sum += Math.floor(10.5 * number);
                        return <td key={i} style={style}>{Math.floor(10.5 * number)}<br /><br />{sum}</td>
                    })}
                    <td style={style}>floor(10.5n)<br /><br />sum(floor(10.5x) for x = 1, 2, ..., n)</td>
                </tr>
            </tbody>
        </table>
    </div>
}

function EnhanceCostSummary({ isSmall }) {
    const giftTierStyle = { fontFamily: "'Archivo Narrow', sans-serif", fontWeight: "bold", fontSize: "24px", color: "#ffd84d" }
    const style = { textAlign: "center", padding: "0.5rem", border: "1px #666 dotted" }
    return <div style={{ display: "flex", justifyContent: "center" }}>
        <table style={{ width: "fit-content", borderCollapse: "collapse" }}>
            <thead>
                <tr>
                    <th style={style}>Tier</th>
                    <th style={style}><span style={giftTierStyle}>I</span></th>
                    <th style={style}><span style={giftTierStyle}>II</span></th>
                    <th style={style}><span style={giftTierStyle}>III</span></th>
                    <th style={style}><span style={giftTierStyle}>IV</span></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th style={style}><span style={giftTierStyle}>+</span></th>
                    <td style={style}>50</td>
                    <td style={style}>60</td>
                    <td style={style}>75</td>
                    <td style={style}>100</td>
                </tr>
                <tr>
                    <th style={style}>
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                            <Gift id={9189} scale={isSmall ? .6 : 1} />
                            <span style={giftTierStyle}>+</span>
                        </div>
                    </th>
                    <td style={style}>35</td>
                    <td style={style}>42</td>
                    <td style={style}>53</td>
                    <td style={style}>70</td>
                </tr>
                <tr>
                    <th style={style}><span style={giftTierStyle}>++</span></th>
                    <td style={style}>100</td>
                    <td style={style}>120</td>
                    <td style={style}>150</td>
                    <td style={style}>200</td>
                </tr>
                <tr>
                    <th style={style}>
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                            <Gift id={9189} scale={isSmall ? .6 : 1} />
                            <span style={giftTierStyle}>++</span>
                        </div>
                    </th>
                    <td style={style}>70</td>
                    <td style={style}>84</td>
                    <td style={style}>105</td>
                    <td style={style}>140</td>
                </tr>
            </tbody>
        </table>
    </div>
}

function ShowEGOsTip({ tip, isSmall }) {
    return <div style={{ overflowX: "auto", overflowY: "hidden", alignSelf: "center", maxWidth: "100%" }}>
        <div style={{ width: "100%", display: "flex" }}>
            {tip.EGOs.map(EGOId => <div key={EGOId} style={{ border: "1px #666 dotted" }}>
                <EgoIcon id={EGOId} scale={isSmall ? .33 : 0.5} displayName={true} type={"awaken"} />
            </div>)}
        </div>
    </div>
}

function AchievementTips({ achievement, isSmall }) {
    if (!("tips" in achievement)) return <div>Coming soon...</div>;

    const components = [];
    achievement.tips.forEach(tip => {
        switch (tip.type) {
            case "text": components.push(<TextTip key={components.length} tip={tip} />); break;
            case "table": components.push(<TableTip key={components.length} tip={tip} isSmall={isSmall} />); break;
            case "showGifts": components.push(<ShowGiftsTip key={components.length} tip={tip} isSmall={isSmall} />); break;
            case "showGiftList": components.push(<ShowGiftListTip key={components.length} tip={tip} isSmall={isSmall} />); break;
            case "showThemePacks": components.push(<ShowThemePacksTip key={components.length} tip={tip} isSmall={isSmall} />); break;
            case "showThemePacksByFloor": components.push(<ShowThemePacksByFloorTip key={components.length} tip={tip} />); break;
            case "showIds": components.push(<ShowIdentities key={components.length} tip={tip} isSmall={isSmall} />); break;
            case "showIdsbySinner": components.push(<ShowIdentitiesBySinner key={components.length} tip={tip} isSmall={isSmall} />); break;
            case "refreshCostSummary": components.push(<RefreshCostSummary key={components.length} isSmall={isSmall} />); break;
            case "enhanceCostSummary": components.push(<EnhanceCostSummary key={components.length} isSmall={isSmall} />); break;
            case "showEGOs": components.push(<ShowEGOsTip key={components.length} tip={tip} isSmall={isSmall} />); break;
            default: break;
        }
    });

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {components}
    </div>
}

export default AchievementTips;