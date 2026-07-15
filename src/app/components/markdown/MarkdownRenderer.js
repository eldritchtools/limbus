"use client";

import "./MarkdownRenderer.css";

import "katex/dist/katex.min.css";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { visit } from "unist-util-visit";

import { convertTokenAlias } from "./tokens";
import { useData, useDataProvider } from "../DataProvider";
import { tokenizeMarkdown } from "./MarkdownUtil";
import Gift from "../gifts/Gift";
import AdditionalIcon from "../icons/AdditionalIcon";
import CommunityAsset from "../icons/CommunityAsset";
import KeywordIcon, { isValidKeywordId } from "../icons/KeywordIcon";
import SinnerIcon from "../icons/SinnerIcon";
import LinkWithTooltip from "../LinkWithTooltip";
import NoPrefetchLink from "../NoPrefetchLink";
import HintText from "../objects/HintText";
import Status from "../objects/Status";
import ThemePackNameWithTooltip from "../objects/ThemePackNameWithTooltip";
import { getEgoTooltipProps } from "../tooltips/EgoTooltip";
import { getEncounterTooltipProps } from "../tooltips/EncounterTooltip";
import { getIdentityTooltipProps } from "../tooltips/IdentityTooltip";
import { getMarkdownTooltipProps } from "../tooltips/MarkdownTooltip";
import { getSkillTooltipProps } from "../tooltips/SkillTooltip";
import { getTeamCodeTooltipProps } from "../tooltips/TeamCodeTooltip";

import { searchBuilds } from "@/app/database/builds";
import { searchCollections } from "@/app/database/collections";
import { searchMdPlans } from "@/app/database/mdPlans";
import { sinnerIdMapping } from "@/app/lib/constants";
import { encounterCategoryLabels } from "@/app/lib/encounters";
import { getSkillName } from "@/app/lib/skill";


function tokenExtractionPlugin() {
    return tree => {
        visit(tree, "text", (node, index, parent) => {
            const parts = tokenizeMarkdown(node.value);

            if (!parts.some(x => x.type === "token"))
                return;

            parent.children.splice(
                index,
                1,
                ...parts.map(part =>
                    part.type === "text"
                        ? { type: "text", value: part.value }
                        : {
                            type: "tokenNode",
                            data: {
                                hName: "tokenNode",
                                hProperties: { tokenType: part.tokenType, tokenValues: part.tokenValues, },
                            },
                        }
                )
            );

            return index + parts.length;
        });
    };
}

function sanitizeUrl(url) {
    try {
        const parsed = new URL(url, "https://limbus.eldritchtools.com/");

        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
            return parsed.href;
        }
        return null;
    } catch {
        return null;
    }
}

function IdentityItem({ id, context, guardedLinks }) {
    const [identities, identitiesLoading] = useData("identities_mini", !context?.identity);
    if (identitiesLoading && !context?.identity) {
        return <span>{"{Loading...}"}</span>
    } else {
        const data = context ? context.identity[id] : identities[id];
        if (data)
            return <LinkWithTooltip
                href={`/identities/${id}`}
                tooltipProps={getIdentityTooltipProps(id)}
                className="text-link"
                style={{ textDecoration: "underline" }}
                guarded={guardedLinks}
            >
                [{sinnerIdMapping[data.sinnerId]}] {data.name}
            </LinkWithTooltip>;
        else
            return <span>{`{identity:${id}}`}</span>;
    }
}

function EgoItem({ id, context, guardedLinks }) {
    const [egos, egosLoading] = useData("egos_mini", !context?.ego);
    if (egosLoading && !context?.ego) {
        return <span>{"{Loading...}"}</span>
    } else {
        const data = context ? context.ego[id] : egos[id];
        if (data)
            return <LinkWithTooltip
                href={`/egos/${id}`}
                tooltipProps={getEgoTooltipProps(id)}
                className="text-link"
                style={{ textDecoration: "underline" }}
                guarded={guardedLinks}
            >
                [{sinnerIdMapping[data.sinnerId]}] {data.name}
            </LinkWithTooltip>;
        else
            return <span>{`{ego:${id}}`}</span>;
    }
}

