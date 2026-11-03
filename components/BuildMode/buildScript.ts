import type { BuildFile, BuildPart } from "./BuildMode.types";

/** The page's copy the files type out, read from the messages so the editor
 *  and the preview say the same thing in either locale. */
export interface BuildCopy {
  heroTitle1: string;
  heroTitle2: string;
  heroSub: string;
  effaceLabel: string;
  effaceDefinition: string;
  effaceSentence: string;
  work: SectionCopy;
  capabilities: SectionCopy;
  approach: SectionCopy;
  about: SectionCopy;
  testimonials: SectionCopy;
  contact: SectionCopy & { email: string };
  footerTagline: string;
  footerRights: string;
}

interface SectionCopy {
  label: string;
  title: string;
  lead: string;
}

// Part builders: what reaching each stretch does to the preview.
const layout = (code: string): BuildPart => ({ code, event: "layout" });
const text = (code: string): BuildPart => ({ code, event: "text" });
const color = (code: string): BuildPart => ({ code, event: "color" });
const media = (code: string): BuildPart => ({ code, event: "media" });
const plain = (code: string): BuildPart => ({ code });

/** The palette block every file closes with — the moment its colours land. */
function palette(entries: [string, string][]): BuildPart[] {
  return [
    plain("\nconst colors = {\n"),
    color(entries.map(([k, v]) => `  ${k}: "${v}",\n`).join("")),
    plain("};\n"),
  ];
}

/** A titled section: label, heading, lead — the shape most of the page shares. */
function titled(name: string, id: string, copy: SectionCopy, body: BuildPart[], tail: BuildPart[]): BuildFile {
  return {
    name,
    dir: "components/sections",
    parts: [
      plain(`export default function ${name.replace(/\.tsx$/, "")}() {\n  return (\n`),
      layout(`    <section id="${id}" className="border-t border-line py-36">\n      <p className="label">\n        `),
      text(`// ${copy.label}`),
      layout(`\n      </p>\n      <h2 className="mt-5 text-5xl font-semibold tracking-tight">\n        `),
      text(copy.title),
      layout(`\n      </h2>\n      <p className="mt-6 max-w-xl text-fg-dim">\n        `),
      text(copy.lead),
      layout("\n      </p>\n"),
      ...body,
      layout("    </section>\n"),
      plain("  );\n}\n"),
      ...tail,
    ],
  };
}

/** One file per block of the page, in page order — the preview's sections line up by index. */
export function buildFiles(c: BuildCopy): BuildFile[] {
  return [
    {
      name: "Hero.tsx",
      dir: "components/sections",
      parts: [
        plain("export default function Hero() {\n  return (\n"),
        layout(`    <section className="relative min-h-svh overflow-hidden">\n      <h1 className="text-7xl font-semibold leading-[1.04]">\n        `),
        text(c.heroTitle1),
        plain("\n        "),
        text(c.heroTitle2),
        layout(`\n      </h1>\n      <p className="mt-7 max-w-md text-lg">\n        `),
        text(c.heroSub),
        layout("\n      </p>\n      <Tour />\n    </section>\n"),
        plain("  );\n}\n"),
        ...palette([
          ["bg", "#0a0a0b"],
          ["fg", "#f6f6f7"],
          ["dim", "#9b9ba4"],
          ["accent", "#3b62e5"],
        ]),
        media('\n<HeroScene shader="glass" dpr={2} />\n'),
      ],
    },
    {
      name: "EffaceIntro.tsx",
      dir: "components/sections",
      parts: [
        plain("export default function EffaceIntro() {\n  return (\n"),
        layout(`    <section id="efface" style={{ height: "300svh" }}>\n      <div className="sticky top-0 h-svh">\n        <p className="label">`),
        text(c.effaceLabel),
        layout(`</p>\n        <p className="font-mono text-sm">\n          `),
        text(c.effaceDefinition),
        layout(`\n        </p>\n        <p className="text-5xl font-semibold">\n          `),
        text(c.effaceSentence),
        layout("\n        </p>\n      </div>\n    </section>\n"),
        plain("  );\n}\n"),
        ...palette([
          ["ink", "#ededef"],
          ["orb", "#3b62e5"],
        ]),
        media("\n<ClutterField />\n<EraserPuck />\n"),
      ],
    },
    titled("Work.tsx", "work", c.work, [layout("      <WorkFeaturedScene items={featured} />\n")], [
      ...palette([
        ["line", "rgba(255,255,255,0.09)"],
        ["accent", "#3b62e5"],
      ]),
      media('\n<img src="/work/*.webp" loading="lazy" />\n'),
    ]),
    titled(
      "Capabilities.tsx",
      "capabilities",
      c.capabilities,
      [layout('      <div className="grid grid-cols-2 gap-6">{groups.map(CapabilityCard)}</div>\n')],
      [
        ...palette([
          ["surface", "#141418"],
          ["accent", "#6183ff"],
        ]),
        media("\n<MagnifierLens />\n"),
      ]
    ),
    titled("Approach.tsx", "approach", c.approach, [layout('      <ul className="border-t border-line">{items}</ul>\n')], [
      ...palette([
        ["accent", "#3b62e5"],
        ["faint", "#6a6a73"],
      ]),
      media('\n<SectionBackdrop src="/approach/code.webp" />\n'),
    ]),
    titled("About.tsx", "about", c.about, [layout('      <LogoParticle className="h-72" />\n')], [
      ...palette([
        ["dim", "#9b9ba4"],
        ["accent", "#3b62e5"],
      ]),
      media('\n<SectionBackdrop src="/about/office.webp" />\n'),
    ]),
    titled(
      "Testimonials.tsx",
      "testimonials",
      c.testimonials,
      [layout('      <ul className="grid gap-6 md:grid-cols-3">{quotes}</ul>\n')],
      [
        ...palette([
          ["card", "#101013"],
          ["accent", "#3b62e5"],
        ]),
        media('\n<SectionBackdrop src="/testimonials/silicon-valley.webp" />\n'),
      ]
    ),
    titled(
      "Contact.tsx",
      "contact",
      c.contact,
      [layout('      <a href={`mailto:${email}`} className="text-4xl">'), text(c.contact.email), layout("</a>\n")],
      [
        ...palette([
          ["ink", "#3b62e5"],
          ["fg", "#f6f6f7"],
        ]),
        media("\n<FluidInk className=\"opacity-75\" />\n"),
      ]
    ),
    {
      name: "Footer.tsx",
      dir: "components",
      parts: [
        plain("export default function Footer() {\n  return (\n"),
        layout(`    <footer className="border-t border-[#1b1b22]">\n      <h2 className="text-6xl font-semibold">\n        `),
        text(c.footerTagline),
        layout(`\n      </h2>\n      <FooterMeta />\n      <small>`),
        text(c.footerRights),
        layout("</small>\n    </footer>\n"),
        plain("  );\n}\n"),
        ...palette([
          ["bg", "#0a0a0b"],
          ["ink", "#ededef"],
        ]),
        media("\n<Wordmark />\n"),
      ],
    },
  ];
}
