# Smaller, unified interface typography

## Scope
- Keep the existing Plus Jakarta Sans family across the interface.
- Reduce the shared text scale slightly so screens feel cleaner and more compact.
- Preserve the current hierarchy between page headings, section headings, body text, labels, helper text, badges, and buttons.
- Leave layout, spacing, colors, icons, content, navigation, and component behavior unchanged.

## Implementation
- Define one consistent typography scale in the global stylesheet for extra-small through display text.
- Set a slightly smaller readable base size and consistent line heights and weights.
- Normalize the few one-off interface font sizes to the shared scale where they create inconsistency.
- Keep CV document/template typography unchanged so downloaded CV formatting is not altered by an interface-only request.

## Verification
- Check representative authentication, Job Seeker, and Employer/HR screens on desktop and iPhone widths.
- Confirm headings remain distinct, text stays readable, and labels/buttons/cards do not overflow or wrap unnecessarily.
- Confirm no layout, spacing, color, icon, content, or interaction changes.
