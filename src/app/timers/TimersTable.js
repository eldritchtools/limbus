import { useBreakpoint } from "@eldritchtools/shared-components";
import { useEffect, useState } from "react";

import { getNextDay, getNextDayOfWeek, kstToLocalTime } from "./timerFunc";
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

export function TimeString({ date }) {
    const { d, h, m, s } = useCountdown(date);
    return <span>{padDigit(d)}:{padDigit(h)}:{padDigit(m)}:{padDigit(s)}</span>;
}

export function isDaysAway(date, days) {
    const diff = date.getTime() - Date.now();
    if (diff < 0) return false;
    return Math.floor(diff / DAY) >= days;
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
            display: "flex", alignItems: "center",
            flexDirection: column ? "column" : "row", flex: 1, justifyContent: "center",
            pointerEvents: "none"
        }}
        {...tooltipProps}
    >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0.2rem", width: style.width }}>
            <span style={{ textAlign: "center", whiteSpace: "pre-wrap" }}>{title}</span>
            {src ? <BannerIcon path={src} style={style} /> : null}
        </div>
        <TimeComponent key={dateString} date={date} dateString={dateString} />
    </div>
}

export default function TimersTable({ timers }) {
    const timeLocal = kstToLocalTime("6AM");
    const { isMobile } = useBreakpoint();

    return <div style={{
        display: "flex", width: "max-content", overflowY: "hidden", alignItems: "start", justifyContent: "center",
        border: "1px var(--primary-border-color) solid", borderRadius: "0.5rem"
    }}
    >
        <div style={{ display: "flex", flexDirection: "column" }}>
            {timers?.season ?
                <TimerRow title={`Season ${getSeasonString(7)}`} src={timers.season.src} dateString={timers.season.endDate} column={isMobile} /> :
                null
            }
            <TimerRow title={`Daily Reset\n6AM KST • ${timeLocal} local`} date={getNextDay()} column={isMobile} />
            <TimerRow title={`Weekly Reset\n6AM KST • ${timeLocal} local`} date={getNextDayOfWeek(4)} column={isMobile} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
            {timers?.events?.main && <TimerRow title={timers.events.main.name} src={timers.events.main.src} dateString={timers.events.main.endDate} column={isMobile} />}
            {(timers?.events?.others ?? []).map((timer, i) => <TimerRow key={i} title={timer.name} src={timer.src} dateString={timer.endDate} column={isMobile} />)}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
            {timers?.banners?.main && <TimerRow title={timers.banners.main.name} src={timers.banners.main.src} dateString={timers.banners.main.endDate} column={isMobile} />}
            {(timers?.banners?.others ?? []).map((timer, i) => <TimerRow key={i} title={timer.name} src={timer.src} dateString={timer.endDate} column={isMobile} />)}
        </div>
    </div>
}

export function HomepageTimers() {
    const [timers, timersLoading] = useData("timers");
    const { isMobile } = useBreakpoint();

    if (timersLoading) return null;
    const timeLocal = kstToLocalTime("6AM");

    return <div style={{ display: "flex", flexWrap: "wrap", border: "1px var(--primary-border-color) solid", borderRadius: "0.5rem" }}>
        <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", flex: 1 }}>
            <TimerRow title={`Daily Reset\n6AM KST • ${timeLocal} local`} date={getNextDay()} column={true} />
            <TimerRow title={`Weekly Reset\n6AM KST • ${timeLocal} local`} date={getNextDayOfWeek(4)} column={true} />
        </div>
        {timers?.event ?
            <TimerRow title={timers.event.name} src={timers.event.src} dateString={timers.event.endDate} column={true} tooltip={"events"} /> :
            null
        }
        {timers?.feature ?
            <TimerRow title={timers.feature.name} src={timers.feature.src} dateString={timers.feature.endDate} column={true} tooltip={"banners"} /> :
            null
        }
    </div>
}
