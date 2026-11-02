"""Generate the auto tour's narration from messages/{ko,en}.json → Tour.steps.

Writes one MP3 per line to public/tour/<locale>/<step>.mp3 and the word
timings the captions follow to components/Tour/tourTimings.json.

Uses Microsoft's neural voices through edge-tts:
    python3 -m venv .venv && .venv/bin/pip install edge-tts
    .venv/bin/python scripts/generate-tour-audio.py
Re-run it whenever the tour copy changes.
"""

import asyncio
import json
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
VOICES = {"ko": "ko-KR-SunHiNeural", "en": "en-US-AvaMultilingualNeural"}
TICKS_PER_MS = 10_000  # edge-tts offsets are in 100ns units
# How the voice should say words it would otherwise mispronounce. The captions
# keep the written form; only the synthesized text changes.
SAY_AS = {"ko": {"efface": "이페이스"}, "en": {"efface": "E-face"}}


def spoken_form(text: str, locale: str):
    """The text to synthesize, plus a map from each of its characters back to
    the caption character it stands for."""
    out, index = [], []
    i = 0
    while i < len(text):
        for written, said in SAY_AS[locale].items():
            if text.startswith(written, i):
                out.append(said)
                # Spread the spoken characters across the written ones.
                index += [i + k * len(written) // len(said) for k in range(len(said))]
                i += len(written)
                break
        else:
            out.append(text[i])
            index.append(i)
            i += 1
    return "".join(out), index


async def render(caption: str, locale: str, out: Path):
    """Synthesize `caption` into `out`, returning its word timings as caption
    character ranges."""
    text, to_caption = spoken_form(caption, locale)
    communicate = edge_tts.Communicate(text, VOICES[locale], boundary="WordBoundary")
    words = []
    cursor = 0
    with out.open("wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                word = chunk["text"]
                start = text.find(word, cursor)
                if start < 0:
                    continue  # spoken form differs from the copy; skip it
                cursor = start + len(word)
                words.append(
                    {
                        "t": round(chunk["offset"] / TICKS_PER_MS),
                        "d": round(chunk["duration"] / TICKS_PER_MS),
                        "s": to_caption[start],
                        "e": to_caption[cursor - 1] + 1,
                    }
                )
    return words


async def main():
    timings = {}
    for locale in VOICES:
        steps = json.loads((ROOT / f"messages/{locale}.json").read_text())["Tour"]["steps"]
        out_dir = ROOT / "public/tour" / locale
        out_dir.mkdir(parents=True, exist_ok=True)
        timings[locale] = {}
        for step, line in steps.items():
            words = await render(line, locale, out_dir / f"{step}.mp3")
            end = max((w["t"] + w["d"] for w in words), default=0)
            timings[locale][step] = {"duration": end, "words": words}
            print(f"{locale}/{step}: {len(words)} words, {end / 1000:.1f}s")
    path = ROOT / "components/Tour/tourTimings.json"
    path.write_text(json.dumps(timings, ensure_ascii=False, separators=(",", ":")) + "\n")


asyncio.run(main())
