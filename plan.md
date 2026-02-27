# Markout Generator Module — Implementation Plan

## Overview
New tab "Markout" in WYP Assist that imports CSV rigging data and renders an interactive 2D plot with center lines, point labels, color-coded types, and exports to Arch D / A1 PDF format.

## CSV Format (from Iron Maiden arena data)
```
#, POINT LABEL, Y [m], X [m], Y [ft], X [ft], TYPE, Load [lbs], Load [kgs], NOTES, TRIM [ft], TRIM [m], CABLE [ft], CABLE [m]
```
- X axis = stage left/right (negative = stage right)
- Y axis = upstage/downstage (positive = upstage)
- Origin (0,0) = center stage
- Data includes both metric and imperial values already
- Point types: Stage, 1 Ton Generic Hoist, Fall Arrest, 1 Ton Video, 1 Ton Lights, Cable Pick, Audio, Floormark, etc.

## Changes to `src/wyp-assist.jsx` (single file, matching existing patterns)

### 1. Add i18n strings for both languages
- `tabMarkout`, `moTitle`, `moImportCSV`, `moUnit`, `moExportPDF`, `moPaperSize`, `moPointLabel`, `moType`, `moLoad`, `moNotes`, `moTotalPoints`, `moTotalWeight`, `moCenterLine`, `moUpstage`, `moDownstage`, `moStageLeft`, `moStageRight`, etc.

### 2. Add color map constant
```
MARKOUT_COLORS = {
  "Stage": "#888",
  "1 Ton Lights": "#FFD700",
  "1 Ton Video": "#00BFFF",
  "1 Ton Generic Hoist": "#FF6B35",
  "1/2 Ton Generic Hoist": "#FF9F6B",
  "1 Ton Cable Pick": "#2ECC71",
  "1/2 Ton Cable Pick": "#7DCEA0",
  "1 Ton Audio": "#E056CF",
  "Fall Arrest": "#E74C3C",
  "Floormark": "#9B59B6",
  "Unknown Other": "#95A5A6",
}
```
Default fallback color for unrecognized types.

### 3. CSV parser function
- `parseMarkoutCSV(text)` — splits lines, detects header, returns array of point objects
- Handles quoted fields, trailing commas, summary row at bottom
- Returns `{ points: [...], errors: [] }`

### 4. `MarkoutTab()` component
**State:**
- `csvData` — raw parsed points array
- `unit` — "imperial" | "metric" (toggleable)
- `paperSize` — "archD" | "a1"
- `fileName` — imported file name

**Layout (top to bottom):**
1. **Card: Import & Controls**
   - File upload button (CSV)
   - Unit toggle (Imperial/Metric) using existing `Chips` component
   - Paper size toggle (Arch D / A1) using `Chips`
   - Export PDF button (existing `exportBtn` style)
   - Summary stats: total points, total weight

2. **Card: SVG Visualizer** (real-time, updates on unit toggle)
   - Full-width SVG with proper aspect ratio
   - Grid lines every 10ft / 5m
   - **Center lines**: dashed lines at X=0 (vertical) and Y=0 (horizontal), labeled
   - Axis labels with tick marks in selected unit
   - Points rendered as colored circles by TYPE
   - Point labels (POINT LABEL field) next to each dot
   - Stage outline connected (where TYPE === "Stage")
   - Legend showing type → color mapping
   - Compass labels: Upstage/Downstage/Stage Left/Stage Right

3. **Card: Data Table**
   - Full table of all points, styled with existing `tbl`/`th`/`td` styles
   - Columns: #, Label, Y, X, Type, Load, Notes
   - Values shown in selected unit system
   - Sortable by column (click header)
   - Color indicator dot matching the visualizer

### 5. PDF Export function
- `generateMarkoutPDF({ points, unit, paperSize, fileName, tx, theme })`
- Paper sizes:
  - **Arch D**: 24" × 36" (609.6mm × 914.4mm) landscape
  - **A1**: 594mm × 841mm landscape
- Content: Title block, the SVG plot rendered via jsPDF drawing commands (lines, circles, text), data table on page 2+
- Center lines, grid, axis labels, legend all included
- Uses same jsPDF import pattern as existing Pull Sheet export

### 6. Wire into main app
- Add `{id:"markout", icon:"📐", label:tx.tabMarkout}` to `tabList`
- Add `{tab==="markout"&&<MarkoutTab/>}` in main render
- Update test file to expect 4 tabs instead of 3

## Files Modified
- `src/wyp-assist.jsx` — all implementation (matching single-file pattern)
- `src/test/wyp-assist.test.jsx` — update nav tab count, add markout tab test
- `src/test/helpers.test.js` — add CSV parser tests

## No New Dependencies
- CSV parsing done manually (simple split logic, no library needed)
- SVG rendering via React JSX (no D3 or chart library)
- PDF export via existing jsPDF dependency
