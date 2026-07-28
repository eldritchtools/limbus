import { Suspense } from "react";

const name = "Community Assets";
const desc = "Upload emotes and stickers for the community to use across the site."
const path = "/community-assets";

export const metadata = {
  title: name,
  description: desc,
  robots: {
    index: false,
    follow: false
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

export default function CommunityAssetsLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}