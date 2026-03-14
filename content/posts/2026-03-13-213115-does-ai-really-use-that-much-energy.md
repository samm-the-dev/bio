---
title: 'Does AI Really Use That Much Energy?'
slug: does-ai-really-use-that-much-energy
excerpt: 'An Instagram Reel sent me down a research rabbit hole. I compared the energy footprint of 25 days of heavy AI-assisted development against 14 years of PC gaming.'
publishedAt: 2026-03-13T23:20:08-05:00
tags:
  - ai
  - data
  - personal
authors:
  - sam
  - claude
relatedProjects: []
---

A friend of mine recently reposted an Instagram Reel making sensational claims about water shortage and (at least implying) AI's primary role in that shortage.
This sent me down a research rabbit hole with Claude because I wanted to check in on my part in the environmental impact of this cultural paradigm shift.
It's worth noting that I'm not an academic, and not well versed in such research.
The following is some personal context and data, plus what Claude found in its broad research, with citations.

## The Setup

_For most of my life I was what I would call a casual gamer. I never played too competitively, but I have engaged in multi-hour gaming sessions many, many times._
_Recently I've all but dropped PC gaming, and have instead engaged more in in-person creative pursuits like improv, and more recently code project work with Claude Code._

_Here are the specs for my current PC, which I've had for a couple of years now, plus Claude and Steam numbers:_

> **PC specs:** Intel i7-12700KF, RTX 3070 Ti, 32GB DDR5. Under gaming load, this system draws roughly 310W from the wall (GPU averaging ~220W, CPU ~60W, the rest fans/RAM/storage), plus about 40W for the monitor -- approximately **0.35 kWh per hour of gaming**.
>
> **Claude Code usage** was measured via [ccusage](https://github.com/ryoppippi/ccusage), which parses local session files for token counts. From January 31 to March 13, 2026 -- 25 active days -- 1.89 billion tokens were processed, 652 commits produced across 15 repos, with a theoretical API-equivalent cost of $1,238 (covered by a Max subscription).
>
> **Steam library data** came from Steam's local `localconfig.vdf` file, which tracks playtime in minutes and last-played Unix timestamps. Total: **5,500 hours across 311 games over ~14 years**.

## How Much Energy Does Claude Code Actually Use?

> AI companies don't publish per-user energy figures, so this estimate uses the [Epoch AI methodology](https://epoch.ai/gradient-updates/how-much-energy-does-chatgpt-use): GPU-seconds per token, multiplied by hardware power draw and datacenter overhead (PUE).
>
> The key factor: 96% of tokens were cache reads -- memory lookups, not GPU compute. Only 74 million tokens actually hit the GPU. At roughly 2,500 tokens/sec on an H100 running at 840W effective (700W TDP x 1.2 PUE):
>
> **~6.9 kWh total.** For 25 days of heavy, multi-hour-per-day AI-assisted development.
>
> But that's only Anthropic's inference compute. The full picture includes the local PC running during development and CI infrastructure triggered by the work. Based on commit timestamps, active sessions averaged roughly 8 hours per day. During dev work (IDE, Vite dev server, browser), this PC draws ~150W with the GPU idle -- about half the gaming load.
>
> | Component                              | Energy      | Where      |
> | -------------------------------------- | ----------- | ---------- |
> | AI inference (Anthropic servers)       | ~6.9 kWh    | Datacenter |
> | GitHub Actions CI (1,133 runs)         | ~0.3 kWh    | Datacenter |
> | Local dev PC (25 days x ~8 hrs x 150W) | ~30 kWh     | My desk    |
> | **Total AI-assisted dev footprint**    | **~37 kWh** |            |
>
> The datacenter energy -- the part that's actually AI-specific -- was ~7.2 kWh. The local PC draw is energy you'd spend doing any screen-based work; it's lower than gaming because the GPU sits idle during development.

_I've been engaging in heavy, sometimes unhealthy usage of Claude Code for these personal projects. I'll also be the first to admit I'm probably not very efficient about it, so the idea that 8 hours of AI-assisted development uses about the same energy as 4 hours of gaming is a little surprising, but I still want to improve my efficiency._

> It's worth noting that AI-assisted development will likely get even more efficient relative to gaming over time:
>
> - **Cache efficiency is already doing heavy lifting** -- 96% of tokens in this period were cache reads, not GPU compute. More efficient prompting pushes that number even higher.
> - **Model inference is getting cheaper** -- energy per query has been dropping as models are optimized. Training costs are the ceiling; inference keeps shrinking.
> - **Gaming hardware isn't getting more efficient in absolute terms** -- GPU TDPs have actually climbed generation over generation (RTX 4090 is 450W vs the 3070 Ti's 290W). Perf-per-watt improves, but wall draw doesn't.

