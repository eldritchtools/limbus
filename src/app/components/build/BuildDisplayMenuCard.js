import { useBreakpoint } from "@eldritchtools/shared-components";

import styles from "./BuildDisplay.module.css";

export default function BuildDisplayMenuCard({ children }) {
    const {isMobile} = useBreakpoint();
    return <div 
        className={`panel-container ${styles.buildDisplayMenuCard}`} 
        style={{width: isMobile ? "180px" : "240px", height: isMobile ? "100px" : "120px"}}
    >
        {children}
    </div>
}