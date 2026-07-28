export const metadata = {
  title: "Collections",
  description: "Browse collections of content managed by users",
  alternates: {
      canonical: "/collections/search"
  },
  robots: {
    index: false,
    follow: true
  }
};

export default function SearchCollectionsLayout({ children }) {
  return <>{children}</>;
}
