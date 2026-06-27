# Failure: Profile Comprehensibility

## Summary

Profile outputs are vague, use jargon, or fail to explain their own basis. Users don't understand what they're being told or why the app exists. Affects quiz-takers who invested 5 minutes and get nothing actionable back.

## Failure Chain

1. User completes the quiz and receives their profile.
2. The profile shows cuisine affinities and mode labels without sufficient grounding.
   - *Intervention point (Prevention):* Every output must include a "because" line citing specific ingredients the user rated.
3. Mode labels from the Epicure paper are too academic or abstract (e.g., "Processed condiment base"). User doesn't understand what it means.
   - *Intervention point (Prevention):* Vet and rewrite all mode labels before shipping. Show example ingredients prominently.
4. The landing context failed to convey why recipe co-occurrence matters, so the user treats the quiz as a BuzzFeed personality test. **Harm begins** — results feel generic because the user doesn't appreciate what's behind them.
   - *Intervention point (Prevention):* Context screen must explain the "4M recipes" value prop concisely and engagingly.
5. User concludes "this told me nothing I didn't know" and doesn't share.

## Observations

- **Severity:** High — if users don't understand or value the output, the product has no reason to exist.
- **Related failures:** Partially overlaps with "Quiz signal quality" (bad input also produces vague output).
- **Variants:** Generic profile despite effort, incomprehensible mode labels, user doesn't understand Epicure premise.

## Intervention Points

### Prevention
- Every cuisine result includes "because you rated X, Y, Z highly" using actual ingredient names
- Every mode shows 3-4 concrete ingredient examples, not just the label
- Rewrite all ~20 user-facing mode labels to plain language (build-time curation)
- Intro screen must make the "4M recipes → ingredient map → your palate" pipeline vivid in 3 sentences
- Dish suggestions ground abstract modes in concrete "order this at a restaurant" actions

### Detection
- User testing: ask 5 people "what does this result mean?" If they can't explain it back, rewrite
- Track share rate as a proxy (low shares = low perceived value)

### Mitigation
- If profile only shows 1 strong cuisine (everything else near zero), add contextual text: "You have a focused palate — you know what you like"
- Fallback dish suggestions even for weak modes

### Recovery
- None needed (no permanent harm)

---

## Management Plan

**Prevent through design and curation.** This is a content and copy problem, not a technical one:

1. **Mode label curation (build-time):** Review all ~150 mode labels from mode_atlas_cooc.csv. Rewrite the ~20 that could appear as top results into plain, vivid language. "Processed condiment base" → "Savory sauce foundations" with examples: soy sauce, Worcestershire, fish sauce.

2. **"Because" explanations (implementation):** Already in the scoring engine — `topContributors` field traces back which rated ingredients drove each cuisine score. Render these prominently.

3. **Intro copy (implementation):** The IntroScreen component must convey: what Epicure did (scanned 4M recipes), what it found (ingredient neighborhoods), what the quiz does (maps you onto those neighborhoods), what you get (cuisines + dishes + friend matching). Currently drafted; needs user-testing for clarity.

4. **Dish grounding (implementation):** Add a static mode → dishes mapping so every mode result comes with 2-3 "order this" suggestions. Turns abstract neighborhoods into restaurant actions.
