"use client";

import { useEffect, useState } from "react";
import { profile } from "@/data/profile";

const anchors = [
  { label: "JOURNEY", href: "#journey" },
  { label: "WORK", href: "#projects" },
  { label: "OFF DUTY", href: "#altitude", hideOnMobile: true },
  { label: "CONTACT", href: "#contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-line bg-bg/80 backdrop-blur-sm"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <a href="#top" className="flex min-w-0 items-baseline gap-4">
          <span className="font-display text-lg tracking-wide text-ink">
            A·S
          </span>
          <span className="coord hidden lg:inline">
            25.7617° N — 80.1918° W
          </span>
        </a>

        <div className="flex items-center gap-4 font-mono text-[0.62rem] uppercase tracking-[0.18em] sm:gap-7 sm:text-[0.68rem]">
          {anchors.map((a) => (
            <a
              key={a.label}
              href={a.href}
              className={`link-keyline whitespace-nowrap text-ink-dim transition-colors hover:text-ink ${
                a.hideOnMobile ? "hidden sm:inline" : ""
              }`}
            >
              {a.label}
            </a>
          ))}
          <a
            href={profile.links.resume}
            download="Aaradhy-Sharma-Resume.docx"
            className="whitespace-nowrap border border-amber/45 px-2.5 py-1.5 text-amber transition-colors hover:border-amber hover:bg-amber-soft sm:px-3"
          >
            RESUME ↓
          </a>
        </div>
      </nav>
    </header>
  );
}
