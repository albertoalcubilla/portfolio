---
name: Alberto Alcubilla · Pared de galería
description: A Director of Photography's portfolio as a white gallery wall, stills and reel hung at staggered sizes and heights, with a whisper of small uppercase type.
colors:
  wall: "#ffffff"
  ink: "#111111"
  ink-soft: "#6b6b6b"
  hairline: "#e4e4e2"
  pill: "#efefed"
  media-well: "#0c0c0c"
  reel-well: "#000000"
typography:
  lede:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.75rem, 3.6vw, 3.1rem)"
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.45
  list:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.35
  label:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 560
    lineHeight: 1.45
    letterSpacing: "0.01em"
  label-light:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 450
    lineHeight: 1.45
    letterSpacing: "0.01em"
  figures:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.35
    fontFeature: "'tnum' 1"
rounded:
  none: "0"
  pill: "999px"
spacing:
  edge: "clamp(1rem, 2vw, 1.75rem)"
  col-gap: "clamp(1rem, 2.4vw, 2.5rem)"
  bar: "1rem"
  grid-top: "4.5rem"
  grid-top-narrow: "3.5rem"
  stack-narrow: "2.5rem"
  block-gap: "3rem"
  label-gap: "0.75rem"
  group-gap: "2rem"
  info-top: "clamp(8rem, 18vw, 16rem)"
  cols-top: "clamp(3rem, 7vw, 6rem)"
  foot-top: "clamp(6rem, 12vw, 10rem)"
components:
  nav-link:
    textColor: "{colors.wall}"
    typography: "{typography.label}"
    padding: "1rem clamp(1rem, 2vw, 1.75rem)"
  grid-caption:
    textColor: "{colors.wall}"
    typography: "{typography.label}"
  grid-caption-touch:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "0.55rem 0 0"
  grid-media:
    backgroundColor: "{colors.media-well}"
    rounded: "{rounded.none}"
  reel-media:
    backgroundColor: "{colors.reel-well}"
    rounded: "{rounded.none}"
  reel-play:
    backgroundColor: "{colors.wall}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.55rem 0.95rem"
  reel-play-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.wall}"
  filter-pill:
    backgroundColor: "{colors.pill}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.3rem"
  filter-option:
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
    padding: "0.45rem 0.8rem"
  filter-option-hover:
    textColor: "{colors.ink}"
  filter-option-active:
    backgroundColor: "{colors.wall}"
    textColor: "{colors.ink}"
  info-heading:
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
  credit-row:
    textColor: "{colors.ink}"
    typography: "{typography.list}"
    padding: "0.35rem 0"
  footer:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "1rem clamp(1rem, 2vw, 1.75rem) 5rem"
---

# Design System: Alberto Alcubilla · Pared de galería

## Overview

**Creative North Star: "The White Gallery Wall"**

The page is a white wall in a gallery. Stills and the reel hang on it at different sizes and different heights, offset across a twelve-column grid so no two frames line up the way thumbnails would. The work carries all of the colour; the wall is white, the ink is near-black, and the interface is reduced to a whisper of small uppercase type at the edges: four nav words across the top, a caption that appears on the frame you are looking at, a pill of filters floating at the foot of the wall.

Density is low and deliberate. Frames are separated by generous, irregular vertical offsets, and the only text of any size is one lede sentence in the Información section. Below the wall, the information area returns to the same twelve columns, divided from the work by a single hairline, with the portrait, contact, training and a ruled credits list set side by side.

The system refuses the boxed equal-thumbnail grid and any decorative chrome: no cards, no borders around frames, no accent colour, no ornament.

**Key Characteristics:**
- White wall (`wall`), near-black ink (`ink`), one grey (`ink-soft`), one hairline (`hairline`); no accent hue.
- Frames hung on a 12-column grid with per-item column spans and vertical offsets, never a uniform tile grid.
- One UI voice: 13px Archivo, weight 560, uppercase, for nav, captions, filter, reel button, info headings and footer.
- One large lede sentence is the only display-sized type.
- Square frames; the pill radius belongs only to the filter and the reel button.
- Motion is slow and settling: images ease in scale, captions fade down into place, all on one ease-out curve.

## Colors

A strict monochrome wall: white, near-black, one grey and one hairline, so the stills supply every colour on the page.