function SkillItem({ val, context }) {
    const { getData } = useDataProvider();
    const [ownerId, skillId] = val.split("|");
    const fullId = `${ownerId}${skillId}`;
    const type = ownerId[0] === "1" ? "identity" : "ego";
    const [skillName, setSkillName] = useState(context?.skill?.[fullId]);

    useEffect(() => {
        if (skillName) return;
        const fetch = async () => {
            const data = await getData(type === "identity" ? `identities/${ownerId}` : `egos/${ownerId}`);
            setSkillName(getSkillName(type, data, fullId, 5));
        }

        fetch();
    }, [skillName, getData, ownerId, fullId, type]);

    if (skillName)
        return <span
            {...getSkillTooltipProps(ownerId, skillId)}
            style={{ display: "inline", fontWeight: "bold" }}>
            <span>{skillName}</span>
        </span>
    else {
        return <span>{`{skill:${ownerId}|${skillId}}`}</span>
    }
}

function StatusItem({ id, context }) {
    const [statuses, statusesLoading] = useData("statuses", !context?.status);
    if (statusesLoading && !context?.status) {
        return <span>{"{Loading...}"}</span>
    } else {
        const data = context ? context.status[id] : statuses[id];
        if (data)
            return <Status id={id} status={data} includeTooltip={true} />;
        else
            return <span>{`{status:${id}}`}</span>;
    }
}

function StatusIconItem({ id, context }) {
    const [statuses, statusesLoading] = useData("statuses", !context?.status);
    if (statusesLoading && !context?.status) {
        return <span>{"{Loading...}"}</span>
    } else {
        const data = context ? context.status[id] : statuses[id];
        if (data)
            return <Status id={id} status={data} includeName={false} includeTooltip={true} />;
        else
            return <span>{`{statusicon:${id}}`}</span>;
    }
}

function GiftNameItem({ val, context }) {
    const [gifts, giftsLoading] = useData("gifts", !context?.gift);
    const split = val.split("|");
    const id = split[0];
    const enhanceRank = split.length > 1 ? split[1] : 0;

    const checkValidity = (data) => {
        if (!data) return false;
        const rank = Number(enhanceRank);
        if (isNaN(rank) || !Number.isInteger(rank) || rank >= data.names.length || rank < 0) return false;
        return true;
    }

    if (giftsLoading && !context?.gift) {
        return <span>{"{Loading...}"}</span>
    } else {
        const data = context ? context.gift[id] : gifts[id];
        if (checkValidity(data))
            return <span style={{ display: "inline", textDecoration: "underline" }}>
                <Gift gift={data} enhanceRank={Number(enhanceRank)} text={true} />
            </span>
        else {
            return <span>{`{giftname:${val}}`}</span>
        }
    }
}

function GiftIconsItem({ vals, context }) {
    const [gifts, giftsLoading] = useData("gifts", !context?.gift);

    if (giftsLoading && !context?.gift) {
        return <span>{"{Loading...}"}</span>
    } else {
        return <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
            {vals.map((val, i) => {
                const split = val.split("|");
                const id = split[0];
                const enhanceRank = split.length > 1 ? Number(split[1]) : 0;
                const data = context ? context.gift[id] : gifts[id];

                if (data && !isNaN(enhanceRank) && Number.isInteger(enhanceRank) && enhanceRank >= 0 && enhanceRank < data.names.length) {
                    return <Gift key={i} gift={data} enhanceRank={enhanceRank} />
                } else {
                    return <Gift key={i} gift={null} />
                }
            })}
        </div>
    }
}

function ThemePackItem({ id, context }) {
    const [themePacks, themePacksLoading] = useData("md_theme_packs", !context?.themepack);
    if (themePacksLoading && !context?.themepack) {
        return <span>{"{Loading...}"}</span>
    } else {
        const data = context ? context.themepack[id] : themePacks[id];
        if (data)
            return <ThemePackNameWithTooltip id={id} themePack={data} />;
        else
            return <span>{`{themepack:${id}}`}</span>;
    }
}

function EncounterItem({ str, context, guardedLinks }) {
    const [cat, enc] = str.split("|");
    const [encounters, encountersLoading] = useData("encounters", !context?.encounter);
    if (encountersLoading && !context?.encounter) {
        return <span>{"{Loading...}"}</span>
    } else if (!(cat in encounters) || !(enc in encounters[cat])) {
        return <span>{`{encounter:${str}}`}</span>;
    } else {
        const data = context ? context.encounter[cat][enc] : encounters[cat][enc];
        return <LinkWithTooltip
            href={`/encounters?category=${cat}&encounter=${enc}`}
            tooltipProps={getEncounterTooltipProps(cat, enc)}
            className="text-link"
            style={{ textDecoration: "underline" }}
            guarded={guardedLinks}
        >
            {encounterCategoryLabels[cat]}: {data}
        </LinkWithTooltip>;
    }
}

