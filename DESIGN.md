---
name: Bombay Palace
description: A Sunday dining page on warm paper, with a Goudy headline beside a square photograph and one deep green for the action.
colors:
  green: "#1b4332"
  green-pressed: "#143328"
  on-green: "#ffffff"
  paper: "#fbf9f6"
  sheet: "#ffffff"
  ink: "#1c1916"
  ink-soft: "#3f3a34"
  ink-quiet: "#5c564c"
  line: "rgba(28,25,22,.14)"
  line-strong: "rgba(28,25,22,.32)"
  danger: "#8e2f1c"
  danger-wash: "#f8e8e4"
  selection: "#d7e6dc"
typography:
  display:
    fontFamily: "\"Sorts Mill Goudy\", Georgia, \"Times New Roman\", serif"
    fontSize: "clamp(2.15rem, 3.6vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "0"
  headline:
    fontFamily: "\"Sorts Mill Goudy\", Georgia, \"Times New Roman\", serif"
    fontSize: "clamp(2rem, 3vw, 3.15rem)"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "0"
  brand:
    fontFamily: "\"Sorts Mill Goudy\", Georgia, \"Times New Roman\", serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0"
  name:
    fontFamily: "\"Source Sans 3\", \"Segoe UI\", sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: "\"Source Sans 3\", \"Segoe UI\", sans-serif"
    fontSize: "1.35rem"
    fontWeight: 600
  body:
    fontFamily: "\"Source Sans 3\", \"Segoe UI\", sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  lede:
    fontFamily: "\"Source Sans 3\", \"Segoe UI\", sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "\"Source Sans 3\", \"Segoe UI\", sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.4
  button:
    fontFamily: "\"Source Sans 3\", \"Segoe UI\", sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1
rounded:
  control: "2px"
spacing:
  gutter: "clamp(20px, 4vw, 40px)"
  band: "clamp(64px, 8vw, 104px)"
  stack: "14px"
  cluster: "8px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.on-green}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.green-pressed}"
    textColor: "{colors.on-green}"
  button-primary-small:
    backgroundColor: "{colors.green}"
    textColor: "{colors.on-green}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "44px"
  button-secondary:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 18px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  text-button:
    backgroundColor: transparent
    textColor: "{colors.ink-soft}"
    padding: "0"
    height: "44px"
  filter:
    backgroundColor: transparent
    textColor: "{colors.ink-soft}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "44px"
  filter-pressed:
    backgroundColor: "{colors.green}"
    textColor: "{colors.on-green}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "44px"
  search:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "48px"
  field:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "8px 10px"
    height: "44px"
---

# Design System: Bombay Palace

## Overview

**Creative North Star: "The Sunday Dining Page"**

The page is set like a printed Sunday dining feature on warm paper. A square photograph and a Sorts Mill Goudy headline share the opening; the rest of the visit is a scannable menu, hairline rules, and a clear action. Sections are airy: each one starts with a single rule and a deep band of the same paper, and each dish is one line.

Color is almost all paper and charcoal. Deep green is the only accent. It fills the primary action and the pressed category filter, and it also draws the focus ring, the current-section underline, text links, nav hover, a pressed tab, and the open-status label. Photographs keep their own proportion. The caption or the name sits under the plate, never on it. Corners are 2px. Nothing is lifted with a drop shadow.

Two self-hosted faces do all the work. Sorts Mill Goudy, at its only shipped weight, is the wordmark and the headlines. Source Sans 3 is navigation, the menu, buttons, and captions. A proposed arch mark sits beside the wordmark in the header and the footer.

**Key Characteristics:**

- Warm paper field and charcoal ink, with white reserved for typing surfaces and dialogs
- Self-hosted Sorts Mill Goudy for the wordmark and headlines; self-hosted Source Sans 3 for the UI and the menu
- Square photograph sharing the opening with the headline, caption under the plate
- Deep green for the primary action and the pressed filter
- 2px corners, 1px hairline rules, and no drop shadows

## Colors

The page is warm paper and charcoal, with one deep green held for action, pressed state, and focus.

### Primary

- **Deep Green** (`green`): The primary action, the pressed category filter, the focus ring, the current-section underline, text links, navigation hover, a pressed spice or editor tab, and the open-status label. It is not a section background, a headline color, or a treatment on a photograph.
- **Pressed Green** (`green-pressed`): Hover of the primary action and of an already pressed filter, where hover is available.
- **On Green** (`on-green`): Label color on a filled green control, on the optional announcement strip, and on the small-screen directions action.

### Neutral

