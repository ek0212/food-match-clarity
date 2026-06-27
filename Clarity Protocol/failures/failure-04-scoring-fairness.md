# Failure: Scoring Fairness

## Summary

The scoring math produces results that don't discriminate between users (everyone gets "Mediterranean and East Asian"), or that unfairly bias against certain dietary patterns. Compatibility becomes meaningless when most pairs look identical. Affects pairs comparing who get useless "you both like everything" results.

## Failure Chain

1. Two users complete the quiz and compare profiles.
2. Both profiles show the same top cuisines (e.g., Mediterranean and East Asian are universally popular ingredients: olive oil, soy sauce, garlic).
   - *Intervention point (Prevention):* Include "discriminating" ingredients that not everyone likes — divisive flavors like fish sauce, cilantro, blue cheese that create genuine separation.
3. Compatibility computation finds shared ground on everything, conflicts on nothing.
   - *Intervention point (Prevention):* Thresholds for "shared" should be calibrated against actual score distributions, not absolute values.
4. The "eat together" suggestion is too broad ("try Mediterranean food") because it's based on universal preferences rather than distinctive shared tastes. **Harm begins.**
5. Additionally, a user whose dietary restrictions caused many exclusions has a profile computed from fewer data points. Their scores may be less reliable, making comparison with a full-scoring user unbalanced.
   - *Intervention point (Mitigation):* Weight comparison confidence by the minimum number of scored ratings between the two profiles.

## Observations

- **Severity:** Medium — the app still works (profiles are generated), but the comparison output loses value.
- **Related failures:** Interacts with "Quiz signal quality" (fewer ratings = less discrimination).
- **Variants:** Everyone gets same profile, corpus bias in directions, dietary exclusions break comparability.

## Intervention Points

### Prevention
- Include polarizing ingredients in the quiz deck (fish sauce, blue cheese, cilantro, durian, licorice). Not everyone needs to like them — the point is they create separation.
- Rank cuisines by relative strength (how much higher than average), not absolute score
- Ensure the 8 cuisine directions are genuinely orthogonal (check from Epicure data)
- Select quiz ingredients that project strongly onto different directions (maximize embedding space coverage)

### Detection
- During development: run scoring on synthetic "all love" profiles and verify they don't all collapse to the same output
- Check that a uniform rating pattern (all +1) doesn't produce a strongly peaked profile

### Mitigation
- Use relative scoring: subtract the mean cuisine score before ranking. "You lean Mediterranean more than your average" is more discriminating than "you scored 0.3 on Mediterranean"
- For comparison: compute difference-from-mean for each person, then compare those relative profiles
- If both profiles are very similar (cosine similarity > 0.9), acknowledge it: "You have remarkably similar palates! Here's what distinguishes you..."

### Recovery
- Users can always retake with more deliberate ratings

---

## Management Plan

**Prevent through ingredient selection and relative scoring:**

1. **Polarizing ingredients (build-time):** Ensure the 30-card deck includes 5-6 "divisive" ingredients that people have strong opinions about in both directions. Fish sauce, cilantro, blue cheese, licorice/anise, raw onion, very spicy chilies. These create the separation that makes profiles and comparisons meaningful.

2. **Relative scoring (implementation change):** After computing raw cuisine scores, subtract the mean and divide by standard deviation across all 8 directions. This produces z-scores that emphasize what's distinctive about a user, not what's universally popular. Apply the same to mode scores.

3. **Comparison calibration (implementation):** "Shared ground" threshold should be based on both users being above their own mean on the same direction — not an absolute score cutoff.

4. **Similar-profile acknowledgment (implementation):** If comparison shows >80% overlap and no conflicts, output: "You have very aligned palates — you'll enjoy almost anything together. Here's what makes each of you distinctive:" followed by the one direction where they differ most.
