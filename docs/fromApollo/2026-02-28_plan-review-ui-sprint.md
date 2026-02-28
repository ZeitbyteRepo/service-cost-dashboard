# Plan Review: UI Sprint - Card Navigation, Fold 6 Flex Mode, Responsive Breakpoints

## Summary

This plan implements three related UX enhancements: (1) converting provider cards to full-click navigation with complete detail pages, (2) adding Samsung Fold 6 flex mode support with split-screen layout, and (3) establishing explicit responsive breakpoints for cover/folded/unfolded modes.

## Strengths

- **Clear technical approach** - The `vertical-viewport-segments` media query is the correct modern API for fold detection
- **Progressive enhancement mindset** - App remains usable when fold APIs are unavailable
- **Accessibility baked in** - Keyboard navigation, focus styles, and 48px touch targets are specified upfront
- **Well-scoped file list** - Changes are localized to specific components and hooks
- **Testable definition of done** - Each item can be verified with concrete actions
- **No nested interactive conflicts** - Explicitly addresses the full-card link vs. internal links issue
- **Execution sequence is logical** - Core navigation first, then enhancements

## Concerns

| Priority | Concern |
|----------|---------|
| MEDIUM | No testing strategy for flex mode - Chrome DevTools doesn't natively simulate viewport-segments API |
| MEDIUM | Selected provider state in flex mode has no persistence strategy (URL? localStorage? lost on refresh?) |
| LOW | Swipe gesture vs. scroll conflict mentioned but threshold values not specified |
| LOW | No explicit loading/error states defined for provider detail page |
| LOW | Impact on existing tests not addressed |

## Suggestions

1. **Testing flex mode**: Add a dev-mode override (e.g., `?flex=force` query param) to manually trigger split layout for testing without physical Fold device

2. **Selected provider persistence**: Use URL query param `?selected=<id>` in flex mode so users can share/bookmark the state

3. **Swipe thresholds**: Specify values in implementation notes, e.g., "horizontal delta > 50px and vertical delta < 30px triggers swipe"

4. **Provider detail fallbacks**: Add explicit "Trend data unavailable" and "Loading metrics..." UI states to the detail page spec

5. **Test impact**: Note which existing tests may need updates when card click behavior changes

## Verdict

**APPROVED**

The plan is technically sound and well-structured. The concerns above are recommendations for implementation robustness, not blockers. The core approach using `vertical-viewport-segments` with fallbacks, the file scope, and the execution sequence are all appropriate. Proceed with implementation.

---

*Apollo - Plan Review Complete - 2026-02-28*
