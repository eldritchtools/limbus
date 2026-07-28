export const metadata = {
  title: "MD Plans",
  description: "Browse md plans",
  alternates: {
      canonical: "/md-plans/search"
  },
  robots: {
    index: false,
    follow: true
  }
};

export default function SearchMdPlansLayout({ children }) {
  return <>{children}</>;
}
