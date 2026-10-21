import MarkdownEditorWrapper from "../components/markdown/MarkdownEditorWrapper"
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { uiColors } from "../lib/colors";

function EditableQuestion({ question, setQuestion }) {
    const setField = (field, value) => {
        setQuestion(p => ({ ...p, [field]: value }));
    }

    return <div style={{ display: "grid", gridTemplateColumns: "auto auto", alignItems: "center", gap: "0.5rem", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "end" }}>
            <span style={{ fontSize: "1.1rem", textAlign: "end" }}>
                Answer Type
            </span>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <select value={question.answerType} onChange={e => setField("answerType", e.target.value)}>
                <option value={"short_answer"}>Short Answer</option>
                <option value={"multiple_choice"}>Multiple Choice</option>
            </select>
        </div>

        <div style={{ display: "flex", justifyContent: "end" }}>
            <span style={{ fontSize: "1.1rem", textAlign: "end" }}>
                Question
            </span>
        </div>

        <div style={{ display: "flex" }}>
            <input value={question.question} onChange={e => setField("question", e.target.value)} style={{ width: "100%" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "end" }}>
            <span style={{ fontSize: "1.1rem", textAlign: "end" }}>
                Answer
            </span>
        </div>

        <div style={{ display: "flex" }}>
            <input value={question.answer} onChange={e => setField("answer", e.target.value)} style={{ width: "100%" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "end" }}>
            <span style={{ fontSize: "1.1rem", textAlign: "end" }}>
                {question.answerType === "short_answer" ?
                    <span className="hover-text" {...getGeneralTooltipProps("Other ways to input the correct answer.")}>Alternate Answers</span> :
                    <span>Incorrect Options</span>
                }
            </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            {question.otherAnswers.map((x, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                <button
                    onClick={() => { setField("otherAnswers", question.otherAnswers.filter((y, i2) => i !== i2)) }}
                    style={{ color: uiColors.red }}
                >
                    x
                </button>
                <input value={x}
                    onChange={e => setField("otherAnswers", question.otherAnswers.map((y, i2) => i === i2 ? e.target.value : y))}
                    style={{ flex: 1, width: "100%" }}
                />
            </div>)}
            <button onClick={() => setField("otherAnswers", [...question.otherAnswers, ""])}>
                +
            </button>
        </div>

        <div style={{ display: "flex", justifyContent: "end" }}>
            <span style={{ fontSize: "1.1rem", textAlign: "end" }}>
                Explanation (Optional)
            </span>
        </div>

        <div style={{ display: "flex" }}>
            <MarkdownEditorWrapper key={question.id ?? question.key}
                value={question.explanation} onChange={x => setField("explanation", x)}
                allowImages={false}
            />
        </div>
    </div>
}

export default function Question({ question, setQuestion, editable = false }) {
    if (editable) return <EditableQuestion question={question} setQuestion={setQuestion} />

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", maxWidth: "1280px" }}>
        <span>Submitted by: {question.username}</span>
        <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Question</span>
        {question.question}
    </div>
}