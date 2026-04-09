import { Suspense } from "react";

export const metadata = {
    title: "My Posts | Limbus Company Tools",
    description: "View the user's content"
};

export default function MyPostsLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}