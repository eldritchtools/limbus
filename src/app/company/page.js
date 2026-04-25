"use client";


import CompanyDisplay from "../components/company/CompanyDisplay";

export default function CompanyPage() {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
        <h2 style={{ margin: 0 }}>Company</h2>
        <span style={{ maxWidth: "1000px", textAlign: "center" }}>Set the identities and E.G.Os you own. This will appear on your profile page if set. You can also use it to filter team builds when searching. Changes are automatically saved after a few seconds of inactivity, but you can also manually trigger a save.</span>
        <CompanyDisplay editable={true} />
    </div>
}
