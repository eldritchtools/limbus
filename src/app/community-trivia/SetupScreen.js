"use client";

import { useEffect, useState } from "react";

import Question from "./Question";
import { defaultQuestion, remapQuestion, TRIVIA_REPORT_REASONS } from "./util";
import NumberInput from "../components/objects/NumberInput";
import PageHeader from "../components/pageTemplates/PageHeader";
import { useAuth } from "../database/authProvider";
import { deleteTriviaQuestion, getMyPendingTriviaQuestions, getPendingTriviaQuestions, getTriviaQuestionCounts, getTriviaReports, moderateTriviaQuestion, resolveTriviaReport, searchTriviaQuestions, submitTriviaQuestion, updateTriviaQuestion } from "../database/trivia";

function GameTab({ settings, setSettings, onStart, onReset }) {
    const [counts, setCounts] = useState(null);

    const handleSetSettings = (key, value) => {
        setSettings(p => ({ ...p, [key]: value }))
    }

    useEffect(() => {
        if (counts) return;
        const fetch = async () => setCounts((await getTriviaQuestionCounts())[0]);
        fetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <>
        <PageHeader
            title={"Community Trivia Quiz"}
            mainDesc={<>
                Need to practice your trivia before going to HamHamPangPang? Try the Community Trivia Quiz.
                <br /> <br />
                All questions are submitted by the community and periodically reviewed for accuracy. Playing on the Curated dataset will only include approved questions, while playing on the Community dataset will also include questions that haven&apos;t been reviewed. Questions that have been rejected due to being incorrect, a duplicate, ambiguous, or for other reasons are excluded from both.
                <br /> <br />
                If you have questions of your own, you can submit them in the Submit tab above. To keep things organized, please avoid submitting questions through other channels.
            </>}
            showAd={false}
        ></PageHeader>

        <span style={{ maxWidth: "1000px", textAlign: "center" }}>
            Choose your settings
        </span>

        <div style={{ display: "grid", gridTemplateColumns: "auto auto", alignItems: "center", gap: "0.5rem", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "end" }}>
                <span style={{ fontSize: "1.1rem", textAlign: "end" }}>
                    Number of Questions:
                </span>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <NumberInput min={1} max={100} value={settings.rounds}
                    onChange={x => handleSetSettings("rounds", x)}
                    style={{ textAlign: "center", width: "5ch" }}
                />
            </div>

            <div style={{ display: "flex", justifyContent: "end" }}>
                <span style={{ fontSize: "1.1rem", textAlign: "end" }}>
                    Dataset:
                </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "0.5rem" }}>
                    <label>
                        <input type="radio" name="curated" value={true} checked={settings.curated}
                            onChange={() => handleSetSettings("curated", true)}
                        />
                        Curated{counts && ` (${counts.curated_count} questions)`}
                    </label>
                    <label>
                        <input type="radio" name="curated" value={false} checked={!settings.curated}
                            onChange={() => handleSetSettings("curated", false)}
                        />
                        Community{counts && ` (${counts.community_count} questions)`}
                    </label>
                </div>
            </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <button onClick={onReset}>Reset to Default</button>
            <button onClick={onStart} style={{ background: "#1e7e34" }}>
                Begin!
            </button>
        </div>
    </>
}

function SubmitTab() {
    const [question, setQuestion] = useState({ ...defaultQuestion, key: 0 });
    const [otherQuestions, setOtherQuestions] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const checkQuestion = async () => {
        if (question.question.trim().length === 0) {
            setMessage("Please input a question.");
            return;
        }

        setMessage("");
        setLoading(true);
        setOtherQuestions(await searchTriviaQuestions(question.question));
        setLoading(false);
    }

    const submitQuestion = async () => {
        if (question.question.trim().length === 0) {
            setMessage("Please input a question.");
            return;
        }

        if (question.answer.trim().length === 0) {
            setMessage("Please input an answer.");
            return;
        }

        if (question.answerType === "multiple_choice" && question.otherAnswers.length < 2) {
            setMessage("Multiple Choice questions require at least 2 wrong answers.");
            return;
        }

        setMessage("");
        setLoading(true);
        await submitTriviaQuestion(question);
        setMessage("Thanks for submitting!");
        setQuestion({ ...defaultQuestion, key: question.key + 1, answerType: question.answerType });
        setOtherQuestions(null);
        setLoading(false);
    }

    return <>
        <PageHeader
            title={"Submit a Question"}
            mainDesc={<>
                Have a trivia question you&apos;d like to see in the quiz? Submit it here!
                <br /> <br />
                Please ensure that all questions are related to Project Moon and its games. Questions about fan works, creators, the community, and other unrelated topics will be rejected.
                <br /> <br />
                Please review your submission carefully before submitting. You won&apos;t be able to edit your question afterward. Minor typos and errors may be corrected during review, but submissions with more significant issues may be rejected.
                <br /> <br />
                To help avoid duplicates, you can search existing submissions below to see if a similar question has already been submitted.
            </>}
            showAd={false}
        ></PageHeader>

        <Question question={question} setQuestion={setQuestion} editable={true} />

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button onClick={() => checkQuestion()} disabled={loading}>Check Question</button>
            <button onClick={() => submitQuestion()} disabled={loading}>Submit Question</button>
        </div>

        <div>
            {message}
        </div>

        {otherQuestions &&
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                <span style={{ fontSize: "1.2rem" }}>Other Submitted Questions:</span>
                {otherQuestions?.map(x => <div key={x.id} style={{ display: "flex", flexDirection: "column" }}>
                    <span>Q: {x.question}</span>
                    <span>A: {x.answer}</span>
                </div>)}
            </div>
        }
    </>
}

