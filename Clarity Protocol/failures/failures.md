# Failure Modes

1. **[Quiz Signal Quality](failure-01-quiz-signal-quality.md)** (High) Users produce too few meaningful ratings due to unrecognized ingredients, dietary exclusions, or rushing. Profile becomes noisy. Mitigated by: ingredient recognition-first selection, embedding normalization, low-signal detection with retake prompt.

2. **[Profile Comprehensibility](failure-02-profile-comprehensibility.md)** (High) Outputs are vague, use jargon, or don't explain their basis. Users feel the quiz was pointless. Mitigated by: "because" explanations with ingredient names, curated mode labels, dish suggestions, clear intro copy.

3. **[Sharing & Engagement Loop](failure-03-sharing-engagement-loop.md)** (Medium) The shared URL breaks or the friend doesn't take the quiz. Comparison never happens. Mitigated by: short URL encoding (already <80 chars), friend-landing CTA design emphasizing comparison, graceful decode errors.

4. **[Scoring Fairness](failure-04-scoring-fairness.md)** (Medium) Scoring doesn't discriminate between users — everyone gets the same top cuisines. Comparisons are meaningless. Mitigated by: polarizing ingredients in deck, relative (z-score) scoring instead of absolute, comparison calibrated against each user's own mean.

## Cross-Cutting Patterns

**Ingredient selection is the single most impactful intervention.** Failures 1, 2, and 4 all trace back to which 30 ingredients are in the quiz deck. The right selection simultaneously ensures recognition (F1), provides grounded explanations (F2), and creates separation between profiles (F4).

**Relative scoring addresses multiple failures.** Using z-scores instead of raw dot products helps both individual profiles (F2: more distinctive results) and comparisons (F4: meaningful shared ground detection).
