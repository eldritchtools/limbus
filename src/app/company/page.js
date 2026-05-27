"use client";


import CompanyDisplay from "../components/company/CompanyDisplay";

export default function CompanyPage() {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Company</h1>
        <span style={{ maxWidth: "1000px", textAlign: "center" }}>Select the Identities and E.G.O you own. These will be displayed on your profile and can be used to filter results in team builds and other tools.</span>
        <span className="sub-text">Changes are automatically saved after a few seconds of inactivity or you can manually save below.</span>
        <CompanyDisplay editable={true} />
    </div>
}


