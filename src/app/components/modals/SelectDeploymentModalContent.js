"use client";

import { DndContext, PointerSensor, useSensor, useSensors, closestCenter, TouchSensor } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";

import DeploymentPositionOverlay from "../build/DeploymentPositionOverlay";
import IdentityIcon from "../icons/IdentityIcon";
import SinnerIcon from "../icons/SinnerIcon";
import { HorizontalDivider } from "../objects/Dividers";

import { deploymentColors } from "@/app/lib/colors";

const ALL_ITEMS = Array.from({ length: 12 }, (_, i) => i + 1);

function Tile({ id, identityId, activeItems, index, activeSinners, active, onClick }) {
    const { setNodeRef, attributes, listeners, transform, transition } = useSortable({ id });

    return <button ref={setNodeRef} {...attributes} {...listeners} onClick={onClick}
        style={{
            width: 64,
            height: 64,
            borderRadius: 12,
            border: `1px solid ${active ? (index < activeSinners ? deploymentColors.active : deploymentColors.backup) : "transparent"}`,
            opacity: active ? 1 : 0.7,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: active ? "grab" : "pointer",
            userSelect: "none",
            flexShrink: 0,
            transform: CSS.Transform.toString(transform),
            transition,
            position: "relative",
            touchAction: "none",
            padding: 0
        }}
    >
        {identityId ?
            <IdentityIcon id={identityId} style={{ width: "64px", height: "64px", borderRadius: 12 }} /> :
            <div style={{ width: "100%", aspectRatio: "1/1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <SinnerIcon num={id} style={{ width: "75%", height: "75%" }} />
            </div>
        }
        
        {active && <DeploymentPositionOverlay sinnerId={id} deploymentOrder={activeItems} activeSinners={activeSinners} />}
    </button>
}

export default function SelectDeploymentModalContent({ initialActive, identityIds, activeSinners, onSave }) {
    const [activeItems, setActiveItems] = useState(initialActive);

    const inactiveItems = useMemo(() =>
        ALL_ITEMS.filter(id => !activeItems.includes(id)),
        [activeItems]
    );

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 50, tolerance: 8 } })
    );

    const activate = id => {
        if (!activeItems.includes(id)) {
            const newList = [...activeItems, id];
            setActiveItems(newList);
            onSave(_ => newList);
        }
    }

    const deactivate = id => {
        const newList = activeItems.filter(x => x !== id);
        setActiveItems(newList);
        onSave(_ => newList);
    }

    const handleDragEnd = ({ active: dragged, over }) => {
        if (!over) return;

        const id = dragged.id;
        const overId = over.id;

        if (!activeItems.includes(id)) return;

        const oldIndex = activeItems.indexOf(id);
        const newIndex = activeItems.indexOf(overId);

        if (oldIndex !== -1 && newIndex !== -1) {
            const newList = arrayMove(activeItems, oldIndex, newIndex);
            setActiveItems(newList);
            onSave(_ => newList);
        }
    }

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "min(900px, 90vw)", padding: "0.5rem", boxSizing: "border-box" }}>
        <span className="title-text">Set Deployment Order</span>
        <span className="sub-text">Click to deploy. Drag to reorder.</span>
        <div style={{ height: "0.5rem" }} />
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={activeItems} strategy={rectSortingStrategy}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem", justifyContent: "center" }}>
                    {activeItems.map((id, index) =>
                        <Tile
                            key={id} id={id} identityId={identityIds[id - 1]} activeItems={activeItems} index={index} activeSinners={activeSinners}
                            active onClick={() => deactivate(id)}
                        />
                    )}
                </div>
            </SortableContext>
            <div style={{ height: "0.5rem" }} />
            <HorizontalDivider />
            <div style={{ height: "0.5rem" }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem", justifyContent: "center" }}>
                {inactiveItems.map(id =>
                    <Tile key={id} id={id} identityId={identityIds[id - 1]} active={false} onClick={() => activate(id)} />
                )}
            </div>
        </DndContext>
    </div>;
}