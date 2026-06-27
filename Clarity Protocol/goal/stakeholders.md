# Stakeholders

## Quiz-Taker

**Type:** aligned
**Engagement:** direct

**Characteristics:** Non-technical. May know nothing about food science or embeddings. Wants a quick, fun experience that tells them something true about their tastes. Likely arrives via a shared link from a friend.

**Goals:** Learn something about their palate. Get actionable food suggestions. Share results easily.

**Concerns:** Quiz feels too long or confusing. Results feel generic or wrong. Ingredients shown are unfamiliar or too niche.

## Profile Pair (Two People Comparing)

**Type:** aligned
**Engagement:** direct

**Characteristics:** Two people who want to eat together. One has already completed the quiz and shared their profile link. The second completes theirs and triggers the comparison.

**Goals:** Find shared food ground quickly. Get a concrete suggestion for what to eat together. Discover something new they'd both enjoy.

**Concerns:** Compatibility output is vague or unhelpful. No clear "what to do next" action.

## Epicure Researchers

**Type:** aligned
**Engagement:** indirect

**Characteristics:** The paper's authors. Not users of the app, but their work is the foundation. CC-BY-4.0 license governs the data.

**Goals:** Their research gets used and cited correctly.

**Concerns:** Misrepresentation of the model's capabilities. Attribution missing.

## Link-Spammer / Bad Actor

**Type:** adversarial
**Engagement:** direct

**Characteristics:** Minimal threat surface given no backend, no user data, no accounts. Could potentially craft malicious profile URLs.

**Goals:** Inject harmful content via URL-encoded profile data.

**Concerns:** Profile URL parsing must be safe against injection.
