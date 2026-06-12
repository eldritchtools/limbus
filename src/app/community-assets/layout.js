import { Suspense } from "react";

export const metadata = {
  title: "Community Assets",
  description: "Upload emotes and stickers for the community to use across the site.",
  robots: {
    index: false,
    follow: false
  }
};

export default function CommunityAssetsLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}