- **Warm Paper** (`paper`): The page, the sticky header, the footer, the stuck menu tools, and the frame inside the gallery dialog. `theme-color` matches it.
- **Sheet** (`sheet`): Search, form fields, the newsletter field, editor utility buttons, and the dialog surface. Sheet sits on paper so a field is visible without a shadow.
- **Charcoal Ink** (`ink`): Body text on paper, the wordmark, headlines, primary navigation when current, secondary button borders and hover fill, and the toast.
- **Soft Ink** (`ink-soft`): Secondary copy, resting navigation, the hero introduction, dish descriptions, and text buttons.
- **Quiet Ink** (`ink-quiet`): Captions, photo notes, placeholders, counts, and unconfirmed prices.
- **Hairline** (`line`): Section rules, dish rules, header and footer edges, and the current-nav’s surrounding structure.
- **Strong Hairline** (`line-strong`): Borders of search, filters, fields, and the empty-menu divider.
- **Danger** (`danger`): Error text and the editor’s restore action. It is not a brand accent.
- **Danger Wash** (`danger-wash`): The error banner behind danger text.
- **Selection** (`selection`): Text selection. A pale green wash, not a fill for controls.

**The Paper Field Rule.** The page background stays warm paper. Bands do not take a second fill. White is for a surface that accepts typing, or for a dialog.

**The One Green Rule.** Deep green is the only accent, and it is never a page field. It fills the primary action and the pressed category filter. The same green draws the 2px focus ring and the current-section underline, and it colors a text link, navigation hover, a pressed tab underline, and the open-status label.

## Typography

**Display Font:** Sorts Mill Goudy (Georgia, Times New Roman)

**Body Font:** Source Sans 3 (Segoe UI, sans-serif)

Both faces are self-hosted woff2 files, loaded with `font-display: swap`. Goudy ships at weight 400 only. Source Sans 3 ships at 400, 500, and 600.

**Character:** An old-style serif at a modest size for the wordmark and the headlines, with a plain humanist sans for everything a person scans or taps. Headlines are regular, not light and not bold. The sans carries the menu.

### Hierarchy

- **Display** (400, `clamp(2.15rem, 3.6vw, 3.5rem)`, line-height 1.08, letter-spacing 0): The opening headline only.
- **Headline** (400, `clamp(2rem, 3vw, 3.15rem)`, line-height 1.12, letter-spacing 0): Section titles. The visit name uses the same face one step smaller, `clamp(1.8rem, 2.6vw, 2.4rem)`, line-height 1.15.
- **Brand** (400, 1.5rem, line-height 1, letter-spacing 0): The wordmark in the header and the footer. From 760px down it is 1.25rem.
- **Name** (600, 1.25rem, line-height 1.2): Category names under a plate. The line under the opening headline uses this size at line-height 1.35. Dish names are 1.125rem at weight 600 and line-height 1.35.
- **Title** (600, 1.35rem): A menu group title and the empty-result heading, in the sans, not in Goudy.
- **Lede** (400, 1.125rem, line-height 1.6): The sentence under a section title, held to about 62ch, in soft ink.
- **Body** (400, 1.0625rem, line-height 1.6): Page copy. The opening introduction stays within about 42ch. Story and dish descriptions stay within about 62ch.
- **Label** (400, 0.9375rem, line-height 1.4): Captions, photo notes, counts, and field help, in quiet ink.
- **Button** (600, 1.0625rem, line-height 1): Primary and secondary actions, and category filters. The compact action in the header is 1rem. Navigation links are 1.0625rem at weight 500.

**The Two Faces Rule.** Sorts Mill Goudy is the wordmark and the headlines. Source Sans 3 is navigation, body, the menu, buttons, filters, and captions. A headline is not set in the sans, and a button is not set in Goudy.

## Layout

The page is one column, `min(1120px, 100% - 2 × gutter)`. The gutter runs from 20px to 40px. Sections are bands with 64px to 104px of padding, separated by a hairline. The header is sticky, paper, 76px tall, and 64px from 760px down. The wordmark stays in that bar for the whole visit.

From 860px up, the opening is a float: the square photograph sits on the right at `min(48%, 520px)`, and the headline, support line, introduction, actions, and address run beside it. Below 860px those parts stack, and the photograph follows the address. The caption remains under the image in both arrangements.

The story and the visit split into two columns until 800px, then stack. The clay-oven heading, its sentence, and its action sit on one row until 800px, with a 4:3 photograph underneath at up to 760px wide. Category plates are three columns, with 18px between them; from 640px down they become a horizontal row of 78% slides. The gallery is three columns, two from 800px, and one from 640px. Menu tools stick under the header from 800px down. Primary navigation leaves the header from 980px down and opens in a paper panel. From 760px down, a two-cell bar can sit on the bottom edge: menu on paper, directions on deep green.

**The Shared Opening Rule.** From 860px up, the square photograph and the Goudy headline share the opening. The photograph stays square, at its own proportion, with no card around it. Under 860px it still belongs to that opening, stacked after the address, with the caption underneath.

## Elevation & Depth

The page is flat. Depth comes from a hairline between bands, from a white sheet on paper, and from an ink scrim behind a dialog (`rgba(28,25,22,.46)`). There is no drop shadow on a card, a button, a photograph, or the header. The current section in the header is marked with a 2px inset underline in deep green, which is a rule, not a lift. A toast is ink on paper, flat, with a 2px corner. A pressed button moves down 1px. Hover color changes have no duration.

**The Flat Paper Rule.** Surfaces stay flat at rest and on hover. Do not add a drop shadow to separate a band, a plate, or a control. Use the hairline, the sheet, or the dialog scrim.

