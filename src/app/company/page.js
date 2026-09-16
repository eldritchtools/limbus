"use client";


import CompanyDisplay from "../components/company/CompanyDisplay";

export default function CompanyPage() {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Company</h1>
        <span style={{ maxWidth: "1000px", textAlign: "center" }}>Keep track of everything you own in-game and share it with others.</span>
        <p className="sub-text" style={{ margin: 0, alignSelf: "center", textAlign: "center", maxWidth: "1280px" }}>
            Keep track of the Identities, E.G.O, Announcers, and Façades you own. Your Company is displayed on your profile and can be used to filter results in team builds and other tools.
            <br /><br />
            You can also add items to your wishlist to keep track of things you plan to obtain. Both owned and unowned items can be searched and filtered by ownership status, Sinner, keywords, rank, and other available criteria.
            <br /><br />
            The Advanced Options provide more detailed ways to sort and filter your collection and wishlist based on the properties of the selected items. Display options let you choose which types of items are shown, so you can focus on the parts of your collection that you are interested in.
            <br /><br />
            Changes to your Company are saved automatically after a few seconds of inactivity, or can be saved manually.
        </p>
        <CompanyDisplay editable={true} />
    </div>
}


