'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function Analytics({ gaId }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (pathname && window.gtag) {
            const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

            // Manually trigger the config command to record a page_view
            // This fires AFTER the component has mounted and the title has updated.
            window.gtag('config', gaId, {
                page_path: url,
            });
        }
    }, [pathname, searchParams, gaId]);

    return null;
}