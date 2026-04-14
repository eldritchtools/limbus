"use client";

import { useSearchParams } from "next/navigation";

import MdPlanEditor from "@/app/components/editors/MdPlanEditor";

export default function NewMdPlanPage() {
  const searchParams = useSearchParams().entries().reduce((acc, [f, v]) => {
    if(f === "difficulty") acc["initDifficulty"] = v;
    else if(f === "floors") acc["initFloors"] = v.split(",");
    return acc;
  }, {});

  return <MdPlanEditor mode="create" {...searchParams} />;
}