function ReviewTab() {
    const [questions, setQuestions] = useState(null);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        const fetch = async () => setQuestions((await getMyPendingTriviaQuestions()).map(x => remapQuestion(x)));
        if (!questions) fetch();
    }, [questions]);

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const question = questions?.find(x => x.id === selected);

    const updateQuestion = async () => {
        if (!question) return;
        setMessage("");
        setLoading(true);
        await updateTriviaQuestion(question);
        setMessage("Updated");
        setLoading(false);
    }

    const deleteQuestion = async () => {
        if (!question) return;
        setMessage("");
        setLoading(true);
        await deleteTriviaQuestion(question.id);
        setQuestions(p => p.filter(x => x.id !== question.id));
        setMessage("Deleted")
        setLoading(false);
    }

    const handleSetQuestion = fn => {
        setQuestions(p => p.map(x => x.id === selected ? fn(x) : x));
    }

    return <>
        <PageHeader
            title={"Review my Pending Questions"}
            mainDesc={<>
                You can review and edit your pending questions here. Accepted and rejected questions can no longer be edited.
            </>}
            showAd={false}
        ></PageHeader>

        <select value={selected} onChange={e => { setMessage(""); setSelected(Number(e.target.value)) }}>
            <option value={-1}></option>
            {questions?.map(x => <option key={x.id} value={x.id}>
                {x.question}
            </option>)}
        </select>

        {question && <>
            <Question question={question} setQuestion={handleSetQuestion} editable={true} />

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button onClick={() => updateQuestion()} disabled={loading}>Update Question</button>
                <button onClick={() => deleteQuestion()} disabled={loading}>Delete Question</button>
            </div>

            <div>
                {message}
            </div>
        </>
        }
    </>
}

function ModerateTab() {
    const [questions, setQuestions] = useState(null);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        const fetch = async () => setQuestions((await getPendingTriviaQuestions()).map(x => remapQuestion(x)));
        if (!questions) fetch();
    }, [questions]);

    const [otherQuestions, setOtherQuestions] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const question = questions?.find(x => x.id === selected);

    const checkQuestion = async () => {
        if (!question) return;
        setLoading(true);
        setOtherQuestions(await searchTriviaQuestions(question.question));
        setLoading(false);
    }

    const updateQuestion = async () => {
        if (!question) return;
        setMessage("");
        setLoading(true);
        await updateTriviaQuestion(question);
        setMessage("Updated");
        setLoading(false);
    }

    const moderateQuestion = async (action) => {
        if (!question) return;
        setMessage("");
        setLoading(true);
        await moderateTriviaQuestion(question.id, action);
        setMessage("Moderated");
        setQuestions(p => p.filter(x => x.id !== question.id));
        setLoading(false);
    }

    const handleSetQuestion = fn => {
        setQuestions(p => p.map(x => x.id === selected ? fn(x) : x));
    }

    return <>
        <select value={selected} onChange={e => { setMessage(""); setSelected(Number(e.target.value)) }}>
            <option value={-1}></option>
            {questions?.map(x => <option key={x.id} value={x.id}>
                ({x.id}) {x.question}
            </option>)}
        </select>

        {question && <>
            <span>Status: {question.status}</span>
            <span>Submitted by: {question.username}</span>
            <Question question={question} setQuestion={handleSetQuestion} editable={true} />

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button onClick={() => checkQuestion()} disabled={loading}>Check Question</button>
                <button onClick={() => updateQuestion()} disabled={loading}>Update Question</button>
                <button onClick={() => moderateQuestion("accept")} disabled={loading}>Accept Question</button>
                <button onClick={() => moderateQuestion("reject")} disabled={loading}>Reject Question</button>
            </div>

            <div>
                {message}
            </div>

            {otherQuestions &&
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                    <span style={{ fontSize: "1.2rem" }}>Other Submitted Questions:</span>
                    {otherQuestions?.map(x => <div key={x.id} style={{ display: "flex", flexDirection: "column" }}>
                        <span>({x.id}) {x.status}</span>
                        <span>Q: {x.question}</span>
                        <span>A: {x.answer}</span>
                    </div>)}
                </div>
            }
        </>
        }
    </>
}

