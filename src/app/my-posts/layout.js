import { Suspense } from "react";

export const metadata = {
  title: "My Posts",
  description: "View the user's content",
  robots: {
    index: false,
    follow: false
  }
};

export default function MyPostsLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}