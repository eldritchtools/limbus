import { useBreakpoint } from "@eldritchtools/shared-components";
import React, { useMemo } from "react";

import ItemCard from "./ItemCard";
import { itemsTypeMapping } from "./util";
import { useData } from "../components/DataProvider";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";

export default function ItemsView() {
    const [items, itemsLoading] = useData("rpg/items");
    const { isMobile } = useBreakpoint();

    const itemsMap = useMemo(() =>
        itemsLoading ? [] : Object.entries(items).reduce((acc, [id, item]) => {
            if (!(item.type in acc)) acc[item.type] = [id];
            else acc[item.type].push(id);
            return acc;
        }, {}),
        [items, itemsLoading]
    );

    if (itemsLoading) return <LoadingContentPageTemplate />

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
        {Object.entries(itemsTypeMapping).map(([key, label]) => <React.Fragment key={key}>
            <div style={{ fontSize: "1.1rem", fontWeight: "bold", borderBottom: "1px var(--secondary-border-color) solid", padding: "0.2rem", margin: "0.2rem" }}>
                {label}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 200 : 400}px, 1fr))`, width: "100%", gap: "0.2rem" }}>
                {itemsMap[key].map(id => <ItemCard key={id} id={id} item={items[id]} />)}
            </div>
        </React.Fragment>
        )}
    </div>
}