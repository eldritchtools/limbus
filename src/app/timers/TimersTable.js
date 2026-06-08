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

function TimeComponent({ date, dateString, label = "Date"}) {
    if (dateString && dateString.includes("?"))
        return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem", alignItems: "center" }}>
            <span>{label}: {dateString}</span>
            <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>??:??:??:??</span>
        </div>

    if (date) {
        const target = date;
        const krDate = new Date(date);
        krDate.setHours(krDate.getHours() + 9);
        const y = krDate.getUTCFullYear();
        const m = krDate.getUTCMonth() + 1;
        const d = krDate.getUTCDate();
        return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem", alignItems: "center" }}>
            <span>{label}: {y}-{padDigit(m)}-{padDigit(d)}</span>
            <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}><TimeString date={target} /></span>
        </div>
    } else {
        const [y, m, d] = dateString.split("-").map(Number);
        const target = new Date(Date.UTC(y, m - 1, d, 1, 0, 0)); // 10AM KST
        return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem", alignItems: "center" }}>
            <span>{label}: {dateString}</span>
            <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}><TimeString date={target} /></span>
        </div>
    }
}

export function TimerRow({ title, src, date, startDate, endDate, column = false, tooltip }) {
    const { isMobile } = useBreakpoint();
    const style = isMobile ?
        { width: "170px", height: "75px" } :
        { width: "280px", height: "120px" };

    const tooltipProps = tooltip ? getTimerTooltipProps(tooltip) : {};

    const timeComponent = useMemo(() => {
        if(startDate && endDate) {
            const [y, m, d] = startDate.split("-").map(Number);
            const start = new Date(Date.UTC(y, m - 1, d, 1, 0, 0));
            const diff = start.getTime() - Date.now();

            if(diff <= 0) return <TimeComponent dateString={endDate} label={"End Date"} />;
            else return <TimeComponent dateString={startDate} label={"Start Date"} />;
        } else if (startDate) {
            return <TimeComponent dateString={startDate} label={"Start Date"} />;
        } else if (endDate) {
            return <TimeComponent dateString={endDate} label={"End Date"} />;
        } else {
            return <TimeComponent date={date} label={"Reset Date"} />;
        }
    }, [date, startDate, endDate]);

    return <div
        style={{
            display: "flex", alignItems: "center",
            flexDirection: column ? "column" : "row", flex: 1, justifyContent: "center"
        }}
        {...tooltipProps}
    >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0.2rem", width: style.width, pointerEvents: "none" }}>
            <span style={{ textAlign: "center", whiteSpace: "pre-wrap" }}>{title}</span>
            {src ? <BannerIcon path={src} style={style} /> : null}
        </div>
        {timeComponent}
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
                <TimerRow title={`Season ${getSeasonString(7)}`} src={timers.season.src} endDate={timers.season.endDate} column={isMobile} /> :
                null
            }
            <TimerRow title={`Daily Reset\n6AM KST • ${timeLocal} local`} date={getNextDay()} column={isMobile} />
            <TimerRow title={`Weekly Reset\n6AM KST • ${timeLocal} local`} date={getNextDayOfWeek(4)} column={isMobile} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
            {timers?.events?.main && <TimerRow title={timers.events.main.name} src={timers.events.main.src} startDate={timers.events.main.startDate} endDate={timers.events.main.endDate} column={isMobile} />}
            {(timers?.events?.others ?? []).map((timer, i) => <TimerRow key={i} title={timer.name} src={timer.src} startDate={timer.startDate} endDate={timer.endDate} column={isMobile} />)}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
            {timers?.banners?.main && <TimerRow title={timers.banners.main.name} src={timers.banners.main.src} startDate={timers.banners.main.startDate} endDate={timers.banners.main.endDate} column={isMobile} />}
            {(timers?.banners?.others ?? []).map((timer, i) => <TimerRow key={i} title={timer.name} src={timer.src} startDate={timer.startDate} endDate={timer.endDate} column={isMobile} />)}
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
        {timers?.events ?
            <TimerRow title={timers.events.main.name} src={timers.events.main.src} startDate={timers.events.main.startDate} endDate={timers.events.main.endDate} column={true} tooltip={"events"} /> :
            null
        }
        {timers?.banners ?
            <TimerRow title={timers.banners.main.name} src={timers.banners.main.src} startDate={timers.banners.main.startDate} endDate={timers.banners.main.endDate} column={true} tooltip={"banners"} /> :
            null
        }
    </div>
}
