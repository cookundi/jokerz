import { Link, useLocation } from "react-router-dom";

export function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-void/80 backdrop-blur-md border-b border-smoke/30">
      <div className="w-full mx-auto px-6 sm:px-10 flex items-center justify-between h-12">
        <Link
          to="/"
          className="font-[family-name:var(--font-pixel)] text-[15px] text-blood hover:text-bone transition-colors"
        >
          JOKERZ<span className="text-2xl">🤡</span>
        </Link>

        <div className="flex items-center gap-5 sm:gap-7">
          <NavLink to="/apply" active={pathname === "/apply"}>
            APPLY
          </NavLink>
          <NavLink to="/check" active={pathname === "/check"}>
            CHECK
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`
        font-[family-name:var(--font-silk)] text-[11px] sm:text-xs tracking-widest transition-colors
        ${active ? "text-bone" : "text-fog/60 hover:text-bone"}
      `}
    >
      {children}
    </Link>
  );
}
