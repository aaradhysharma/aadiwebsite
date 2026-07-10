import { profile } from "@/data/profile";

export default function ContactSection() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-28 sm:px-6 md:pt-36 lg:px-10">
        {/* Toolbox band */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
          {profile.skills.map((group) => (
            <div key={group.group}>
              <h3 className="font-mono text-[0.62rem] uppercase tracking-[0.24em] text-muted">
                {group.group}
              </h3>
              <ul className="mt-4 space-y-1.5 text-sm leading-relaxed text-ink-dim">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Certifications + education */}
        <div className="mt-14 space-y-4 border-t border-line pt-8">
          <p className="font-mono text-[0.62rem] uppercase leading-loose tracking-[0.14em] text-muted">
            CERTIFICATIONS — {profile.certifications.join(" · ")}
          </p>
          <div className="space-y-1.5">
            {profile.education.map((e) => (
              <p
                key={e.school}
                className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted"
              >
                {e.school} — {e.degree} — {e.dates}
              </p>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div id="contact" className="mt-28 scroll-mt-20 md:mt-36">
          <p className="section-label">
            <span className="idx">04</span> / CONTACT
          </p>
          <h2 className="mt-6 font-display text-4xl tracking-tight text-ink md:text-6xl">
            Currently in Building 1.
          </h2>
          <p className="mt-6 max-w-xl leading-relaxed text-muted">
            Miami, FL — building production AI agents at ChenMed. Open to
            interesting problems, hard infrastructure, and anything that flies
            or dives.
          </p>

          <a
            href={`mailto:${profile.email}`}
            className="link-keyline mt-14 inline-block break-all font-display text-3xl text-ink transition-colors hover:text-amber md:text-5xl"
          >
            {profile.email}
          </a>

          <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.68rem] uppercase tracking-[0.2em]">
            <a
              href={profile.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="link-keyline text-ink-dim hover:text-ink"
            >
              GITHUB ↗
            </a>
            <span className="text-muted">·</span>
            <a
              href={profile.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="link-keyline text-ink-dim hover:text-ink"
            >
              LINKEDIN ↗
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted sm:px-6 md:flex-row md:items-center md:justify-between lg:px-10">
          <p>© 2026 Aaradhy Sharma</p>
          <p>Indore → Boston → Miami, the long way.</p>
          <p>Built with Next.js + three.js</p>
        </div>
      </footer>
    </section>
  );
}
