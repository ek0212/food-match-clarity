# Solution

## Approach: Client-Side Taste Quiz Powered by Epicure Embeddings

Food Match is a static web app that loads Epicure's co-occurrence data as bundled assets and runs all computation in the browser. The user flow is: context → quiz → profile → share → compare.

## The Experience

### 1. Landing / Context

The app opens with a brief, engaging explanation: Epicure scanned 4 million recipes across 7 languages and mapped how 1,790 ingredients relate to each other. The quiz uses those relationships to infer your palate. This isn't generic preference guessing — it's grounded in how real recipes actually combine ingredients.

### 2. Quiz (30 fixed cards)

Each card presents one ingredient with a one-line context note:
- **Ingredient name** prominently displayed
- **Context line** explaining what it is and where it's common (e.g., "Dashi — savory stock base in Japanese cooking")
- **Four buttons:** Love it (+1) · It's fine (0) · Not for me (-1) · Can't eat (excluded)
- **Skip option:** "Don't know" (also excluded from scoring)

"Can't eat" is distinct from "Not for me" — dietary restrictions are excluded from scoring (same as "Don't know") so they don't produce false negative taste signals. A vegetarian who can't eat beef isn't penalized on cuisines that use beef. Everyone still sees the same 30 cards, preserving profile comparability.

The 30 ingredients are selected using cuisine-anchored strategy:
- ~3-4 representative ingredients per cuisine direction (8 directions × 3-4 = 24-32)
- 2-4 bridge ingredients that span multiple cuisines (rice, chili, olive oil)
- Selection criteria: recognizable to most people, clearly anchored in their cuisine direction's embedding neighborhood, collectively spanning the space

Progress bar shows completion. Total time: ~4-5 minutes.

### 3. Scoring (client-side, instant)

After the quiz:
1. **Build rating vector:** For each rated ingredient, look up its 300-dim Cooc embedding. Multiply by the rating (+1/0/-1). Sum into a weighted preference vector.
2. **Cuisine scores:** Dot product of preference vector against each of 8 cuisine direction vectors. Normalize to relative affinities.
3. **Mode scores:** Dot product against each mode centroid (from mode_atlas_cooc.csv). Top-scoring modes are the user's flavor neighborhoods.
4. **Profile output:** Top 2-3 cuisines, top 3-5 modes (translated to plain language via the Claude-generated mode labels and member ingredients).

### 4. Profile Display

The profile shows:
- **Your cuisines:** "You lean toward South Asian and Mediterranean cooking" — with a "because" line citing which rated ingredients drove this (e.g., "because you loved ghee, cumin, and lentils")
- **Your flavor neighborhoods:** Top modes shown by their human label + example ingredients (e.g., "Sweet baking ingredients — vanilla, cinnamon, brown sugar")
- **Dish ideas:** 3-5 concrete dishes derived from the user's top modes and cuisines
- **LLM prompt:** A pre-written prompt the user can paste into ChatGPT or similar: "I like [cuisines]. I'm drawn to [mode descriptions]. Suggest restaurants near me that serve [dish types]."
- **Share button:** Copies a URL containing the encoded profile

### 5. Profile URL Encoding

The shareable URL contains only the computed scores, not raw quiz answers:
- 8 cuisine direction scores (float16 or quantized to uint8 for compactness)
- Top 5 mode indices + scores
- Total payload: ~30-50 bytes → base64 encoded into ~40-70 characters in the URL hash

When someone opens a profile link, the app decodes it and renders the profile directly (no quiz needed for viewing).

### 6. Compatibility Comparison

When two profiles exist (the viewer has completed the quiz and is viewing someone else's link):
- **Shared ground (primary):** Cuisines and modes where both score high. "You both love Mediterranean flavors — especially olive oil, garlic, and tomato-based dishes."
- **Conflicts:** Directions where one scores high and the other low. "They lean heavily into fermented East Asian flavors that you rated low."
- **Bridge foods:** Modes or ingredients where one person scores high and the other scores neutral (not negative). "They might introduce you to miso — you haven't tried it but your profile suggests you'd like umami flavors."
- **Eat-together suggestion:** A concrete recommendation synthesized from shared ground. "Try a Mediterranean mezze spread — you both scored high on olive oil, chickpeas, and herbs."

## Key Design Decisions

**Fixed 30-card set over adaptive quiz.** Makes all profiles directly comparable. A user who took a different quiz can't be meaningfully compared. Simplicity wins.

**3-tier taste rating + "Can't eat" exclusion.** Binary loses the crucial "neutral" signal. 5-point doubles decision time. 3-tier (+1/0/-1) captures direction of preference without overthinking. "Can't eat" is separate from "Not for me" so dietary restrictions don't skew taste profiles. Everyone sees the same 30 cards regardless of diet — comparability preserved.

**Cooc model as primary engine.** The co-occurrence model captures "what goes together in real recipes" — the most intuitive and explainable basis for taste inference. Chem model (molecular chemistry) is interesting but harder to explain to users.

**Scores in URL, not answers.** Storing 30 ratings would be ~30 bytes but would require recomputation on load. Storing computed scores is similar size and lets the receiver see the profile instantly. Also prevents reverse-engineering exact quiz answers from someone's shared link.

**No backend, no analytics.** The app works entirely offline after initial load. No user data ever leaves the browser except via the URL the user explicitly shares.

## Alternatives Considered

**Adaptive quiz (rejected):** Better signal per card, but profiles become incomparable if different users saw different ingredients. Also adds significant implementation complexity (real-time scoring during the quiz to select next card).

**Grid selection ("pick 5 favorites from 20") (rejected):** Faster, but doesn't capture negative signal. Knowing what someone dislikes is as important as what they love for compatibility.

**Backend with short codes (rejected):** Would allow shorter URLs and richer profiles. But adds infrastructure, requires hosting, introduces data persistence concerns, and violates the "no accounts, no backend" constraint.

## Risks and Observations

- **Ingredient recognition:** If users don't recognize many of the 30 ingredients, the quiz feels alienating. Mitigation: select commonly-known ingredients and always include the context line. The "Don't know" skip prevents bad signal.
- **Profile stability:** With only 30 ratings (some possibly skipped), profile scores might be noisy. Mitigation: choose ingredients with high discriminative power across cuisine directions (well-separated in embedding space).
- **URL length:** Some platforms truncate long URLs. Need to verify the encoded profile stays under ~200 characters total URL length.
- **Mode labels:** The Claude-generated labels from the paper need vetting — some may be technical or unclear. May need to write custom labels for user-facing display.
- **"Why" explanations:** Tracing back from a cuisine score to "because you rated X and Y highly" requires keeping a lightweight record of which ingredients contributed most to each direction. This is cheap to compute but needs to be designed in.
