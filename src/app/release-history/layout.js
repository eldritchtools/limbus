const name = "Release History";
const desc = "View release history";
const path = "/release-history";

export const metadata = {
    title: name,
    description: desc,
    robots: {
        index: false,
        follow: true
    },
    alternates: {
        canonical: path
    },
    openGraph: {
        title: name,
        description: desc,
        url: path,
        type: "website",
    },

    twitter: {
        card: "summary",
        title: name,
        description: desc
    }
};

export default function ReleaseHistoryLayout({ children }) {
  return children;
}