function IconItem({ id, context }) {
    const [icons, iconsLoading] = useData("additional_icons", !context?.icon);
    if (iconsLoading && !context?.icon) {
        return <span>{"{Loading...}"}</span>
    } else {
        const data = context ? context.icon[id] : icons[id];
        if (data)
            return <AdditionalIcon id={id} style={{ height: "2rem", verticalAlign: "middle" }} />
        else
            return <span>{`{icon:${id}}`}</span>;
    }
}

function BuildItem({ id, guardedLinks }) {
    const [build, setBuild] = useState(null);
    const [loading, setLoading] = useState(true);
    const [invalid, setInvalid] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        searchBuilds({ buildIds: [id], ignoreBlockDiscovery: true, published: true }).then(x => {
            if (x.length > 0) setBuild(x[0]);
            else setInvalid(true);
            setLoading(false);
        })
    }, [id])

    return loading ?
        <span>{"{build loading...}"}</span> :
        invalid ?
            <span>{`{build:${id}}`}</span> :
            <span>
                <LinkWithTooltip
                    href={`/builds/${id}`}
                    tooltipProps={getMarkdownTooltipProps("build", build)}
                    className="text-link"
                    style={{ textDecoration: "underline" }}
                    guarded={guardedLinks}
                >
                    {build.title}
                </LinkWithTooltip>
            </span>
}

function CollectionItem({ id, guardedLinks }) {
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [invalid, setInvalid] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        searchCollections({ collectionIds: [id], ignoreBlockDiscovery: true, published: true }).then(x => {
            if (x.length > 0) setCollection(x[0]);
            else setInvalid(true);
            setLoading(false);
        })
    }, [id])

    return loading ?
        <span>{"{collection loading...}"}</span> :
        invalid ?
            <span>{`{collection:${id}}`}</span> :
            <span>
                <LinkWithTooltip
                    href={`/collections/${id}`}
                    tooltipProps={getMarkdownTooltipProps("collection", collection)}
                    className="text-link"
                    style={{ textDecoration: "underline" }}
                    guarded={guardedLinks}
                >
                    {collection.title}
                </LinkWithTooltip>
            </span>
}

function MdPlanItem({ id, guardedLinks }) {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [invalid, setInvalid] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        searchMdPlans({ planIds: [id], ignoreBlockDiscovery: true, published: true }).then(x => {
            if (x.length > 0) setPlan(x[0]);
            else setInvalid(true);
            setLoading(false);
        })
    }, [id])

    return loading ?
        <span>{"{md plan loading...}"}</span> :
        invalid ?
            <span>{`{mdplan:${id}}`}</span> :
            <span>
                <LinkWithTooltip
                    href={`/md-plans/${id}`}
                    tooltipProps={getMarkdownTooltipProps("md_plan", plan)}
                    className="text-link"
                    style={{ textDecoration: "underline" }}
                    guarded={guardedLinks}
                >
                    {plan.title}
                </LinkWithTooltip>
            </span>
}

function TeamCodeItem({ code }) {
    const [hintText, setHintText] = useState(null);

    const handleTeamCodeCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setHintText('Copied!');
            setTimeout(() => setHintText(null), 1500);
        } catch (err) {
            setHintText('Failed to copy!');
            setTimeout(() => setHintText(null), 1500);
            console.error('Failed to copy text: ', err);
        }
    }

    return <HintText hintText={hintText}>
        <span
            {...getTeamCodeTooltipProps(code)}
            className="text-link"
            onClick={handleTeamCodeCopy}
        >
            [Team Code]
        </span>
    </HintText>
}

