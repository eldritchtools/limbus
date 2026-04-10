import { useBreakpoint } from "@eldritchtools/shared-components";

import MdPlan from "../contentCards/MdPlan";

export default function MdPlansSearchDisplay({ plans, complete = true, clickOverride }) {
    const { isMobile } = useBreakpoint();

    return <div style={{
        display: "grid", gridTemplateColumns: `repeat(auto-fill, 300px)`,
        gap: isMobile ? "0.2rem" : "0.5rem", justifyContent: "center"
    }}>
        {plans.map(plan => <div key={plan.id} onClick={clickOverride ? () => clickOverride(plan) : undefined}>
            <MdPlan plan={plan} complete={complete} clickable={!clickOverride} />
        </div>)}
    </div>
}
