import { Suspense } from "react";

export const metadata = {
  title: "My Profile",
  description: "View the user's profile",
  robots: {
    index: false,
    follow: false
  }
};

export default function MyProfileLayout({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}