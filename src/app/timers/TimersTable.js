import { useBreakpoint } from "@eldritchtools/shared-components";
import React, { useEffect, useState } from "react";

import { useData } from "../components/DataProvider";
import BannerIcon from "../components/icons/BannerIcon";
import { getTimerTooltipProps } from "../components/tooltips/TimerTooltip";
import { getSeasonString } from "../lib/constants";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function useCountdown(target) {
    const getTimeLeft = () => {
        const diff = target.getTime() - Date.now();

        if (diff <= 0) {
            return { d: 0, h: 0, m: 0, s: 0 };
        }

        const d = Math.floor(diff / DAY);
        const h = Math.floor((diff / HOUR) % 24);
        const m = Math.floor((diff / MINUTE) % 60);
        const s = Math.floor((diff / SECOND) % 60);

        return { d, h, m, s };
    };

    const [time, setTime] = useState(getTimeLeft);

    useEffect(() => {
        const id = setInterval(() => {
            setTime(getTimeLeft());
        }, 1000);

        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target]);

    return time;
}

function padDigit(num) {
    return num.toString().padStart(2, "0");
}

function TimeString({ date }) {
    const { d, h, m, s } = useCountdown(date);
    return <span>{padDigit(d)}:{padDigit(h)}:{padDigit(m)}:{padDigit(s)}</span>;
}

function TimeComponent({ date, dateString }) {
    if (dateString && dateString.includes("?"))
        return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem", alignItems: "center" }}>
            <span>End Date: {dateString}</span>
            <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>??:??:??:??</span>
        </div>

    if (date) {
        const target = date;
        const y = date.getUTCFullYear();
        const m = date.getUTCMonth() + 1;
        const d = date.getUTCDate();
        return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem", alignItems: "center" }}>
            <span>End Date: {y}-{padDigit(m)}-{padDigit(d)}</span>
            <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}><TimeString date={target} /></span>
        </div>
    } else {
        const [y, m, d] = dateString.split("-").map(Number);
        const target = new Date(Date.UTC(y, m - 1, d, 1, 0, 0)); // 10AM KST
        return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem", alignItems: "center" }}>
            <span>End Date: {dateString}</span>
            <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}><TimeString date={target} /></span>
        </div>
    }

}

export function TimerRow({ title, src, date, dateString, column = false, tooltip }) {
    const { isMobile } = useBreakpoint();
    const style = isMobile ?
        { width: "170px", height: "75px" } :
        { width: "280px", height: "120px" };

    const tooltipProps = tooltip ? getTimerTooltipProps(tooltip) : {};

    return <div
        style={{
            display: "flex", border: "1px #777 solid", alignItems: "center",
            flexDirection: column ? "column" : "row", flex: 1, justifyContent: "center"
        }}
        {...tooltipProps}
    >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: isMobile ? "0.2rem" : "0.5rem", width: style.width }}>
            <span>{title}</span>
            {src ? <BannerIcon path={src} style={style} /> : null}
        </div>
        <TimeComponent date={date} dateString={dateString} />
    </div>
}

function getNextDay() {
    const SHIFT = 3 * 60 * 60 * 1000; // 6AM KST

    const adjusted = new Date((new Date()).getTime() + SHIFT);

    adjusted.setUTCHours(0, 0, 0, 0);
    adjusted.setUTCDate(adjusted.getUTCDate() + 1);

    return new Date(adjusted.getTime() - SHIFT);
}

function getNextThurs() {
    const SHIFT = 3 * 60 * 60 * 1000; // 6AM KST

    const adjusted = new Date((new Date()).getTime() + SHIFT);
    const currentDay = adjusted.getUTCDay();

    let diff = (4 - currentDay + 7) % 7;
    if (diff === 0) diff = 7;

    adjusted.setUTCDate(adjusted.getUTCDate() + diff);
    adjusted.setUTCHours(0, 0, 0, 0);

    return new Date(adjusted.getTime() - SHIFT);
}

export default function TimersTable({ timers }) {
    return <div style={{ display: "flex", flexDirection: "column", overflowX: "auto", maxWidth: "95vw", border: "1px #aaa solid", borderRadius: "0.5rem" }}>
        {timers?.season ?
            <TimerRow title={`Season ${getSeasonString(7)}`} src={timers.season.src} dateString={timers.season.endDate} /> :
            null
        }
        <TimerRow title={"Daily Reset (6AM KST)"} date={getNextDay()} />
        <TimerRow title={"Weekly Reset (6AM KST)"} date={getNextThurs()} />
        {timers?.event ?
            <TimerRow title={timers.event.name} src={timers.event.src} dateString={timers.event.endDate} /> :
            null
        }
        {timers?.feature ?
            <TimerRow title={timers.feature.name} src={timers.feature.src} dateString={timers.feature.endDate} /> :
            null
        }
        {timers?.target ?
            <TimerRow title={timers.target.name} src={timers.target.src} dateString={timers.target.endDate} /> :
            null
        }
    </div>
}

export function HomepageTimers() {
    const [timers, timersLoading] = useData("timers");
    const { isMobile } = useBreakpoint();

    if (timersLoading) return null;

    return <div style={{ display: "flex", flexWrap: "wrap", border: "1px #aaa solid", borderRadius: "0.5rem" }}>
        <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", flex: 1 }}>
            <TimerRow title={"Daily Reset (6AM KST)"} date={getNextDay()} column={true} />
            <TimerRow title={"Weekly Reset (6AM KST)"} date={getNextThurs()} column={true} />
        </div>
        {timers?.event ?
            <TimerRow title={timers.event.name} src={timers.event.src} dateString={timers.event.endDate} column={true} tooltip={"event"} /> :
            null
        }
        {timers?.feature ?
            <TimerRow title={timers.feature.name} src={timers.feature.src} dateString={timers.feature.endDate} column={true} tooltip={"feature"} /> :
            null
        }
    </div>
}