## 5,500 Hours of Steam Gaming

_I had a great time playing most if not all of these games. Many of them helped me connect to others in one way or another, albeit in a limited online fashion. I don't regret spending these hours, but the energy consumption comparison is interesting._

| Game             | Hours     | Energy (kWh) | Context                   |
| ---------------- | --------- | ------------ | ------------------------- |
| Valheim          | 703       | ~246         | ~7x total AI-assisted dev |
| Elden Ring       | 633       | ~222         | 6x total AI-assisted dev  |
| Astroneer        | 371       | ~130         |                           |
| Rocket League    | 295       | ~103         |                           |
| Skyrim           | 277       | ~97          |                           |
| Helldivers 2     | 216       | ~76          |                           |
| Marvel Rivals    | 188       | ~66          |                           |
| Dark Souls III   | 151       | ~53          |                           |
| Starbound        | 142       | ~50          |                           |
| Dark Souls II    | 137       | ~48          |                           |
| **Top 10 total** | **3,113** | **~1,090**   | 57% of all gaming hours   |

> At 0.35 kWh/hr, lifetime gaming has consumed approximately **1,925 kWh** -- the top 10 games alone account for over half of that.

## The Comparison

|                                         | Energy     |
| --------------------------------------- | ---------- |
| Lifetime PC gaming (5,500 hrs)          | ~1,925 kWh |
| AI-assisted dev, holistic (25 days)     | ~37 kWh    |
| ...of which datacenter (inference + CI) | ~7.2 kWh   |
| ...of which local PC                    | ~30 kWh    |
| **Ratio (holistic)**                    | **52:1**   |

> The entire AI-assisted dev period consumed about **106 hours' worth of gaming energy** on this rig. The datacenter portion alone was just ~7.2 kWh -- equivalent to about 20 hours of gaming. Valheim alone consumed roughly 7 times more energy than all AI-assisted development combined.

## The Drop-Off

> Steam tracks the last time each game was played. The timeline shows a sharp transition:

| Date           | Activity                                          |
| -------------- | ------------------------------------------------- |
| Dec 30, 2025   | Last significant gaming session (Elden Ring)      |
| Jan 31, 2026   | 1.9 hrs Sleeping Dogs / First Claude Code session |
| Feb 1, 2026    | 4.5 hrs MTG Arena (last Steam activity)           |
| Feb - Mar 2026 | **0 hours gaming. 652 commits.**                  |

_My drift away from gaming was more due to increasing improv involvement than Claude Code, but these code projects have proven to be a much more interesting screen hobby to me these days._

## The Bigger Picture

_Again, I am not an academic, but from what I can tell these are genuine findings._