function ReportsTab() {
    const [reports, setReports] = useState(null);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        const fetch = async () => setReports((await getTriviaReports()).map(x => remapQuestion(x)));
        if (!reports) fetch();
    }, [reports]);

    const [otherQuestions, setOtherQuestions] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const report = reports?.find(x => x.reportId === selected);

    const checkQuestion = async () => {
        if (!report) return;
        setLoading(true);
        setOtherQuestions(await searchTriviaQuestions(report.question));
        setLoading(false);
    }

    const updateQuestion = async () => {
        if (!report) return;
        setMessage("");
        setLoading(true);
        await updateTriviaQuestion(report);
        setMessage("Updated");
        setLoading(false);
    }

    const disableQuestion = async () => {
        if (!report) return;
        setMessage("");
        setLoading(true);
        await moderateTriviaQuestion(report.id, "reject");
        await resolveTriviaReport(report.reportId);
        setMessage("Disabled and Resolved");
        setReports(p => p.filter(x => x.reportId !== report.reportId));
        setLoading(false);
    }

    const resolveReport = async () => {
        if (!report) return;
        setMessage("");
        setLoading(true);
        await resolveTriviaReport(report.reportId);
        setMessage("Resolved");
        setReports(p => p.filter(x => x.reportId !== report.reportId));
        setLoading(false);
    }

    const handleSetReport = fn => {
        setReports(p => p.map(x => x.reportId === selected ? fn(x) : x));
    }

    return <>
        <select value={selected} onChange={e => { setMessage(""); setSelected(Number(e.target.value)) }}>
            <option value={-1}></option>
            {reports?.map(x => <option key={x.reportId} value={x.reportId}>
                ({x.id}) {x.question}
            </option>)}
        </select>

        {report && <>
            <span>Status: {report.status}</span>
            <span>Submitted by: {report.username}</span>
            <Question question={report} setQuestion={handleSetReport} editable={true} />

            <span>Report: {TRIVIA_REPORT_REASONS[report.reason]}</span>
            <span>Reported by: {report.reporter}</span>
            <div>
                {report.details}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button onClick={() => checkQuestion()} disabled={loading}>Check Question</button>
                <button onClick={() => updateQuestion()} disabled={loading}>Update Question</button>
                <button onClick={() => disableQuestion()} disabled={loading}>Disable Question</button>
                <button onClick={() => resolveReport()} disabled={loading}>Resolve Report</button>
            </div>

            <div>
                {message}
            </div>

            {otherQuestions &&
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                    <span style={{ fontSize: "1.2rem" }}>Other Submitted Questions:</span>
                    {otherQuestions?.map(x => <div key={x.id} style={{ display: "flex", flexDirection: "column" }}>
                        <span>({x.id}) {x.status}</span>
                        <span>Q: {x.question}</span>
                        <span>A: {x.answer}</span>
                    </div>)}
                </div>
            }
        </>
        }
    </>
}

export default function SetupScreen({ settings, setSettings, onStart, onReset }) {
    const [tab, setTab] = useState("game");
    const { user, profile } = useAuth();

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "1000px", gap: "1rem" }}>
        <div style={{ display: "flex", flexDirection: "row", gap: "1rem", alignSelf: "center", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
            {user &&
                <div className={`tab-header ${tab === "game" ? "active" : ""}`} onClick={() => setTab("game")}>Play</div>
            }
            {user &&
                <div className={`tab-header ${tab === "submit" ? "active" : ""}`} onClick={() => setTab("submit")}>Submit</div>
            }
            {user &&
                <div className={`tab-header ${tab === "review" ? "active" : ""}`} onClick={() => setTab("review")}>Review</div>
            }
            {profile && profile.is_admin &&
                <div className={`tab-header ${tab === "mod" ? "active" : ""}`} onClick={() => setTab("mod")}>Moderate</div>
            }
            {profile && profile.is_admin &&
                <div className={`tab-header ${tab === "report" ? "active" : ""}`} onClick={() => setTab("report")}>Reports</div>
            }
        </div>

        {tab === "game" && <GameTab settings={settings} setSettings={setSettings} onStart={onStart} onReset={onReset} />}
        {tab === "review" && <ReviewTab />}
        {tab === "submit" && <SubmitTab />}
        {tab === "mod" && <ModerateTab />}
        {tab === "report" && <ReportsTab />}
    </div>
}