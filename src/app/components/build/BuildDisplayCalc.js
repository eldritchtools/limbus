"use client";

import { useState } from "react";

import { BuildDisplayMain } from "./BuildDisplay";
import BuildDisplayCalcMenu from "./BuildDisplayCalcMenu";

export default function BuildDisplayCalc({ ...props }) {
    const [otherOpts, setOtherOpts] = useState({});

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
        <BuildDisplayCalcMenu opts={otherOpts} setOpts={setOtherOpts} />

        <BuildDisplayMain otherOpts={otherOpts} {...props} />
    </div>
}