> **AI currently accounts for roughly 10-15% of data center energy use** ([IEA](https://www.iea.org/reports/energy-and-ai)), though the growth trajectory is steep -- Goldman Sachs projects a [160% increase in data center power demand](https://www.goldmansachs.com/insights/articles/AI-poised-to-drive-160-increase-in-power-demand) by 2030, driven largely by AI. A single ChatGPT query uses about [0.3 Wh](https://www.datacenterdynamics.com/en/news/sam-altman-chatgpt-queries-consume-034-watt-hours-of-electricity-and-0000085-gallons-of-water/) -- trivial in isolation, but the concern is about billions of queries per day and the infrastructure being built to serve them.
>
> The real energy questions are about training runs (GPT-4 is [estimated at ~50 GWh](https://arxiv.org/html/2509.07218v3), though OpenAI hasn't confirmed this) and infrastructure scaling, not individual queries. Those are legitimate concerns worth honest discussion.

> **There's also a concern the viral discourse tends to miss entirely:** data center backup generators create real, measurable air pollution -- disproportionately in communities of color. In Northern Virginia, data centers drove CO up 196%, NOx up 111%, and PM up 139% between 2015-2023 ([VCU study](https://news.vcu.edu/article/northern-virginia-data-center-air-pollution-rivals-power-plant-emissions)). xAI operated up to 35 unpermitted gas turbines at its Memphis facility near Boxtown before being permitted for 15; it has since [expanded to Mississippi with more unpermitted turbines](https://www.cnbc.com/2026/03/10/elon-musk-xai-permit-for-mississippi-plant-despite-pollution-concerns.html). Memphis ranks [#1 for ozone pollution](https://www.lung.org/research/sota/city-rankings/most-polluted-cities) ([SELC](https://www.selc.org/press-release/new-images-reveal-elon-musks-xai-datacenter-has-nearly-doubled-its-number-of-polluting-unpermitted-gas-turbines/)). That's a real harm worth real attention -- but it's a data center problem broadly, not an AI-specific one. AI accounts for roughly 10-15% of data center workload; the majority is conventional cloud computing and enterprise IT. The growth driving _new_ facilities into these communities is AI-motivated, and that matters. But the existing pollution footprint is overwhelmingly non-AI.

## Closing Thoughts

For me, the bigger picture here is that screen life in general, not just AI usage specifically, has a real and measurable impact on our environment. **That impact skews negative**, especially when you factor in what engagement algorithms have done to both online and real, in-person discourse. The Reel that sent me down this rabbit hole had 70K likes because the algorithm rewards outrage, not accuracy. That's the part that concerns me more than kilowatt-hours. More than that, the research that struck me most was the air pollution data. **The disproportionate impact on specific, already-suffering and marginalized communities is the buried lede here.**

## Sources

- [IEA Energy and AI Report (2025)](https://www.iea.org/reports/energy-and-ai)
- [Epoch AI: How Much Energy Does ChatGPT Use?](https://epoch.ai/gradient-updates/how-much-energy-does-chatgpt-use)
- [Google Gemini energy disclosure (Aug 2025)](https://www.technologyreview.com/2025/08/21/1122288/google-gemini-ai-energy/)
- [Sam Altman on ChatGPT energy per query](https://www.datacenterdynamics.com/en/news/sam-altman-chatgpt-queries-consume-034-watt-hours-of-electricity-and-0000085-gallons-of-water/)
- [Jegham et al. -- LLM eco-efficiency rankings](https://arxiv.org/abs/2505.09598)
- [Goldman Sachs -- AI power demand projections](https://www.goldmansachs.com/insights/articles/AI-poised-to-drive-160-increase-in-power-demand)
- [VCU -- Northern Virginia data center air pollution](https://news.vcu.edu/article/northern-virginia-data-center-air-pollution-rivals-power-plant-emissions)
- [SELC -- xAI unpermitted gas turbines in Memphis](https://www.selc.org/press-release/new-images-reveal-elon-musks-xai-datacenter-has-nearly-doubled-its-number-of-polluting-unpermitted-gas-turbines/)
- [American Lung Association -- Most Polluted Cities](https://www.lung.org/research/sota/city-rankings/most-polluted-cities)
- [CNBC -- xAI Mississippi permit approved despite pollution concerns](https://www.cnbc.com/2026/03/10/elon-musk-xai-permit-for-mississippi-plant-despite-pollution-concerns.html)