export default function MarkdownRenderer({ content, context, guardedLinks }) {
    const renderedMarkdown = useMemo(() => {
        return <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks, remarkMath, tokenExtractionPlugin]}
            rehypePlugins={[rehypeKatex]}
            skipHtml={true}
            components={{
                tokenNode: ({ node }) => {
                    const { tokenType, tokenValues } = node.properties;

                    switch (convertTokenAlias(tokenType)) {
                        case "identity":
                            return <IdentityItem id={tokenValues[0]} context={context} guardedLinks={guardedLinks} />;
                        case "ego":
                            return <EgoItem id={tokenValues[0]} context={context} guardedLinks={guardedLinks} />;
                        case "skill":
                            return <SkillItem val={tokenValues[0]} context={context} />;
                        case "status":
                            return <StatusItem id={tokenValues[0]} context={context} />;
                        case "statusicon":
                            return <StatusIconItem id={tokenValues[0]} context={context} />;
                        case "keyword":
                            if (isValidKeywordId(tokenValues[0]))
                                return <KeywordIcon id={tokenValues[0]} style={{ display: "inline-block", width: "2rem", height: "2rem", verticalAlign: "middle" }} />;
                            else
                                return <span>{`{${tokenType}:${tokenValues[0]}}`}</span>;
                        case "giftname":
                            return <GiftNameItem val={tokenValues[0]} context={context} />
                        case "gifticons":
                            return <GiftIconsItem vals={tokenValues} context={context} />
                        case "themepack":
                            return <ThemePackItem id={tokenValues[0]} context={context} />
                        case "encounter":
                            return <EncounterItem str={tokenValues[0]} context={context} guardedLinks={guardedLinks} />
                        case "icon":
                            return <IconItem id={tokenValues[0]} context={context} />
                        case "build":
                            return <BuildItem id={tokenValues[0]} guardedLinks={guardedLinks} />;
                        case "collection":
                            return <CollectionItem id={tokenValues[0]} guardedLinks={guardedLinks} />;
                        case "mdplan":
                            return <MdPlanItem id={tokenValues[0]} guardedLinks={guardedLinks} />;
                        case "teamcode":
                            return <TeamCodeItem code={tokenValues[0]} />;
                        case "user":
                            return <NoPrefetchLink href={`/profiles/${tokenValues[0]}`} className="text-link" style={{ textDecoration: "underline" }} guarded={guardedLinks}>
                                {tokenValues[0]}
                            </NoPrefetchLink>;
                        case "sinner":
                            try {
                                return <span>{sinnerIdMapping[parseInt(tokenValues[0])]}</span>;
                            } catch (err) {
                                return <span>{`{${tokenType}:${tokenValues[0]}}`}</span>;
                            }
                        case "sinnericon":
                            try {
                                return <SinnerIcon num={tokenValues[0]} style={{ width: "2rem", display: "inline", verticalAlign: "middle" }} />;
                            } catch (err) {
                                return <span>{`{${tokenType}:${tokenValues[0]}}`}</span>;
                            }
                        case "emote":
                            return <CommunityAsset
                                id={tokenValues[0]} type={"sm"}
                                style={{ display: "inline", height: "2rem", verticalAlign: "middle" }}
                            />;
                        case "sticker":
                            return <CommunityAsset id={tokenValues[0]} type={"lg"} style={{ display: "block" }} />;
                        default:
                            return <span>{`{${tokenType}:${tokenValues.join(":")}}`}</span>;
                    }
                },
                p: ({ node, ...props }) => (
                    <p className="markdown-p" {...props} />
                ),
                a: ({ node, ...props }) => {
                    const safe = sanitizeUrl(props.href);
                    if (!safe) return <span>[invalid link]</span>;
                    return (
                        <NoPrefetchLink className="text-link" style={{ textDecoration: "underline" }} href={safe} target="_blank" rel="nofollow ugc">
                            {props.children}
                        </NoPrefetchLink>
                    );
                },
                // ul: ({ node, ...props}) => (
                //     <ul style={{marginBlock: 0}}>{props.children}</ul>
                // ),
                blockquote: ({ node, ...props }) => (
                    <blockquote
                        style={{
                            borderLeft: "4px solid var(--primary-border-color)",
                            paddingLeft: "1rem",
                            margin: "1rem 0",
                            color: "var(--secondary-text-color)",
                            fontStyle: "italic",
                        }}
                        {...props}
                    />
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    }, [content, context, guardedLinks]);

    return <div style={{ lineHeight: "1.4", textAlign: "justify", wordWrap: "break-word", overflowWrap: "break-word", wordBreak: "break-word" }}>
        {renderedMarkdown}
    </div>

}