### Neutral
- **Gallery White** (`wall`): the ground of the entire page; also the active filter option, the reel button fill, and the caption and nav colour over imagery.
- **Gallery Ink** (`ink`): all primary text, the reel button hover fill, the skip link, text selection and the focus outline.
- **Wall-Label Grey** (`ink-soft`): secondary text only; info headings, unselected filter options, the role and year columns of the credits list, caption second lines on touch, and the footer link hover.
- **Hairline** (`hairline`): the single rule above the information columns and the dividers between credit rows.
- **Pill Grey** (`pill`): the floating filter pill's ground, a step off white so it reads as an object resting on the wall.
- **Frame Black** (`media-well`): the well behind every still while it loads or letterboxes.
- **Reel Black** (`reel-well`): the reel frame's ground under its poster.

### Named Rules
**The Stills Carry the Colour Rule.** No accent hue exists. Every chromatic pixel on the page comes from a photograph or the reel. A coloured button, link or rule is a defect.

**The One Grey Rule.** Secondary information uses `ink-soft` and nothing else. Do not introduce a second grey for tertiary text; drop the information or move it into the label voice.

## Typography

**Display Font:** none; the lede is set in the body family.
**Body Font:** Archivo (with Helvetica Neue, Arial, sans-serif), self-hosted variable font at normal width.
**Label Font:** Archivo, same family.

**Character:** A single plain grotesk at normal width in two registers: a quiet 13px uppercase label voice for all interface, and one large tightly tracked sentence for the only statement on the page. Hierarchy comes from case and size, never from a second family.

### Hierarchy
- **Lede** (500, `clamp(1.75rem, 3.6vw, 3.1rem)`, line-height 1.08, -0.02em, max 22ch, balanced wrap): the one introductory sentence in Información. Used once.
- **Body** (400, 1rem, line-height 1.45): base text.
- **List** (400, 1rem, line-height 1.35): contact, training and credit lines in the information columns.
- **Figures** (List with tabular numerals): the year column of the credits list.
- **Label** (560, 0.8125rem / 13px, 0.01em, uppercase): nav, grid captions (first line), filter options, reel button, info headings, footer.
- **Label Light** (450, same size and case): the second line of each grid caption (format, role, year).

### Named Rules
**The Whisper Rule.** All interface text is the Label voice: 13px, 560, uppercase. If a control or caption needs to be louder, it is in the wrong place; do not raise its size.

**The One Statement Rule.** Only the lede is set large. Section titles are visually hidden headings or Label-voice headings; there are no display headlines on the wall.

## Layout

The wall is a 12-column grid (`col-gap` between columns) inset from the viewport by `edge`, starting `grid-top` below the fixed nav. Each frame declares its own column span and a vertical offset (between 0 and 14rem) inline, so frames sit at staggered heights and widths. Spans run from 3 columns (the tall portrait still) to 7 columns (the reel). Each frame keeps its source aspect ratio; nothing is cropped to a shared ratio except the reel at 16:9.

The nav and footer share one four-column bar structure: first item flush left, middle items centred in their column, last item flush right.

The information section opens `info-top` below the wall with the lede, then a hairline-topped 12-column row: portrait (columns 1-3, 4:5 crop), contact (4-5), training and experience (6-8), credits (9-12). Label headings sit `label-gap` above their lists, and a second heading in the same block sits `group-gap` below the previous list.

At max-width 799px the wall becomes a 6-column grid with `stack-narrow` row gaps and no vertical offsets; frames alternate their spans in a four-step rhythm (full, 2-6, 1-5, 3-6) so the stagger survives as a horizontal sway. The reel stays full width, the tall still takes columns 2-5. The nav collapses to three items (Reel hidden), the information row becomes two columns (portrait beside contact, the rest full width), and the footer becomes a 2x2 grid.

### Named Rules
**The Hung, Not Tiled Rule.** No two adjacent frames share both a column span and a vertical offset. A row of equal thumbnails is the thing this system replaces.

## Elevation & Depth

The wall is flat. Depth comes from photographs, not from surfaces. Two shadows exist, each tied to a specific object.

### Shadow Vocabulary
- **Pill rest** (`box-shadow: 0 6px 20px -10px rgb(0 0 0 / 0.25)`): under the floating filter pill only, so it reads as resting just off the wall.
- **Caption legibility** (`text-shadow: 0 1px 12px rgb(0 0 0 / 0.45)`): behind white captions shown over a still on hover, for legibility on bright frames.

### Named Rules
**The Flat Wall Rule.** Frames, info blocks and lists never take a shadow or border. Only the floating pill is lifted.

## Shapes

Everything is square: frames, the portrait, the information columns and the credit rows have no radius. The only round form is the full pill (`pill`, 999px), reserved for the filter pill, its options and the reel play button. Rules are 1px `hairline`, horizontal only.

## Components

