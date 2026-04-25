import { Suspense } from "react";

export const metadata = {
    title: "My Profile | Limbus Company Tools",
    description: "View the user's profile"
};

export default function MyProfileLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}