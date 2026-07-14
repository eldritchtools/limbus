import Link from "next/link";

import GuardedLink from "./GuardedLink";

export default function NoPrefetchLink({ href, guarded, onClick, children, ...props }) {
    if (guarded)
        return <GuardedLink href={href} onClick={onClick} {...props}>
            {children}
        </GuardedLink>

    return <Link href={href} onClick={onClick} prefetch={false} {...props}>
        {children}
    </Link>;
}