### Navigation
- **Character:** four words across the top of the wall, almost invisible until needed.
- **Style:** fixed to the top, `bar` vertical padding and `edge` side inset, Label voice in white with `mix-blend-mode: difference`, so it inverts against whatever frame or wall passes under it. The bar itself ignores pointer events; only the links take them.
- **Hover:** a 1px underline grows from the left to full width (0.4s, house ease-out).
- **Mobile:** below 800px, three items (name left, Trabajos and Información right); Reel is hidden.

### Grid Frame and Caption (signature)
- **Frame:** square-cornered media well (`media-well`) at the image's own aspect ratio, image covering it.
- **Caption on hover devices:** title (Label) over format, role and year (Label Light), right-aligned in white at the frame's top-right, inset 0.9rem / 1rem, with the caption legibility shadow. Hidden at rest; on hover or focus within, it fades in (0.35s) and settles down from -4px (0.5s), and the image scales to 1.025 over 1.2s.
- **Caption on touch devices:** always visible below the frame, left-aligned, 0.55rem above, second line in `ink-soft`.
- **Reveal:** with JS, frames below the first viewport start with the image at scale 1.08 and settle to 1 as they enter. Content is visible without JS.

### Reel
- **Frame:** a 16:9 well on `reel-well` with the poster behind a muted, looping preview that loads only when near the viewport (skipped with reduced motion or Save-Data).
- **Play button:** a white pill (`reel-play`) at bottom-left, inset 1rem, in the Label voice. Hover inverts it to ink with white text (0.25s). On press, the button fades out and the full reel plays with sound and native controls.
- **Caption:** on hover devices the reel caption is always shown, not hover-gated.

### Filter Pill
- **Style:** fixed, centred, 1.25rem above the viewport bottom; `pill` ground, 0.3rem inner padding, 0.15rem between options, pill rest shadow. Label voice.
- **Options:** transparent with `ink-soft` text; hover darkens to `ink`; the pressed option (`aria-pressed="true"`) becomes a white pill with `ink` text.
- **Behaviour:** choosing an option hides non-matching frames and scrolls back to the wall. When the Información section arrives, the pill steps aside: fades out and drops 1rem (0.4s), and stops taking pointer events.

### Information Blocks
- **Headings:** Label voice in `ink-soft`, `label-gap` below.
- **Lists:** List type, 0.15rem vertical padding per line.
- **Links:** carry a 1px underline at rest that retracts on hover (the inverse of the nav).

### Credits List
- **Style:** each row is a three-column line (title, role at 4.5rem, year at 2.75rem, 0.75rem gaps), 0.35rem vertical padding, a 1px `hairline` below. Role and year are `ink-soft`; the year is right-aligned with tabular figures.

### Footer
- **Style:** the four-column bar again (copyright, email, Instagram, back to top) in the Label voice, `foot-top` below the information section, with 5rem bottom padding to clear the floating pill (6rem on narrow screens).
- **Hover:** links shift to `ink-soft`.

### Focus, Selection and Skip Link
- **Focus:** 2px solid `ink` outline, 3px offset, on every focusable element.
- **Selection:** `ink` ground with `wall` text.
- **Skip link:** an `ink` block with `wall` text that drops in from above the viewport on focus.

### Motion
One house curve, `cubic-bezier(0.16, 1, 0.3, 1)`, drives every eased transition. Durations scale with the size of what moves: 0.2-0.25s for colour fills, 0.35-0.5s for captions, underlines and the pill stepping aside, 0.9-1.2s for image scale. Under `prefers-reduced-motion: reduce`, transitions are effectively instant, smooth scrolling is off, the reveal scale is removed and the reel preview never autoloads.

## Do's and Don'ts

### Do:
- **Do** hang each frame with its own column span and vertical offset on the 12-column grid, keeping its source aspect ratio.
- **Do** set every piece of interface text in the Label voice (13px, 560, uppercase, 0.01em).
- **Do** keep secondary text in `ink-soft` and rules in 1px `hairline`.
- **Do** reveal captions on the frame at hover on pointer devices and place them below the frame on touch devices.
- **Do** use the house ease-out `cubic-bezier(0.16, 1, 0.3, 1)` and honour reduced motion and Save-Data.
- **Do** keep the reel as a muted loop until the visitor asks for sound.

### Don't:
- **Don't** introduce an accent colour; the stills carry all colour.
- **Don't** lay frames out as an equal-thumbnail grid or box them in cards, borders or shadows.
- **Don't** round frames, blocks or rows; the 999px pill belongs only to the filter and the reel button.
- **Don't** add display headlines or raise UI text above 13px; the lede is the only large type.
- **Don't** add decorative chrome (icons, dividers between frames, background textures) to the wall.
