import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, Menu, X, Sun, Moon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/lib/supabase";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/checker", label: "Interaction Checker" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/cart-safety", label: "Cart Safety" },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();

  // ✅ AUTH STATE
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // ✅ CLOSE DROPDOWN ON OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      {" "}
      <div className="container flex h-16 items-center justify-between">
        {/* LOGO */}{" "}
        <Link
          to="/"
          className="flex items-center gap-2 font-heading text-xl font-bold text-primary"
        >
          {" "}
          <ShieldCheck className="h-7 w-7" />
          MediSafe AI{" "}
        </Link>
        {/* DESKTOP NAV */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                location.pathname === link.to
                  ? "text-primary bg-primary/5"
                  : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
        {/* RIGHT SIDE */}
        <div className="hidden items-center gap-3 md:flex">
          {/* THEME TOGGLE */}
          <button onClick={toggle} className="rounded-full p-2 hover:bg-muted">
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Moon className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {/* AUTH UI */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              {/* PROFILE BUTTON */}
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white overflow-hidden"
              >
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="profile"
                    className="w-9 h-9 object-cover"
                  />
                ) : (
                  user.email?.charAt(0).toUpperCase()
                )}
              </button>

              {/* DROPDOWN */}
              {open && (
                <div className="absolute right-0 mt-2 w-44 rounded-lg border bg-card shadow-lg p-2">
                  <p className="text-xs px-2 py-1 text-muted-foreground truncate">
                    {user.email}
                  </p>
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className="block w-full rounded-md px-2 py-2 text-sm hover:bg-muted"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setOpen(false);
                    }}
                    className="w-full text-left px-2 py-2 text-sm hover:bg-muted rounded-md"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Login
            </Link>
          )}
        </div>
        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden rounded-md p-2 hover:bg-muted"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>
      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="border-t bg-card px-4 pb-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted",
                location.pathname === link.to
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={toggle}
              className="rounded-full p-2 hover:bg-muted"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Moon className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {user ? (
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  setMobileOpen(false);
                }}
                className="flex-1 rounded-lg border px-4 py-2 text-sm"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-center text-sm text-primary-foreground"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
