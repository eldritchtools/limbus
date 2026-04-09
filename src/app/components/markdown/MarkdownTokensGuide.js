"use client";

import { useEffect, useState } from "react";

import MarkdownRenderer from "./MarkdownRenderer";
import DropdownButton from "../objects/DropdownButton";
import { EgoDropdownSelector } from "../selectors/EgoSelectors";
import { GiftDropdownSelector } from "../selectors/GiftSelectors";
import { IdentityDropdownSelector } from "../selectors/IdentitySelectors";
import { KeywordDropdownSelector } from "../selectors/KeywordSelectors";
import { SinnerDropdownSelector } from "../selectors/SinnerSelectors";
import { StatusDropdownSelector } from "../selectors/StatusSelectors";

const options = {
    "none": "Select a type",
    "identity": "identity",
    "ego": "ego",
    "status": "status",
    "statusicon": "statusicon",
    "keyword": "keyword",
    "giftname": "giftname",
    "gifticons": "gifticons",
    "build": "build",
    "mdplan": "mdplan",
    "collection": "collection",
    "user": "user",
    "sinner": "sinner"
}

const desc = {
    "identity": "Reference an identity with {identity:id} or {id:id}. This will show a link to its page and a tooltip with its keywords and skill types on hover.",
    "ego": "Reference an E.G.O with {ego:id}. This will show a link to its page and a tooltip with its attack types, statuses, and cost on hover.",
    "status": "Reference a status with {status:id} or {st:id}. This will show a tooltip with its description on hover.",
    "statusicon": "Reference a status with {statusicon:id} or {sti:id}. This will show a tooltip with its description on hover. This will only show the icon of the status.",
    "keyword": "Reference a keyword with {keyword:id} or {kw:id}. This will show an icon corresponding to that keyword.",
    "giftname": "Reference an E.G.O Gift with {giftname:id} or {gn:id}. This will show the name of the gift and a tooltip with its description on hover. Clicking on the gift name will show a modal with more details on the gift. Gifts can be assigned enhancement levels by attaching it to the end of the id after a pipe e.g. {giftname:9001|2}. The token will fail to parse if the gift does not have that enhancement level.",
    "gifticons": "Reference E.G.O Gifts with {gifticons:id} or {gi:id}. This will show an icon of the gift centered in its own row and a tooltip with its description on hover. Clicking on the gift icon will show a modal with more details on the gift. This token supports multiple gifts by inputting {gifticons:id1:id2:...} (Insert to text will not automatically handle this). Gifts can be assigned enhancement levels by attaching it to the end of the id after a pipe e.g. {giftname:9001|2}. The token will fail to parse if the gift does not have that enhancement level.",
    "build": "Reference a build with {build:id}. This will show the name of the build and a tooltip with its search overview on hover. You can find the id of a build on its url or using the share feature on its page. Copying the full url below will automatically isolate the id.",
    "mdplan": "Reference an md plan with {mdplan:id}. This will show the name of the md plan and a tooltip with its search overview on hover. You can find the id of an md plan on its url. Copying the full url below will automatically isolate the id.",
    "collection": "Reference a collection with {collection:id}. This will show the name of the collection and a tooltip with its search overview on hover. You can find the id of a collection on its url. Copying the full url below will automatically isolate the id.",
    "user": "Reference a user with {user:username}. This will show a link to the user's profile. Note that if the user changes their username, this will break. Usernames are also case-sensitive.",
    "sinner": "Reference a sinner with {sinner:id}. This will show the name of the sinner. Useful if you want to accurately type Ryōshū."
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
        <div>{desc[type]}</div>
        {children}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            Result:
            {guideValue ?
                <div style={{ border: "1px #777 solid", padding: "0.5rem" }}>
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
        "sinner": SinnerDropdownSelector
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

    return null;
}

function GuideAssembler({ guideTab, editorRef, onChange, guideValue, setGuideValue }) {
    if (["identity", "ego", "status", "statusicon", "keyword", "giftname", "gifticons", "sinner"].includes(guideTab))
        return <SelectorGuide type={guideTab} editorRef={editorRef} onChange={onChange} guideValue={guideValue} setGuideValue={setGuideValue} />

    if (["build", "mdplan", "collection", "user"].includes(guideTab))
        return <InputGuide type={guideTab} editorRef={editorRef} onChange={onChange} guideValue={guideValue} setGuideValue={setGuideValue} />

    return null;
}

export default function MarkdownTokensGuide({ editorRef, onChange, guideTab, setGuideTab, guideValue, setGuideValue }) {
    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <div>You can reference things like statuses or keywords with tokens like {"{keyword:Burn}"} to show icons or tooltips when hovering over them.</div>
        <div>Choose a type below to search for tokens you might like to use.</div>
        <div>An autocomplete system is available for the following token types: identity, ego, status, giftname, gifticons, keyword, sinner. To trigger it, just start typing {"\"{type:\""}.</div>
        <div>Token type: <DropdownButton value={guideTab} setValue={x => { setGuideTab(x); setGuideValue(null); }} options={options} /></div>
        <GuideAssembler guideTab={guideTab} editorRef={editorRef} onChange={onChange} guideValue={guideValue} setGuideValue={setGuideValue} />
    </div>;
}
