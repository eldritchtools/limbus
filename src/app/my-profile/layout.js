import { Suspense } from "react";

export const metadata = {
    title: "My Profile | Limbus Company Tools",
    description: "View the user's content or edit their profile details"
};

export default function ProfileLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}