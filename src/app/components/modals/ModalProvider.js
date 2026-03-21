import { createContext, useState } from "react";
import ModalContainer from "./ModalContainer";
import GiftModalContent from "./GiftModalContent";

const ModalContext = createContext();

const MODAL_COMPONENTS = {
    gift: GiftModalContent
};

export function ModalProvider({ children }) {
    const [stack, setStack] = useState([]);

    const openModal = (type, props = {}) => {
        setStack(prev => [...prev, { type, props }]);
    }

    const openGiftModal = ({ gift, enhanceRank }) => {
        openModal("gift", { gift, enhanceRank });
    }

    const closeModal = () => {
        setStack(prev => prev.slice(0, -1));
    };

    return (
        <ModalContext.Provider value={{ openGiftModal }}>
            {children}

            {stack.map((entry, index) => {
                const ModalComponent = MODAL_COMPONENTS[entry.type];

                <ModalContainer key={index} isOpen={true} onClose={closeModal} index={index}>
                    <ModalComponent {...entry.props} />
                </ModalContainer>
            })}
        </ModalContext.Provider>
    );
}

export function useModal() {
    return useContext(ModalContext);
}