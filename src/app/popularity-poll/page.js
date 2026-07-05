"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

import { questions } from "./pollData";
import { useData } from "../components/DataProvider";
import BannerIcon from "../components/icons/BannerIcon";
import EgoIcon from "../components/icons/EgoIcon";
import IdentityIcon from "../components/icons/IdentityIcon";
import { useModal } from "../components/modals/ModalProvider";
import NoPrefetchLink from "../components/NoPrefetchLink";
import DragContainer from "../components/objects/DragContainer";
import Slider from "../components/objects/Slider";
import DropdownSelectorWithExclusion from "../components/selectors/DropdownSelectorWithExclusion";
import { EgoDropdownSelector } from "../components/selectors/EgoSelectors";
import { IdentityDropdownSelector } from "../components/selectors/IdentitySelectors";
import { useAuth } from "../database/authProvider";
import { fetchSurveyAggregates, fetchSurveyResponse, fetchSurveyResponseCount, submitSurveyResponse } from "../database/surveys";
import { romanMapping } from "../lib/constants";
import { YouTubeThumbnailEmbed } from "../lib/youtube";
import { selectStyle } from "../styles/selectStyle";

const SURVEY_ID = 7;

function Question({ question, response, setResponse }) {
    const component = useMemo(() => {
        if (question.type === "idselect") {
            return <div style={{ display: "flex", gap: "0.2rem", flexDirection: "column" }}>
                {
                    Array.from({ length: question.limit }, (x, i) =>
                        <IdentityDropdownSelector key={i}
                            selected={response[i]} setSelected={x => setResponse(response.map((p, ind) => ind === i ? x : p))}
                            options={question.options} />
                    )
                }
            </div>
        }
        if (question.type === "egoselect") {
            return <div style={{ display: "flex", gap: "0.2rem", flexDirection: "column" }}>
                {
                    Array.from({ length: question.limit }, (x, i) =>
                        <EgoDropdownSelector key={i}
                            selected={response[i]} setSelected={x => setResponse(response.map((p, ind) => ind === i ? x : p))}
                            options={question.options} />
                    )
                }
            </div>
        }
        if (question.type === "select") {
            return <div style={{ display: "flex", gap: "0.2rem", flexDirection: "column" }}>
                {
                    Array.from({ length: question.limit }, (x, i) =>
                        <DropdownSelectorWithExclusion key={i}
                            options={question.options.map(opt => ({ value: opt, label: opt })).sort((a, b) => a.value.localeCompare(b.value))}
                            selected={response[i]} setSelected={x => setResponse(response.map((p, ind) => ind === i ? x : p))}
                            placeholder={"Select an Option..."}
                            styles={selectStyle}
                        />
                    )
                }
            </div>
        }
        if (question.type === "themeselect") {
            return <div style={{ display: "flex", gap: "0.2rem", flexDirection: "column" }}>
                {
                    Array.from({ length: question.limit }, (x, i) =>
                        <DropdownSelectorWithExclusion key={i}
                            options={question.options.map(opt => ({ value: opt.name, label: opt.name })).sort((a, b) => a.value.localeCompare(b.value))}
                            selected={response[i]} setSelected={x => setResponse(response.map((p, ind) => ind === i ? x : p))}
                            placeholder={"Select an Option..."}
                            styles={selectStyle}
                        />
                    )
                }
                <DragContainer>
                    <div style={{ display: "flex", gap: "0.2rem" }}>
                        {
                            Array.from({ length: question.limit }, (x, i) => {
                                return response[i] ?
                                    <div key={i} style={{ width: "100%", maxWidth: "300px" }}>
                                        <YouTubeThumbnailEmbed videoId={question.options.find(x => x.name === response[i]).youtubeVideoId} />
                                    </div> :
                                    null
                            })
                        }
                    </div>
                </DragContainer>
            </div>
        }
        if (question.type === "compare") {
            return <div style={{ display: "flex", gap: "0.2rem", flexDirection: "column" }}>
                {
                    question.items.map((item, i) => <React.Fragment key={i}>
                        <span style={{ fontWeight: "bold" }}>{item.long}</span>
                        <div style={{ display: "flex", flexWrap: "wrap", columnGap: "1rem", rowGap: 0 }}>
                            <label>
                                <input type="radio" value={-1} checked={response[i] === -1}
                                    onChange={e => setResponse(response.map((p, ind) => ind === i ? Number(e.target.value) : p))}
                                />
                                Prefer Canto IX
                            </label>
                            <label>
                                <input type="radio" value={0} checked={response[i] === 0}
                                    onChange={e => setResponse(response.map((p, ind) => ind === i ? Number(e.target.value) : p))}
                                />
                                About the Same
                            </label>
                            <label>
                                <input type="radio" value={1} checked={response[i] === 1}
                                    onChange={e => setResponse(response.map((p, ind) => ind === i ? Number(e.target.value) : p))}
                                />
                                Prefer {item.short}
                            </label>
                        </div>
                    </React.Fragment>)
                }
            </div>
        }
        if (question.type === "rating") {
            return <div>
                <Slider
                    value={response[0]} onChange={v => setResponse([v])}
                    min={0} max={10} step={1} compressed={true} sliderWidth={250}
                />
            </div>
        }
        if (question.type === "other") {
            return <div>
                <textarea
                    value={response[0]} onChange={e => setResponse([e.target.value])}
                    style={{ width: "100%", height: "10ch" }}
                    placeholder="Leave blank for no comment."
                />
            </div>
        }

        return null;
    }, [question, response, setResponse])

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        <span className="title-text">{question.question}</span>
        {question.subquestion && <span className="sub-text">{question.subquestion}</span>}
        {component}
    </div>
}