## Shapes

Corners on buttons, filters, search, fields, dialogs, and toasts are 2px. Photographs are rectangles at the proportion of the file: the opening plate and the category plates are square; the clay-oven plate is 4:3; gallery frames follow each picture. Images are not circles, not tilted, and not covered by a panel. A caption sits 8px under the image. A category name sits under its plate in the same way.

The proposed arch mark is a stroked path in the current ink, 28 by 34, beside the wordmark. Flavor notes use a botanical line drawing in ink, with a 1.6 stroke, not a filled icon.

**The Two-Pixel Rule.** Controls, dialogs, and toasts use a 2px radius. Do not round a photograph into a pill, and do not sharpen a button back to a hard square.

**The Caption Under the Plate Rule.** The name or the caption sits under the photograph. Nothing is lettered on the food, and no panel sits on the picture.

## Components

### Buttons

Actions are 2px, weight 600, and at least 48px tall, with a 1.5px border so primary and secondary share a box. Padding is 18px on the sides. The compact header action is 44px tall, with 14px of side padding and 1rem type.

- **Primary:** Deep green fill, white label. Hover, where available, moves to pressed green. Press shifts the button down 1px. Focus is a 2px green outline, 3px outside the control.
- **Secondary:** Transparent, charcoal label, charcoal border. Hover fills with charcoal and paper text.
- **Text:** No border and no fill. Soft ink, underlined, weight 500, 44px tall. Hover becomes charcoal. Used for “show all,” copy address, and the staff editor.

### Filters

Category filters are a single row of 44px controls, 2px corners, strong-hairline border, soft-ink label, transparent fill. The pressed filter is deep green with a white label and a green border. Hover darkens that fill to pressed green, and darkens an unpressed border to charcoal. Filters may scroll sideways when the row is narrow.

Spice notes and editor sections use a different pressed state: no fill, charcoal label, and a 2px deep-green underline. Do not fill those tabs the way a category filter is filled.

### Search and fields

Search is a white sheet, 48px tall, 2px corners, strong-hairline border, 12px of horizontal padding. The field text is 1rem. Focus sets the border to charcoal and a 2px green outline 2px outside the box. Placeholder text is quiet ink.

Editor and newsletter fields match that sheet: 44px, 2px corners, strong hairline, 8px by 10px of padding. Labels above them are 0.9375rem at weight 600.

### Navigation

The header is paper with a hairline along the bottom. The proposed arch and the Goudy wordmark sit at the left. Desktop links are soft ink, 1.0625rem, weight 500, with a 44px target. The current section is charcoal with a 2px deep-green underline. Hover turns a link deep green. The header action is the compact primary button.

From 980px down, those links move into a paper panel under the header. Rows are 48px, charcoal, separated by hairlines, with the primary and secondary actions stacked above them. From 760px down, the optional bottom bar pairs a paper menu action with a green directions action.

Footer links are charcoal at rest and deep green on hover, stacked, with 44px targets.

### Plates

A plate is the photograph alone. The opening image is square and uncropped. Category images are square. The clay-oven image is 4:3. Gallery images keep the file’s proportion. The caption is quiet ink, 0.9375rem, 8px below the image. Clicking a plate opens it in a dialog; the pointer is zoom-in. The dialog is a white sheet with a 2px corner, on an ink scrim, and the picture inside sits on paper.

### Dish line

Each dish is one row on a hairline: the name at 1.125rem weight 600, the price at weight 600 in tabular figures, then the description in soft ink within about 62ch. An unconfirmed price drops to weight 500 and quiet ink. Group titles are the sans title, with the count in quiet ink. There is no card around a dish.

### Notice, toast, and dialog

An announcement, when shown, is a deep-green strip with white text above the header. The error banner is danger wash with danger text. The toast is charcoal with paper text, 2px corners, and no shadow. Dialogs share the sheet, the 2px corner, and the scrim. Editor tabs follow the underline pressed state, not the filled filter.

## Do's and Don'ts

### Do:

- **Do** keep the page field on warm paper and the text on charcoal ink.
- **Do** set the wordmark and headlines in self-hosted Sorts Mill Goudy, and navigation, the menu, and buttons in self-hosted Source Sans 3.
- **Do** share the opening, from 860px up, between the square photograph and the Goudy headline, and place the caption under the plate.
- **Do** use deep green for the primary action and the pressed category filter.
- **Do** keep controls at a 2px radius and separate sections with a 1px hairline.
- **Do** show photographs at their own proportion, with a name or caption underneath.

### Don't:

- **Don't** paint a section band, a headline, or a photograph with deep green.
- **Don't** put type, a card, or a panel on top of a photograph.
- **Don't** add a drop shadow or a second accent color.
- **Don't** set headlines in Source Sans 3, or buttons and the menu in Sorts Mill Goudy.
- **Don't** replace either self-hosted face with a system display font. Goudy ships at weight 400 only.
- **Don't** crop the opening photograph into a wide banner. It stays square.
