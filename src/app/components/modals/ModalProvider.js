"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

import ChoiceEventModalContent from "./ChoiceEventModalContent";
import CommunityAssetModalContent from "./CommunityAssetModalContent";
import DeleteCommentModalContent from "./DeleteCommentModalContent";
import DeleteContentModalContent from "./DeleteContentModalContent";
import GiftModalContent from "./GiftModalContent";
import ImageCarouselModalContent from "./ImageCarouselModalContent";
import ImageModalContent from "./ImageModalContent";
import ModalContainer from "./ModalContainer";
import PollResultModalContent from "./PollResultModalContent";
import RatingModalContent from "./RatingModalContent";
import SelectBuildModalContent from "./SelectBuildModalContent";
import SelectDeploymentModalContent from "./SelectDeploymentModalContent";
import SelectGiftModalContent from "./SelectGiftModalContent";
import SelectMdPlanModalContent from "./SelectMdPlanModalContent";
import SelectThemePackModalContent from "./SelectThemePackModalContent";
import SetFavoriteLinksModalContent from "./SetFavoriteLinksModalContent";
import UpdateHistoryModalContent from "./UpdateHistoryModalContent";

const ModalContext = createContext();

const MODAL_COMPONENTS = {
    "gift": GiftModalContent,
    "selectBuild": SelectBuildModalContent,
    "selectMdPlan": SelectMdPlanModalContent,
    "selectGift": SelectGiftModalContent,
    "selectThemePack": SelectThemePackModalContent,
    "deleteContent": DeleteContentModalContent,
    "deleteComment": DeleteCommentModalContent,
    "updateHistory": UpdateHistoryModalContent,
    "choiceEvent": ChoiceEventModalContent,
    "setFavoriteLinks": SetFavoriteLinksModalContent,
    "rating": RatingModalContent,
    "selectDeployment": SelectDeploymentModalContent,
    "imageCarousel": ImageCarouselModalContent,
    "image": ImageModalContent,
    "communityAsset": CommunityAssetModalContent,
    "pollResult": PollResultModalContent
};

export function ModalProvider({ children }) {
    const [stack, setStack] = useState([]);

    const pathname = usePathname();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStack([]);
    }, [pathname]);

    useEffect(() => {
        if (stack.length === 0) {
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
            return;
        }

        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = "hidden";
        document.body.style.paddingRight = `${scrollbarWidth}px`;

        return () => {
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
        };
    }, [stack.length]);

    const openModal = (type, props = {}) => {
        setStack(prev => [...prev, { modalId: stack.length, type, props, beforeClose: null }]);
    }

    const openGiftModal = ({ id, enhanceRank, forceTriggersEffects }) => {
        openModal("gift", { id, enhanceRank, forceTriggersEffects });
    }

    const openSelectBuildModal = ({ onSelectBuild, allowDrafts = false }) => {
        openModal("selectBuild", { onSelectBuild, allowDrafts });
    }

    const openSelectMdPlanModal = ({ onSelectMdPlan, allowDrafts = false }) => {
        openModal("selectMdPlan", { onSelectMdPlan, allowDrafts });
    }

    const openSelectGiftModal = ({ title, getChoiceList, showSearch = false, onSelectGift, forcedFilter }) => {
        openModal("selectGift", { title, getChoiceList, showSearch, onSelectGift, forcedFilter });
    }

    const openSelectThemePackModal = ({ getOptions, onSelectPack }) => {
        openModal("selectThemePack", { getOptions, onSelectPack });
    }

    const openDeleteContentModal = ({ targetType, targetId, title }) => {
        openModal("deleteContent", { targetType, targetId, title });
    }

    const openDeleteCommentModal = ({ targetType, commentId, commentBody, onDelete }) => {
        openModal("deleteComment", { targetType, commentId, commentBody, onDelete });
    }

    const openUpdateHistoryModal = ({ date, title, path }) => {
        openModal("updateHistory", { date, title, path });
    }

    const openChoiceEventModal = ({ choiceEvent }) => {
        openModal("choiceEvent", { choiceEvent });
    }

    const openSetFavoriteLinksModal = ({ currentList, setFavoriteLinks }) => {
        openModal("setFavoriteLinks", { currentList, setFavoriteLinks });
    }

    const openRatingModal = ({ type, id, getCommunityReviews, getUserReviews, onChange }) => {
        openModal("rating", { type, id, getCommunityReviews, getUserReviews, onChange });
    }

    const openSelectDeploymentModal = ({ initialActive, identityIds, activeSinners, onSave }) => {
        openModal("selectDeployment", { initialActive, identityIds, activeSinners, onSave });
    }

    const openImageCarouselModal = ({ imageIds, draftImages, startingPosition }) => {
        openModal("imageCarousel", { imageIds, draftImages, startingPosition });
    }

    const openImageModal = ({ type, data, mod }) => {
        openModal("image", { type, data, mod });
    }

    const openCommunityAssetModal = ({ imageId }) => {
        openModal("communityAsset", { imageId });
    }

    const openPollResultModal = ({ title, result, iconFn, transform }) => {
        openModal("pollResult", { title, result, iconFn, transform });
    }

    const setModalBeforeClose = (id, beforeClose) => {
        setStack(prev =>
            prev.map(entry =>
                entry.modalId === id
                    ? { ...entry, beforeClose }
                    : entry
            )
        );
    };

    const canNavigateAway = async () => {
        if(stack.length === 0) return true;
        const topModal = stack[stack.length - 1];
        if (!topModal?.beforeClose) return true;
        return await topModal.beforeClose();
    };

    const closeModal = () => {
        setStack(prev => prev.slice(0, -1));
    };

    const clearModals = () => {
        setStack([]);
    }

    const exportFunctions = {
        openGiftModal,
        openSelectBuildModal,
        openSelectMdPlanModal,
        openSelectGiftModal,
        openSelectThemePackModal,
        openDeleteContentModal,
        openDeleteCommentModal,
        openUpdateHistoryModal,
        openChoiceEventModal,
        openSetFavoriteLinksModal,
        openRatingModal,
        openSelectDeploymentModal,
        openImageCarouselModal,
        openImageModal,
        openCommunityAssetModal,
        openPollResultModal,
        setModalBeforeClose,
        canNavigateAway,
        closeModal,
        clearModals
    }

    return <ModalContext.Provider value={exportFunctions}>
        {children}

        {stack.map((entry, index) => {
            const ModalComponent = MODAL_COMPONENTS[entry.type];

            return <ModalContainer key={index} isOpen={true} onClose={closeModal} beforeClose={entry.beforeClose} index={index}>
                <ModalComponent modalId={entry.modalId} {...entry.props} onClose={closeModal} />
            </ModalContainer>
        })}
    </ModalContext.Provider>;
}

export function useModal() {
    return useContext(ModalContext);
}