# Talento global UI consistency and responsive fixes

## Scope
Preserve all routes, data, matching logic, actions, and role-specific content. Change only the shared header, logo presentation, card styling consistency, and mobile Candidates layout requested.

## Implementation
1. **One authenticated header**
   - Extract the authenticated top bar into a reusable shared header used by the existing app shell for both roles and every authenticated route.
   - Keep only the full Talento logo at the left and Notifications plus the existing initials avatar at the right.
   - Remove page titles and personal/company names from the top bar while preserving back navigation where a detail flow requires it outside the empty center area.
   - Use one fixed height, logo size, padding, and icon spacing at all breakpoints.

2. **Tightly crop the supplied logo**
   - Derive a tightly bounded image from the uploaded source by removing only surrounding white/empty pixels.
   - Preserve the complete original symbol, wordmark, colors, and proportions without redrawing or distortion.
   - Store and use the single cropped asset through the existing shared Logo component everywhere.

3. **Reusable card system**
   - Keep Recently Viewed → Recommended for you → Career Development Suggestions in that order.
   - Continue using the same JobCard component for both seeker job sections and normalize its stable height, spacing, logo, badge, explanation, and action layout.
   - Add/reuse a shared candidate-card presentation for HR Recent applications, HR recommendations, and the Candidates results where their content allows, while preserving each section’s information and actions.
   - Apply the same outer surface, spacing, typography, avatar, badge, explanation, and button sizing rules across job and candidate cards without making their content identical.

4. **Candidates mobile fit**
   - Make the page header action, search controls, selects, result cards, tags, match row, and action button shrink or stack at iPhone widths.
   - Add `min-width: 0`, wrapping, and full-width constraints where needed so long names, job titles, metadata, and skills cannot widen the viewport.
   - Preserve desktop columns and ensure the existing bottom-safe content spacing remains sufficient.

## Verification
- Run the project’s automated type/build checks.
- Test authenticated seeker and HR screens at 393px mobile and 1280px desktop.
- Verify header content and alignment, one consistent cropped logo, required seeker section order, card dimensions, Candidates `scrollWidth === clientWidth`, usable controls, visible final card/button above bottom navigation, and no browser console errors.
