# Failure: Sharing & Engagement Loop

## Summary

The viral loop breaks: either the shared URL doesn't arrive intact, or the friend opens it but never takes the quiz. The core comparison value proposition never activates. Affects pairs who wanted to find food compatibility.

## Failure Chain

1. User A completes quiz and gets their profile with a share URL.
2. User A shares the URL via text, social media, or messaging app.
3a. **URL truncation path:** The platform truncates or reformats the URL. The link arrives broken. Friend clicks and sees an error or empty page. **Harm begins.**
   - *Intervention point (Prevention):* Keep total URL under 100 characters. Current design: ~28 chars base64 + domain = well within limits.
   - *Intervention point (Mitigation):* Graceful error if URL decode fails: "This link seems broken. Take the quiz yourself instead!"
3b. **Engagement drop path:** URL arrives intact. Friend opens it and sees User A's profile. But there's no compelling reason to take the quiz themselves — it just shows someone else's results.
   - *Intervention point (Prevention):* When opened via profile link, the landing screen should emphasize "Take the quiz to see what you have in common" as the primary CTA, not just display the friend's profile passively.
4. Friend leaves without taking the quiz. Comparison never happens. **Harm begins.**
5. User A asks "did you do the quiz?" and gets "I looked at it but didn't do it." Disappointing but not severe.

## Observations

- **Severity:** Medium — the app still works for individual profiles, but the "together" promise fails.
- **Related failures:** URL encoding design directly prevents the truncation variant.
- **Variants:** URL gets truncated, friend doesn't engage with quiz after opening link.

## Intervention Points

### Prevention
- URL must stay short: domain + /#p= + 28 chars = ~60-70 total. Already achieved.
- When friend opens a profile link, show a prominent "Take the quiz to compare" CTA above the friend's profile
- Brief teaser: "See what you'd enjoy eating together" to motivate quiz-taking
- Show friend's profile as partially hidden/blurred until comparison is unlocked by taking the quiz

### Detection
- Not measurable without analytics (which we've excluded by design)

### Mitigation
- If URL decode fails, show a friendly error with a direct "Take the quiz" button
- The friend's profile link should work even if they just want to view it (don't force the quiz)

### Recovery
- Friend can always take the quiz later; the URL remains valid indefinitely

---

## Management Plan

**Prevent through UX design:**

1. **Short URLs (already solved):** The binary encoding produces ~28 chars base64. Total URL stays under 80 characters. No truncation risk on any major platform.

2. **Friend landing experience (implementation):** When the app detects a profile in the URL hash:
   - Primary CTA: "Take the quiz to see your compatibility" (large, prominent)
   - Secondary: brief preview of the friend's top cuisines (motivation to engage)
   - Don't just passively show their full profile — make the comparison the draw

3. **Graceful decode failure (implementation):** If the hash doesn't decode, show: "Hmm, that link didn't work. Want to take the quiz fresh?" with a start button. No error codes or technical messages.
