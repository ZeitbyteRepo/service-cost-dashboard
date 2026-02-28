# UI Sprint Plan - 2026-02-28

## Objective
Implement card-to-detail navigation, fold-aware UX for Samsung Fold 6 (including flex mode), and explicit responsive breakpoint behavior without breaking current dashboard styling.

## 1) Provider Detail Pages (card clicks navigate)

### Technical approach
1. Convert provider cards from "small details link" behavior to full-card navigation.
2. Keep navigation semantic and accessible:
   - card container as primary click target
   - preserve keyboard navigation and visible focus styles
   - avoid nested interactive conflicts inside card body
3. Keep `/providers/[id]` as server-rendered detail route, but make it data-complete by rendering:
   - provider identity + status badge
   - all `cardMetrics` (or computed fallback)
   - all `detailSections`
   - all `objectLists`
   - 7-day trend area (real series if present, otherwise explicit unavailable state)
4. Add an API shape for provider details/trend-ready fields if needed so the page does not hardcode provider-specific logic.

### Files to modify
- `src/components/cards/ProviderCardShell.tsx`
- `src/components/cards/GenericProviderCard.tsx`
- `src/components/cards/ProviderCard.tsx` (if card wrapper API changes are needed)
- `src/app/providers/[id]/page.tsx`
- `src/lib/providers/types.ts` (extend for optional trend/series fields)
- `src/lib/providers/registry.ts` (populate extended fields when available)

### Implementation notes
- Prefer solving navigation once in `ProviderCardShell` and generic card so provider-specific card files do not need duplicate link wrappers.
- If full-card link is used, remove or demote the existing "Details ->" link text to avoid nested anchor issues.
- Use provider `id` route param directly and keep `notFound()` behavior for invalid IDs.

## 2) Samsung Fold 6 Flex Mode Support

### Technical approach
1. Add a dedicated fold/flex detection hook:
   - primary detection: `matchMedia('(vertical-viewport-segments: 2)')`
   - fallback heuristics using viewport width/height + orientation to infer likely flex posture
   - expose `isFlexMode`, `isCover`, `isFolded`, `isUnfolded`
2. Update home dashboard to support a split layout when `isFlexMode`:
   - top pane: compact provider grid
   - bottom pane: selected provider detail panel
3. In flex mode, clicking/tapping a card selects provider for bottom pane preview.
4. Outside flex mode, cards keep normal route navigation behavior to `/providers/[id]`.

### Files to modify
- `src/hooks/useFlexMode.ts` (new)
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/components/cards/ProviderCardShell.tsx` (selected-state styles / optional selection callback support)
- `src/components/cards/ProviderCard.tsx` (forward selection/navigation props)

### Implementation notes
- Progressive enhancement: if segmented viewport APIs are unavailable, app remains fully usable in standard responsive layouts.
- Keep flex-mode state local to page and avoid global store unless later required.

## 3) Responsive Breakpoints

### Target breakpoints
- `360px`: cover mode
- `640px`: folded portrait/tablet-compact
- `1024px`: unfolded wide

### Technical approach
1. Replace current grid breakpoints with explicit sprint values in `globals.css`.
2. Define mode-specific layout rules:
   - `< 400px` cover: summary-first, minimal chrome, single column cards, reduced secondary text
   - `>= 640px` folded: 2-column grid
   - `>= 1024px` unfolded: 3-4 column grid depending on available width
3. Enforce 48px minimum touch targets for interactive controls (refresh button, card hit targets, tabs/chips if added).
4. Add narrow-screen swipe handling in `page.tsx` to cycle selected provider (only active on narrow layouts).

### Files to modify
- `src/app/globals.css`
- `src/app/page.tsx`
- `src/hooks/useFlexMode.ts` (share breakpoint helpers)

### Implementation notes
- Keep existing CRT visual style; adjust spacing/scale only where readability or touch usability requires it.
- Ensure swipe gestures do not conflict with vertical scroll (horizontal threshold + intent detection).

## Execution sequence
1. Provider card navigation + detail completeness
2. Flex mode hook + split layout integration
3. Breakpoint/touch/gesture polish
4. Manual verification across viewport presets (360, 640, 1024, wide) and fold simulation where available

## Definition of done mapping
- Clicking any provider card navigates to `/providers/[id]` outside flex mode
- Provider detail page renders identity, health, metrics, sections, object lists, and trend area state
- Dashboard supports cover/folded/unfolded breakpoints with expected card density
- Flex mode shows top/bottom split with selected provider detail preview
- Interactive targets meet 48px minimum in narrow layouts
