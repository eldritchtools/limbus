import React from "react";

import { BuildDisplaySection } from "./BuildPageComponents";

import MarkdownRendererServer from "@/app/components/markdown/MarkdownRendererServer";
import ImageCarousel from "@/app/components/objects/ImageCarousel";
import ContentPageTemplate, { LoadingContentPageTemplate } from "@/app/components/pageTemplates/ContentPageTemplate";
import { decodeBuildExtraOpts } from "@/app/lib/buildExtraOpts";
import { YouTubeThumbnailEmbed } from "@/app/lib/youtube";

export default function BuildPage({ id, build }) {
    if(!build) return <LoadingContentPageTemplate />

    const { addedIcons } = decodeBuildExtraOpts(build.extra_opts, ["ai"]);

    return <ContentPageTemplate
        targetType={"build"} targetId={id} content={build}
        keywordIcons={build.keyword_ids}
        addedIcons={addedIcons ?? []}
        actions={["like", "save", "share", "edit", "delete"]}
    >
        <BuildDisplaySection build={build} />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {build?.body?.length > 0 && <>
                <span style={{ fontSize: "1.2rem" }}>Description</span>
                <div>
                    <MarkdownRendererServer content={build.body} />
                </div>
            </>
            }
            {build?.image_ids?.length > 0 && <>
                <span style={{ fontSize: "1.2rem" }}>Images</span>
                <ImageCarousel imageIds={build.image_ids} />
            </>
            }
            {build.youtube_video_id ?
                <div style={{ display: "flex", paddingTop: "1rem", alignSelf: "center", width: "100%", justifyContent: "center" }}>
                    <YouTubeThumbnailEmbed videoId={build.youtube_video_id} />
                </div> :
                null
            }
        </div>
    </ContentPageTemplate>
}