function SeasonComparisonChart({ points, labels }) {
    const containerRef = useRef(null);
    const [width, setWidth] = useState(0);
    const [hovered, setHovered] = useState(null);

    useEffect(() => {
        const observer = new ResizeObserver(([entry]) => {
            setWidth(entry.contentRect.width);
        });

        observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, []);

    const MARGIN = width < 500 ? 20 : 40;
    const AXIS_Y = 100;

    const LEVEL_HEIGHT = 20;
    const LABEL_OFFSET = 10;
    const CHAR_WIDTH = 7;
    const LABEL_PADDING = 10;
    const EXTRA_GAP = 12;

    const layout = useMemo(() => {
        const levels = [];

        const levelOffset = level => {
            if (level === 0) return 0;

            const n = Math.ceil(level / 2);
            return level % 2 ? -n : n;
        };

        const sorted = [...points, 0]
            .map((point, i) => {
                const x = MARGIN + ((point + 1) / 2) * (width - MARGIN * 2);
                const labelWidth = romanMapping[i + 1].length * CHAR_WIDTH + LABEL_PADDING;
                if (i === points.length) return { label: "Canto IX: The Unsevering", shortLabel: "IX", x, labelWidth, score: 0 };
                return { label: labels[i], shortLabel: romanMapping[i + 1], x, labelWidth, score: point };
            })
            .sort((a, b) => a.x - b.x);

        const laidOut = [];

        for (const point of sorted) {
            let level = 0;

            while (true) {
                const previous = levels[level];
                if (!previous) break;
                const previousRight = previous.x + LABEL_OFFSET + previous.labelWidth;
                if (point.x > previousRight + EXTRA_GAP) break;
                level++;
            }

            levels[level] = point;
            laidOut.push({ ...point, y: AXIS_Y + levelOffset(level) * LEVEL_HEIGHT });
        }

        return laidOut;

    }, [points, labels, MARGIN, width]);

    const maxLevel = Math.max(0, ...layout.map(p => Math.abs((p.y - AXIS_Y) / LEVEL_HEIGHT)));

    const height = AXIS_Y + (maxLevel + 2) * LEVEL_HEIGHT;

    return <div ref={containerRef} style={{ width: "100%" }}>
        <svg width="100%" height={height}>
            <line x1={MARGIN} x2={width - MARGIN} y1={AXIS_Y} y2={AXIS_Y} stroke="var(--primary-border-color)" />
            {[-1, -0.5, 0, 0.5, 1].map(value => {
                const x = MARGIN + ((value + 1) / 2) * (width - MARGIN * 2);
                return <g key={value}>
                    <line x1={x} x2={x} y1={AXIS_Y - 5} y2={AXIS_Y + 5} stroke="var(--primary-border-color)" />
                    {/* <text x={x} y={AXIS_Y + 20} textAnchor="middle" fontSize="0.8rem" fill="var(--primary-text-color)">
                        {value}
                    </text> */}
                </g>;
            })}

            {layout.map(point => <g key={point.shortLabel}
                onMouseEnter={() => setHovered(point)}
                onMouseLeave={() => setHovered(null)}
                onClick={() =>
                    setHovered(h =>
                        h?.id === point.id ? null : point
                    )
                }
            >
                {/* <line x1={point.x} y1={AXIS_Y} x2={point.x} y2={point.y} stroke="var(--primary-border-color)" /> */}
                <circle cx={point.x} cy={point.y} r="4"
                    fill={point.shortLabel === "IX" ? "var(--primary-text-color)" : "var(--secondary-border-color)"}
                />
                <text x={point.x + LABEL_OFFSET} y={point.y + 6} fontSize="1.2rem" fill="var(--primary-text-color)">
                    {point.shortLabel}
                </text>
            </g>
            )}

            <text x={MARGIN} y={height - 8} fontSize="1.2rem" fill="var(--primary-text-color)">
                Prefer Canto IX
            </text>

            <text x={width / 2} y={height - 8} textAnchor="middle" fontSize="1.2rem" fill="var(--primary-text-color)">
                No Preference
            </text>

            <text x={width - MARGIN} y={height - 8} textAnchor="end" fontSize="1.2rem" fill="var(--primary-text-color)">
                Prefer Previous Canto
            </text>
        </svg>
        {(hovered && hovered.shortLabel !== "IX") ?
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                <span>{hovered.label}</span>
                <span>Score: {hovered.score.toFixed(2)}</span>
            </div> :
            <div style={{ justifyContent: "center", textAlign: "center" }}>
                Tap/Hover over a canto to see its score.
            </div>
        }
    </div>;
}

function ResultsTab({ results, responseCount }) {
    const { isMobile } = useBreakpoint();
    const { openPollResultModal } = useModal();
    const [identities, identitiesLoading] = useData("identities_mini");
    const [egos, egosLoading] = useData("egos_mini");
    const [othersIndex, setOthersIndex] = useState(0);

    if (!results || identitiesLoading || egosLoading) return null;

    const stripFavorite = text => text.replace("Favorite ", "");

    const constructIconResult = (title, limit, result, iconFn, nameFn) => {
        const list = result.sort((a, b) => a.count === b.count ? a.answer.localeCompare(b.answer) : b.count - a.count);

        return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", maxWidth: "350px" }}>
            <span className="title-text" style={{ textAlign: "center" }}>{stripFavorite(title)}</span>
            <span className="sub-text" style={{textAlign: "center"}}>{limit} vote{limit === 1 ? "" : "s"} per response</span>
            <div style={{ display: "flex", gap: "0.2rem", alignItems: "end", alignSelf: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {iconFn(list[1].answer, 112)}
                    <span>#2</span>
                    <span>{list[1].count} votes</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {iconFn(list[0].answer, 128)}
                    <span>#1</span>
                    <span>{list[0].count} votes</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {iconFn(list[2].answer, 96)}
                    <span>#3</span>
                    <span>{list[2].count} votes</span>
                </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "0.5rem", alignItems: "center" }}>
                <span>Place</span>
                <span>Name</span>
                <span>Votes</span>
                {
                    list.slice(3, 10).map((answer, i) => <React.Fragment key={answer.answer}>
                        <span style={{ textAlign: "center" }}>#{i + 4}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                            <div style={{ flex: 0 }}>{iconFn(answer.answer, 32, false)}</div>
                            <span style={{ whiteSpace: "pre-wrap" }}>{nameFn(answer.answer)}</span>
                        </div>
                        <span style={{ textAlign: "center" }}>{answer.count}</span>
                    </React.Fragment>)
                }
            </div>
            {result.length > 10 &&
                <div style={{ alignSelf: "center" }}>
                    <button className="text-link"
                        style={{ background: "transparent", border: "transparent", padding: 0 }}
                        onClick={() => { openPollResultModal({ title: stripFavorite(title), result: list, iconFn: iconFn, transform: nameFn }) }}
                    >
                        See More
                    </button>
                </div>
            }
        </div>
    }

    const constructTextResult = (title, limit, result, transform) => {
        const list = result.sort((a, b) => a.count === b.count ? a.answer.localeCompare(b.answer) : b.count - a.count);

        return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", maxWidth: "400px" }}>
            <span className="title-text" style={{ textAlign: "center" }}>{stripFavorite(title)}</span>
            <span className="sub-text" style={{textAlign: "center"}}>{limit} vote{limit === 1 ? "" : "s"} per response</span>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "0.5rem", alignItems: "center" }}>
                <span>Place</span>
                <span>Name</span>
                <span>Votes</span>
                {
                    list.slice(0, 10).map((answer, i) => <React.Fragment key={answer.answer}>
                        <span style={{ textAlign: "center" }}>#{i + 1}</span>
                        <div style={{ display: "flex" }}>
                            <span style={{ whiteSpace: "pre-wrap" }}>{transform ? transform(answer.answer) : answer.answer}</span>
                        </div>
                        <span style={{ textAlign: "center" }}>{answer.count}</span>
                    </React.Fragment>)
                }
            </div>
            {result.length > 10 &&
                <div style={{ alignSelf: "center" }}>
                    <button className="text-link"
                        style={{ background: "transparent", border: "transparent", padding: 0 }}
                        onClick={() => { openPollResultModal({ title: stripFavorite(title), result: list, transform: transform }) }}
                    >
                        See More
                    </button>
                </div>
            }
        </div>
    }

    const constructComparisonResult = (title, items, result) => {
        return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", maxWidth: "1200px", alignSelf: "center" }}>
            <span className="title-text" style={{ textAlign: "center" }}>{title}</span>
            <span className="sub-text" style={{ textAlign: "center" }}>
                Cantos further left are less preferred, while Cantos further right are more preferred than Canto IX.
            </span>
            <SeasonComparisonChart points={result} labels={items} />
        </div>
    }

    const constructRatingResult = (title, result) => {
        const data = result.map((x, i) => ({ rating: i, count: x }));
        const average = responseCount === 0 ? 0 : data.reduce((sum, d) => sum + d.rating * d.count, 0) / responseCount;

        return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", maxWidth: "1200px", alignSelf: "center" }}>
            <span className="title-text" style={{ textAlign: "center" }}>{title}</span>
            <span style={{ textAlign: "center" }}>Average: {average.toFixed(2)}</span>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="rating" label={{ value: "Rating", position: "insideBottom", offset: -5 }} />
                    <YAxis allowDecimals={false} label={{ value: "Responses", angle: -90, position: "insideLeft" }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "var(--bg-secondary)",
                            border: "1px solid var(--primary-border-color)",
                            borderRadius: "1rem",
                            color: "var(--primary-text-color)"
                        }}
                        labelStyle={{ color: "var(--primary-text-color)" }}
                        itemStyle={{ color: "var(--primary-text-color)" }}
                        cursor={{ fill: "var(--bg-hover)", fillOpacity: 0.5 }}
                    />
                    <Bar
                        dataKey="count"
                        fill="var(--secondary-text-color)"
                        activeBar={{ fill: "var(--primary-text-color)" }}
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    }

    const constructOtherResult = (title, result) => {
        const end = Math.min(othersIndex + 10, result.length);
        const messages = result.slice(othersIndex, end);

        const next = () => {
            if (othersIndex + 10 >= result.length) {
                setOthersIndex(0);
            } else {
                setOthersIndex(p => p + 10);
            }
        }

        return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", maxWidth: "1200px", alignSelf: "center" }}>
            <span className="title-text" style={{ textAlign: "center" }}>{title}</span>
            <div style={{ display: "flex", flexDirection: "column", width: "100%"}}>
                {messages.map((x, i) => 
                    <div key={i} 
                        style={{
                            borderTop: "1px solid var(--secondary-border-color)", borderBottom: "1px solid var(--secondary-border-color)",
                            borderRadius: "1rem", whiteSpace: "pre-wrap", padding: "0.5rem", boxSizing: "border-box"
                        }}>
                            {x}
                    </div>
                )}
            </div>

            {result.length > 10 && 
                    <button className="text-link"
                        style={{ background: "transparent", border: "transparent", padding: 0 }}
                        onClick={next}
                    >
                        See More
                    </button>
            }
        </div>
    }

    const constructThemeLink = (name, options) => {
        const option = options.find(y => y.name === name);
        return <NoPrefetchLink className="text-link" href={`https://www.youtube.com/watch?v=${option.youtubeVideoId}`}>{name}</NoPrefetchLink>;
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
        <span style={{ textAlign: "center" }}>Responses: {responseCount}</span>
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "0.5rem", width: "100%", justifyContent: isMobile ? null : "center" }}>
            {constructIconResult(
                questions[0].question,
                questions[0].limit,
                results[0],
                (id, size, name = true) => <IdentityIcon id={id} width={size} displayName={name} />,
                id => identities[id].name
            )}
            {constructIconResult(
                questions[1].question,
                questions[1].limit,
                results[1],
                (id, size, name = true) => <IdentityIcon id={id} width={size} displayName={name} />,
                id => identities[id].name
            )}
            {constructIconResult(
                questions[2].question,
                questions[2].limit,
                results[2],
                (id, size, name = true) => <EgoIcon id={id} type={"awaken"} width={size} displayName={name} />,
                id => egos[id].name
            )}
        </div>
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "0.5rem", width: "100%", justifyContent: isMobile ? null : "center" }}>
            {constructTextResult(questions[3].question, questions[3].limit, results[3])}
            {constructTextResult(questions[4].question, questions[4].limit, results[4])}
            {constructTextResult(questions[5].question, questions[5].limit, results[5])}
        </div>
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "0.5rem", width: "100%", justifyContent: isMobile ? null : "center" }}>
            {constructTextResult(questions[6].question, questions[6].limit, results[6])}
            {constructTextResult(questions[7].question, questions[7].limit, results[7], x => constructThemeLink(x, questions[7].options))}
            {constructTextResult(questions[8].question, questions[8].limit, results[8], x => constructThemeLink(x, questions[8].options))}
            {constructTextResult(questions[9].question, questions[9].limit, results[9])}
        </div>
        {constructComparisonResult(questions[10].short, questions[10].items.map(x => x.long), results[10])}
        {constructRatingResult(questions[11].short, results[11])}
        {constructOtherResult(questions[12].short, results[12])}
    </div>
}

