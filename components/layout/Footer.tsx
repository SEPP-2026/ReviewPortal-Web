"use client";

import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
} from "lucide-react";

const FOOTER_LINKS = {
  equipment: [
    { name: "Construction Equipment", href: "/equipment?category=construction" },
    { name: "Landscaping Tools", href: "/equipment?category=landscaping" },
    { name: "Plumbing Equipment", href: "/equipment?category=plumbing" },
    { name: "Electrical Tools", href: "/equipment?category=electrical" },
    { name: "Decorating Tools", href: "/equipment?category=decorating" },
    { name: "Cleaning Equipment", href: "/equipment?category=cleaning" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Our Services", href: "/services" },
    { name: "Pricing Plans", href: "/pricing" },
    { name: "Customer Reviews", href: "/reviews" },
    { name: "Contact Us", href: "/contact" },
    { name: "FAQ", href: "/faq" },
  ],
  support: [
    { name: "Help Center", href: "/help" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Rental Agreement", href: "/rental-agreement" },
    { name: "Damage Policy", href: "/damage-policy" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-slate-900">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <Link href="/" className="inline-flex mb-4">
              {/* Logo artwork has a light background, so frame it on the dark
                  footer with a rounded white card. */}
              <img
                src="/logo.png"
                alt="Shelton Tool-Hire"
                className="h-16 w-auto rounded-md bg-white p-1.5"
              />
            </Link>
            <p className="text-sm text-slate-400 mb-5 leading-relaxed">
              Your trusted partner for professional tool and equipment rentals.
              Quality machinery for every project, big or small.
            </p>
            <div className="flex gap-2">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-8 h-8 bg-white/5 border border-white/10 rounded-md flex items-center justify-center text-slate-400 hover:text-white hover:border-white/30 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Equipment Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Our equipment</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.equipment.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Contact us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <span className="text-slate-400">
                  123 Industrial Park Road
                  <br />
                  Shelton, CT 06484
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href="tel:+1234567890"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href="mailto:info@sheltontoolhire.com"
                  className="text-slate-400 hover:text-white transition-colors break-all"
                >
                  info@sheltontoolhire.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <span className="text-slate-400">
                  Mon – Sat: 7:00 AM – 6:00 PM
                  <br />
                  Sunday: Closed
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-slate-500">
              © 2026 Shelton Tool-Hire. All rights reserved.
            </p>
            <div className="flex gap-5 text-xs">
              {FOOTER_LINKS.support.slice(0, 3).map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
