import MarkdownRenderer from "../markdown/MarkdownRenderer"

function UpdateItem({ item }) {
    if (item.type === "text") {
        return <MarkdownRenderer content={item.text} />
    } else if (item.type === "list") {
        return <ul style={{margin: 0}}>
            {item.texts.map((text, i) => <li key={i} style={{lineHeight: 1.3}}>{text}</li>)}
        </ul>
    }
}

export default function UpdateHistoryContent({ date, title, content }) {
    return <div style={{ display: "flex", flexDirection: "column", gap: ".5rem", padding: "1rem", maxHeight: "90vh", overflowY: "auto", maxWidth: "min(80vw, 1000px)" }}>
        <span style={{ color: "#aaa", fontSize: "0.9rem" }}>{date}</span>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {content.map((item, i) => <UpdateItem key={i} item={item} />)}
    </div>
}