export default function PopularityPollPage() {
    const { user } = useAuth();
    const [mode, setMode] = useState("result");
    const [userResponse, setUserResponse] = useState(null);
    const [hasResponse, setHasResponse] = useState(false);
    const [message, setMessage] = useState(null);
    const [results, setResults] = useState(null);
    const [responseCount, setResponseCount] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!user || userResponse) return;

        const fetchData = async () => {
            const fetched = await fetchSurveyResponse(SURVEY_ID);

            if (fetched) setHasResponse(true);

            let resp = fetched ? fetched.answers : Array.from({ length: questions.length }, () => []);
            questions.forEach((question, i) => {
                if (["idselect", "egoselect", "select", "themeselect"].includes(question.type))
                    while (resp[i].length < question.limit) resp[i].push(null);
                else if (question.type === "compare") {
                    resp[i] = resp[i].map(x => Number(x.split(":")[1]));
                    while (resp[i].length < question.items.length) resp[i].push(0);
                }
                else if (question.type === "rating")
                    while (resp[i].length < 1) resp[i].push(0);
                else if (question.type === "other")
                    while (resp[i].length < 1) resp[i].push("");
            })

            setUserResponse(resp);
        }

        fetchData();
    }, [user, userResponse]);

    useEffect(() => {
        if(results) return;

        const fetchData = async () => {
            const fetched = await fetchSurveyAggregates(SURVEY_ID);
            const count = await fetchSurveyResponseCount(SURVEY_ID);

            const res = questions.map(x => {
                if (["idselect", "egoselect", "select"].includes(x.type)) return x.options.map(opt => ({ answer: opt, count: 0 }));
                else if (x.type === "themeselect") return x.options.map(opt => ({ answer: opt.name, count: 0 }));
                else if (x.type === "compare") return Array.from({ length: x.items.length }, () => 0);
                else if (x.type === "rating") return Array.from({ length: 11 }, () => 0);
                else if (x.type === "other") return [];
            });

            fetched.forEach(aggregate => {
                switch (questions[aggregate.question_index].type) {
                    case "idselect": case "egoselect": case "select": case "themeselect":
                        res[aggregate.question_index].find(x => x.answer === aggregate.answer).count = aggregate.count;
                        break;
                    case "compare":
                        const [index, value] = aggregate.answer.split(":");
                        res[aggregate.question_index][Number(index)] += Number(value) * aggregate.count;
                        break;
                    case "rating":
                        res[aggregate.question_index][Number(aggregate.answer)] = aggregate.count;
                        break;
                    case "other":
                        res[aggregate.question_index].push(aggregate.answer)
                        break;
                }
            })

            const res2 = res.map((x, i) => {
                if (questions[i].type === "compare") return x.map(y => y / Math.max(count, 1));
                if (questions[i].type === "other") return x.sort(() => Math.random() - 0.5);
                return x;
            })

            setResults(res2);
            setResponseCount(count);
        }

        fetchData();
    }, [results]);

    const submitResponse = async () => {
        const resp = userResponse.map((list, i) => {
            if (["idselect", "egoselect", "select", "themeselect"].includes(questions[i].type)) return list.filter(x => x !== null);
            if (questions[i].type === "compare") return list.map((x, j) => `${j}:${x}`);
            if (questions[i].type === "rating") return list;
            if (questions[i].type === "other") {
                if (list[0].length === 0) return [];
                else return list;
            }
        });

        const duplicate = questions.some((q, i) => {
            if (!["idselect", "egoselect", "select", "themeselect"].includes(q.type)) return false;
            return new Set(resp[i]).size !== resp[i].length;
        })

        if (duplicate) {
            setMessage("You can't vote for the same item more than once!");
            return;
        }

        setSubmitting(true);
        await submitSurveyResponse(SURVEY_ID, resp);
        setMessage("Response recorded! Returning to results.");
        setTimeout(() => { setMessage(""); setMode("result"); setSubmitting(false); }, 3000);
    }

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", gap: "0.5rem" }}>
        <BannerIcon path={"season_7"} style={{width: "auto", maxWidth: "100%"}}/>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Season 7 Popularity Poll</h1>
        <span style={{ maxWidth: "1000px", textAlign: "start" }}>
            Vote for your favorites this season! Submit or update your responses at any time while the poll is open. Current results are shown below. Refresh to see the latest results.
            <br /> <br />
            Anything new released in the last few weeks before the season ends will be added to the possible answers. Just edit your response if you want to change anything. Responses will be locked some time after Season 8 starts. The exact date is still to be determined.
            <br /> <br />
            If there are any missing answers you&apos;d like to see, feel free to report it through the <NoPrefetchLink className="text-link" href="/feedback">Feedback</NoPrefetchLink> page. This page will be improved over time as responses come in. If you&apos;d like to suggest improvements, you can do so in the same page. Thank you!
        </span>

        {mode === "submit" ?
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", maxWidth: "1000px" }}>
                {questions.map((question, i) =>
                    <Question key={i}
                        question={question}
                        response={userResponse[i]}
                        setResponse={x => setUserResponse(p => p.map((pr, ind) => ind === i ? x : pr))}
                    />
                )}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "0.2rem" }}>
                        <button onClick={() => setMode("result")} disabled={submitting}>Cancel</button>
                        <button onClick={() => submitResponse()} disabled={submitting}>Submit</button>
                    </div>
                    <span>{message}</span>
                </div>
            </div> :
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem", width: "100%", maxWidth: "1600px" }}>
                <div style={{ alignSelf: "center" }}>
                    {user ?
                        <button onClick={() => setMode("submit")}>{hasResponse ? "Edit" : "Submit"} Your Response</button> :
                        <span style={{ fontWeight: "bold" }}>Login to submit a response</span>
                    }
                </div>
                <ResultsTab results={results} responseCount={responseCount} />
            </div>
        }
    </div>
}