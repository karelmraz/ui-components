const LINKS = ['Platform', 'Pricing', 'Docs'];

export function MainNav() {
  return (
    <nav className="hidden items-center gap-7 text-[15px] md:flex">
      {LINKS.map((link) => (
        <span key={link} className="navlink">
          {link}
        </span>
      ))}
    </nav>
  );
}
