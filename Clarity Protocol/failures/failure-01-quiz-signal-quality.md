# Failure: Quiz Signal Quality

## Summary

Users produce too few meaningful ratings, or their ratings are skewed by factors unrelated to taste preference. The profile becomes noisy or misleading. Affects quiz-takers who get results that feel random or wrong.

## Failure Chain

1. User opens the quiz and encounters ingredient cards.
2. Several ingredients are unfamiliar, or dietary restrictions force many "Can't eat" responses, or the quiz feels tedious and they rush through rating everything neutral.
   - *Intervention point (Prevention):* Select ingredients most people recognize. Ensure each cuisine direction has at least one universally-known anchor.
   - *Intervention point (Prevention):* Make the quiz feel engaging, not like a survey. Visual polish, card animations, progress feedback.
3. The effective number of scored ratings drops below ~15 (half the deck).
   - *Intervention point (Detection):* Count scored ratings. If too few, warn the user that results may be less accurate.
4. Dot product computation runs on sparse input. A single strong rating (e.g., "Love" on garlic) dominates the preference vector because few other ratings counterbalance it.
   - *Intervention point (Mitigation):* Normalize embeddings to unit length before scoring so no single ingredient has outsized magnitude.
5. Profile output shows cuisine/mode scores driven by 1-2 ingredients rather than a broad pattern. **Harm begins** — user sees results that feel arbitrary.
6. User loses trust, doesn't share their profile. The viral loop breaks.

## Observations

- **Severity:** High — this is the most likely failure to occur in practice and directly undermines the core value proposition.
- **Related failures:** Feeds into "Scoring fairness" (few ratings also hurt comparability).
- **Variants:** Users don't recognize ingredients, dietary restrictions cause mass skipping, quiz boring so users rush, dot product dominated by few strong embeddings.

## Intervention Points

### Prevention
- Choose 30 ingredients that are widely recognized (test with a diverse group)
- Include at least 2 universally-known ingredients per cuisine direction (rice, garlic, olive oil, soy sauce, etc.)
- Context lines on every card reduce "Don't know" responses
- Keep quiz feeling playful: card transitions, progress bar, encouraging micro-copy
- Normalize all embeddings to unit length at build time

### Detection
- After quiz completion, count how many were scored (not skipped/can't-eat)
- If fewer than 15 scored ratings, show a soft warning: "Your profile is based on fewer ingredients than ideal"

### Mitigation
- Normalize preference vector (already in design) so no single ingredient dominates
- If scored count < 10, offer to retake with a hint: "Try rating more ingredients, even with 'It's fine'"

### Recovery
- User can always retake the quiz (no permanent state)

---

## Management Plan

**Accept and mitigate.** This failure can't be fully eliminated (some users will always rush or be unfamiliar), but its probability and severity can be reduced significantly:

1. **Ingredient curation (build-time):** Select the 30 ingredients using a recognition-first strategy. Every ingredient must pass the bar of "would most English-speaking adults recognize this name?" Niche items (galangal, sumac) can appear only if paired with a clear context line.

2. **Embedding normalization (build-time):** Pre-normalize all quiz embeddings to unit length. This prevents high-magnitude ingredients from dominating.

3. **Quiz UX polish (implementation):** Card animations, encouraging progress text ("halfway there!"), visual variety to maintain engagement.

4. **Low-signal detection (implementation):** Count scored ratings after quiz. If < 15, display a gentle note on the profile: "Based on [N] ingredients — retake for a richer profile."
