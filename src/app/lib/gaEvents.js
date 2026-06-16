import { sendGAEvent } from '@next/third-parties/google'

export const gaId = process.env.NODE_ENV === 'production' ? 'G-HJ0SH2TDC8' : null;

export function setGAUser(userId) {
    if (process.env.NODE_ENV === 'production' && userId) {
        sendGAEvent('config', gaId, { user_id: userId });
    }
}

export function clearGAUser() {
    if (process.env.NODE_ENV === 'production') {
        sendGAEvent('config', gaId, { user_id: null });
    }
}

function triggerGAEvent(name, params) {
    if (process.env.NODE_ENV === 'production') {
        sendGAEvent('event', name, params);
    } else {
        console.log("GA Event Triggered (Dev Mode):", name, params);
    }
}

export function triggerSignUpGAEvent(method) {
    triggerGAEvent("sign_up", { method });
}

export function triggerShareGAEvent(content_type, post_id) {
    triggerGAEvent("share", { content_type, post_id })
}

export function triggerPostCreateGAEvent(content_type) {
    triggerGAEvent("post_create", { content_type })
}

export function triggerReviewSubmitGAEvent(item_id, item_name) {
    triggerGAEvent("review_submit", { item_id, item_display_name: item_name, item_full_context: `${item_name} (${item_id.slice(0, 5)})`})
}

export function triggerReviewInteractionGAEvent(item_id, user_id, review_id, reviewer_id) {
    triggerGAEvent("review_interaction", { item_id, user_id, review_id, reviewer_id })
}

export function triggerToolUsedGAEvent(tool_name) {
    triggerGAEvent("tool_used", { tool_name })
}

export function triggerCommunityAssetUploadedEvent() {
    triggerGAEvent("community_asset_uploaded", {})
}

export function triggerPollAnsweredEvent() {
    triggerGAEvent("community_poll_answered", {})
}