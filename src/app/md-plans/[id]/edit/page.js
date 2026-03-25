"use client";

import React from "react";

import MdPlanEditor from "@/app/components/editors/MdPlanEditor";

export default function EditMdPlanPage({params}) {
    const { id } = React.use(params);
    return <MdPlanEditor mode="edit" mdPlanId={id} />;
}
