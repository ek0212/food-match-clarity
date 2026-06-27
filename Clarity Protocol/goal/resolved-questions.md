# Resolved Questions

## Q1: What does a quiz card look like and how does the user rate?

**Status:** resolved
**Why it matters:** Determines the entire UX feel and what data we collect per ingredient.
**Strategy:** prototyping
**Findings:** User confirmed "ingredients is probably the easiest place to start." Quiz must complete in ≤5 minutes. Needed to balance speed vs. signal density.
**Resolution:** Each card shows one ingredient with a brief context line (e.g., "Ghee — clarified butter common in South Asian cooking"). Three response options: Love it (+1), It's fine (0), Not for me (-1), plus a Don't know skip (excluded from scoring). 3-tier chosen over 5-point (too slow) and binary (loses neutral signal).

## Q2: How many quiz cards are needed for a useful profile?

**Status:** resolved
**Why it matters:** Too few cards = unreliable profile. Too many = user drops off.
**Strategy:** prototyping
**Findings:** With 8 cuisine directions needing coverage, ~3-4 anchors per direction plus bridge ingredients gives sufficient dot-product signal. At ~8-10 seconds per card, 30 cards fits within 5 minutes.
**Resolution:** Fixed set of 30 ingredients. ~3-4 cuisine-anchored ingredients per regional direction + 2-4 bridge ingredients spanning multiple cuisines. Fixed (not adaptive) so all profiles are directly comparable.
