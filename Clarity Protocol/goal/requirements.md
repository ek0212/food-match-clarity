# Requirements

Any solution must:

## Functional Requirements

1. Present a taste quiz using ingredients drawn from Epicure's 1,790-ingredient vocabulary
2. Select quiz ingredients using cuisine-anchored strategy (representatives from each of 8 regional directions)
3. Score user responses via dot product against Epicure mode centroids and cuisine direction vectors
4. Produce a palate profile: cuisine affinities, top flavor neighborhoods (modes), dish ideas
5. Generate an LLM prompt the user can paste to find nearby restaurants matching their profile
6. Encode the profile into a shareable URL (no server round-trip)
7. Decode a received profile URL and display that person's palate summary
8. Compare two profiles: highlight shared ground (primary), conflicts, and bridge foods
9. Produce a combined "eat together" suggestion from the compatibility output

## Non-Functional Requirements

### Performance
- Quiz loads instantly (static assets, no API calls for core flow)
- Profile computation completes client-side in <1 second

### Security
- URL-encoded profiles must be safe to parse (no script injection, no arbitrary data execution)
- No user data leaves the browser (no analytics, no tracking beyond what the user shares)

### Usability
- Quiz completes in ≤5 minutes
- Results are understandable without food science knowledge — no raw scores, embedding dimensions, or mode IDs shown to users
- All outputs use plain language: cuisine names, ingredient examples, dish names, and brief explanations of "why" (e.g., "You lean Mediterranean because you rated olive oil, garlic, and basil highly")
- The app explains its own premise upfront: what Epicure is, why recipe co-occurrence matters, and how the quiz works
- Works on mobile and desktop
- Shareable with one tap/click (copy link)

### Data Integrity
- Epicure data used faithfully: co-occurrence relationships, mode memberships, cuisine directions
- CC-BY-4.0 attribution displayed

## Constraints

- **Client-side only:** No backend server. All computation happens in the browser.
- **No accounts:** Ephemeral sessions. Profile lives only in the URL.
- **Pairs only:** Compatibility is between exactly two profiles.
- **Epicure Cooc model primary:** Use the co-occurrence embeddings as the main scoring engine (recipe-context, not chemistry).
- **Data is public:** Embeddings, mode atlases, and cuisine directions ship as static assets from the CC-BY-4.0 ancillary files.
