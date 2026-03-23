export default function HoverBlocker({ setBlockHover, children }) {
    return <div
        style={{ display: "contents" }}
        onMouseEnter={() => setBlockHover(true)}
        onMouseLeave={() => setBlockHover(false)}
    >
        {children}
    </div>;
}