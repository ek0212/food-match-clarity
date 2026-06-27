# Problem Statement

People eat together constantly but lack a shared language for food preferences. Picking a restaurant or cooking together becomes guesswork: you don't know what the other person actually likes, what they'd be open to trying, or where your tastes overlap.

Separately, Epicure's research mapped the ingredient universe with unprecedented depth (4M recipes, 1,790 ingredients, 300-dimensional embeddings, 8 cuisine directions, ~150 flavor neighborhoods). But this knowledge is locked in academic CSVs and papers. No one can use it day-to-day.

The goal framing was pressure-tested: the destination is "make Epicure's recipe-derived ingredient knowledge tangible and useful to regular people," with friend-matching as the primary use case, not a social platform.

## Why This Matters

Food is deeply personal but poorly articulated. Most people can't describe their palate beyond "I like Italian" or "I don't like spicy." Epicure's co-occurrence data captures something richer: actual ingredient relationships learned from millions of real recipes. Translating that into something a person can interact with in 5 minutes makes food discovery more grounded and friend-compatible dining more accessible.

## Scope

**In scope:**
- Taste quiz using Epicure's ingredient data (ingredient rating cards)
- Personal palate profile (cuisine affinities, flavor neighborhoods, dish ideas)
- LLM prompt generation for restaurant/place finding
- Pair compatibility (shared ground, conflicts, bridge foods)
- Shareable profile via URL encoding (no server)
- Client-side only, no accounts or backend

**Out of scope:**
- Social features, feeds, or friend lists
- Real restaurant/venue data or integrations
- Groups larger than 2 people
- User accounts or persistent server-side storage
- Recipe database or meal planning

**Stretch goals:**
- Recipe adjustment suggestions based on profile
- Recipe recommendations

## Success Criteria

- A user completes the quiz in ≤5 minutes and receives a profile that feels accurate to their self-perception
- The profile output is specific enough to act on (cuisine names, dish suggestions, not vague labels)
- Two users can compare profiles and immediately see what to eat together
- The entire experience works client-side with a shareable URL, no signup required
- Epicure's ingredient relationships feel present and grounded (not generic preference questions)
