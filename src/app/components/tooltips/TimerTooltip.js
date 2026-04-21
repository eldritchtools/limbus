"use client";

import { useData } from "../DataProvider";
import TooltipTemplate from "./TooltipTemplate";

import { TimerRow } from "@/app/timers/TimersTable";

const TOOLTIP_ID = "timer-tooltip";

function TimerTooltipContent({ timers }) {
    return <div style={{display: "flex", flexDirection: "column"}}>
        {timers.map((timer, i) => <TimerRow key={i} title={timer.name} src={timer.src} dateString={timer.endDate} />)}
    </div>
}

function TooltipLoader({ type }) {
    const [timers, timersLoading] = useData("timers");
    if (timersLoading) return null;

    const timerObjs = Object.values(timers).filter(x => x.sub === type);
    if(timerObjs.length === 0) return null;

    return <TimerTooltipContent timers={timerObjs} />
}

export default function TimerTooltip() {
    return <TooltipTemplate id={TOOLTIP_ID} contentFunc={type => <TooltipLoader type={type} />} />
}

export function getTimerTooltipProps(type) {
    return {
        "data-tooltip-id": TOOLTIP_ID,
        "data-tooltip-content": type
    }
}