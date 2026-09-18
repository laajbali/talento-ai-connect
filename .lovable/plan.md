# Talento compact header and unified card system

## Scope
Preserve all routes, data, navigation, matching logic, content, bottom navigation, and role-specific workflows. Change only the authenticated header sizing, shared job/candidate card presentation, card actions, AI explanation presentation, and Candidates mobile fit requested.

## Implementation
1. **Compact global header**
   - Keep the existing single authenticated header used by both roles and every authenticated screen.
   - Retain only the full Talento logo at left and Notifications plus initials avatar at right; keep the center empty.
   - Reduce the displayed logo by roughly 20–25% without modifying the tightly cropped source artwork, proportions, or colors.
   - Preserve identical header height, alignment, and spacing across routes and roles.

2. **One compact card design system**
   - Refactor the shared job and candidate cards around one reusable card frame and shared internal primitives for identity, metadata/badges, AI explanation, and actions.
   - Reduce padding, avatar size, section gaps, AI area padding, and button height by about 15–20% while keeping all text readable and controls touch-friendly.
   - Keep job and candidate information role-specific, but align width, radius, border, shadow, hierarchy, spacing, and visual weight.
   - Apply the same system to seeker Recently Viewed and Recommended jobs, HR Recent Applications and Recommended candidates, the Candidates results, and other existing shared-card usages.

3. **Unified actions and saves**
   - Style View details and View profile identically as white/neutral outlined buttons with dark/navy text, matching dimensions and typography.
   - Give every applicable job and candidate card the same adjacent Save control and preserve the existing saved-jobs/saved-candidates state behavior.
   - Add the existing candidate save behavior to HR dashboard cards without changing candidate data or navigation.

4. **Unified AI match explanation**
   - Extract one reusable AI explanation block with the same badge, heading, background, radius, padding, typography, and spacing.
   - Use “Why this matches you” for seeker job cards and relevant candidate-match copy for HR cards within the same component structure.
   - Keep all current explanations and match information visible.

5. **Candidates mobile fit**
   - Keep desktop columns unchanged.
   - At iPhone widths, ensure page controls stack, cards use the full available content width, long metadata/skills wrap, and action buttons fit without clipping.
   - Preserve fixed bottom navigation and sufficient bottom clearance, with zero horizontal overflow.

## Verification
- Run the project’s automated checks.
- Test seeker home, HR home, and Candidates at 393px and 1280px.
- Confirm the header has only logo/notifications/avatar, compact logo dimensions, matching card/action/AI styling, Save on every requested card, Candidates `scrollWidth === clientWidth`, visible last content above bottom navigation, and no console errors.
