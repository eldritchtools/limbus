import Link from "next/link"

export default function NoPrefetchLink(props) {
  return <Link {...props} prefetch={false} />
}