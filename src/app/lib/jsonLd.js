const ORG_ID = "https://eldritchtools.com/#organization";
const SITE_ID = "https://limbus.eldritchtools.com/#website";

export function getOrganizationSchema() {
    return {
        "@type": "Organization",
        "@id": ORG_ID,
        "name": "Eldritch Tools",
        "url": "https://eldritchtools.com"
    };
}

export function getWebsiteSchema() {
    return {
        "@type": "WebSite",
        "@id": SITE_ID,
        "url": "https://limbus.eldritchtools.com",
        "name": "Limbus Company Tools",
        "description": "Community-driven tools and reference resources for Limbus Company.",
        "publisher": {
            "@id": ORG_ID
        }
    };
}

export function getAppSchema({ url, name, description }) {
    return {
        "@type": "SoftwareApplication",
        "@id": `${url}#app`,
        "name": name,
        "url": url,
        "operatingSystem": "All",
        "applicationCategory": "GameApplication",
        "description": description,
        "author": {
            "@id": ORG_ID
        },
        "isPartOf": {
            "@id": SITE_ID
        },
        "about": {
            "@type": "VideoGame",
            "name": "Limbus Company"
        }
    };
}

export function getWebPageSchema({ title, description, url }) {
    return {
        "@type": "WebPage",
        "name": title,
        "description": description,
        "url": url,
        "isPartOf": {
            "@id": SITE_ID
        }
    };
}

export function getArticleSchema({ targetType, targetId, title, username, description, published_at, updated_at }) {
    const result = {
        "@type": "Article",
        "@id": `https://limbus.eldritchtools.com/${targetType}/${targetId}`,
        "headline": title,
        "url": `https://limbus.eldritchtools.com/${targetType}/${targetId}`,
        "publisher": {
            "@id": "https://limbus.eldritchtools.com/#organization"
        },
        "isPartOf": {
            "@id": "https://limbus.eldritchtools.com/#website"
        }
    }

    if (published_at) result.datePublished = published_at;
    if (updated_at) result.dateModified = updated_at;
    if (username) result.author = { "@type": "Person", "name": username };
    if (description) result.description = description;

    return result
}

export default function JsonLd({ data }) {
    return <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />;
}