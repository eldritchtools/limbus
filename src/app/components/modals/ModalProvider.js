"use client";

import { createContext, useContext, useState } from "react";

import DeleteCommentModalContent from "./DeleteCommentModalContent";
import DeleteContentModalContent from "./DeleteContentModalContent";
import GiftModalContent from "./GiftModalContent";
import ModalContainer from "./ModalContainer";
import SelectBuildModalContent from "./SelectBuildModalContent";
import SelectMdPlanModalContent from "./SelectMdPlanModalContent";

const ModalContext = createContext();

const MODAL_COMPONENTS = {
    "gift": GiftModalContent,
    "selectBuild": SelectBuildModalContent,
    "selectMdPlan": SelectMdPlanModalContent,
    "deleteContent": DeleteContentModalContent,
    "deleteComment": DeleteCommentModalContent
};

export function ModalProvider({ children }) {
    const [stack, setStack] = useState([]);

    const openModal = (type, props = {}) => {
        setStack(prev => [...prev, { type, props }]);
    }

    const openGiftModal = ({ gift, enhanceRank }) => {
        openModal("gift", { gift, enhanceRank });
    }

    const openSelectBuildModal = ({ onSelectBuild, allowDrafts = false }) => {
        openModal("selectBuild", { onSelectBuild, allowDrafts });
    }

    const openSelectMdPlanModal = ({ onSelectMdPlan, allowDrafts = false }) => {
        openModal("selectMdPlan", { onSelectMdPlan, allowDrafts });
    }

    const openDeleteContentModal = ({ targetType, targetId, title }) => {
        openModal("deleteContent", { targetType, targetId, title });
    }

    const openDeleteCommentModal = ({ targetType, commentId, commentBody, onDelete }) => {
        openModal("deleteComment", { targetType, commentId, commentBody, onDelete });
    }

    const closeModal = () => {
        setStack(prev => prev.slice(0, -1));
    };

    const exportFunctions = {
        openGiftModal,
        openSelectBuildModal,
        openSelectMdPlanModal,
        openDeleteContentModal,
        openDeleteCommentModal,
        closeModal
    }

    return <ModalContext.Provider value={exportFunctions}>
        {children}

        {stack.map((entry, index) => {
            const ModalComponent = MODAL_COMPONENTS[entry.type];

            return <ModalContainer key={index} isOpen={true} onClose={closeModal} index={index}>
                <ModalComponent {...entry.props} onClose={closeModal} />
            </ModalContainer>
        })}
    </ModalContext.Provider>;
}

export function useModal() {
    return useContext(ModalContext);
}