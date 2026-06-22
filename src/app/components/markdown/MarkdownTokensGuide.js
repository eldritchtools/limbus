"use client";

import { useEffect, useState } from "react";

import MarkdownRenderer from "./MarkdownRenderer";
import { tokensDescs } from "./tokens";
import { useSkillData } from "../dataHooks/skills";
import DropdownButton from "../objects/DropdownButton";
import { AdditionalIconDropdownSelector } from "../selectors/AdditionalIconSelectors";
import DropdownSelectorWithExclusion from "../selectors/DropdownSelectorWithExclusion";
import { EgoDropdownSelector } from "../selectors/EgoSelectors";
import { EncounterDropdownSelector } from "../selectors/EncounterSelectors";
import { GiftDropdownSelector } from "../selectors/GiftSelectors";
import { IdentityDropdownSelector } from "../selectors/IdentitySelectors";
import { KeywordDropdownSelector } from "../selectors/KeywordSelectors";
import { SinnerDropdownSelector } from "../selectors/SinnerSelectors";
import { StatusDropdownSelector } from "../selectors/StatusSelectors";
import { ThemePackDropdownSelector } from "../selectors/ThemePackSelectors";
import { getSkillTooltipProps } from "../tooltips/SkillTooltip";

import { checkFilterMatch } from "@/app/lib/filter";
import { selectStyle } from "@/app/styles/selectStyle";

const options = {
    "none": "Select a type",
    "identity": "identity",
    "ego": "ego",
    "skill": "skill",
    "status": "status",
    "statusicon": "statusicon",
    "keyword": "keyword",
    "giftname": "giftname",
    "gifticons": "gifticons",
    "themepack": "themepack",
    "encounter": "encounter",
    "icon": "icon",
    "build": "build",
    "mdplan": "mdplan",
    "collection": "collection",
    "teamcode": "teamcode",
    "user": "user",
    "sinner": "sinner",
    "sinnericon": "sinnericon",
    "emote": "emote",
    "sticker": "sticker"
}

function GuideBase({ type, editorRef, onChange, guideValue, children }) {
    const [notif, setNotif] = useState("");

    const handleTokenCopy = async () => {
        try {
            await navigator.clipboard.writeText(`{${type}:${guideValue}}`);
            setNotif('Copied to clipboard!');
            setTimeout(() => setNotif(''), 2000);
        } catch (err) {
            setNotif('Failed to copy!');
            setTimeout(() => setNotif(''), 2000);
            console.error('Failed to copy text: ', err);
        }
    };

    const handleTokenInsert = async () => {
        if (editorRef.current) {
            editorRef.current.appendToEditor(`{${type}:${guideValue}}`);
        } else {
            onChange(p => p + `{${type}:${guideValue}}`);
        }
        setNotif('Inserted at the end of your text!');
        setTimeout(() => setNotif(''), 2000);
    };

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div>{tokensDescs[type]}</div>
        {children}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            Result:
            {guideValue ?
                <div style={{ border: "1px var(--secondary-border-color) solid", padding: "0.5rem" }}>
                    <MarkdownRenderer content={`{${type}:${guideValue}}`} />
                </div> : null
            }
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            Token:
            {guideValue ? <code>{`{${type}:${guideValue}}`}</code> : null}
            <div>
                <button onClick={handleTokenCopy} disabled={!guideValue}>Copy to clipboard</button>
                <button onClick={handleTokenInsert} disabled={!guideValue}>Insert to text</button>
            </div>
            <span>{notif}</span>
        </div>
    </div>
}

function SelectorGuide({ type, editorRef, onChange, guideValue, setGuideValue }) {
    const Selector = {
        "identity": IdentityDropdownSelector,
        "ego": EgoDropdownSelector,
        "status": StatusDropdownSelector,
        "statusicon": StatusDropdownSelector,
        "keyword": KeywordDropdownSelector,
        "giftname": GiftDropdownSelector,
        "gifticons": GiftDropdownSelector,
        "themepack": ThemePackDropdownSelector,
        "encounter": EncounterDropdownSelector,
        "icon": AdditionalIconDropdownSelector,
        "sinner": SinnerDropdownSelector,
        "sinnericon": SinnerDropdownSelector
    }[type];

    return <GuideBase type={type} editorRef={editorRef} onChange={onChange} guideValue={guideValue} setGuideValue={setGuideValue}>
        <Selector selected={guideValue} setSelected={setGuideValue} />
    </GuideBase>
}

