export default function HoverBlocker({ setBlockHover, children }) {
    return (
        <div
            onMouseEnter={() => setBlockHover(true)}
            onMouseLeave={() => setBlockHover(false)}
        >
            {children}
        </div>
    );
}