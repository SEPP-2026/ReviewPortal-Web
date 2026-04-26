"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Phone, ChevronDown } from "lucide-react";

const NAV_LINKS = [
  { name: "Home", href: "/" },
  {
    name: "Equipment",
    href: "/equipment",
    submenu: [
      { name: "All Equipment", href: "/equipment" },
      { name: "Construction", href: "/equipment?category=construction" },
      { name: "Landscaping", href: "/equipment?category=landscaping" },
      { name: "Plumbing", href: "/equipment?category=plumbing" },
      { name: "Electrical", href: "/equipment?category=electrical" },
      { name: "Decorating", href: "/equipment?category=decorating" },
    ],
  },
  { name: "Services", href: "/services" },
  { name: "Pricing", href: "/pricing" },
  { name: "Reviews", href: "/reviews" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAuthResolved, setIsAuthResolved] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          if (isMounted) setUserName(null);
          return;
        }

        const data = (await response.json()) as { name?: string };
        if (isMounted) setUserName(data?.name || null);
      } catch {
        if (isMounted) setUserName(null);
      } finally {
        if (isMounted) setIsAuthResolved(true);
      }
    };

    loadUser();

    const handleAuthChange = () => {
      loadUser();
    };

    window.addEventListener("auth:changed", handleAuthChange);

    return () => {
      isMounted = false;
      window.removeEventListener("auth:changed", handleAuthChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      document.cookie = "rp_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setUserName(null);
      window.dispatchEvent(new Event("auth:changed"));
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top Bar */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <span className="hidden sm:inline text-gray-400">
              Mon - Sat: 7:00 AM - 6:00 PM
            </span>
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-accent" />
              <a href="tel:+1234567890" className="font-semibold hover:text-accent transition-colors">
                +1 (234) 567-890
              </a>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-gray-300">
            {isAuthResolved && userName ? (
              <>
                <span className="text-white">Hi, {userName}</span>
                <span className="text-gray-600">|</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="hover:text-accent transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-accent transition-colors">
                  Login
                </Link>
                <span className="text-gray-600">|</span>
                <Link href="/register" className="hover:text-accent transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-xl">ST</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-black font-bold text-xl">Shelton</span>
                <span className="text-accent font-bold text-xl"> Tool-Hire</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => link.submenu && setActiveDropdown(link.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-1 text-[#111111] hover:text-accent transition-colors duration-200 font-medium"
                  >
                    {link.name}
                    {link.submenu && <ChevronDown className="w-4 h-4" />}
                  </Link>
                  {link.submenu && activeDropdown === link.name && (
                    <div className="absolute top-full left-0 pt-2">
                      <div className="bg-white border border-gray-200 rounded-lg py-2 min-w-[200px] shadow-xl">
                        {link.submenu.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className="block px-4 py-2 text-[#666666] hover:text-accent hover:bg-gray-50 transition-colors duration-200"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center gap-4">
              <Link
                href="/equipment"
                className="bg-accent hover:bg-accent-dark text-black font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
              >
                Rent Equipment
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-black"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              {NAV_LINKS.map((link) => (
                <div key={link.name}>
                  <Link
                    href={link.href}
                    className="block py-3 text-[#111111] hover:text-accent transition-colors duration-200 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                  {link.submenu && (
                    <div className="pl-4 border-l border-gray-200 ml-2">
                      {link.submenu.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className="block py-2 text-[#666666] hover:text-accent transition-colors duration-200 text-sm"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-gray-200">
                {isAuthResolved && userName ? (
                  <div className="flex items-center justify-between pb-4">
                    <span className="text-sm text-[#111111]">Hi, {userName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-sm text-accent font-semibold"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 pb-4 text-sm">
                    <Link
                      href="/login"
                      className="text-[#111111] hover:text-accent transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <span className="text-gray-400">|</span>
                    <Link
                      href="/register"
                      className="text-[#111111] hover:text-accent transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </div>
                )}
                <Link
                  href="/equipment"
                  className="block w-full bg-accent hover:bg-accent-dark text-black font-semibold px-6 py-3 rounded-lg text-center transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Rent Equipment
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
