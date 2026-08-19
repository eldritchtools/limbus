"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import CreatorsDirectoryTab from "./CreatorsDirectoryTab";
import CreatorsManageTab from "./CreatorsManageTab";
import CreatorsRequestTab from "./CreatorsRequestTab";
import NoPrefetchLink from "../components/NoPrefetchLink";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { useAuth } from "../database/authProvider";

export default function CreatorsPage() {
    const { profile } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const tab = searchParams.get("tab") ?? "directory";
    const search = searchParams.get("search") ?? "";
    const tagsParam = searchParams.get("tags");
    const tagIds = tagsParam ? tagsParam.split(",").map(Number).filter(Number.isInteger) : [];
    const varietyParam = searchParams.get("variety");
    const isVariety = varietyParam === null ? "all" : varietyParam;

    const setParams = updates => {
        const params = new URLSearchParams(searchParams);

        for (const [key, value] of Object.entries(updates)) {
            if (value === null || value === undefined || value === "") params.delete(key);
            else params.set(key, value);
        }

        router.push(`${pathname}?${params.toString()}`);
    };

    const setTab = newTab => {
        setParams({ tab: newTab === "directory" ? null : newTab });
    };

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>
            Creator Directory
        </h1>
        <p style={{ margin: 0 }}>
            Find creators who make content related to Project Moon games. Search by creator name, creator type, or the kinds of content they make.
        </p>
        <p className="sub-text" style={{ margin: 0, maxWidth: "min(1200px, 100%)" }}>
            This is a directory of known creators who make content related to Project Moon games. For the purposes of this directory, Project Moon content means content where a Project Moon game is a primary focus. A passing mention or a brief look at a game does not qualify. Any creator who makes Project Moon content is eligible to be included. Search results are randomized to give creators a fair chance of being seen rather than favoring any particular creator.
            <br /><br />
            Being listed in this directory is <strong>not an endorsement or ranking</strong> by the site. This directory does not make any judgment about a creator&apos;s popularity, reputation, or standing within the community. The only creators specifically endorsed by the site are those listed on the <NoPrefetchLink className="text-link" href={"/support"}>Support page</NoPrefetchLink>.
            <br /><br />
            Creator tags are based on submissions from users and are intended to describe the types of content a creator makes. If you think a creator&apos;s tags are inaccurate or incomplete, you can submit your own set of tags using the + button on their creator card (login required).
            <br /><br />
            If a creator is missing from the directory, or you notice that their information is outdated, you can submit an Add/Update request through the Request tab. The Request tab is only for adding or updating creators. Suggestions such as new features or more tags can be submitted through Discord or the <NoPrefetchLink className="text-link" href={"/feedback"}>Feedback page</NoPrefetchLink>. If you are a creator listed in the directory and would like your listing removed, please contact me directly through Discord or contact@eldritchtools.com. 
        </p>

        <div style={{ display: "flex", gap: "1rem" }}>
            <div
                {...getGeneralTooltipProps("Search for creators in the directory")}
                className={`tab-header ${tab === "directory" ? "active" : ""}`} onClick={() => setTab("directory")}
            >
                Directory
            </div>
            <div
                {...getGeneralTooltipProps("Submit a request for a creator to be added or updated")}
                className={`tab-header ${tab === "request" ? "active" : ""}`} onClick={() => setTab("request")}
            >
                Request
            </div>
            {profile && profile.is_admin &&
                <div className={`tab-header ${tab === "manage" ? "active" : ""}`} onClick={() => setTab("manage")}>Manage</div>
            }
        </div>

        {tab === "directory" &&
            <CreatorsDirectoryTab search={search} tagIds={tagIds} isVariety={isVariety} setParams={setParams} />
        }

        {tab === "request" &&
            <CreatorsRequestTab />
        }

        {tab === "manage" && profile && profile.is_admin &&
            <CreatorsManageTab />
        }
    </div>
}