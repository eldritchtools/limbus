import { Suspense } from "react";

export const metadata = {
    title: "My Profile | Limbus Company Tools",
    description: "Edit the user's profile details"
};

export default function MyProfileLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}