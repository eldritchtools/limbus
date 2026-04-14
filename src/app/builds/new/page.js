"use client";

import { useSearchParams } from "next/navigation";

import BuildEditor from "@/app/components/editors/BuildEditor";

export default function NewBuild() {
  const searchParams = useSearchParams().entries().reduce((acc, [f, v]) => {
    if (f === "teamCode") acc["initTeamCode"] = v;
    return acc;
  }, {});

  return <BuildEditor mode="create" {...searchParams} />;
}
