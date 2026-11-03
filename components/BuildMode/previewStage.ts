import type { BuildCommand, BuildEnvelope, BuildReply, BuildStageName } from "./BuildMode.types";

/** Name of the highlight that hides the letters not typed yet. */
const HIDDEN = "build-hidden";

/**
 * The preview side of build mode, running inside the studio's iframe. It strips
 * the page back to nothing and rebuilds one block at a time as the studio's
 * code reaches it: outlines, then letters, then colour, then images. All of it
 * is attributes and CSS (see `.build-stage` in globals.css) plus a highlight
 * over the untyped letters, so React's DOM is never rewritten.
 */
export function startBuildStage() {
  const html = document.documentElement;
  html.classList.add("build-stage");
  html.style.scrollBehavior = "smooth";

  const stages: BuildStageName[] = [];
  let target = 0;
  let letters: Text[] = [];
  let letterTotal = 0;

  // Re-resolved on every command: some blocks swap their element after mount
  // (the phone layouts), and a stale handle would drop the stage.
  const groups = (): HTMLElement[][] => {
    const sections = [...(document.querySelector("main")?.children ?? [])].filter(
      (el): el is HTMLElement => el.tagName === "SECTION"
    );
    const header = document.querySelector<HTMLElement>("body > header");
    const footer = document.querySelector<HTMLElement>("body > footer");
    const [hero, ...rest] = sections;
    return [
      [header, hero].filter((el): el is HTMLElement => !!el),
      ...rest.map((s) => [s]),
      footer ? [footer] : [],
    ];
  };

  const paint = () =>
    groups().forEach((els, i) =>
      els.forEach((el) => {
        el.dataset.build = stages[i] ?? "done";
      })
    );

  const hideLetters = (from: number) => {
    if (!("highlights" in CSS)) return;
    const ranges: Range[] = [];
    let seen = 0;
    for (const node of letters) {
      const start = Math.max(0, Math.min(node.length, from - seen));
      seen += node.length;
      if (start === node.length) continue;
      const range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, node.length);
      ranges.push(range);
    }
    CSS.highlights.set(HIDDEN, new Highlight(...ranges));
  };

  const clearLetters = () => {
    letters = [];
    letterTotal = 0;
    if ("highlights" in CSS) CSS.highlights.delete(HIDDEN);
  };

  // The letters the viewer can see once the section has scrolled in; the rest
  // of a long section shows whole rather than waiting on copy nobody watches.
  const collectLetters = (els: HTMLElement[]) => {
    letters = [];
    for (const el of els) {
      const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => (n.nodeValue?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
      });
      for (let n = walk.nextNode(); n; n = walk.nextNode()) {
        const range = document.createRange();
        range.selectNodeContents(n);
        const r = range.getBoundingClientRect();
        const top = r.top + scrollY - target;
        if (r.width > 0 && top > -r.height && top < innerHeight) letters.push(n as Text);
      }
    }
    letterTotal = letters.reduce((sum, n) => sum + n.length, 0);
  };

  const run = (msg: BuildCommand) => {
    switch (msg.type) {
      case "reset":
        groups().forEach((_, i) => (stages[i] = "blank"));
        clearLetters();
        scrollTo({ top: 0, behavior: "instant" });
        break;
      case "enter": {
        const el = groups()[msg.sec]?.find((e) => e.tagName !== "HEADER");
        target = el ? Math.round(el.getBoundingClientRect().top + scrollY) : 0;
        scrollTo({ top: target });
        break;
      }
      case "stage": {
        const els = groups()[msg.sec] ?? [];
        stages[msg.sec] = msg.stage;
        els.forEach((el) => el.style.setProperty("--build-speed", String(msg.speed)));
        if (msg.stage === "text") {
          collectLetters(els);
          hideLetters(0);
        } else if (msg.stage !== "layout") clearLetters();
        break;
      }
      case "text":
        if (stages[msg.sec] === "text") hideLetters(Math.floor(msg.p * letterTotal));
        break;
      case "finish":
        groups().forEach((_, i) => (stages[i] = "done"));
        clearLetters();
        // Instant: a long smooth scroll back up stalls on the pinned scenes.
        scrollTo({ top: 0, behavior: "instant" });
        break;
    }
    paint();
  };

  addEventListener("message", (e: MessageEvent<BuildEnvelope<BuildCommand>>) => {
    if (e.source !== parent || e.origin !== location.origin || e.data?.efface !== "build") return;
    run(e.data.msg);
  });

  // Ready once the page has settled (phone layouts swap in on mount), wiped clean.
  const ready = () =>
    setTimeout(() => {
      run({ type: "reset" });
      const reply: BuildEnvelope<BuildReply> = { efface: "build", msg: { type: "ready", sections: groups().length } };
      parent.postMessage(reply, location.origin);
    }, 300);
  if (document.readyState === "complete") ready();
  else addEventListener("load", ready, { once: true });
}
