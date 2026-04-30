'use client'

import { useEffect } from 'react'

export default function ChunkErrorHandler() {
    useEffect(() => {
        function shouldHandle(msg) {
            return (
                msg.includes('ChunkLoadError') ||
                msg.includes('Loading chunk') ||
                msg.includes('dynamically imported')
            )
        }

        function reloadOnce() {
            const alreadyReloaded = sessionStorage.getItem('chunk-reload');

            if (!alreadyReloaded) {
                sessionStorage.setItem('chunk-reload', 'true');
                window.location.reload();
            } else {
                console.error('Chunk error persists after reload');
            }
        }

        function handleError(e) {
            if (shouldHandle(e.message || '')) {
                reloadOnce();
            }
        }

        function handleRejection(e) {
            const msg = e.reason?.message || ''
            if (shouldHandle(msg)) {
                reloadOnce();
            }
        }

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleRejection);
        }
    }, [])

    // optional: reset flag after successful load
    useEffect(() => {
        sessionStorage.removeItem('chunk-reload');
    }, [])

    return null;
}