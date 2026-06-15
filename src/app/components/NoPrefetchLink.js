"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useModal } from "./modals/ModalProvider";

export default function NoPrefetchLink({ href, onClick, children, ...props }) {
    const router = useRouter();
    const { canNavigateAway } = useModal();

    const handleClick = async (e) => {
        e.preventDefault();

        if (!(await canNavigateAway())) {
            return;
        }

        router.push(href);

        onClick?.(e);
    };

    return <Link href={href} prefetch={false} onClick={handleClick} {...props}>
        {children}
    </Link>;
}