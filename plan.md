# Duewise — MVP implementation plan

## Product direction
Duewise is a desktop scholarship discovery workspace for Hacktoberfest 2026. It turns a student's documents and destination choice into a transparent shortlist: the interface emphasizes evidence, deadlines, and next steps instead of pretending an opaque model made the decision.

## Design system
- **Design movement:** editorial travel-journal dashboard — the visual ease of a destination guide combined with the clarity of a modern research tool.
- **Core principles:** (1) make progress visible, (2) turn eligibility into understandable evidence, (3) make the selected destination feel alive, (4) keep the interface warm and human.
- **Color philosophy:** parchment and ink neutrals create a calm reading surface; a coral-orange accent owns the brand and adds optimism; each country gets a distinct accent gradient so the destination treatment is unmistakably personal without changing the entire product chrome.
- **Layout paradigm:** a persistent left rail and asymmetrical editorial canvas. The destination card is intentionally oversized and image-like, while scholarship results sit in a quieter reading column.
- **Signature elements:** coral sunburst brand mark, paper-like cards with thin borders, country “postcard” card with an atmospheric gradient and stamp-like flag badge.
- **Interaction philosophy:** every control should explain its consequence — country selection updates the postcard and scholarship currency, eligibility pills open the reasoning trail, and save actions make a clear state change.
- **Animation:** subtle 180–240ms ease-out transitions for cards, filter pills, and drawer opening; no looping motion except a gentle upload progress shimmer; prefer opacity/translate over large scale changes.
- **Typography system:** Plus Jakarta Sans for interface copy and display headings; IBM Plex Mono for dates, labels, and source metadata. The hierarchy uses compact uppercase labels, oversized editorial headings, and readable 14–15px body text.
- **Brand essence:** “A clearer route to the scholarships that fit.” For curious, deadline-aware, independent students. Personality: **grounded, hopeful, precise**.
- **Brand voice:** direct, reassuring, lightly editorial. Example lines: “Find your next yes.” / “The why matters as much as the match.”
- **Wordmark & logo:** `duewise` in a custom lowercase lockup paired with a coral compass-sun mark: four rounded rays around a central dot, suggesting both direction and deadlines.
- **Signature brand color:** Coral Signal `#F46B45`.

## Implementation
- `client/src/pages/Home.tsx` owns the interactive MVP surface and local demo state.
- `client/src/index.css` defines the custom design tokens, layout primitives, card treatments, responsive behavior, and small interaction states.
- `public/manus-routes.json` declares the single `/` route for Webdev preview and publication.
- The demo is intentionally client-side and deterministic for the MVP: uploaded files are represented locally, profile extraction is simulated with a short progress state, and scholarship eligibility is computed from structured fixture data.
- Country data is structured by country key so changing the destination updates the flag, gradient, source link, currency, guide copy, and scholarship cards together.
