import ProtectedRoute from "@/app/database/ProtectedRoute";

export const metadata = {
    title: "Setup",
    description: "Setup steps for a user's account on login"
};

export default function UsernameSetupLayout({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
