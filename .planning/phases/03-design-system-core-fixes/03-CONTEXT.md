# Phase 3: Design System & Core Fixes - Context

**Gathered:** 2026-01-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Unify visual design across all dashboard pages with consistent card-based layouts and fix critical financial calculation errors. Establish dark theme with automotive color palette, responsive grid system, and smooth real-time update patterns. Ensure all profit, fuel economy, and aggregate metrics display accurate values.

This phase establishes the design foundation that all subsequent pages will follow.

</domain>

<decisions>
## Implementation Decisions

### Card Layout & Spacing Rhythm
- **Related metrics unified** - Group related metrics in single cards (e.g., all damage indicators in one "Vehicle Health" card, all fuel metrics in one "Fuel" card)
- **Equal responsive treatment** - Both mobile and desktop experiences equally important (no mobile-first or desktop-first bias)
- **Claude's Discretion**: Information density, specific spacing scale (4px vs 8px base), exact grid breakpoints

### Color Application & Theming
- **Traditional truck brand aesthetic** - Emulate Peterbilt/Kenworth classic automotive amber/orange warnings, analog-inspired colors
- **Gradient damage indicators** - Smooth color transition as damage increases (0-5% green → 5-15% yellow → 15%+ red with interpolation)
- **Claude's Discretion**: Exact semantic color roles (when to use amber vs green vs white), dark theme base color (true black vs dark gray), specific contrast levels

### Animation & Real-Time Updates
- **Instant updates** - Numbers change immediately without animated transitions (like traditional dashboards, no fade/slide effects)
- **Claude's Discretion**: Subtle highlights or flashes on value changes (if needed), transition timing for non-telemetry UI elements

### Financial Calculation Display
- **Whole dollars only** - Display monetary values as $2,275 (no cents, cleaner display matching game economy)
- **Red with minus sign for negative profit** - Display losses as -$450 in red color for clear visual indicator
- **Claude's Discretion**: Rounding rules for calculations, zero/null state displays, currency symbol placement, thousand separator format

</decisions>

<specifics>
## Specific Ideas

- Traditional truck brand aesthetic (Peterbilt, Kenworth) - classic automotive amber/orange warnings, analog-inspired styling
- Gradient damage visualization - smooth transitions feel more realistic than discrete zones
- Instant value updates - no animation delays for real-time telemetry (users need immediate feedback while driving)

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope

</deferred>

---

*Phase: 03-design-system-core-fixes*
*Context gathered: 2026-01-21*
