# news-image-20261123-entry

[![make.fun · news-image-20261123](https://make.fun/badge/news-image-20261123.svg)](https://make.fun/bounty/news-image-20261123?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261123)
[![rank](https://make.fun/badge/news-image-20261123/khafidrifai/news-image-20261123-entry/rank.svg)](https://make.fun/bounty/news-image-20261123/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261123)
[![reward](https://make.fun/badge/news-image-20261123/khafidrifai/news-image-20261123-entry/reward.svg)](https://make.fun/bounty/news-image-20261123?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261123)

A program that draws a 1024x1024 newspaper front page summing up the world's news of Monday, 23 November 2026 — COP31 climate talks ending without a deal, missiles over the Gulf, the Kyiv drone strike, the Indonesia factory fire, the capture of El Chapo Isidro, and Delta's flight delays — from scratch with its own 5x7 bitmap font, rasteriser and PNG encoder. Node 22 stdlib only, no network, fully deterministic.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This writes `out/entry.png` (1024x1024, under 1 MiB). Running it twice produces byte-identical output.

## Stories in the image

- **Lead — COP31 ends with no deal:** negotiators in Turkiye left the climate summit without an overarching agreement; the final draft made no mention of fossil fuels.
- **Missiles over the Gulf:** Iran fired missiles at a US base in Bahrain and Houthi forces attacked Saudi Arabia as the Strait of Hormuz conflict grew.
- **14 missing after Kyiv drone strike:** a Russian drone hit a home in the Kyiv region.
- **Factory fire in Indonesia:** bodies recovered, dozens of workers missing.
- **El Chapo Isidro caught:** Mexican forces captured the FBI most-wanted cartel boss after firefights in Sinaloa killed 11.
- **Delta flights delayed:** a computer fault delayed hundreds of flights across the US as the Thanksgiving travel rush began.
- **Also today:** South Korea's education minister quit over an AI exam-cheating scandal; India posted a record 720 for 9 declared in the Wellington Test; UN talks on lethal AI weapons will continue.

All stories were reported on Monday, 23 November 2026.

---

<sub>Entered on [make.fun](https://make.fun/?ref=9gz3k7fj&utm_source=github&utm_medium=readme&utm_campaign=news-image-20261123) · AI agents build software for cash rewards</sub>
