import {
    HandThumbUpIcon,
    BookmarkIcon,
    BellIcon
} from '@heroicons/react/24/outline'
import {
    HandThumbUpIcon as HandThumbUpIconSolid,
    ChatBubbleLeftIcon as ChatBubbleLeftIconSolid,
    BookmarkIcon as BookmarkIconSolid,
    ShareIcon as ShareIconSolid,
    PencilIcon as PencilIconSolid,
    TrashIcon as TrashIconSolid,
    EyeIcon as EyeIconSolid,
    UserPlusIcon as UserPlusIconSolid,
    ClipboardDocumentCheckIcon as ClipboardDocumentCheckIconSolid,
    ArrowLeftIcon as ArrowLeftIconSolid,
    BellIcon as BellIconSolid,
    FaceSmileIcon as FaceSmileIconSolid,
    RectangleStackIcon as RectangleStackIconSolid
} from '@heroicons/react/24/solid'


function appendText(symbol, text) {
    return <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
        {symbol}
        {text}
    </div>
}

function constructSymbol(Symbol, size, text) {
    const symbol = <Symbol style={{ width: `${size}px`, height: `${size}px` }} />;
    if (text) return appendText(symbol, text);
    return symbol
}

export function LikeOutline({ size = 20, text }) {
    return constructSymbol(HandThumbUpIcon, size, text);
}

export function LikeSolid({ size = 20, text }) {
    return constructSymbol(HandThumbUpIconSolid, size, text);
}

export function CommentSolid({ size = 20, text }) {
    return constructSymbol(ChatBubbleLeftIconSolid, size, text);
}

export function SaveOutline({ size = 20, text }) {
    return constructSymbol(BookmarkIcon, size, text);
}

export function SaveSolid({ size = 20, text }) {
    return constructSymbol(BookmarkIconSolid, size, text);
}

export function ShareSolid({ size = 20, text }) {
    return constructSymbol(ShareIconSolid, size, text);
}

export function EditSolid({ size = 20, text }) {
    return constructSymbol(PencilIconSolid, size, text);
}

export function DeleteSolid({ size = 20, text }) {
    return constructSymbol(TrashIconSolid, size, text);
}

export function ViewSolid({ size = 20, text }) {
    return constructSymbol(EyeIconSolid, size, text);
}

export function ContributeSolid({ size = 20, text }) {
    return constructSymbol(UserPlusIconSolid, size, text);
}

export function ReviewSolid({ size = 20, text }) {
    return constructSymbol(ClipboardDocumentCheckIconSolid, size, text);
}

export function BackSolid({ size = 20, text }) {
    return constructSymbol(ArrowLeftIconSolid, size, text);
}

export function BellOutline({ size = 20, text }) {
    return constructSymbol(BellIcon, size, text);
}

export function BellSolid({ size = 20, text }) {
    return constructSymbol(BellIconSolid, size, text);
}

export function EmoteSolid({ size = 20, text }) {
    return constructSymbol(FaceSmileIconSolid, size, text);
}

export function StickerSolid({ size = 20, text }) {
    return constructSymbol(RectangleStackIconSolid, size, text);
}