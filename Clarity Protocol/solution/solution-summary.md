# Solution Summary

Food Match is a static web app that turns Epicure's recipe-derived ingredient embeddings into a 5-minute taste quiz. No backend, no accounts — everything runs in the browser.

## What it feels like to use

You land on the app and get a quick explanation: 4 million recipes were analyzed to map how ingredients relate to each other. The quiz uses that map to figure out your palate.

You see 30 ingredient cards, one at a time. Each shows an ingredient name with a brief context note ("Dashi — savory stock base in Japanese cooking"). You tap Love it, It's fine, or Not for me. Takes about 4 minutes.

The app instantly shows your profile: your top cuisines with a "because" explanation, your flavor neighborhoods with example ingredients, concrete dish suggestions, and an LLM prompt you can paste to find matching restaurants.

You tap "Share" and get a URL. You text it to a friend. They take the quiz, then the app compares both profiles: what you both love, where you clash, a bridge food to try together, and a concrete "eat this together" suggestion.

## How it works under the hood

The 30 quiz ingredients are chosen to anchor Epicure's 8 cuisine directions. Your ratings (+1/0/-1) are combined with each ingredient's 300-dimensional embedding to produce a preference vector. Dot products against cuisine directions and mode centroids produce your scores. Only those scores go into the URL — compact enough to share (~28 characters of base64), and the profile renders instantly from them.

**Stack:** Vite + React + TypeScript. The entire Epicure data payload (quiz embeddings, cuisine vectors, mode atlas) is ~80-100KB gzipped, bundled as static JSON. Deploys to any static host.

## Key design choices that required discussion

- **Fixed 30 cards, not adaptive:** Ensures all profiles are comparable. Everyone answers the same quiz.
- **3-tier taste rating + "Can't eat":** Captures positive, neutral, and negative signal without overthinking. "Can't eat" and "Don't know" are both excluded from scoring so dietary restrictions don't produce false taste signals. Everyone sees the same 30 cards.
- **Scores in URL, not raw answers:** Compact (~20 bytes binary), instant rendering, and doesn't expose exact quiz responses.
- **Comprehensibility mandate:** Every output comes with plain-language "because" explanations grounded in ingredients the user actually rated. No scores, IDs, or jargon shown.
- **Only quiz ingredients ship:** We bundle only the 30 quiz embeddings (not all 1,790), keeping the data payload under 100KB gzipped.
- **Mode centroids precomputed at build time:** The mode atlas provides member lists; a build script averages their embeddings into centroid vectors.
