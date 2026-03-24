"use client";

import React from "react";

import BuildEditor from "@/app/components/editors/BuildEditor";

export default function EditBuildPage({params}) {
    const { id } = React.use(params);
    return <BuildEditor mode="edit" buildId={id} />;
}
