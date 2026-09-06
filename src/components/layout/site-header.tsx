import Link from "next/link";

const navigationItems = [
  { href: "/", label: "Overview" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/interactive", label: "Interactive hub" },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="Atlas home">
        <span aria-hidden="true">◆</span> ATLAS
      </Link>
      <nav aria-label="Primary navigation">
        <ul className="site-nav">
          {navigationItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
