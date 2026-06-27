# Notes

## Guiding Principles

- Epicure's value is making 4M recipes of co-occurrence data tangible to everyday people. Every design choice should serve that translation.
- The app is a utility, not a social platform. Useful → shareable, not social → sticky.
- Ephemeral by design. No data we have to protect because we never store it.
- **Comprehensibility over precision.** Never show users raw numbers, mode IDs, or embedding jargon. Every output must be grounded in concrete examples (ingredients, dishes, cuisine names) with a brief "because" explanation. If a user can't immediately understand what a result means and why, the output has failed.
- **Context-setting matters.** The app must explain its premise: what Epicure discovered, why recipe co-occurrence is meaningful, and how ratings become recommendations. Users should feel oriented, not tested.

## Observations

- Epicure data is fully public under CC-BY-4.0 (ancillary files on arXiv). No access barriers.
- The Cooc model (~150 modes) is the primary model for Food Match. Core and Chem are available but secondary.
- 8 cuisine direction vectors provide the regional mapping. These are the backbone of profile output.
- Mode atlas has Claude-generated labels and pipe-separated member lists — directly usable for UI display.
- Profile URL encoding only needs cuisine scores + top mode affinities (8-20 floats). Very compact.
- The ingredient selection strategy uses cuisine-anchored representatives: pick ingredients that sit near each of the 8 regional directions to ensure broad coverage with minimal cards.

## Tagged Items

[for: solution-brainstorming] Consider whether quiz cards should show ingredient names only or include brief context (e.g., "ghee — clarified butter used in South Asian cooking")
[for: architecture-design] URL encoding: 8 cuisine floats + top N mode scores. Estimate payload size and choose encoding (base64, base62, etc.)
[for: failure-brainstorming] What happens when a user doesn't recognize most quiz ingredients? Need a fallback or "I don't know" option.
