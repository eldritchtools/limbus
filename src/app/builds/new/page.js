"use client";

import { useSearchParams } from "next/navigation";

import BuildEditor from "@/app/components/editors/BuildEditor";

export default function NewBuild() {
  const searchParams = useSearchParams().entries().reduce((acc, [f, v]) => {
    if (f === "teamCode") acc["initTeamCode"] = v;
    if (f === "identityIds") acc["initIdentityIds"] = v.split(",");
    return acc;
  }, {});

  return <BuildEditor mode="create" {...searchParams} />;
}