function InputGuide({ type, editorRef, onChange, guideValue, setGuideValue }) {
    const [value, setValue] = useState("");

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValue("");
    }, [type]);

    if (type === "build") {
        const handleTestBuild = () => {
            const buildId = value.split("/").at(-1);
            setGuideValue(buildId);
        }

        return <GuideBase type={type} editorRef={editorRef} onChange={onChange} guideValue={guideValue} setGuideValue={setGuideValue}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input value={value} onChange={e => setValue(e.target.value)} style={{ width: "20rem" }} />
                <button onClick={handleTestBuild}>Test Build</button>
            </div>
        </GuideBase>
    }
    if (type === "mdplan") {
        const handleTestMdPlan = () => {
            const planId = value.split("/").at(-1);
            setGuideValue(planId);
        }

        return <GuideBase type={type} editorRef={editorRef} onChange={onChange} guideValue={guideValue} setGuideValue={setGuideValue}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input value={value} onChange={e => setValue(e.target.value)} style={{ width: "20rem" }} />
                <button onClick={handleTestMdPlan}>Test MD Plan</button>
            </div>
        </GuideBase>
    }
    if (type === "collection") {
        const handleTestCollection = () => {
            const collectionId = value.split("/").at(-1);
            setGuideValue(collectionId);
        }

        return <GuideBase type={type} editorRef={editorRef} onChange={onChange} guideValue={guideValue} setGuideValue={setGuideValue}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input value={value} onChange={e => setValue(e.target.value)} style={{ width: "20rem" }} />
                <button onClick={handleTestCollection}>Test Collection</button>
            </div>
        </GuideBase>
    }
    if (type === "user") {
        const handleTestUser = () => {
            setGuideValue(value);
        }

        return <GuideBase type={type} editorRef={editorRef} onChange={onChange} guideValue={guideValue} setGuideValue={setGuideValue}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input value={value} onChange={e => setValue(e.target.value)} style={{ width: "20rem" }} />
                <button onClick={handleTestUser}>Test User</button>
            </div>
        </GuideBase>
    }
    if (type === "emote") {
        const handleTestEmote = () => {
            setGuideValue(value);
        }

        return <GuideBase type={type} editorRef={editorRef} onChange={onChange} guideValue={guideValue} setGuideValue={setGuideValue}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input value={value} onChange={e => setValue(e.target.value)} style={{ width: "20rem" }} />
                <button onClick={handleTestEmote}>Test Emote</button>
            </div>
        </GuideBase>
    }
    if (type === "sticker") {
        const handleTestSticker = () => {
            setGuideValue(value);
        }

        return <GuideBase type={type} editorRef={editorRef} onChange={onChange} guideValue={guideValue} setGuideValue={setGuideValue}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input value={value} onChange={e => setValue(e.target.value)} style={{ width: "20rem" }} />
                <button onClick={handleTestSticker}>Test Sticker</button>
            </div>
        </GuideBase>
    }

    return null;
}

function SkillGuide({ editorRef, onChange, guideValue, setGuideValue }) {
    const [type, setType] = useState("identity");
    const [item, setItem] = useState(null);
    const skillData = useSkillData(type, item, 5);

    const optionsMapped = useMemo(() => skillData ?
        (
            (type === "identity" ?
                Object.entries(skillData.skills) :
                [...skillData.awakeningSkills, ...(skillData.corrosionSkills ?? [])].map(x => [x.data.id, x])
            ).reduce((acc, [id, skill]) => {
                acc[id] = {
                    value: `${id.slice(0, -2)}|${id.slice(-2)}`,
                    label: <div style={{ fontWeight: "bold" }} {...getSkillTooltipProps(id.slice(0, -2), id.slice(-2))}>
                        {skill.data.name}
                    </div>,
                    searchStrings: [skill.data.name]
                };
                return acc;
            }, {})
        ) :
        {},
        [type, skillData]
    );

    return <GuideBase type={"skill"} editorRef={editorRef} onChange={onChange} guideValue={guideValue} setGuideValue={setGuideValue}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: 'center' }}>
            <select value={type} onChange={e => { setType(e.target.value); setItem(null); }}>
                <option value="identity">Identity</option>
                <option value="ego">E.G.O</option>
            </select>

            {type === "identity" ?
                <IdentityDropdownSelector selected={item} setSelected={setItem} /> :
                <EgoDropdownSelector selected={item} setSelected={setItem} />
            }

            {item &&
                <DropdownSelectorWithExclusion
                    optionsMapped={optionsMapped}
                    selected={guideValue}
                    setSelected={setGuideValue}
                    placeholder={"Search Skills..."}
                    filterFunction={(candidate, input) => checkFilterMatch(input, candidate.data.searchStrings)}
                    isMulti={false}
                    styles={selectStyle}
                />
            }
        </div>
    </GuideBase>
}

function GuideAssembler({ guideTab, editorRef, onChange, guideValue, setGuideValue }) {
    if (["identity", "ego", "status", "statusicon", "keyword", "giftname", "gifticons", "themepack", "encounter", "icon", "sinner", "sinnericon"].includes(guideTab))
        return <SelectorGuide type={guideTab} editorRef={editorRef} onChange={onChange} guideValue={guideValue} setGuideValue={setGuideValue} />

    if (["build", "mdplan", "collection", "teamcode", "user", "emote", "sticker"].includes(guideTab))
        return <InputGuide type={guideTab} editorRef={editorRef} onChange={onChange} guideValue={guideValue} setGuideValue={setGuideValue} />

    if (guideTab === "skill")
        return <SkillGuide editorRef={editorRef} onChange={onChange} guideValue={guideValue} setGuideValue={setGuideValue} />

    return null;
}

export default function MarkdownTokensGuide({ editorRef, onChange, guideTab, setGuideTab, guideValue, setGuideValue }) {
    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div>You can reference things like statuses or keywords with tokens like {"{keyword:Burn}"} to show icons or tooltips when hovering over them.</div>
        <div>Choose a type below to search for tokens you might like to use.</div>
        <div>An autocomplete system is available for the following token types: identity, ego, status, statusicon, giftname, gifticons, keyword, sinner. To trigger it, just start typing {"\"{type:\""}.</div>
        <div>Token type: <DropdownButton value={guideTab} setValue={x => { setGuideTab(x); setGuideValue(null); }} options={options} /></div>
        <GuideAssembler guideTab={guideTab} editorRef={editorRef} onChange={onChange} guideValue={guideValue} setGuideValue={setGuideValue} />
    </div>;
}
